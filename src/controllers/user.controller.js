const UserModel = require("../models/user.model.js");
const CartModel = require("../models/cart.model.js");
const jwt = require("jsonwebtoken");
const { createHash, isValidPassword } = require("../utils/hashbcryp.js");
const UserDTO = require("../dto/user.dto.js");
const { generarResetToken } = require("../utils/tokenreset.js");
const EmailManager = require("../services/email.js");
const emailManager = new EmailManager();
const { generarInfoError } = require("../services/errors/info.js");
const { EErrors } = require("../services/errors/enum.js");

class UserController {
    async register(req, res) {
        const { first_name, last_name, email, password, age } = req.body;
        try {
            const existeUsuario = await UserModel.findOne({ email });
            if (existeUsuario) {
                CustomError.crearError({
                    nombre: "UserExistsError",
                    causa: "El usuario ya existe",
                    mensaje: "El usuario ya existe",
                    codigo: EErrors.USER_EXISTS
                });
                return res.status(400).send("El usuario ya existe");
            }

            // Creo un nuevo carrito:
            const nuevoCarrito = new CartModel();
            await nuevoCarrito.save();

            const nuevoUsuario = new UserModel({
                first_name,
                last_name,
                email,
                cart: nuevoCarrito._id,
                password: createHash(password),
                age,
            });

            await nuevoUsuario.save();

            const token = jwt.sign({ user: nuevoUsuario }, "coderhouse", {
                expiresIn: "1h"
            });

            res.cookie("coderCookieToken", token, {
                maxAge: 3600000,
                httpOnly: true
            });

            res.redirect("/api/users/profile");
        } catch (error) {
            console.error(error);
            res.status(500).send("Error interno del servidor");
        }
    }

    async login(req, res) {
        const { email, password } = req.body;
        try {
            const usuarioEncontrado = await UserModel.findOne({ email });

            if (!usuarioEncontrado) {
                return res.status(401).send("Usuario no válido");
            }

            const esValido = isValidPassword(password, usuarioEncontrado);
            if (!esValido) {
                return res.status(401).send("Contraseña incorrecta");
            }

            const token = jwt.sign({ user: usuarioEncontrado }, "coderhouse", {
                expiresIn: "1h"
            });

            res.cookie("coderCookieToken", token, {
                maxAge: 3600000,
                httpOnly: true
            });

            res.redirect("/api/users/profile");
        } catch (error) {
            console.error(error);
            res.status(500).send("Error interno del servidor");
        }
    }

    async profile(req, res) {
        try {
            const isPremium = req.user.role === 'premium';
            const userDto = new UserDTO(req.user.first_name, req.user.last_name, req.user.role);
            const isAdmin = req.user.role === 'admin';

            res.render("profile", { user: userDto, isPremium, isAdmin });
        } catch (error) {
            res.status(500).send('Error interno del servidor');
        }
    }

    async logout(req, res) {
        res.clearCookie("coderCookieToken");
        res.redirect("/login");
    }

    async admin(req, res) {
        if (req.user.role !== "admin") {
            return res.status(403).send("Acceso denegado");
        }
        res.render("admin");
    }

    async requestPasswordReset(req, res) {
        const { email } = req.body;
        try {
            const user = await UserModel.findOne({ email });

            if (!user) {
                return res.status(404).send("Usuario no encontrado");
            }

            const token = generarResetToken();
            user.resetToken = {
                token: token,
                expire: new Date(Date.now() + 3600000) // 1 Hora de duración.
            }
            await user.save()

            await emailManager.enviarCorreoRestablecimiento(email, user.first_name, token);

            res.redirect("/confirmacion-envio");
        } catch (error) {
            res.status(500).send("Error interno del servidor");
        }
    }

    async resetPassword(req, res) {
        const { email, password, token } = req.body;

        try {
            const user = await UserModel.findOne({ email });
            if (!user) {
                return res.render("passwordcambio", { error: "Usuario no encontrado" });
            }

            const resetToken = user.resetToken;
            if (!resetToken || resetToken.token !== token) {
                return res.render("passwordreset", { error: "El token de restablecimiento de contraseña es inválido" });
            }

            const ahora = new Date();
            if (ahora > resetToken.expire) {
                return res.render("passwordreset", { error: "El token de restablecimiento de contraseña ha expirado" });
            }

            if (isValidPassword(password, user)) {
                return res.render("passwordcambio", { error: "La nueva contraseña no puede ser igual a la anterior" });
            }

            user.password = createHash(password);
            user.resetToken = undefined;
            await user.save();

            return res.redirect("/login");
        } catch (error) {
            return res.status(500).render("passwordreset", { error: "Error interno del servidor" });
        }
    }

    async cambiarRolPremium(req, res) {
        const { uid } = req.params;
        try {
            const user = await UserModel.findById(uid);

            if (!user) {
                return res.status(404).send("Usuario no encontrado");
            }

            const nuevoRol = user.role === "usuario" ? "premium" : "usuario";

            const actualizado = await UserModel.findByIdAndUpdate(uid, { role: nuevoRol }, { new: true });
            res.json(actualizado);
        } catch (error) {
            res.status(500).send("Error del servidor");
        }
    }

    async cambiarRolAdmin(req, res) {
        const { uid } = req.params;
        try {
            const user = await UserModel.findById(uid);

            if (!user) {
                return res.status(404).send("Usuario no encontrado");
            }

            if (user.role === "admin") {
                return res.status(400).send("El usuario ya es administrador");
            }

            const actualizado = await UserModel.findByIdAndUpdate(uid, { role: "admin" }, { new: true });
            res.json(actualizado);
        } catch (error) {
            res.status(500).send("Error del servidor");
        }
    }

    async deleteUser(req, res) {
        const id = req.params.uid;

        try {
            const borrado = await UserModel.findByIdAndDelete(id);
            res.json(borrado);
        } catch (error) {
            res.status(500).send("Error al borrar usuario");
        }
    }    

    async getAllUsers(req, res) {
        try {
            // Lógica para obtener todos los usuarios desde la base de datos
            const users = await UserModel.find();
            res.json(users);
        } catch (error) {
            console.error("Error al obtener todos los usuarios:", error);
            res.status(500).json({ error: "Error interno del servidor al obtener usuarios" });
        }
    }
}

module.exports = UserController;

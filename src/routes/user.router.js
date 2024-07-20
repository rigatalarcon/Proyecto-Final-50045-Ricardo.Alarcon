const express = require("express");
const router = express.Router();
const passport = require("passport");
const UserController = require("../controllers/user.controller.js");
const checkUserRole = require("../middleware/checkrole.js");

const userController = new UserController();

//router.put("/users/:uid/role/admin", authenticateAdmin, (req, res) => userController.cambiarRolAdmin(req, res));
router.get("/", userController.getAllUsers);
router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/profile", passport.authenticate("jwt", { session: false }), userController.profile);
router.post("/logout", userController.logout.bind(userController));
//router.get("/admin", passport.authenticate("jwt", { session: false }), userController.admin);

router.post("/requestPasswordReset", userController.requestPasswordReset);
router.post("/reset-password", userController.resetPassword);


// Ruta para cambiar el rol a administrador, solo accesible por administradores actuales
router.put("/:uid/role/admin", checkUserRole(['admin']), (req, res) => userController.cambiarRolAdmin(req, res));

// Ruta para cambiar el rol a premium, accesible por administradores y usuarios premium
router.put("/:uid/role/premium", checkUserRole(['admin', 'premium']), (req, res) => userController.cambiarRolPremium(req, res));

// Ruta para eliminar usuarios, solo accesible por administradores
router.delete("/:uid", checkUserRole(['admin']), (req, res) => userController.deleteUser(req, res));


module.exports = router;

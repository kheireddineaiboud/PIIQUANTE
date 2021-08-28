const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/user"); //Associer les fonctions aux différentes routes
const mdpVerify = require("../middleware/mdpValidator");

//Des routes post car le front envoie des informations
router.post("/signup", mdpVerify, userCtrl.signup); //creer un nouveau utilisateur
router.post("/login", userCtrl.login); //pour connecter lutilisateur

module.exports = router;
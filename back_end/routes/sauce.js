//Déportation de la logique routing sur le Router
const express = require("express");
const router = express.Router(); //Implémenter des routes
const sauceCtrl = require("../controllers/sauce");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");
//CRUD create read update delete
//Fonctions importées et appliquées aux routes depuis le dossier Controllers
router.post("/", auth, multer, sauceCtrl.createSauce); //Enregistrer une sauce dans la base de données
router.put("/:id", auth, multer, sauceCtrl.modifySauce); //Mettre à jour une sauce existante
router.delete("/:id", auth, sauceCtrl.deleteSauce); //Supprimer une sauce
router.get("/:id", auth, sauceCtrl.getOneSauce); //Récupération d'une sauce spécifique
router.get("/", auth, sauceCtrl.getAllSauces); //Renvoie toutes les sauces
router.post("/:id/like", auth, sauceCtrl.likeSauce); //creer un like ou dislike

module.exports = router; //donner lacces a dautres fichiers ex:server
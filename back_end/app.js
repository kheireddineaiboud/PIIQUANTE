const express = require("express"); //cest un framwork baser sur nodejs qui facilite la gestion de lAPI
const mongoose = require("mongoose"); //facilite les interactions avec la base de données
const bodyParser = require("body-parser"); //Gérer la demande POST provenant de l'application front-end, permet l'extraction de l'objet JSON de la demande(rendre le corps de la reqûete exploitable)
const path = require("path"); //Donne acccès au chemin du systeme de fichier
require("dotenv").config(); //charger la variable d'environnement
const helmet = require("helmet");

const sauceRoutes = require("./routes/sauce"); //Importation du Router
const userRoutes = require("./routes/user");

//Connection de l'API au cluster mongoDB
mongoose
    .connect(
        `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_LINK}`, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }
    )
    .then(() => console.log("Connexion à MongoDB réussi !"))
    .catch(() => console.log("Connexion à MongoDB échoué !"));

const app = express(); //Création d'une application express
app.use(helmet()); //Helmet est une collection de plusieurs middleware qui définissent des en-têtes HTTP liés à la sécurité

//Middleware sont des fonctions qui capturent et traitent les reqûetes envoyées vers le serveur

//Middleware appliqué à toutes les routes, permettant l'envoie de requête et d'accéder à l'API
//pour bloquer les erreurs cors
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*"); //Accès à l'API depuis n'importe quelle origine
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
    ); //Ajout des headers mentionnés vers l'API
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    ); //Envoie de requête avec les méthodes mentionnées
    next();
});

app.use(bodyParser.json()); //Transformer le corps de la requête en objet JS utilisable

app.use("/images", express.static(path.join(__dirname, "images"))); //Sert le dossier statique image

app.use("/api/sauces", sauceRoutes); //Enregistrement du routeur pour toutes les demandes effectuées vers /api/sauces
app.use("/api/auth", userRoutes); //La racine de toutes les routes liées à l'authentification ; attendu par le front

module.exports = app; //Permet l'accès depuis les autres fichiers, notamment le serveur Node
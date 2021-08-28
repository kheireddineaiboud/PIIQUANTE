const bcrypt = require("bcrypt"); //Le package bcrpyt permet un cryptage sécurisé avec un algorithme unidirectionnel
const jwt = require("jsonwebtoken"); //Créer et vérifier les tokens d'authentification

const User = require("../models/User");

exports.signup = (req, res, next) => {
    console.log(req);
    bcrypt
        .hash(req.body.password, 10) //Execution de l'algorythme de hashage, "saler" le mdp 10 fois
        .then((hash) => {
            const user = new User({
                email: req.body.email,
                password: hash,
            });
            user
                .save()
                .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
                .catch((error) => res.status(400).json({ error }));
        }) //Recuperation du hash du mdp qu'on va enregistrer dans un nouvel user, ensuite enregistré dans la base de donnée
        .catch((error) => res.status(500).json({ error }));
};

//Fonction asynchrone signup qui va crypter le mdp, prend le mdp crytpé et créé un nouveau user avec ce mdp crypté. Dans le bloc then, on créé un nouvel utilisateur qui sera enregistré dans la base de données. bcrypt sait quand deux hash différents ont été produits à partir du même string d'origine

//Vérifier que l'e-mail entré par l'utilisateur correspond à un utilisateur existant de la base de données
exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email }) //Objet filtre : l'utilisateur pour qui l'adresse mail correspond à ladresse mail envoyée dans la requête
        .then((user) => {
            if (!user) {
                return res.status(401).json({ error: "Utilisateur non trouvé !" });
            }
            //si l'e-mail correspond à un utilisateur existant
            bcrypt
                .compare(req.body.password, user.password) //comparaison du mot de passe entré par l'user avec le hash enregistré dans la base de données
                .then((valid) => {
                    if (!valid) {
                        return res.status(401).json({ error: "Mot de passe incorrect !" });
                    }
                    //Si le mot de pass et le hash correspondent, les informations d'identification sont valides
                    res.status(200).json({
                        userId: user._id, //Envoie d'une réponse 200 contenant l'ID user et un token. Ce user id encodé sera utilisé pour appliquer le bon user id à chaque objet, afin de ne pas modifier les objets des autres utilisateurs
                        token: jwt.sign(
                            //Encode un nouveau Token
                            { userId: user._id },
                            process.env.SECRET_TOKEN, //Chaîne secrète de développement temporaire pour encoder le token(à remplacer par une chaîne aléatoire beaucoup plus longue pour la production)
                            { expiresIn: "24h" } //Durée de validité
                        ),
                    });
                })
                .catch((error) => res.status(500).json({ error }));
        })
        .catch((error) => res.status(500).json({ error }));
};
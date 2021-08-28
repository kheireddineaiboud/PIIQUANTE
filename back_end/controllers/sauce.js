//Stocker logique métier et implémentation des routes CRUD
const Sauce = require('../models/sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce); //req.body.sauce sera un objet JS sous forme chaîne de caractère 
    delete sauceObject._id; //Suppression de l'id envoyé par le front, car MongoDB en génère un automatiquement
    const sauce = new Sauce({ //Creation d'une nouvelle instance du modèle Sauce, auquelle on passe un objet qui va contenir toutes les informations requises
        ...sauceObject, //L'opérateur spread copie tous les éléments de req.body
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`, //Génère l'url de l'image
    });
    sauce.save() //Enregistre l'objet dans la base de données et renvoie une promesse
        .then(() => res.status(201).json({ message: 'Objet enregistré !' }))
        .catch(error => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? //S'il y a une nouvelle image on aura req.file
        {
            ...JSON.parse(req.body.sauce), //Récupération de toutes les informations sur l'objet 
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : {...req.body }; //Si req.file n'existe pas, on prend le corps de la requête
    Sauce.updateOne({ _id: req.params.id }, {...sauceObject, _id: req.params.id }) //Prend l'objet créé et modification de son id pour correspondre à l'id des paramètres de requête
        .then(() => res.status(200).json({ message: 'Objet modifié !' }))
        .catch(error => res.status(400).json({ error }));
}; //Création d'un sauceObject qui regarde si req.file existe ou non. S'il existe, la nouvelle image est traitée sinon l'objet entrant est traité 

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id }) //Récupération d'une sauce spécifique ayant le même _id que le paramètre de la requête. La sauce est ensuite retournée dans une promesse et envoyée au front-end 
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet supprimé !' }))
                    .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(500).json({ error }));
}; //Utilisation de l'Id reçu en paramètre pour accéder à la sauce correspondante dans la base de donnée. L'url d'image contient un segment /images/ pour séparer le nom du fichier. Utilisation de la fonction unlink pour supprimer le fichier. Dans le callback, supression de la sauce dans la base de donnée

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id }) //Methode pour trouver une sauce unique, ayant le même id que le paramètre de la requête
        .then(sauce => res.status(200).json(sauce)) //La sauce est retournée dans une promesse envoyée au front
        .catch(error => res.status(404).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
    Sauce.find() //Methode renvoie un tableau contenant toutes les sauces dans la base de données
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};

//Like et Dislike les sauces
exports.likeSauce = (req, res, next) => {

    let like = req.body.like //Initialiser le statut Like
    let userId = req.body.userId //Un utilisateur ne peut avoir qu'une seule valeur pour chaque sauce
    let sauceId = req.params.id //Récupération de l'id de la sauce

    if (like === 1) { //Si l'utilisateur like
        //Methode update pour mettre à jour le like
        Sauce.updateOne({ _id: sauceId }, {
            $push: { usersLiked: userId }, //Push l'utilisateur
            $inc: { likes: +1 } //On incrémente de 1
        })

        .then(() => res.status(200).json({ message: 'Sauce liké !' }))
            .catch(error => res.status(400).json({ error }));
    }

    if (like === -1) { //Si l'utilisateur Dislike
        Sauce.updateOne({ _id: sauceId }, {
            $push: { usersDisliked: userId },
            $inc: { dislikes: +1 } //Incrémente de 1 
        })

        .then(() => res.status(200).json({ message: 'Sauce Disliké !' }))
            .catch(error => res.status(400).json({ error }));
    }

    if (like === 0) { //Annulation d'un like ou dislike
        //Methode findOne pour trouver la sauce unique ayant le même id que le paramètre de la requête
        Sauce.findOne({ _id: sauceId })
            .then((sauce) => {
                if (sauce.usersLiked.find(user => user === userId)) { //Si l'utilisateur annule un like
                    Sauce.updateOne({ _id: sauceId }, {
                        $pull: { usersLiked: userId },
                        $inc: { likes: +1 } //Décréménte de 1
                    })

                    .then(() => res.status(200).json({ message: "Like annulé !" }))
                        .catch(error => res.status(400).json({ error }));
                }

                if (sauce.usersDisliked.find(user => user === userId)) { //Si l'utilisateur annule un dislike
                    Sauce.updateOne({ _id: sauceId }, {
                        $pull: { usersDisliked: userId },
                        $inc: { likes: -1 } //Décréménte de 1
                    })

                    .then(() => res.status(200).json({ message: "Dislike annulé !" }))
                        .catch(error => res.status(400).json({ error }));
                }

            })
            .catch((error) => res.status(404).json({ error }))

    }

};
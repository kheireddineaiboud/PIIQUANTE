const mdpSchema = require('../models/mdp');

//Renforcer et sécuriser les mots de passe entrant
module.exports = (req, res, next) => {
    if (!mdpSchema.validate(req.body.password)) {
        return res.status(400).json({ message: 'Mot de passe requis : 8 caractères minimun. Au moins 1 Majuscule, 1 minuscule. Sans espaces' });
    } else {
        next();
    }
}
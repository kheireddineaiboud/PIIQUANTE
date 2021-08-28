const mongoose = require('mongoose');

const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
    email: { type: String, require: true, unique: true },
    password: { type: String, require: true }
});

userSchema.plugin(uniqueValidator); //Appliquer validator au schema avant d'en faire un modèle. Impossible d'avoir plusieurs utilisateurs inscrits avec la même adresse e-mail

module.exports = mongoose.model('User', userSchema);
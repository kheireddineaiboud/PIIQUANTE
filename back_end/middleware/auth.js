const jwt = require("jsonwebtoken"); //Verification des token

//Middleware d'authentification
module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.SECRET_TOKEN);
        const userId = decodedToken.userId;
        if (req.body.userId && req.body.userId !== userId) {
            throw "User ID non valable";
        } else {
            next();
        }
    } catch {
        res.status(401).json({
            error: new Error("Requête non authentifiée"),
        });
    }
}; //Extraire le token du header Authorization de la requête entrante. Contenant le mot-clé Bearer, utlisation de la fonction split pour récupérer tout après l'espace dans le header. Utilisation de la fonction verify pour décoder le token et extraction de l'ID user. Si la demande contient un ID user, on compare à celui extrait du token.
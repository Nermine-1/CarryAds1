

const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1]; // Format: Bearer TOKEN

    if (!token) {
        return res.status(403).json({ message: 'Aucun jeton fourni. Accès refusé.' });
    }

    try {
        // Vérifie le jeton
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Attache les informations décodées à la requête
        req.user = decoded; // req.user.id, req.user.email, req.user.roles
        next(); // Passe au prochain middleware/contrôleur
    } catch (error) {
        return res.status(401).json({ message: 'Jeton invalide. Accès non autorisé.' });
    }
};



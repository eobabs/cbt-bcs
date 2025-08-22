const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const token = req.headers('x-auth-token');
    if (!token) {
        return res.status(401).json({
            message: 'No token provided'
        });
    }

    try{
        const decoded = jwt.verify(token, process.env.SECRET);
        req.user = decoded.user;
        next();
    } catch(err){
        res.status(401).json({
            message: 'No token provided'
        });
    }
};
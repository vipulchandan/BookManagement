const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        const token = req.headers['x-access-token'];
        if(!token) {
            return res.status(401).send({
                status: false,
                message: 'No token provided'
            });
        }

        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
            if(err) {
                return res.status(401).send({
                    status: false,
                    message: 'Unauthorized access!'
                });
            }
            req.userId = decoded.userId;
            next();
        });

    } catch(error) {
        res.status(500).send({
            status: false,
            message: error.message
        });
    }
}

module.exports = { auth };
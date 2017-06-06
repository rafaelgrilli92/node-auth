const jwt = require('jwt-simple');
const config = require('../config');

const User = require('../modules/user');

function generateToken(user) {
    const timestamp = new Date().getTime();
    return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
};

exports.signIn = function(req, res, next) {
    // User has already had his Email and Password
    // Just retrieve to him a token
    return res.send({ token: generateToken(req.user) });
}

exports.signUp = function(req, res, next) {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password)
        return res.status(422).send({ error: 'You must provide email and password' });

    // Try to find an user in the User Collection from DB
    User.findOne({ email: email }, function(err, existingUser) {
        if (err) return next(err);
        
        // See if the user with the given email exists
        // If so, return an error
        if (existingUser)
            return res.status(422).send({ error: 'Email is in use' });

        // If doesn't exist, create and save user record
        const newUser = new User({
            email: email,
            password: password
        });

        newUser.save(function(err) {
            if (err) return next(err);

            // Respond to request indicating the user was created
            return res.json({ token: generateToken(newUser) });
        });
    });
};
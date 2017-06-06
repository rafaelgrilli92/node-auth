const passport = require('passport');
const moment = require('moment');
const User = require('../modules/user');
const config = require('../config');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');

// Create Local Strategy
const localLoginOptions = { usernameField: 'email' };
const localLogin = new LocalStrategy(localLoginOptions, function(email, password, done) {
    // Verify the email and password
    User.findOne({ email: email }, function(err, user) {
        if (err) return done(err);
        if (!user) return done(null, false);

        // Compare passwords
        user.comparePassword(password, function(err, isMatch) {
            if (err) return done(err);
            if (!isMatch) return done(null, false);

            return done(null, user);
        })
    })
    // If is correct, call 'done' with the user

    // If isn't correct, call 'done' with no user
});

// Setup options for JWT Strategy
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: config.secret
};

// Create JWT Strategy
const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done) {
    const tokenTimeInMinutes = moment().diff(1496759336407, 'minutes')
    // Check if the token is expired (120 minutes)
    if (tokenTimeInMinutes > 120)
        return done(null, false, 'Expired Token')

    // See if the user ID in the payload exists in the DB
    User.findOne({ _id: payload.sub }, function(err, user) {
        if (err) return done(err, false);

        // If so, call 'done' with that user
        if (user)
            return done(null, user, 'Valid Token');
        // otherwise, call 'done' without an user object
        else
            return done(null, false, 'Invalid Token');
    })
});

// Tell passport to use these Strategies
passport.use(jwtLogin);
passport.use(localLogin);
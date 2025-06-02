const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Load User model
const User = require("../models/User");

module.exports = function (passport) {
  // Local Strategy
  passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      // Match user
      User.findOne({ email: email.toLowerCase() })
        .then((user) => {
          if (!user) {
            return done(null, false, { message: "Email not registered" });
          }

          // Match password
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
              return done(null, user);
            } else {
              return done(null, false, { message: "Password incorrect" });
            }
          });
        })
        .catch((err) => console.error(err));
    })
  );

  // Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      (accessToken, refreshToken, profile, done) => {
        // console.log(profile);
        User.findOne({ googleId: profile.id })
          .then((existingUser) => {
            if (existingUser) {
              return done(null, existingUser);
            } else {
              const newUser = new User({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
              });
              newUser
                .save()
                .then((user) => done(null, user))
                .catch((err) => console.error(err));
            }
          })
          .catch((err) => console.error(err));
      }
    )
  );

  // Serialize/Deserialize
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id)
      .then((user) => done(null, user))
      .catch((err) => done(err));
  });
};

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const passport = require("passport");

// Load User model
const User = require("../models/User");

// GET: Signup
router.get("/signup", (req, res) => {
  res.render("signup");
});

// POST: Signup
router.post("/signup", (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  // Validate fields
  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please fill in all fields" });
  }
  if (password !== password2) {
    errors.push({ msg: "Passwords do not match" });
  }
  if (password.length < 6) {
    errors.push({ msg: "Password must be at least 6 characters" });
  }
  if (errors.length > 0) {
    res.render("signup", { errors, name, email, password, password2 });
  } else {
    // Check if user exists
    User.findOne({ email: email.toLowerCase() }).then((user) => {
      if (user) {
        errors.push({ msg: "Email is already registered" });
        res.render("signup", { errors, name, email, password, password2 });
      } else {
        const newUser = new User({
          name,
          email: email.toLowerCase(),
          password,
        });
        // Hash password
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then((user) => {
                req.flash(
                  "success_msg",
                  "You are now registered and can log in"
                );
                res.redirect("/login");
              })
              .catch((err) => console.error(err));
          });
        });
      }
    });
  }
});

// GET: Login
router.get("/login", (req, res) => {
  res.render("login");
});

// POST: Login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login",
    failureFlash: true,
  })(req, res, next);
});

// Google OAuth - initiate
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth callback
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    // Successful auth
    res.redirect("/profile");
  }
);

// Logout
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success_msg", "You are logged out");
    res.redirect("/login");
  });
});

module.exports = router;

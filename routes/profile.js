const express = require("express");
const router = express.Router();

// Middleware to check auth
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error_msg", "Please log in to view that resource");
  res.redirect("/login");
}

// GET: Profile (protected)
router.get("/", ensureAuthenticated, (req, res) => {
  res.render("profile", { user: req.user });
});

module.exports = router;

const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

// Signup GET
router.get("/signup", (req, res) => {
  res.render("signup", { errors: [] });
});

// Signup POST
router.post(
  "/signup",
  [
    check("email", "Email is not valid").isEmail(),
    check("password", "Password must be at least 6 characters").isLength({
      min: 6,
    }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("signup", { errors: errors.array() });
    }

    // proses signup ke database dsb di sini...
    res.send("Signup success");
  }
);

module.exports = router;

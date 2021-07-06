const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../dbConfig");

router.post("/login", async (req, res) => {
  const email = req.body.email.trim();
  const password = req.body.password.trim();
  try {
    const res_users = await pool.query(`SELECT * FROM users WHERE email=$1`, [
      email
    ]);
    if (res_users.rows.length > 0) {
      const auth = await bcrypt.compare(password, res_users.rows[0].password);
      if (auth) {
        const token = jwt.sign(
          {
            email: res_users.rows[0].email
          },
          process.env.TOKEN_SECRET
        );
        res
          .status(200)
          .header("auth-token")
          .send(token);
      } else {
        res.status(400).send("Password is incorrect!");
      }
    } else {
      res.status(400).send("User does not exist!");
    }
  } catch (error) {
    console.error(error.message);
  }
});

router.post("/register", async (req, res) => {
  const email = req.body.email.trim();
  const password = req.body.password.trim();
  try {
    const res_users = await pool.query(`SELECT * FROM users WHERE email=$1`, [
      email
    ]);
    if (res_users.rows.length > 0) {
      res.status(400).send("User already exists!");
    } else {
      const hash = await bcrypt.hash(
        password,
        parseInt(process.env.SALT_ROUNDS)
      );
      const insert_res = await pool.query(
        `INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *`,
        [email, password]
      );
      if (insert_res.rowCount > 0) {
        res
          .status(200)
          .send(`New user ${insert_res.rows[0].email} created successfully`);
      } else {
        res.status(400).send("Could not create the new user!");
      }
    }
  } catch (error) {
    console.error(error.message);
  }
});

module.exports = router;

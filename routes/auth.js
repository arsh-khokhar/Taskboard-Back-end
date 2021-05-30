const router = require ('express').Router ();
const bcrypt = require ('bcrypt');
const pool = require ('../dbConfig');

router.post ('/login', async (req, res) => {
  const email = req.body.email.trim ();
  const password = req.body.password.trim ();
  try {
    const res_users = await pool.query (
      `SELECT * FROM users WHERE email='${email}'`
    );
    if (res_users.rows.length > 0) {
      const auth = await bcrypt.compare (password, res_users.rows[0].password);
      if (auth) {
        res.send ('User authenticated!');
      } else {
        res.send ('Password is incorrect!');
      }
    } else {
      res.send ({message: 'User does not exist!'});
    }
  } catch (error) {
    console.error (error.message);
  }
});

router.post ('/register', async (req, res) => {
  const email = req.body.email.trim ();
  const password = req.body.password.trim ();
  try {
    const res_users = await pool.query (
      `SELECT * FROM users WHERE email='${email}'`
    );
    if (res_users.rows.length > 0) {
      res.status (400).send ('User already exists!');
    } else {
      const hash = await bcrypt.hash (
        password,
        parseInt (process.env.SALT_ROUNDS)
      );
      const insert_res = await pool.query (
        `INSERT INTO users (email, password) VALUES ('${email}','${hash}') RETURNING email`
      );
      if (insert_res.rowCount > 0) {
        res.send (`New user ${insert_res.rows[0].email} created successfully`);
      } else {
        res.send ('Could not create the new user!');
      }
    }
  } catch (error) {
    console.log ('In error');
    console.error (error.message);
  }
});

module.exports = router;

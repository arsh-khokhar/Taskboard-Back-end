const router = require ('express').Router ();

router.post ('/register', (req, res) => {
  res.send ('Register');
});

router.post ('/login', async (req, res) => {
  const email = req.body.email.trim ();
  const password = req.body.password.trim ();
  try {
    const res_users = await pool.query (
      `SELECT * FROM users WHERE email='${email}'`
    );
    if (res_users.rows.length > 0) {
      const auth = await bcrypt.compare (password, res_users.rows[0].password);
      console.log (auth);
      if (auth) {
        res.header ('auth-token', token).send (token);
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

module.exports = router;

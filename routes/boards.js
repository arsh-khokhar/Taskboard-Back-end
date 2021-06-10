const router = require('express').Router();
const verify = require('./verifyToken');
const pool = require('../dbConfig');

router.get('/', verify, async (req, res) => {
	auth_user = req.header('auth-user');
	try {
		const boards = await pool.query(
			`SELECT * FROM boards WHERE owner_id='${auth_user}'`
		);
		res.send(boards.rows);
	} catch (error) {
		console.error(error.message);
	}
	//res.status(200).send(`Got access to ${auth_user}'s boards`);
});

module.exports = router;

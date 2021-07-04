const router = require('express').Router();
const verify = require('./verifyToken');
const pool = require('../dbConfig');

router.post('/', verify, async (req, res) => {
	console.log(req.body);
	try {
		const insert_res = await pool.query(
			`INSERT INTO lists (title, board_id) VALUES ('${req.body.title}','${req.body.board_id}') RETURNING list_id`
		);
		if (insert_res.rowCount > 0) {
			res.status(200).send(`New list created successfully`);
		} else {
			res.status(400).send('Could not create the new list!');
		}
	} catch (error) {
		console.error(error.message);
	}
});

module.exports = router;

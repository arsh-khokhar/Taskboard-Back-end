const router = require('express').Router();
const verify = require('./verifyToken');
const pool = require('../dbConfig');

router.post('/', verify, async (req, res) => {
	try {
		const query =
			req.body.description === null
				? `INSERT INTO tasks (title, list_id) VALUES ('${req.body.title}', '${req.body.list_id}') RETURNING task_id`
				: `INSERT INTO tasks (title, description, list_id) VALUES ('${req.body.title}','${req.body.description}', '${req.body.list_id}') RETURNING task_id`;

		const insert_res = await pool.query(query);
		if (insert_res.rowCount > 0) {
			if (req.body.prev !== null) {
				const update_res = await pool.query(
					`UPDATE tasks SET next_id='${insert_res.rows[0].task_id}' WHERE task_id='${req.body.prev}' RETURNING task_id`
				);
				if (update_res.rowCount <= 0) {
					res.status(400).send('Could not create the new task!');
				}
			}
			res.status(200).send('New task created successfully.');
		} else {
			res.status(400).send('Could not create the new task!');
		}
	} catch (error) {
		console.error(error.message);
	}
});

module.exports = router;

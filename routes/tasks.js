const router = require('express').Router();
const verify = require('./verifyToken');
const pool = require('../dbConfig');

router.post('/', verify, async (req, res) => {
	try {
		const query =
			req.body.description === null
				? `INSERT INTO tasks (title, list_id, next_id) VALUES ('${
						req.body.title
				  }', '${req.body.list_id}', '${
						parseInt(req.body.num_elems) + 1
				  }') RETURNING task_id`
				: `INSERT INTO tasks (title, description, list_id, next_id) VALUES ('${
						req.body.title
				  }','${req.body.description}', '${req.body.list_id}', '${
						parseInt(req.body.num_elems) + 1
				  }') RETURNING task_id`;

		console.log(query);
		const insert_res = await pool.query(query);
		if (insert_res.rowCount <= 0) {
			res.status(400).send('Could not create the new task!');
		} else {
			res.status(200).send('New task added successfully');
		}
	} catch (error) {
		console.error(error.message);
	}
});

router.post('/reorder', verify, async (req, res) => {
	try {
		for (i in req.body) {
			list = req.body[i];
			for (j in list.tasks) {
				const query = `UPDATE tasks SET list_id='${list.list_id}', next_id='${j}' WHERE task_id='${list.tasks[j].task_id}' RETURNING task_id`;
				const update_task = await pool.query(query);
				if (update_task.rows.rowCount <= 0) {
					res.status(400).send('Not able to update a task!');
				}
			}
		}
		res.status(200).send('Done syncing');
	} catch (error) {
		console.error(error.message);
	}
});

module.exports = router;

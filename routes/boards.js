const router = require('express').Router();
const verify = require('./verifyToken');
const pool = require('../dbConfig');

router.get('/', verify, async (req, res) => {
	auth_user = req.header('auth-user');
	try {
		const boards = await pool.query(
			`SELECT * FROM boards WHERE owner_id='${auth_user}'`
		);
		const collab_boards = await pool.query(
			`SELECT boards.board_id, boards.title, boards.owner_id FROM userboards INNER JOIN boards ON userboards.board_id=boards.board_id AND userboards.user_id='${auth_user}'`
		);
		res.send(boards.rows.concat(collab_boards.rows));
	} catch (error) {
		console.error(error.message);
	}
});

router.get('/:board_id', verify, async (req, res) => {
	var to_send = {title: null, lists: {}};
	const board_id = req.params.board_id;
	try {
		const name = await pool.query(
			`SELECT boards.title FROM boards WHERE board_id='${board_id}'`
		);
		to_send.title = name.rows[0].title;
		const lists = await pool.query(
			`SELECT * FROM lists WHERE board_id='${board_id}'`
		);
		for (i in lists.rows) {
			var new_list = lists.rows[i];
			const tasks = await pool.query(
				`SELECT * FROM tasks WHERE list_id='${new_list.list_id}'`
			);
			new_list.tasks = tasks.rows;
			to_send.lists[`${new_list.list_id}`] = new_list;
		}
		res.send(to_send);
	} catch (error) {
		console.error(error.message);
	}
});

router.post('/', verify, async (req, res) => {
	try {
		const insert_res = await pool.query(
			`INSERT INTO boards (title, owner_id) VALUES ('${
				req.body.title
			}','${req.header('auth-user')}') RETURNING board_id`
		);
		if (insert_res.rowCount > 0) {
			res.status(200).send(`New board created successfully`);
		} else {
			res.status(400).send('Could not create the new board!');
		}
	} catch (error) {
		console.error(error.message);
	}
});

module.exports = router;

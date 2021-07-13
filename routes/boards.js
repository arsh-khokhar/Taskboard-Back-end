const router = require("express").Router();
const verify = require("./verifyToken");
const pool = require("../dbConfig");

router.get("/", verify, async (req, res) => {
  auth_user = req.header("auth-user");
  try {
    const boards = await pool.query(`SELECT * FROM boards WHERE owner_id=$1`, [
      auth_user
    ]);
    const collab_boards = await pool.query(
      `SELECT boards.board_id, boards.title, boards.owner_id FROM userboards INNER JOIN boards ON userboards.board_id=boards.board_id AND userboards.user_id=$1`,
      [auth_user]
    );
    res.status(200).send(boards.rows.concat(collab_boards.rows));
  } catch (error) {
    console.error(error.message);
  }
});

const getSortedTasks = arg_tasks => {
  return arg_tasks.sort((a, b) =>
    a.rank > b.rank ? 1 : b.rank > a.rank ? -1 : 0
  );
};

router.get("/:board_id", verify, async (req, res) => {
  var to_send = {
    title: null,
    owner_id: null,
    lists: {},
    collaborators: {},
    all_users: []
  };
  const board_id = req.params.board_id;
  try {
    const name = await pool.query(`SELECT * FROM boards WHERE board_id=$1`, [
      board_id
    ]);
    to_send.title = name.rows[0].title;
    to_send.owner_id = name.rows[0].owner_id;

    const lists = await pool.query(`SELECT * FROM lists WHERE board_id=$1`, [
      board_id
    ]);
    for (i in lists.rows) {
      var new_list = lists.rows[i];
      const tasks = await pool.query(`SELECT * FROM tasks WHERE list_id=$1`, [
        new_list.list_id
      ]);
      for (i in tasks.rows) {
        const assignees = await pool.query(
          "SELECT user_id FROM taskassignees WHERE task_id=$1",
          [tasks.rows[i].task_id]
        );
        tasks.rows[i].assignees = assignees.rows;
      }
      new_list.tasks = getSortedTasks(tasks.rows);
      to_send.lists[`${new_list.list_id}`] = new_list;
    }

    const collabs = await pool.query(
      `SELECT users.email FROM userboards INNER JOIN users ON userboards.user_id=users.email AND userboards.board_id=$1`,
      [board_id]
    );
    to_send.collaborators = collabs.rows;

    const all_users = await pool.query(`SELECT email FROM users`);
    to_send.all_users = all_users.rows;
    res.send(to_send);
  } catch (error) {
    console.error(error.message);
  }
});

router.post("/", verify, async (req, res) => {
  auth_user = req.header("auth-user");
  try {
    const insert_res = await pool.query(
      `INSERT INTO boards (title, owner_id) VALUES ($1, $2) RETURNING *`,
      [req.body.title, auth_user]
    );
    if (insert_res.rowCount > 0) {
      res.status(200).send("New board created successfully");
    } else {
      res.status(400).send("Could not create the new board!");
    }
  } catch (error) {
    console.error(error.message);
  }
});

router.post("/delete/:board_id", verify, async (req, res) => {
  auth_user = req.header("auth-user");
  try {
    const delete_res = await pool.query(
      `DELETE FROM boards WHERE board_id=$1`,
      [req.params.board_id]
    );
    if (delete_res.rowCount > 0) {
      res.status(200).send("Board deleted successfully");
    } else {
      res.status(400).send("Could not create the new board!");
    }
  } catch (error) {
    console.error(error.message);
  }
});

router.post("/:board_id/update", verify, async (req, res) => {
  try {
    const update_res = await pool.query(
      `UPDATE boards SET title=$1 WHERE board_id=$2 RETURNING *`,
      [req.body.board_title, req.params.board_id]
    );
    if (update_res.rowCount > 0) {
      res.status(200).send("Board name updated successfully!");
    } else {
      res.status(400).send("Could not update the board name!");
    }
  } catch (error) {
    console.error(error.message);
  }
});

router.post("/:board_id/add_collab", verify, async (req, res) => {
  try {
    const insert_res = await pool.query(
      `INSERT INTO userboards (user_id, board_id) VALUES ($1, $2) RETURNING *`,
      [req.body.user_id, req.params.board_id]
    );
    if (insert_res.rowCount > 0) {
      res.status(200).send("Collaborator added successfully!");
    } else {
      res.status(400).send("Could not add the collaborator!");
    }
  } catch (error) {
    console.error(error.message);
  }
});

router.post("/:board_id/remove_collab", verify, async (req, res) => {
  try {
    const delete_res = await pool.query(
      `DELETE FROM userboards WHERE user_id=$1 AND board_id=$2 RETURNING *`,
      [req.body.user_id, req.params.board_id]
    );

    const delete_assignments = await pool.query(
      `DELETE FROM taskassignees WHERE user_id=$1 AND board_id=$2 RETURNING *`,
      [req.body.user_id, req.params.board_id]
    );

    if (delete_res.rowCount > 0 && delete_assignments.rowCount > 0) {
      res.status(200).send("Collaborator removed successfully!");
    } else {
      res.status(400).send("Could not remove the collaborator!");
    }
  } catch (error) {
    console.error(error.message);
  }
});

module.exports = router;

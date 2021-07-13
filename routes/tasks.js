const router = require("express").Router();
const verify = require("./verifyToken");
const pool = require("../dbConfig");

router.post("/", verify, async (req, res) => {
  try {
    const insert_res = await pool.query(
      `INSERT INTO tasks (title, description, list_id, rank) VALUES ($1, $2, $3, $4) RETURNING *`,
      [
        req.body.title,
        req.body.description,
        req.body.list_id,
        req.body.num_elems + 1
      ]
    );
    if (insert_res.rowCount <= 0) {
      res.status(400).send("Could not create the new task!");
    } else {
      res.status(200).send("New task added successfully");
    }
  } catch (error) {
    console.error(error.message);
  }
});

router.post("/delete", verify, async (req, res) => {
  try {
    const delete_res = await pool.query(`DELETE FROM tasks WHERE task_id=$1`, [
      req.body.task_id
    ]);
    res.status(200).send("Task Deleted!");
  } catch (error) {
    console.error(error.message);
  }
});

router.post("/update", verify, async (req, res) => {
  try {
    const update_res = await pool.query(
      `UPDATE tasks SET title=$1, description=$2, priority=$3 WHERE task_id=$4 RETURNING *`,
      [
        req.body.title,
        req.body.description,
        req.body.priority ? req.body.priority.toLowerCase() : null,
        req.body.task_id
      ]
    );
    if (update_res.rowCount <= 0) {
      console.log("not able to update the task");
      res.status(400).send("Could not update the task!");
    } else {
      for (i in req.body.assignees) {
        const insert_res = await pool.query(
          `INSERT INTO taskassignees (task_id, user_id, board_id) VALUES ($1, $2, $3) RETURNING *`,
          [req.body.task_id, req.body.assignees[i], req.body.board_id]
        );
        if (insert_res.rowCount <= 0) {
          console.log("not able to add assignees to the task");
        }
      }
      for (i in req.body.removed_assignees) {
        const delete_res = await pool.query(
          `DELETE FROM taskassignees WHERE task_id=$1 AND user_id=$2`,
          [req.body.task_id, req.body.removed_assignees[i]]
        );
      }
      res.status(200).send("Task updated");
    }
  } catch (error) {
    console.error(error.message);
  }
});

router.post("/reorder", verify, async (req, res) => {
  try {
    for (i in req.body) {
      list = req.body[i];
      for (j in list.tasks) {
        const update_task = await pool.query(
          `UPDATE tasks SET list_id=$1, rank=$2 WHERE task_id=$3 RETURNING *`,
          [list.list_id, j, list.tasks[j].task_id]
        );
        if (update_task.rows.rowCount <= 0) {
          res.status(400).send("Could not sync!");
        }
      }
    }
    res.status(200).send("Synced");
  } catch (error) {
    console.error(error.message);
  }
});

module.exports = router;

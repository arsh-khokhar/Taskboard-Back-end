const router = require("express").Router();
const verify = require("./verifyToken");
const pool = require("../dbConfig");

router.post("/", verify, async (req, res) => {
  console.log(req.body);
  try {
    const insert_res = await pool.query(
      `INSERT INTO lists (title, board_id) VALUES ($1, $2) RETURNING *`,
      [req.body.title, req.body.board_id]
    );
    if (insert_res.rowCount > 0) {
      res.status(200).send(`New list created successfully`);
    } else {
      res.status(400).send("Could not create the new list!");
    }
  } catch (error) {
    console.error(error.message);
  }
});

router.post("/update", verify, async (req, res) => {
  try {
    const update_res = await pool.query(
      `UPDATE lists SET title=$1 WHERE list_id=$2 RETURNING *`,
      [req.body.title, req.body.list_id]
    );
    if (update_res.rowCount <= 0) {
      res.status(400).send("Could not update the list!");
    } else {
      res.status(200).send("List updated");
    }
  } catch (error) {
    console.error(error.message);
  }
});

router.post("/delete", verify, async (req, res) => {
  try {
    const delete_res = await pool.query(`DELETE FROM lists WHERE list_id=$1`, [
      req.body.list_id
    ]);
    res.status(200).send("List Deleted!");
  } catch (error) {
    console.error(error.message);
  }
});

module.exports = router;

const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./dbConfig");

const authRoute = require("./routes/auth");
const boardsRoute = require("./routes/boards");
const listsRoute = require("./routes/lists");
const tasksRoute = require("./routes/tasks");

app.set("port", process.env.PORT || 5000);

app.use(cors());

app.use(express.json());
app.use("/api/users", authRoute);
app.use("/api/boards", boardsRoute);
app.use("/api/lists", listsRoute);
app.use("/api/tasks", tasksRoute);

app.get("/api", async (req, res) => {
  res.status(200).send("Welcome to Taskboard API");
});

app.get("/api/ping_database", async (req, res) => {
  try {
    const ping_res = await pool.query(`SELECT NOW() AS servertime`);
    if (ping_res.rowCount > 0) {
      res.status(200).send("Ping received from the database!");
    } else {
      res.status(400).send("Could not ping the database!");
    }
  } catch (error) {
    console.error(error.message);
  }
});

app.listen(app.get("port"), () => console.log(`Server has started!`));

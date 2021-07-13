const express = require("express");
const app = express();
const cors = require("cors");

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

app.listen(app.get("port"), () => console.log(`Server has started!`));

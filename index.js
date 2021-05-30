const express = require('express');
const app = express();

const authRoute = require('./routes/auth');
const boardsRoute = require('./routes/boards');

app.use(express.json());
app.use('/api/users', authRoute);
app.use('/api/boards', boardsRoute);

app.listen(5000, () => console.log(`Server has started!`));

const express = require ('express');
const app = express ();

const authRoute = require ('./routes/auth');

app.use ('/api/user', authRoute);

app.listen (5000, () => console.log (`Server has started!`));

const router = require('express').Router();
const verify = require('./verifyToken');

router.get('/', verify, (req, res) => {
	res.send(`Got access to ${req.user.email}'s boards`);
});

module.exports = router;

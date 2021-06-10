const router = require('express').Router();
const verify = require('./verifyToken');

router.get('/', verify, (req, res) => {
	res.status(200).send(`Got access to ${req.user.email}'s boards`);
});

module.exports = router;

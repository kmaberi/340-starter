const express = require('express');
const router  = express.Router();

router.get('/trigger-error', (req, res, next) => {
  next(new Error('Intentional 500 Error for testing'));
});

module.exports = router;
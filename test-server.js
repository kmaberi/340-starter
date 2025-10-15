// test-server.js
const express = require('express');
const app = express();
const PORT = 5500;

console.log('test-server starting');

app.get('/', (req, res) => res.send('OK - test server'));

app.listen(PORT, () => {
  console.log(`test-server listening on http://localhost:${PORT}`);
});


// Routes
const inventoryRouter = require('./routes/inventory');
app.use('/inventory', inventoryRouter); // mount inventory routes at /inventory

try {
  const accountRouter = require('./routes/account');    
  app.use('/account', accountRouter); // mount account routes at /account
} catch (e) {
  console.warn('No ./routes/account.js found or it failed to load:', e.message);
}   
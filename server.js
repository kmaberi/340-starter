/* ******************************************
 * This is the application server
 * ******************************************/
/* Bring Express into scope and create the app */
const express = require("express");

const app = express();




/* ******************************************
 * Default GET route
 * ***************************************** */
app.get("/", (req, res) => { res.send("Welcome home!"); });

/* ******************************************
 * Server host name and port
 * ****************************************** */
const HOST = "localhost";
const PORT = process.env.PORT || 3000;

/* ***********************
 * Log statement to confirm server operation
 * *********************** */
app.listen(PORT, () => {
  console.log(`trial app listening on ${HOST}:${PORT}`);
});

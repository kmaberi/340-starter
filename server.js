/* ******************************************
 * This is the application server
 * ******************************************/
/* Bring Express into scope and create the app */
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
require("dotenv").config();

const app = express();

// Set the views directory
app.set("views", "./views");

// Set the view engine to EJS
app.set("view engine", "ejs");

// Use express-ejs-layouts
app.use(expressLayouts);

// Static files middleware
app.use(express.static("public"));

/* ******************************************
 * Default GET route
 * ***************************************** */
app.get("/", (req, res) => {
  res.render("index");
});

/* ******************************************
 * Server host name and port
 * ****************************************** */
const HOST = "localhost";
const PORT = process.env.PORT || 3000;

/* ***********************
 * Log statement to confirm server operation
 * *********************** */
app.listen(PORT, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});

/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/


/* ***********************
 * View Engine and Templates
 *************************/


app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")


/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
require("dotenv").config()
const app = express()
const static = require("./routes/static")

// index route
app.get("/", (req, res) => {res.render("index", {title: "Home"})})


/* ***********************
 * Routes
 *************************/
app.use(static)

/* ******************************************
 * Default GET route
 * ***************************************** */
app.get("/", (req, res) => {
  res.send("Welcome home!")
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 3000
const host = process.env.HOST || "localhost"

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})

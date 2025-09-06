const express = require("express")
const path = require("path")

const app = express()

// Now configure after defining app
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

// Middleware, routes, etc. go here
app.use(express.static("public"))

app.get("/", (req, res) => {
  res.send("Hello from Render!")
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

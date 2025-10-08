const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){
  const nav = await utilities.getNav()
  res.render("index", {title: "Home", nav})
}

/* ****************************************
*  Deliver 500 error test page
* *************************************** */
baseController.triggerError = async function(req, res, next){
  // Intentionally throw an error for testing
  throw new Error('Intentional 500 Error - Test Successful')
}

/* ****************************************
*  Deliver 404 error page
* *************************************** */
baseController.build404 = async function(req, res, next) {
  const nav = await utilities.getNav()
  res.status(404).render("errors/error", {
    title: "Page Not Found",
    nav,
    error: { 
      status: 404,
      message: "Sorry, the page you requested cannot be found."
    }
  })
}

module.exports = baseController

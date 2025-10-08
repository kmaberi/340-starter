/* ******************************************
 * Error handling middleware
 *******************************************/
const errorHandler = (err, req, res, next) => {
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  if(err.status == 404){ message = err.message} else {message = 'Oh no! There was a crash. Maybe try a different route?'}
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav: req.nav,
    error: {
      status: err.status || 500,
      message: err.message || 'Internal Server Error'
    }
  })
}

module.exports = { errorHandler }
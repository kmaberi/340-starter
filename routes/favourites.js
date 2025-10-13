// in routes/account.js (or routes/favorites.js)
const favoritesController = require('../controllers/favoritesController');

// POST /account/favorites/add
router.post('/favorites/add', utilities.checkLogin, utilities.handleErrors(favoritesController.addFavorite));

// POST /account/favorites/remove
router.post('/favorites/remove', utilities.checkLogin, utilities.handleErrors(favoritesController.removeFavorite));

// GET /account/favorites (list view)
router.get('/favorites', utilities.checkLogin, utilities.handleErrors(favoritesController.listFavoritesView));

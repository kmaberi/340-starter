// controllers/favoritesController.js
const favoritesModel = require('../models/favorites-model');

exports.addFavorite = async (req, res, next) => {
  try {
    const account_id = res.locals.accountData?.account_id;
    const inv_id = Number(req.body.inv_id);
    if (!account_id) return res.status(401).json({ error: 'Not logged in' });
    if (!inv_id) return res.status(400).json({ error: 'Invalid vehicle id' });

    await favoritesModel.addFavorite(account_id, inv_id);
    return res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

exports.removeFavorite = async (req, res, next) => {
  try {
    const account_id = res.locals.accountData?.account_id;
    const inv_id = Number(req.body.inv_id);
    if (!account_id) return res.status(401).json({ error: 'Not logged in' });

    await favoritesModel.removeFavorite(account_id, inv_id);
    return res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

exports.listFavoritesView = async (req, res, next) => {
  try {
    const account_id = res.locals.accountData?.account_id;
    if (!account_id) {
      req.flash('notice', 'Please log in to view favorites.');
      return res.redirect('/account/login');
    }
    const vehicles = await favoritesModel.getFavoritesByAccount(account_id);
    res.render('account/favorites', {
      title: 'My Favorites',
      vehicles,
      nav: await require('../utilities').getNav(),
    });
  } catch (err) {
    next(err);
  }
};
console.log('Rendering view: inventory/classification with', (vehicles||[]).length, 'vehicles');
exports.isFavorited = async (req, res, next) => {
  try {
    const account_id = res.locals.accountData?.account_id;
    const inv_id = Number(req.params.inv_id);
    if (!account_id) return res.status(401).json({ error: 'Not logged in' });
    if (!inv_id) return res.status(400).json({ error: 'Invalid vehicle id' });

    const isFavorited = await favoritesModel.isFavorited(account_id, inv_id);
    return res.json({ isFavorited });
  } catch (err) {
    next(err);
  }
};
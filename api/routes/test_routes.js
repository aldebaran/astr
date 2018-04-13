module.exports = function(app) {
  var film = require('../controllers/test_controller');

  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  app.route('/api/tests')
    .get(film.getAllTests);

  app.get('/api/tests/:id', (req, res) => {
    const id = req.params.id;
    film.getTest(id, res);
  });

};

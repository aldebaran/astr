module.exports = function(app) {

  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  app.get('/api/download/:id', function (req, res, next) {
    var filePath = 'archives/'; // Or format the path using the `id` rest param
    var fileName = req.params.id + '.zip';
    res.download(filePath + fileName);
  });

};

module.exports = function(app) {
  var test = require('../controllers/test_controller');

  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  app.route('/api/tests')
    .get(test.getAllTests)
    .post(test.getTestsByQuery);

  app.route('/api/tests/add')
    .post(test.addTest);

  app.get('/api/tests/id/:id', (req, res) => {
    const id = req.params.id;
    test.getTest(id, res);
  });

  app.post('/api/tests/id/:id', (req, res) => {
    const id = req.params.id;
    const body = req.body;
    test.updateTest(id, body, res);
  });

  app.delete('/api/tests/id/:id', (req, res) => {
    const id = req.params.id;
    test.deleteTest(id, res);
  });

  app.route('/api/tests/authors')
    .get(test.getDistinctAuthors);

  app.route('/api/tests/subjects')
    .get(test.getDistinctSubjects);

  app.route('/api/tests/configurations')
    .get(test.getDistinctConfigurations);

  app.get('/api/tests/configurations/:subject', (req, res) => {
    const subject = req.params.subject;
    test.getConfigurationsOfSubject(subject, res);
  });

};

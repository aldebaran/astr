module.exports = function(app) {
  var testSubject = require('../controllers/test_subject_controller');

  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  app.route('/api/test-subjects')
    .get(testSubject.getAllTestSubjects)
    .post(testSubject.addTestSubject);

  app.get('/api/test-subjects/id/:id', (req, res) => {
    const id = req.params.id;
    testSubject.getTestSubject(id, res);
  });

  app.post('/api/test-subjects/id/:id', (req, res) => {
    const id = req.params.id;
    const body = req.body;
    testSubject.updateTestSubject(id, body, res);
  });

  app.delete('/api/test-subjects/id/:id', (req, res) => {
    const id = req.params.id;
    testSubject.deleteTestSubject(id, res);
  });

  app.get('/api/test-subjects/options/:subject/:configName', (req, res) => {
    const subjectName = req.params.subject;
    const configName = req.params.configName;
    testSubject.getOptionsOfConfig(subjectName, configName, res);
  }); 

};

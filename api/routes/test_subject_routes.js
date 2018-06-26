module.exports = function(app) {
  var testSubject = require('../controllers/test_subject_controller');

  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  app.route('/api/test-subjects')
  .get(testSubject.getAllTestSubjects) // GET: Returns the list of all test subjects
  .post(testSubject.addTestSubject); // POST:  Add a new test subject in the DB in function of the parameters given in the body request

  app.route('/api/test-subjects/id/:id')
  .get(testSubject.getTestSubject) // GET: Returns the test subject with the associated ID
  .post(testSubject.updateTestSubject) // POST:  Update the test subject with the associated ID in function of the parameters given in the body request
  .delete(testSubject.deleteTestSubject); // DELETE: Delete the test subject with the associated ID

  app.route('/api/test-subjects/name/:name')
  .get(testSubject.getTestSubjectByName); // GET: Returns the test subject with the associated name

  app.route('/api/test-subjects/options/:subject/:configName')
  .get(testSubject.getOptionsOfConfig); // GET: Returns the options of a configuration
};

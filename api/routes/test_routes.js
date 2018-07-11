module.exports = function(app) {
  var test = require('../controllers/test_controller');

  app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

  app.route('/api/tests')
  .get(test.getAllTests) // GET: Returns the list of all tests
  .post(test.getTestsByQuery); // POST: Returns the list of tests that match with the parameters given in the body request

  app.route('/api/tests/page/:page/:resultPerPage')
  .post(test.getTestsByQueryAndPage); // POST: Returns the list of tests that match with the parameters given in the body request, with pagination

  app.route('/api/tests/add')
  .post(test.addTest); // POST: Add a new test in the DB in function of the parameters given in the body request

  app.route('/api/tests/id/:id')
  .get(test.getTest) // GET: Returns the test with the associated ID
  .post(test.updateTest) // POST: Update the test with the associated ID in function of the parameters given in the body request (only the date, the comments, and the configuration values can be updated)
  .delete(test.deleteTest); // DELETE: Delete the test with the associated ID

  app.route('/api/tests/YAMLformat/id/:id')
  .get(test.getTestInYAMLFormat); // GET: Returns the test with the associated ID in a YAML format, to store it in the archive

  app.route('/api/tests/authors')
  .get(test.getDistinctAuthors); // GET: Returns the list of test authors (that wrote at least one test)

  app.route('/api/tests/subjects')
  .get(test.getDistinctSubjects); // GET: Returns the list of test subjects (used at least by one test)

  app.route('/api/tests/configurations')
  .get(test.getDistinctConfigurations); // GET: Returns the list of configurations (used at least by one test)

  app.route('/api/tests/configurations/:subject')
  .get(test.getConfigurationsOfSubject); // GET: Returns the list of configurations of the associated subject (used at least by one test)

  app.route('/api/tests/options/:configname')
  .get(test.getOptionsOfConfig); // GET: Returns the  options of the associated configuration (used at least one time)

  app.route('/api/tests/changeTestSubjectName')
  .post(test.changeTestSubjectName); // POST: Change the test type of all the tests matched by {type: previousName} (body contains previousName and newName)

  app.route('/api/tests/addConfig')
  .post(test.addConfig); // POST: Push a new configuration in all tests matched by the test type/subject (body contains subject and config: {name, value})

  app.route('/api/tests/changeConfigName')
  .post(test.changeConfigName); // POST: Change the name of the matched configuration in all tests matched by the test type/subject (body contains subject, previousName and newName)

  app.route('/api/tests/withoutArchive')
  .get(test.getAllTestsWithoutArchive); // GET: Returns the list of all tests without any archive (to delete them)
};

module.exports = function(app) {
  var user = require('../controllers/user_controller');

  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  app.route('/api/user')
  .get(user.getAllUsers) // GET: Returns the list of all the users
  .post(user.AddUserAndLogin); // POST: Used for connection if the body contains logemail and logpassword; or for adding a new user if the body contains email, firstname, lastname, password and passwordConf

  app.route('/api/user/master')
  .get(user.getAllMasters); // GET: Returns the list of all the masters

  app.route('/api/user/id/:id')
  .get(user.getUser) // GET: Returns the user with the associated ID
  .post(user.updateUser) // POST:  Update the user with the associated ID in function of the parameters given in the body request (only the variable write_permission and master can be modified)
  .delete(user.deleteUser); // DELETE: Delete the user with the associated ID

  app.route('/api/user/email/:email')
  .get(user.getUserByEmail); // GET: Returns the user with the associated email

  app.route('/api/user/profile')
  .get(user.getProfile); // GET: Returns the information about the user logged in the machine

  app.route('/api/user/logout')
  .get(user.logout); // GET: Log out the user logged in the machine

  app.route('/api/user/newToken/:type')
  .get(user.newToken); // GET: Generate a new token for the user, returns it and store it encrypted in the database (type can be 'session' or 'persistent')

};

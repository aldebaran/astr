# Archiving System of Test Results (A.S.T.R.)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Installation](#installation)
- [API](#api)
    - [Endpoints](#endpoints)
        - [Test](#test)
        - [Test subject](#test-subject)
        - [User](#user)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Techs used

- NoSQL database: [MongoDB](https://www.mongodb.com/)
- [Node.js](https://nodejs.org/en/)
    - [express](https://www.npmjs.com/package/express) *(to build web application and API)*
    - [express-session](https://www.npmjs.com/package/express-session) *(to handle user session and cookies)*
    - [mongodb](https://www.npmjs.com/package/mongodb) and [connect-mongo](https://www.npmjs.com/package/connect-mongo) *(to access the database)*
    - [mongoose](https://www.npmjs.com/package/mongoose) *(to easily make queries on the database)*
    - [bcrypt](https://www.npmjs.com/package/bcrypt) *(to encrypt passwords)*
    - [nodemon](https://www.npmjs.com/package/nodemon) *(for development, to restart automatically the application when a file is changed)*

## Useful tools

- [Postman](https://www.getpostman.com/) *(best GUI to make HTTP requests, useful to try queries on the API)*
- [Robo 3T](https://robomongo.org/) *(GUI for MongoDB)*

## Installation

Todo

## API

### Endpoints

#### Test

1. [/api/tests](http://10.0.160.147:8000/api/tests)
    - GET: Returns the list of all the tests
    - POST: Returns the list of tests that match with the parameters given in the body request
2. [/api/tests/add](http://10.0.160.147:8000/api/tests/add)
    - POST: Add a new test in the DB in function of the parameters given in the body request
3. [/api/tests/:id](http://10.0.160.147:8000/api/tests/5ad4acca99c34a25b3d34ae0)
    - GET: Returns the test with the associated ID
    - POST: Update the test with the associated ID in function of the parameters given in the body request
    - DELETE: Delete the test with the associated ID

*Try the queries with [Postman](https://www.getpostman.com/)!*

#### Test subject 

Todo

#### User 

Todo
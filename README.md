# Archiving System of Test Results (A.S.T.R.)

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
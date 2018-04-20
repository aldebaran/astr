# Archiving System of Test Results (A.S.T.R.)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Techs used](#techs-used)
- [Useful tools](#useful-tools)
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

To deploy the application on a server, follow these steps.

On the server:

**1. Install MongoDB**

:warning: The installation process will differ depending of the Linux distribution. Follow the tutorial corresponding to yours: 
- [Ubuntu](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/)
- [Debian 7 or 8](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-debian/)
- [Debian 9](https://www.globo.tech/learning-center/install-mongodb-debian-9/)

**2. Launch MongoDB**

- Open a terminal and run

```
sudo service mongod start
```

- Or (on Debian 9)

```
systemctl start mongodb
```

**3. Create the database**

- Open a Mongo Client in the terminal

```
mongo
```

- Create the database

```
use ASTR
```

- We need to insert a document to complete the creation of the database. Let's insert an empty document in the collection "uselesscollection"

```
db.uselesscollection.insert({})
```

- Now, check that the database is in the list of existing dbs

```
show dbs
```

**4. Install Node.js**

:warning: Install the lastest version of Node.js, don't take the LTS version.

- Follow [this](https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions) tutorial.

**5. Clone the repository**

```
git clone git@gitlab.aldebaran.lan:hardware-test/astr.git
```

**6. Install the modules**

- In your terminal, move to the folder of the repository
- At the root of the folder run

```
npm install
```

- It will install all the Node.js modules used in the application (listed in [package.json](https://gitlab.aldebaran.lan/hardware-test/astr/blob/master/package.json))

**7. Launch the application**

- At the root of the folder run

```
npm start
```

- Or (for development)

```
npm run dev
```

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
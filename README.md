# Archiving System of Test Results (A.S.T.R.)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Techs used](#techs-used)
- [Useful tools](#useful-tools)
- [Installation](#installation)
  - [1. Install MongoDB](#1-install-mongodb)
  - [2. Launch MongoDB](#2-launch-mongodb)
  - [3. Create the database](#3-create-the-database)
  - [4. Install Node.js](#4-install-nodejs)
  - [5. Clone the repository](#5-clone-the-repository)
  - [6. Install the modules](#6-install-the-modules)
  - [7. Launch the application](#7-launch-the-application)
- [API endpoints](#api-endpoints)
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
    - [multer](https://www.npmjs.com/package/multer) *(to upload files on the server)*
    - [archiver](https://www.npmjs.com/package/archiver) *(to zip the files)*
    - [nodemon](https://www.npmjs.com/package/nodemon) *(for development, to restart automatically the application when a file is changed)*

## Useful tools

- [Postman](https://www.getpostman.com/) *(best GUI to make HTTP requests, useful to try queries on the API)*
- [Robo 3T](https://robomongo.org/) *(GUI for MongoDB)*

## Installation

To deploy the application on a server, follow these steps.

On the server:

### 1. Install MongoDB

:warning: The installation process will differ depending of the Linux distribution. Follow the tutorial corresponding to yours: 
- [Ubuntu](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/)
- [Debian 7 or 8](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-debian/)
- [Debian 9](https://www.globo.tech/learning-center/install-mongodb-debian-9/)

### 2. Launch MongoDB

- Open a terminal and run

```
sudo service mongod start
```

- Or (on Debian 9)

```
systemctl start mongodb
```

### 3. Create the database

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

### 4. Install Node.js

:warning: Install the lastest version of Node.js, don't take the LTS version.

- Follow [this](https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions) tutorial.

### 5. Clone the repository

```
git clone git@gitlab.aldebaran.lan:hardware-test/astr.git
```

### 6. Install the modules

- In your terminal, move to the folder of the repository
- At the root of the folder run

```
npm install
```

- It will install all the Node.js modules used in the application (listed in [package.json](https://gitlab.aldebaran.lan/hardware-test/astr/blob/master/package.json))

### 7. Launch the application

- At the root of the folder run

```
npm start
```

- Or (for development)

```
npm run dev
```

## API endpoints

#### Test

1. [/api/tests](http://10.0.160.147:8000/api/tests)
    - GET: Returns the list of all the tests
    - POST: Returns the list of tests that match with the parameters given in the body request
2. [/api/tests/add](http://10.0.160.147:8000/api/tests/add)
    - POST: Add a new test in the DB in function of the parameters given in the body request
3. [/api/tests/id/:id](http://10.0.160.147:8000/api/tests/id/5adf356dda64c157e53c6b18)
    - GET: Returns the test with the associated ID
    - POST: Update the test with the associated ID in function of the parameters given in the body request
    - DELETE: Delete the test with the associated ID
4. [/api/tests/authors](http://10.0.160.147:8000/api/tests/authors)
    - GET: Returns the list of test authors (that wrote at least one test)
5. [/api/tests/subjects](http://10.0.160.147:8000/api/tests/subjects)
    - GET: Returns the list of test subjects (used at least by one test)
6. [/api/tests/configurations](http://10.0.160.147:8000/api/tests/configurations)
    - GET: Returns the list of configurations (used at least by one test)
7. [/api/tests/configurations/:subject](http://10.0.160.147:8000/api/tests/configurations/CAMERA)
    - GET: Returns the list of configurations of the associated subject (used at least by one test)

#### Test subject 

1. [/api/test-subjects](http://10.0.160.147:8000/api/test-subjects)
    - GET: Returns the list of all the test subjects
    - POST:  Add a new test subject in the DB in function of the parameters given in the body request
2. [/api/test-subjects/:id](http://10.0.160.147:8000/api/test-subjects/5adf3559da64c157e53c6b17)
    - GET: Returns the test subject with the associated ID
    - POST:  Update the test subject with the associated ID in function of the parameters given in the body request
    - DELETE: Delete the test subject with the associated ID

#### User 

1. [/api/user](http://10.0.160.147:8000/api/user)
    - GET: Returns the list of all the users
    - POST: Used for connection if the body contains *logemail* and *logpassword*; or for adding a new user if the body contains *email*, *firstname*, *lastname*, *password* and *passwordConf*
2. [/api/user/master](http://10.0.160.147:8000/api/user/master)
    - GET: Returns the list of all the masters
3. [/api/user/id/:id](http://10.0.160.147:8000/api/user/id/5ad8aad45aa7dd1b0f17e7f9)
    - GET: Returns the user with the associated ID
    - POST:  Update the user with the associated ID in function of the parameters given in the body request (only the variable *write_permission* and *master* can be modified)
    - DELETE: Delete the user with the associated ID
4. [/api/user/profile](http://10.0.160.147:8000/api/user/profile)
    - GET: Returns the information about the user logged in the machine
5. [/api/user/logout](http://10.0.160.147:8000/api/user/logout)
    - GET: Log out the user logged in the machine





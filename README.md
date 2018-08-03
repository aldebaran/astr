# Archiving System Truly Restful (A.S.T.R.)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Description of the tool](#description-of-the-tool)
  - [Global architecture](#global-architecture)
  - [Website](#website)
  - [User privileges](#user-privileges)
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
  - [8. Create the first Admin](#8-create-the-first-admin)
  - [9. Monitor the application (optional)](#9-monitor-the-application-optional)
- [Authentification](#authentification)
  - [Request Header](#request-header)
  - [Tokens](#tokens)
    - [Description](#description)
    - [Expiration](#expiration)
- [Python library](#python-library)
- [API endpoints](#api-endpoints)
    - [Archives](#archives)
    - [Archive Categories](#archive-categories)
    - [Search](#search)
    - [Users](#users)
    - [Upload](#upload)
    - [Download](#download)
    - [Application](#application)
    - [Stats](#stats)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Description of the tool

### Global architecture
![global architecture](https://gitlab.aldebaran.lan/hardware-test/astr/raw/dev/img/global_architecture.png)

### Website

The website is currently hosted on the IVV server at this address: [10.0.160.147:8000](http://10.0.160.147:8000/).

Here are the main features:
![website architecture](https://gitlab.aldebaran.lan/hardware-test/astr/raw/dev/img/website_architecture.png)

### User privileges

![user privieges](https://gitlab.aldebaran.lan/hardware-test/astr/raw/dev/img/user_privileges.png)

### Techs used

- NoSQL database: [MongoDB](https://www.mongodb.com/)
- [Node.js](https://nodejs.org/en/)
    - [express](https://www.npmjs.com/package/express) *(to build web application and API)*
    - [express-session](https://www.npmjs.com/package/express-session) *(to handle user session)*
    - [cookie-parser](https://www.npmjs.com/package/cookie-parser) *(to handle cookies)*
    - [mongodb](https://www.npmjs.com/package/mongodb) and [connect-mongo](https://www.npmjs.com/package/connect-mongo) *(to access the database)*
    - [mongoose](https://www.npmjs.com/package/mongoose) *(to easily make queries on the database)*
    - [bcrypt](https://www.npmjs.com/package/bcrypt) *(to encrypt passwords)*
    - [md5](https://www.npmjs.com/package/md5) *(to encrypt tokens)*
    - [uuid](https://www.npmjs.com/package/uuid) *(to generate Universally Unique Identifier)*
    - [multer](https://www.npmjs.com/package/multer) *(to upload files on the server)*
    - [archiver](https://www.npmjs.com/package/archiver) *(to zip the files)*
    - [diskspace](https://www.npmjs.com/package/diskspace) *(to have information about the disk usage of the server)*
    - [get-folder-size](https://www.npmjs.com/package/get-folder-size) *(to know the size of a folder)*
    - [nodemon](https://www.npmjs.com/package/nodemon) *(for development, to restart automatically the application when a file is changed)*
    - [pm2](https://www.npmjs.com/package/pm2) *(for production, to restart automatically the application if it crashes)*

### Useful tools

- [Postman](https://www.getpostman.com/) *(best GUI to make HTTP requests, useful to try queries on the API)*
- [Robo 3T](https://robomongo.org/) *(GUI for MongoDB)*

## Installation

To deploy the application on a server, follow these steps.

On the server:

### 1. Install MongoDB

- [Ubuntu 14.04 / 16.04](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/)
- [Debian 7 / 8 / 9](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-debian/)

### 2. Launch MongoDB

- Open a terminal and run

```
sudo service mongod start
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

:warning: Install [Node.js](https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions) (version 9.x).
```
curl -sL https://deb.nodesource.com/setup_9.x | sudo -E bash -
sudo apt-get install -y nodejs
```

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

- If an error occured, try with `sudo`

- It will install all the Node.js modules used in the application (listed in [package.json](https://gitlab.aldebaran.lan/hardware-test/astr/blob/master/package.json))

- Install [pm2](https://www.npmjs.com/package/pm2) module
```
npm install pm2 -g
```

### 7. Launch the application

- At the root of the folder run
```
npm run prod
```
*:arrow_right_hook: This command starts the application with [pm2](https://www.npmjs.com/package/pm2) at port 8000.*

- Or (for development only)
```
npm run dev
```
*:arrow_right_hook:	This command starts the application with [nodemon](https://www.npmjs.com/package/nodemon) at port 8000.*

- To use a different port, launch the application as follow
```
# for production
npm run prod -- -- 3000
# for development
npm run dev 3000
```

- To stop the server in production mode
```
npm stop
# OR
pm2 delete {pm2_processs_id}
```

### 8. Create the first Admin

**From your personal computer, open the website** (serverIP:8000)
- Click on *Login*
- Click on *Register an Account*
- Fulfill the form to create your account (it will create a simple user without any permission)

**From the server, open a terminal**
- Open the mongoDB client
```
mongo
```

- Switch to ASTR database
```
use ASTR
```

- Update your account with full privileges
```
db.users.update({"email": "yourEmail"}, {"$set": {"master": true, "write_permission": true}})
```

- That's it! You are now a "Master", that means you can modify directly users permissions on the website

### 9. Monitor the application (optional)

- If you started the application with `npm run prod`, you can monitor it by running
```
pm2 monit
```

- You will be able to see some informations like the application logs, the CPU utilization, the number of restarts, etc.

## Authentification

Some requests to the API require authentification. A website user doesn't need to worry about it because it is completely transparent and handled with cookies. But a script user will have to authentificate to do some actions.

### Request Header

To verify that the user has the required authorizations, he has to authentificate in the request header with his email and one of his tokens, using [Basic authentication](https://en.wikipedia.org/wiki/Basic_access_authentication).

```
Authorization: Basic email:token
```

If the user doesn't authentificate or give a wrong token, an 401 error (Unauthorized) will be return.

An example with curl:
```
curl -X DELETE \
     -u john.doe@softbankrobotics.com:d2147e39-8b6e-4c7b-b4ca-f93529dfbbd1 \
      http://10.0.160.147:8000/api/archives/id/5b19442c5dd23f39e6f5e6d8
```

In the [Python library](https://gitlab.aldebaran.lan/hardware-test/astr/tree/master/lib-python-astr), everything is already handled by [client.py](https://gitlab.aldebaran.lan/hardware-test/astr/blob/master/lib-python-astr/libastr/client.py). The user only needs to configure his environment variables (cf. [configuration](#configuration))

### Tokens

#### Description

Tokens are [uuid](https://en.wikipedia.org/wiki/Universally_unique_identifier) (v4): string of 32 random hexadecimal digits.
They are stored encrypted in the database using [MD5](https://en.wikipedia.org/wiki/MD5) hash function. MD5 is known to be vulnerable, but it is perfectly safe to use it on long strings of random characters. Therefore, there is no need to overload the server CPU with more complex hashing algorithms.

Users have two types of tokens:
- **session-tokens**: for website usage. A new token is created on login and is deleted on logout. It is stored in the client cookies and used for requests with authentication. This process is completely transparent for the user.
- **persistent-tokens**: for script usage. The user can create as many persistent-tokens as he wants on the [profile](http://10.0.160.147:8000/profile.html) page. All of them have a name and an expiration date of one year. The user must store these tokens in local files on his PC. In fact, they are stored encrypted on the database, so it won't be possible to access their original form after creation.

#### Expiration

Tokens expiration dates are checked when the user logs in. If the date is passed, then the token is removed from the list and therefore can no longer be used.

## Python library

Libastr is a **Python3** library designed to ease python scripting with A.S.T.R. API. It includes multiple features like retrieving, downloading, uploading archives.

Find all the information about it in the dedicated repository: [lib-python-astr](https://gitlab.aldebaran.lan/naoqi-tests/lib-python-astr)

## API endpoints

#### Archives

1. [/api/archives](http://10.0.160.147:8000/api/archives)
    - GET: Returns the list of all archives (sorted by creation date in descending order)
    - POST: Returns the list of archives that match with the parameters given in the body request (sorted by creation date in descending order)
2. [/api/archives/page/:page/:resultPerPage](http://10.0.160.147:8000/api/archives/page/2/30)
    - POST: Returns the list of archives that match with the parameters given in the body request, with pagination (sorted by creation date in descending order)
3. [/api/archives/add](http://10.0.160.147:8000/api/archives/add)
    - POST: Add a new archive in the DB in function of the parameters given in the body request **(user must have write permission)**
4. [/api/archives/id/:id](http://10.0.160.147:8000/api/archives/id/5adf356dda64c157e53c6b18)
    - GET: Returns the archive with the associated ID
    - POST: Update the archive with the associated ID in function of the parameters given in the body request (only the date, the comments, and the descriptors values can be updated) **(user must be master or owner of the archive)**
    - DELETE: Delete the archive with the associated ID **(user must be master or owner of the archive)**
5. [/api/archives/authors](http://10.0.160.147:8000/api/archives/authors)
    - GET: Returns the list of archive authors (that added at least one archive)
6. [/api/archives/categories](http://10.0.160.147:8000/api/archives/categories)
    - GET: Returns the list of archive categories (used at least by one archive)
7. [/api/archives/descriptors](http://10.0.160.147:8000/api/archives/descriptors)
    - GET: Returns the list of descriptors (used at least by one archive)
8. [/api/archives/descriptors/:category](http://10.0.160.147:8000/api/archives/descriptors/CAMERA)
    - GET: Returns the list of descriptors of the associated archive category (used at least by one archive)
9. [/api/archives/options/:descriptorName](http://10.0.160.147:8000/api/archives/options/robot_type)
    - GET: Returns the  options of the associated descriptor (used at least one time)
10. [/api/archives/changeArchiveCategoryName](http://10.0.160.147:8000/api/archives/changeArchiveCategoryName)
    - POST: Change the category name of all the archives matched by {category: previousName} (body contains previousName and newName) **(user must be master)**
11. [/api/archives/addDescriptor](http://10.0.160.147:8000/api/archives/addDescriptor)
    - POST: Push a new descriptor in all archives matched by the archive category (body contains *category* and *descriptor: {name, value}*) **(user must be master)**
12. [/api/archives/changeDescriptorName](http://10.0.160.147:8000/api/archives/changeDescriptorName)
    - POST: Change the name of the matched descriptors in all archives matched by the archive category (body contains *category*, *previousName* and *newName*) **(user must be master)**
13. [/api/archives/withoutArchive](http://10.0.160.147:8000/api/archives/withoutArchive)
    - GET: Returns the list of all archives that are missing in the folder "archives" (to delete them)
14. [/api/archives/YAMLformat/id/:id](http://10.0.160.147:8000/api/archives/YAMLformat/id/:id)
    - GET: Returns the archive with the associated ID in a YAML format, to store it in the zip

#### Archive Categories

1. [/api/categories](http://10.0.160.147:8000/api/categories)
    - GET: Returns the list of all archive categories
    - POST:  Add a new archive category in the DB in function of the parameters given in the body request **(user must be master)**
2. [/api/categories/id/:id](http://10.0.160.147:8000/api/categories/id/5adf3559da64c157e53c6b17)
    - GET: Returns the archive category with the associated ID
    - POST: Update the archive category with the associated ID in function of the parameters given in the body request **(user must be master)**
    - DELETE: Delete the archive category with the associated ID **(user must be master)**
3. [/api/categories/name/:name](http://10.0.160.147:8000/api/categories/name/CAMERA)
    - GET: Returns the archive category with the associated name
4. [/api/categories/options/:category/:descriptorName](http://10.0.160.147:8000/api/categories/options/WIFI/robot_type)
    - GET: Returns the options of a descriptor
5. [/api/categories/links/:category](http://10.0.160.147:8000/api/categories/links/:category)
    - GET: Returns the links of an archive category

#### Search

1. [/api/search](http://10.0.160.147:8000/api/search)
    - GET: Returns the list of all saved searches
    - POST:  Add a new search in the DB in function of the parameters given in the body request **(user must use authentification)**
2. [/api/search/id/:id](http://10.0.160.147:8000/api/search/id/5adf3559da64c157e53c6b17)
    - GET: Returns the search with the associated ID
    - DELETE: Delete the search with the associated ID **(user must be the owner of the search)**

#### Users

1. [/api/user](http://10.0.160.147:8000/api/user)
    - GET: Returns the list of all the users
    - POST: Used for connection if the body contains *logemail* and *logpassword*; or for adding a new user if the body contains *email*, *firstname*, *lastname*, *password* and *passwordConf*
2. [/api/user/master](http://10.0.160.147:8000/api/user/master)
    - GET: Returns the list of all the masters
3. [/api/user/id/:id](http://10.0.160.147:8000/api/user/id/5ad8aad45aa7dd1b0f17e7f9)
    - GET: Returns the user with the associated ID
    - POST:  Update the user with the associated ID in function of the parameters given in the body request (only the variable *write_permission* and *master* can be modified) **(user must be master)**
    - DELETE: Delete the user with the associated ID **(user must be master)**
4. [/api/user/email/:email](http://10.0.160.147:8000/api/user/email/john.doe@softbankrobotics.com)
    - GET: Returns the user with the associated email
5. [/api/user/profile](http://10.0.160.147:8000/api/user/profile)
    - GET: Returns the information about the user logged in the machine
6. [/api/user/logout](http://10.0.160.147:8000/api/user/logout)
    - GET: Log out the user logged in the machine
7. [/api/user/newToken/:type/:name](http://10.0.160.147:8000/api/user/newToken/persistent/laptop)
    - GET: Generate a new token for the user, returns it and store it encrypted in the database (type can be 'session' or 'persistent')
8. [/api/user/deleteToken/:id](http://10.0.160.147:8000/api/user/deleteToken/5b20db9770e56a3891e64cd1)
    - DELETE: Delete the token with the associated ID

#### Upload

1. [/api/upload](http://10.0.160.147:8000/api/upload)
    - POST: Upload files to the server in a ZIP. The name of the zip is the ID of the archive **(user must have write permission)**
2. [/api/upload/replace-zip](http://10.0.160.147:8000/api/upload/replace-zip)
    - POST: Replace zip with a new one **(user must have write permission)**

#### Download

1. [/api/download/id/:id](http://10.0.160.147:8000/api/download/id/5ae9bba1b87b22360cc2e70f)
    - GET: Download the zip of the archive with the associated ID
2. [/api/download/multiple](http://10.0.160.147:8000/api/download/multiple)
    - POST: Download a ZIP containing multiple archives. The archive IDs to download are passed in the body request.
3. [/api/download/files](http://10.0.160.147:8000/api/download/files)
    - GET: Returns the list of files in archives folder

#### Application

1. [/api](http://10.0.160.147:8000/api)
    - GET: Returns information about the application (name, version, creation date, lastBootUptime)
    - POST: Update version, creation date and lastBootUptime automatically (only localhost can query it)
2. [/api/change-app-name](http://10.0.160.147:8000/api/change-app-name)
    - POST: Change the name of the application (to allow using a custom name) **(user must be master)**

#### Stats

1. [/api/stats/archiving-frequency](http://10.0.160.147:8000/api/stats/archiving-frequency)
    - GET: Returns a dictionnary with the number of archives uploaded per month
2. [/api/stats/disk-usage](http://10.0.160.147:8000/api/stats/disk-usage)
    - GET: Returns a dictionnary with the disk usage information

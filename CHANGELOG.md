# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## Unreleased - XXXXX-XX-XX
### Enhanced
- None

### Added
- None

### Changed
- None

### Deprecated
- None

### Removed
- None

### Fixed
- None

### Security
- None

### Known Issues
- None

## 3.2.0 - 2018-09-05

### Fixed
- archive descriptors are not shown if the category was deleted

## 3.1.1 - 2018-08-20

### Fixed
- Adding a new descriptor on a category doesn't update all the associated archives

## 3.1.0 - 2018-08-13

### Added
- Search with Regex on archive descriptors
- Clean the archive folder once a day
- Configure a custom path to store the archives

### Fixed
- Scrolling bug on modals when a new modal pops
- All descriptors appear in the list even if an archive category is selected (when changing page or using a saved search)

## 3.0.1 - 2018-08-03

### Fixed
- No session-token on first login

## 3.0.0 - 2018-08-01

### Added
- State when the archive is being zipped (to avoid downloading a corrupted zip).
- Can launch the application on a different port with one command line.
- API endpoint that returns the application information (name, version, last reboot).
- Admins can change the name of the application to use a custom one.

### Changed
- User doesn't add or delete files in the archive anymore but replace the entire archive with a new one.
- A.S.T.R. is no longer dedicated to store data about tests. It can be use for any kind of data. Therefore, *"Tests"* have been replaced by *"Archives"*, *"Test Subjects"* by *"Archive Categories"*, and *"Configurations (of tests)"* by *"Descriptors (of archives)"*
- A.S.T.R. stands for Archiving System Truly Restful.

### Fixed
- Cannot read/update the content of a zip when size > 2GB.

## 2.2.0 - 2018-07-25

### Fixed
- Crash when 0 test in DB.
- Does not create the folder containing the archives automatically.

## 2.1.0 - 2018-07-19

### Added
- Search and share tests by ID.
- Search between range of dates.
- Tests can have comments.
- Tests configuration are stored in a file inside the archive (in YAML).
- Update the content of an archive on the website (add new files, delete exisiting ones).
- Configurations can be links to other website.
- Statistics on dashboard.
- Documentation to launch the application in production mode.

### Changed
- Upload rules for the website: 50 files max, 10GB per file, 1 hour timeout.
- Order of display of the tests: new tests appear first.

### Fixed
- Delete tests without archive.
- Logout if the session token exprires in the cookies.

## 2.0.0 - 2018-06-26

### Added
- Python library.

### Security
- Authentification token to interact with the API.

## 1.0.0 - 2018-05-23

*First official release.*


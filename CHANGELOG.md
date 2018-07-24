# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased] - XXXXX-XX-XX
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

## [3.0] - XXXXX-XX-XX

### Added
- [#130](https://gitlab.aldebaran.lan/hardware-test/astr/issues/130) Update archives with the Python library
- [#134](https://gitlab.aldebaran.lan/hardware-test/astr/issues/134) State when the archive is being zipped (to avoid downloading a corrupted zip)
- [#134](https://gitlab.aldebaran.lan/hardware-test/astr/issues/134) Can configure a different port for the application in one command line


### Changed
- [#128](https://gitlab.aldebaran.lan/hardware-test/astr/issues/128) User doesn't add or delete files in the archive anymore but replace the entire archive with a new one

### Fixed
- [#128](https://gitlab.aldebaran.lan/hardware-test/astr/issues/128) Cannot read/update the content of a zip when size > 2GB
- Crash when 0 test archived


## [2.1] - 2018-07-19

### Added
- [#81](https://gitlab.aldebaran.lan/hardware-test/astr/issues/81) [#83](https://gitlab.aldebaran.lan/hardware-test/astr/issues/83) Search and share tests by ID
- [#80](https://gitlab.aldebaran.lan/hardware-test/astr/issues/80) Search between range of dates
- [#82](https://gitlab.aldebaran.lan/hardware-test/astr/issues/82)Tests can have comments
- [#74](https://gitlab.aldebaran.lan/hardware-test/astr/issues/74) [#116](https://gitlab.aldebaran.lan/hardware-test/astr/issues/116) Tests configuration are stored in a file inside the archive (in YAML)
- [#74](https://gitlab.aldebaran.lan/hardware-test/astr/issues/74) Update the content of an archive on the website (add new files, delete exisiting ones)
- [#120](https://gitlab.aldebaran.lan/hardware-test/astr/issues/120) Configurations can be links to other website
- [#126](https://gitlab.aldebaran.lan/hardware-test/astr/issues/126) Statistics on dashboard
- Documentation to launch the application in production mode

### Changed
- Upload rules for the website: 50 files max, 10GB per file, 1 hour timeout
- [#120](https://gitlab.aldebaran.lan/hardware-test/astr/issues/120) Order of display of the tests: new tests appear first

### Fixed
- [#111](https://gitlab.aldebaran.lan/hardware-test/astr/issues/111) Delete tests without archive
- [#112](https://gitlab.aldebaran.lan/hardware-test/astr/issues/112) Logout if the session token exprires in the cookies

## [2.0] - 2018-06-26

### Added
- Python library

### Security
- Authentification token to interact with the API

## [1.0] - 2018-05-23

*First official release.*

[Unreleased]: https://gitlab.aldebaran.lan/hardware-test/astr/compare/v3.0...HEAD
[3.0]: https://gitlab.aldebaran.lan/hardware-test/astr/compare/v2.1...v3.0
[2.1]: https://gitlab.aldebaran.lan/hardware-test/astr/compare/v2.0...v2.1
[2.0]: https://gitlab.aldebaran.lan/hardware-test/astr/compare/v1.0...v2.0

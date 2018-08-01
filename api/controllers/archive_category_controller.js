var mongoose = require('mongoose');
var User = require('../models/user_model');
var ArchiveCategory = mongoose.model('ArchiveCategory');
var error401 = '<h1>401 UNAUTHORIZED</h1><p>Please add your email address and your token in the Authorization Header of your request (use <a href="http://docs.python-requests.org/en/master/user/authentication/#basic-authentication">Basic Auth</a>).<br>If you already did that, it means that you don\'t have the required permission for this action.</p>';

// GET: Returns the list of all archive categories
exports.getAllArchiveCategories = (req, res) => {
  ArchiveCategory.find({}, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(data);
    }
  });
};

// POST:  Add a new archive category in the DB in function of the parameters given in the body request
exports.addArchiveCategory = (req, res) => {
  User.hasAuthorization(req, ['master'])
  .then((hasAuthorization) => {
    if (hasAuthorization) {
      var newArchiveCategory = new ArchiveCategory(req.body);
      newArchiveCategory.created = Date.now();
      newArchiveCategory.save((err, data) => {
        if (err) {
          res.status(500).send(err);
        } else {
          res.json({
            name: 'Success',
            message: 'Archive category successfully added',
            archiveCategory: data,
          });
        }
      });
    } else {
      res.status(401).send(error401);
    }
  });
};

// GET: Returns the archive category with the associated ID
exports.getArchiveCategory = (req, res) => {
  const id = req.params.id;
  ArchiveCategory.findById(id, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      if (data === null) {
        res.status(404).json({
          name: 'Failed',
          message: 'This archive category id doesn\'t exist',
        });
      } else {
        res.json(data);
      }
    }
  });
};

// GET: Returns the archive category with the associated name
exports.getArchiveCategoryByName = (req, res) => {
  const name = req.params.name;
  ArchiveCategory.findOne({name: name}, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      if (data === null) {
        res.status(404).json({
          name: 'Failed',
          message: 'This archive category name doesn\'t exist',
        });
      } else {
        res.json(data);
      }
    }
  });
};

// POST: Update the archive category with the associated ID in function of the parameters given in the body request
exports.updateArchiveCategory = (req, res) => {
  User.hasAuthorization(req, ['master'])
  .then((hasAuthorization) => {
    if (hasAuthorization) {
      const id = req.params.id;
      const body = req.body;
      if (body.noDescriptors) {
        body.descriptors = [];
      }
      ArchiveCategory.findByIdAndUpdate(id, body, (err, data) => {
        if (err) {
          res.status(500).send(err);
        } else {
          if (data === null) {
            res.status(404).json({
              name: 'Failed',
              message: 'This archive category id doesn\'t exist',
            });
          } else {
            res.json({
              name: 'Success',
              message: 'Archive category successfully modified',
              modified: body,
              before: data,
            });
          }
        }
      });
    } else {
      res.status(401).send(error401);
    }
  });
};

// DELETE: Delete the archive category with the associated ID
exports.deleteArchiveCategory = (req, res) => {
  User.hasAuthorization(req, ['master'])
  .then((hasAuthorization) => {
    if (hasAuthorization) {
      const id = req.params.id;
      ArchiveCategory.findByIdAndRemove(id, (err, data) => {
        if (err) {
          res.status(500).send(err);
        } else {
          if (data === null) {
            res.status(404).json({
              name: 'Failed',
              message: 'This archive category id doesn\'t exist',
            });
          } else {
            res.json({
              name: 'Success',
              message: 'Archive category successfully deleted',
              archiveCategory: data,
            });
          }
        }
      });
    } else {
      res.status(401).send(error401);
    }
  });
};

// GET: Returns the options of a descriptor
exports.getOptionsOfDescriptor = (req, res) => {
  const categoryName = req.params.category;
  const descriptorName = req.params.descriptorName;
  ArchiveCategory.aggregate([
    {'$unwind': '$descriptors'},
    {'$match': {'descriptors.name': descriptorName, 'name': categoryName}},
    {'$group': {'_id': '$descriptors.options'}},
  ])
  .exec((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      if (data.length === 1) {
        res.json(data[0]._id);
      } else {
        res.status(404).json({'error': 'Nothing found'});
      }
    }
  });
};

// GET: Returns the links of an archive category
exports.getLinksOfArchiveCategory = (req, res) => {
  const categoryName = req.params.category;
  ArchiveCategory.findOne({'name': categoryName}, (err, archiveCategory) => {
    if (err) {
      res.status(500).send(err);
    } else {
      if (archiveCategory === null) {
        res.status(404).json({
          name: 'Failed',
          message: 'This archive category id doesn\'t exist',
        });
      } else {
        var links = {};
        archiveCategory.descriptors.forEach((descriptor) => {
          if (descriptor.baseUrl) {
            links[descriptor.name] = descriptor.baseUrl;
          }
        });
        res.json(links);
      }
    }
  });
};

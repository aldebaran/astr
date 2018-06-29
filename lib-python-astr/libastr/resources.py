"""
libastr.resources
~~~~~~~~~~~~~~~~~~~~~

This module contains ASTR resources objects.
"""

import json
import os.path
from libastr.logger import get_logger
from libastr.client import AstrClient

MAX_FILE_NUMBER = 50


# - [ Exceptions ] -----------------------------------------------------------

class ArchiveError(Exception):
    """ArchiveError Exception"""
    pass


class PathError(Exception):
    """PathError Exception"""
    pass


# - [ Interface ] ------------------------------------------------------------

class Astr(object):

    def __init__(self):
        self.test = Test
        self.test_subject = TestSubject


# - [ Test ] ----------------------------------------------------------------

class Test(object):

    def __init__(self, date, test_subject, configuration,
                 author=None, comments=None, id=None):
        self.id = id
        self.date = date
        self.test_subject = test_subject
        self.author = author
        self.comments = comments
        self.configuration = configuration

    def __repr__(self):
        return json.dumps(self.__dict__, sort_keys=True, indent=4)

    @staticmethod
    def json_to_object(json):
        """Converts the API object into a Test object.

        Args:
            json: json object returned by ASTR API

        Returns:
            (Test) associated test
        """
        configuration = {}
        for config in json["configuration"]:
            configuration[config["name"]] = config["value"]
        if "comments" in json:
            return Test(id=json["_id"],
                        author=json["author"],
                        date=json["date"],
                        test_subject=json["type"],
                        comments=json["comments"],
                        configuration=configuration)
        else:
            return Test(id=json["_id"],
                        author=json["author"],
                        date=json["date"],
                        test_subject=json["type"],
                        configuration=configuration)

    @staticmethod
    def json_to_list_of_objects(json):
        """Converts the API array into a list of Tests.

        Args:
            json: json array returned by ASTR API

        Returns:
            (List[Test]) associated list of tests
        """
        test_list = []
        for json_test in json:
            test_list.append(Test.json_to_object(json_test))
        return test_list

    @staticmethod
    def object_to_json(test):
        """Converts a Test object into an API object.

        Args:
            test: test to convert

        Returns:
            (Test) with the API form
        """
        configuration = []
        for key, value in test.configuration.items():
            configuration.append({"name": key, "value": value})
        test.configuration = configuration
        test.type = test.test_subject
        return test

    @staticmethod
    def get_all():
        """Get all tests.

        Returns:
            (List[Test]) list of all tests
        """
        return Test.json_to_list_of_objects(AstrClient().send_get("tests"))

    @staticmethod
    def get_by_id(id):
        """Get the test with the associated id.

        Args:
            id: test id (e.g. 5b29162874f5a43fc26f1f34)

        Returns:
            (Test) associated test
        """
        return Test.json_to_object(AstrClient().send_get("tests/id/" + id))

    @staticmethod
    def get_by_mongodb_query(query):
        """Get the tests that match with the mongoDB query.

        Args:
            query: mongoDB query (e.g. {type: "MOTOR CONTROL", author: "John DOE"})
                   "test_subject" is called "type" in the API.

        Returns:
            (List[Test]) list of tests
        """
        return Test.json_to_list_of_objects(AstrClient().send_post("tests", params=query))

    @staticmethod
    def get_by_args(author=None, date=None, test_subject=None, configuration=None):
        """Get the tests that match with the arguments.

        Args:
            author: (optional) test author (e.g. John DOE)
            date: (optional) test date or range of dates
                  (e.g. "2018-05-30" or ["2018-05-30", "2018-06-15"])
            test_subject: (optional) type of test (e.g. MOTOR CONTROL)
            configuration: (optional) dictionary of configuration
                           (e.g. {"robot_type": "NAO", "robot_version": "V6"})

        Returns:
            (List[Test]) list of tests
        """
        query = {}
        if author is not None:
            query["author"] = author
        if date is not None:
            query["date"] = date
        if test_subject is not None:
            query["type"] = test_subject
        if configuration is not None:
            config_list = []
            for key, value in configuration.items():
                config_list.append({
                    "configuration": {
                        "$elemMatch": {
                            "name": key,
                            "value": value
                        }
                    }
                })
            query["$and"] = config_list
        return Test.get_by_mongodb_query(query)

    @staticmethod
    def delete_by_id(id):
        """Delete the test with the associated id.

        Args:
            id: test id (e.g. 5b29162874f5a43fc26f1f34)

        Returns:
            (dict) confirmation
        """
        return AstrClient().send_delete("tests/id/" + id)

    @staticmethod
    def update_by_id(id, date=None, comments=None, configuration=None):
        """Update the test with the associated id.

        Args:
            id: test id (e.g. 5b29162874f5a43fc26f1f34)
            date: (optional) test date (e.g. 2018-05-30)
            comments: (optional) comments about the test
            configuration: (optional) dictionary of configuration
                           (e.g. {"robot_type": "NAO", "robot_version": "V6"})
                           only the values of existing configuration can be modified

        Returns:
            (dict) confirmation
        """
        body_request = {}
        if date is not None:
            body_request["date"] = date
        if comments is not None:
            body_request["comments"] = comments
        if configuration is not None:
            config_list = []
            for key, value in configuration.items():
                config_list.append({"name": key, "value": value})
            body_request["configuration"] = config_list
        return AstrClient().send_post("tests/id/" + id, params=body_request)

    @staticmethod
    def get_all_configurations():
        """Get all exisiting configurations of all test subjects.

        Returns:
            (List) all configurations
        """
        return AstrClient().send_get("tests/configurations")

    @staticmethod
    def get_configurations_of_test_subject(test_subject):
        """Get the configurations of a specific test subject.

        Args:
            test_subject: type of test (e.g. MOTOR CONTROL)

        Returns:
            (List) configurations of test subject
        """
        return AstrClient().send_get("tests/configurations/" + test_subject)

    @staticmethod
    def archive(date, test_subject, configuration, paths, comments=None):
        """Archive a new test in ASTR.

        Args:
            date: test date (e.g. 2018-05-30)
            test_subject: type of test (e.g. MOTOR CONTROL)
            configuration: dictionary of configuration
                           (e.g. {"robot_type": "NAO", "robot_version": "V6"})
                           all the configurations of the test subject must be given
            paths: list of all the files to upload
                   (e.g. ["/home/john.doe/Desktop/measurement.csv",
                          "/home/john.doe/Desktop/analysis.png"])
            comments: (optional) comments about the test

        Returns:
            (str) confirmation
        """
        if len(paths) == 0:
            raise PathError("Empty list of paths.")
        elif len(paths) > MAX_FILE_NUMBER:
            raise PathError("Too many files to upload ({}). The limit is {}."
                            .format(len(paths), MAX_FILE_NUMBER))
        for path in paths:
            if not os.path.isfile(path):
                raise PathError("{} is not a file".format(path))
        if comments is not None:
            test = Test(date=date, test_subject=test_subject,
                        configuration=configuration, comments=comments)
        else:
            test = Test(date=date, test_subject=test_subject,
                        configuration=configuration)
        test = Test.object_to_json(test)
        test.author = AstrClient().get_username()
        res = AstrClient().send_post("tests/add", params=test.__dict__)
        if res["name"] == "Failed":
            raise ArchiveError(res)
        else:
            test_id = res['test']['_id']
            return AstrClient().upload(uri="upload", paths=paths,
                                       archive_name=test_id)

    @staticmethod
    def download_by_id(id, path):
        """Download the test with the associated id.

        Args:
            id: test id (e.g. 5b29162874f5a43fc26f1f34)
            path: location where the archive will be stored
                  (e.g. "/home/john.doe/Desktop")

        Returns:
            (str) confirmation
        """
        if not os.path.isdir(path):
            raise PathError("{} is not a valid directory".format(path))
        if not path.endswith('/'):
            path += '/'
        path += id + '.zip'
        res = AstrClient().download(uri="download/id/" + id, path=path)
        if res is True:
            return "Downloaded: {}".format(path)
        else:
            return "Error while downloading {}".format(id)


class TestSubject(object):

    def __init__(self, id, name,
                 author, configuration):
        self.id = id
        self.name = name
        self.author = author
        self.configuration = configuration

    def __repr__(self):
        return json.dumps(self.__dict__, sort_keys=True, indent=4)

    @staticmethod
    def json_to_object(json):
        """Converts the API object into a TestSubject object.

        Args:
            json: json object returned by ASTR API

        Returns:
            (TestSubject) associated test subject
        """
        configuration = {}
        for config in json["configuration"]:
            configuration[config["name"]] = config["options"]
        return TestSubject(id=json["_id"],
                           name=json["name"],
                           author=json["author"],
                           configuration=configuration)

    @staticmethod
    def json_to_list_of_objects(json):
        """Converts the API array into a list of TestSubjects.

        Args:
            json: json array returned by ASTR API

        Returns:
            (List[TestSubject]) associated list of test subjects
        """
        test_subject_list = []
        for json_test_subject in json:
            test_subject_list.append(TestSubject.json_to_object(json_test_subject))
        return test_subject_list

    @staticmethod
    def get_all():
        """Get all test subjects.

        Returns:
            (List[TestSubject]) list of all test subjects
        """
        return TestSubject.json_to_list_of_objects(AstrClient().send_get("test-subjects"))

    @staticmethod
    def get_by_id(id):
        """Get the test subject with the associated id.

        Args:
            id: test subject id (e.g. 5aeb2225b5a8a90b8affc162)

        Returns:
            (TestSubject) associated test subject
        """
        return TestSubject.json_to_object(AstrClient().send_get("test-subjects/id/" + id))

    @staticmethod
    def get_by_name(name):
        """Get the test subject with the associated name.

        Args:
            name: test subject name (e.g. MOTOR CONTROL)

        Returns:
            (TestSubject) associated test subject
        """
        return TestSubject.json_to_object(AstrClient().send_get("test-subjects/name/" + name))

    @staticmethod
    def get_options_of_configuration(test_subject_name, configuration_name):
        """Get the options of a configuration.

        Args:
            test_subject_name: test subject name (e.g. MOTOR CONTROL)
            configuration_name: configuration name (e.g. articulation)

        Returns:
            (List) list of options of the configuration
                   (e.g. ["KNEE PITCH", "HIP PITCH", "HAND", "WRIST YAW", ...])
        """
        return AstrClient().send_get("test-subjects/options/{}/{}".format(test_subject_name, configuration_name))

import json
from libastr.logger import get_logger
from libastr.client import AstrClient


# - [ Interface ] ------------------------------------------------------------

class Astr(object):

    def __init__(self):
        self.test = Test


# - [ Test ] ----------------------------------------------------------------

class Test(Astr):

    def __init__(self,
                 date,
                 type,
                 configuration,
                 author=None,
                 id=None):
        self.id = id
        self.date = date
        self.type = type
        self.author = author
        self.configuration = configuration

    def __repr__(self):
        return json.dumps(self.__dict__, sort_keys=True, indent=4)

    @staticmethod
    def json_to_object(json):
        configuration = {}
        for config in json["configuration"]:
            configuration[config["name"]] = config["value"]
        return Test(id=json["_id"],
                    author=json["author"],
                    date=json["date"],
                    type=json["type"],
                    configuration=configuration)

    @staticmethod
    def json_to_list_of_object(json):
        testList = []
        for jsonTest in json:
            testList.append(Test.json_to_object(jsonTest))
        return testList

    @staticmethod
    def get_all():
        return Test.json_to_list_of_object(AstrClient().send_get("tests"))

    @staticmethod
    def get_by_id(id):
        return Test.json_to_object(AstrClient().send_get("tests/id/" + id))

    @staticmethod
    def get_by_query(query):
        return Test.json_to_list_of_object(AstrClient().send_post("tests", params=query))

    @staticmethod
    def get_by_args(author=None, date=None, type=None, configuration=None):
        query = {}
        if author is not None:
            query["author"] = author
        if date is not None:
            query["date"] = date
        if type is not None:
            query["type"] = type
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
        return Test.get_by_query(query)

    @staticmethod
    def delete_by_id(id):
        return AstrClient().send_delete("tests/id/" + id)

    @staticmethod
    def update_by_id(id, date=None, configuration=None):
        body_request = {}
        if date is not None:
            body_request["date"] = date
        if configuration is not None:
            config_list = []
            for key, value in configuration.items():
                config_list.append({"name": key, "value": value})
            body_request["configuration"] = config_list
        return AstrClient().send_post("tests/id/" + id, params=body_request)

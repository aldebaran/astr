"""
libastr.client
~~~~~~~~~~~~~~~~~~

This module contains Astr client object.
"""

import urllib.parse
import requests
import os
import json
import base64
from .logger import get_logger
from requests import HTTPError

# - [ Exceptions ] -----------------------------------------------------------

class ConfigurationError(Exception):
    """ConfigurationError Exception"""
    pass


class AuthenticationFailure(HTTPError):
    """Authentication Failure Exception"""
    pass


class ResourceNotFound(Exception):
    pass


class PermissionDenied(Exception):
    pass


class APIError(Exception):
    pass


# - [ Client ] ---------------------------------------------------------------

class AstrClient(object):
    def __init__(self, base_url=None, email=None, token=None):
        """AstrClient object enable to send API requests to ASTR.

        Args:
            base_url: ASTR instance base url (e.g. http://10.0.160.147:8000)
            email: a user email
            token: a token of this user
        """
        self._logger = get_logger(self.__class__.__name__)

        if base_url is None:
            base_url = self._get_base_url_config()

        if email is None or token is None:
            email, token = self._get_user_config()

        if not base_url.endswith("/"):
            base_url += "/"

        self.email = email
        self.token = token
        self.url = base_url + "api/"
        self.headers = {
            "Authorization": "Basic {authorization}".format(authorization=str(
                base64.b64encode(
                    bytes("%s:%s" % (self.email, token), "utf-8")
                ),
                "ascii"
            ).strip()),
            "Content-Type": "application/json"
        }

    # - [ Configuration ] ----------------------------------------------------

    def _get_base_url_config(self):
        """Get ASTR base url from LIBASTR_URL environment variable.

        Returns:
            (str) base url
        """
        try:
            url = os.environ["LIBASTR_URL"]
        except KeyError:
            msg = "Cannot retrieve configuration, please set LIBASTR_URL env variable."
            self._logger.error(msg)
            raise ConfigurationError(msg)
        return url

    def _get_user_config(self):
        """Get user email and token from environment variable (LIBASTR_EMAIL, LIBASTR_TOKEN).

        Returns:
            (tuple) email and token
        """
        try:
            email = os.environ["LIBASTR_EMAIL"]
            token = os.environ["LIBASTR_TOKEN"]
        except KeyError:
            msg = "Cannot retrieve configuration, please set LIBASTR_EMAIL and LIBASTR_TOKEN env variables."
            self._logger.error(msg)
            raise ConfigurationError(msg)
        return email, token

    # - [ Request ] ----------------------------------------------------------

    def _request(self, request_type, url, params=None):
        """GET, POST and DELETE url requests to ASTR.

        Args:
            request_type (unicode): GET, POST or DELETE
            url (unicode): request url
            params (dict): request parameters (body request)

        Returns:
            (dict) Json response as a dictionary
        """
        if request_type == "GET":
            response = requests.get(url, headers=self.headers, json=params)
        elif request_type == "DELETE":
            response = requests.delete(url, headers=self.headers, json=params)
        elif request_type == "POST":
            response = requests.post(url, headers=self.headers, json=params)
        else:
            msg = "request type not supported: {}".format(request_type)
            self._logger.error(msg)
            raise Exception(msg)
        try:
            response.raise_for_status()
        except HTTPError:
            msg = "The following request returned an error code {} -> {}".format(response.status_code, url)
            self._logger.error(msg)
            msg = "ASTR error message -> {}".format(response._content)
            self._logger.error(msg)
            if response.status_code == "401":
                raise AuthenticationFailure(response)
            response.raise_for_status()
        return response.json()

    def send_get(self, uri, params=None):
        """GET request to ASTR

        Args:
            uri (unicode): get request uri (e.g. tests/id/5b29162874f5a43fc26f1f34)
            params (dict): request parameters

        Returns:
            (dict) Json response as a dictionary
        """
        uri = urllib.parse.quote(uri)
        url = "{}{}".format(self.url, uri)
        self._logger.debug("GET: {}, params: {}".format(url, params))
        return self._request("GET", url, params=params)

    def send_post(self, uri, params=None):
        """POST request to ASTR.

        Args:
            uri (unicode): post request uri (e.g. tests/add)
            params (dict): request parameters

        Returns:
            (dict) Json response as a dictionary
        """
        uri = urllib.parse.quote(uri)
        url = "{}{}".format(self.url, uri)
        self._logger.debug("POST: {}, params: {}".format(url, params))
        return self._request("POST", url, params=params)

    def send_delete(self, uri, params=None):
        """DELETE request to ASTR.

        Args:
            uri (unicode): post request uri (e.g. tests/id/5b29162874f5a43fc26f1f34)
            params (dict): request parameters

        Returns:
            (dict) Json response as a dictionary
        """
        uri = urllib.parse.quote(uri)
        url = "{}{}".format(self.url, uri)
        self._logger.debug("DELETE: {}, params: {}".format(url, params))
        return self._request("DELETE", url, params=params)

    def download(self, uri, path):
        """Download file from ASTR.

        Args:
            uri (unicode): post request uri (e.g. download/id/5b29162874f5a43fc26f1f34)
            path (str): location where the file will be saved

        Returns:
            (Boolean) True if success
        """
        uri = urllib.parse.quote(uri)
        url = "{}{}".format(self.url, uri)
        self._logger.debug("Download: {}".format(url))
        response = requests.get(url)
        try:
            response.raise_for_status()
            open(path, "wb").write(response.content)
        except HTTPError:
            msg = "The following request returned an error code {} -> {}".format(response.status_code, url)
            self._logger.error(msg)
            msg = "ASTR error message -> {}".format(response._content)
            self._logger.error(msg)
            if response.status_code == "401":
                raise AuthenticationFailure(response)
            response.raise_for_status()
        return response.ok

    def upload(self, uri, paths, archive_name):
        """Upload file(s) to ASTR.

        Args:
            uri (unicode): post request uri (e.g. upload)
            paths (List[str]): list of files paths to upload
            archive_name (str): name of the archive stored in ASTR

        Returns:
            (str) uploaded files
        """
        uri = urllib.parse.quote(uri)
        url = "{}{}".format(self.url, uri)
        self._logger.debug("Upload: {}".format(url))
        files = []
        filenames = []
        for path in paths:
            files.append(("files", open(path, "rb")))
            filenames.append(path.split("/")[-1])
        r = requests.post(url,
                          data={"testId": archive_name, "files": filenames},
                          files=files,
                          auth=(self.email, self.token))
        return r.text

    # - [ Utils ] ----------------------------------------------------------

    def get_username(self):
        """Get the client username.

        Returns:
            (str) client username
        """
        user = self.send_get("user/email/" + self.email)
        if user is not None:
            return user["firstname"] + " " + user["lastname"]
        else:
            return "Error: user not found"

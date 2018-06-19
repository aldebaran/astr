import urllib.parse
import requests
from requests import HTTPError
import os
import json
import base64
from .logger import get_logger


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
        self._logger = get_logger(self.__class__.__name__)

        if base_url is None:
            base_url = self._get_base_url_config()

        if email is None or token is None:
            email, token = self._get_user_config()

        if not base_url.endswith('/'):
            base_url += '/'

        self.email = email
        self.url = base_url + 'api/'
        self.headers = {
            'Authorization': 'Basic {authorization}'.format(authorization=str(
                base64.b64encode(
                    bytes('%s:%s' % (self.email, token), 'utf-8')
                ),
                'ascii'
            ).strip()),
            'Content-Type': 'application/json'
        }

    # - [ Configuration ] ----------------------------------------------------

    def _get_base_url_config(self):
        try:
            url = os.environ['LIBASTR_URL']
        except KeyError:
            msg = "Cannot retrieve configuration, please set LIBASTR_URL env variable."
            self._logger.error(msg)
            raise ConfigurationError(msg)
        return url

    def _get_user_config(self):
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
            msg = 'The following request returned an error code {} -> {}'.format(response.status_code, url)
            self._logger.error(msg)
            msg = 'ASTR error message -> {}'.format(response._content)
            self._logger.error(msg)
            if response.status_code == "401":
                raise AuthenticationFailure(response)
            response.raise_for_status()
        return response.json()

    def send_get(self, uri, params=None):
        uri = urllib.parse.quote(uri)
        url = "{}{}".format(self.url, uri)
        self._logger.debug("GET: {}, params: {}".format(url, params))
        return self._request("GET", url, params=params)

    def send_post(self, uri, params=None):
        uri = urllib.parse.quote(uri)
        url = "{}{}".format(self.url, uri)
        self._logger.debug("POST: {}, params: {}".format(url, params))
        return self._request("POST", url, params=params)

    def send_delete(self, uri, params=None):
        uri = urllib.parse.quote(uri)
        url = "{}{}".format(self.url, uri)
        self._logger.debug("DELETE: {}, params: {}".format(url, params))
        return self._request("DELETE", url, params=params)

    def download(self, uri, path):
        uri = urllib.parse.quote(uri)
        url = "{}{}".format(self.url, uri)
        self._logger.debug("Download: {}".format(url))
        response = requests.get(url)
        try:
            response.raise_for_status()
            path += '/' + url.split('/')[-1] + '.zip'
            open(path, 'wb').write(response.content)
        except HTTPError:
            msg = 'The following request returned an error code {} -> {}'.format(response.status_code, url)
            self._logger.error(msg)
            msg = 'ASTR error message -> {}'.format(response._content)
            self._logger.error(msg)
            if response.status_code == "401":
                raise AuthenticationFailure(response)
            response.raise_for_status()
        return response.ok

    def getUserName(self):
        user = self.send_get('user/email/' + self.email)
        if user is not None:
            return user['firstname'] + ' ' + user['lastname']
        else:
            return 'Error: user not found'

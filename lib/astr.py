#
# ASTR API binding for Python 3.x
#
# Learn more:
#
# https://gitlab.aldebaran.lan/hardware-test/astr/blob/master/README.md
#
#
# Created with the base of TestRail API (Copyright Gurock Software GmbH)
#

import urllib.request, urllib.error, urllib.parse
import json, base64

class APIClient:
	def __init__(self, base_url):
		self.email = ''
		self.token = ''
		if not base_url.endswith('/'):
			base_url += '/'
		self.__url = base_url + 'api/'

	#
	# Send Get
	#
	# Issues a GET request (read) against the API and returns the result
	# (as Python dict).
	#
	# Arguments:
	#
	# uri                 The API method to call including parameters
	#                     (e.g. tests/id/5b1948a61962bd3fc11c4de8)
	#
	def send_get(self, uri):
		return self.__send_request('GET', uri, None)

	#
	# Send POST
	#
	# Issues a POST request against the API and returns the result
	# (as Python dict).
	#
	# Arguments:
	#
	# uri                 The API method to call including parameters
	#                     (e.g. tests)
	# data                The data to submit as part of the request (as
	#                     Python dict, strings must be UTF-8 encoded)
	#
	def send_post(self, uri, data):
		return self.__send_request('POST', uri, data)

	#
	# Send DELETE
	#
	# Issues a DELETE request against the API and returns the result
	# (as Python dict).
	#
	# Arguments:
	#
	# uri                 The API method to call including parameters
	#                     (e.g. tests/id/5b1948a61962bd3fc11c4de8)
	#
	def send_delete(self, uri):
		return self.__send_request('DELETE', uri, None)

	#
	# Send request
	#
	# Issues a GET, POST or DELETE request against the API and returns the result
	# (as Python dict).
	#
	# Arguments:
	#
	# method              The HTTP method (GET, POST, or DELETE)
	# data				  The body request for a POST request
	# uri                 The API method to call including parameters
	#                     (e.g. tests/id/5b1948a61962bd3fc11c4de8)
	#
	def __send_request(self, method, uri, data):
		uri = urllib.parse.quote(uri)
		url = self.__url + uri
		print('calling ' + method + ' ' + url)
		if (method == 'DELETE'):
			request = urllib.request.Request(url, method = 'DELETE')
		else:
			request = urllib.request.Request(url)
		if (method == 'POST'):
			request.data = bytes(json.dumps(data), 'utf-8')
		auth = str(
			base64.b64encode(
				bytes('%s:%s' % (self.email, self.token), 'utf-8')
			),
			'ascii'
		).strip()
		request.add_header('Authorization', 'Basic %s' % auth)
		request.add_header('Content-Type', 'application/json')

		e = None
		try:
			response = urllib.request.urlopen(request).read()
		except urllib.error.HTTPError as ex:
			response = ex.read()
			e = ex

		if response:
			try:
				result = json.loads(response.decode())
			except:
				result = response
		else:
			result = {}

		return result
	#
	# Download a file
	#
	# Issues a GET request against the API and returns the result
	# (as Python dict).
	#
	# Arguments:
	#
	# uri                 The API method to call including parameters
	#                     (e.g. download/id/5b1948a61962bd3fc11c4de8)
	# path				  The destination to download the file
	#                     (e.g. /home/john.doe/Desktop)
	#
	def download(self, uri, path):
		uri = urllib.parse.quote(uri)
		url = self.__url + uri
		print('downloading ' + ' ' + url)
		request = urllib.request.Request(url)
		auth = str(
			base64.b64encode(
				bytes('%s:%s' % (self.email, self.token), 'utf-8')
			),
			'ascii'
		).strip()
		request.add_header('Authorization', 'Basic %s' % auth)
		request.add_header('Content-Type', 'application/json')

		e = None
		try:
			response = urllib.request.urlopen(request).read()
			urllib.request.urlretrieve(url, path)
		except urllib.error.HTTPError as ex:
			response = ex.read()
			e = ex

		if (e != None):
			return {'error': e}
		else:
			return {'status': 'done', 'path': path}

	#
	# Returns the client username
	#
	def getUserName(self):
		user = self.send_get('user/email/' + self.email)
		if user != None:
			return user['firstname'] + ' ' + user['lastname']
		else:
			return 'Error: user not found'


class APIError(Exception):
	pass

class Test:
	def __init__(self, client):
		self.client = client

	def getAllTests(self):
		return self.client.send_get('tests')

	def getTestById(self, id):
		return self.client.send_get('tests/id/' + id)

	# MongoDB query
	def getTestsByQuery(self, query):
		return self.client.send_post('tests', query)

	# args = {'author': '', 'date': '', 'type': '', 'configuration': {'name': 'value', 'name': 'value', ...}}
	def getTestsByArguments(self, args):
		query = {}
		if 'author' in args:
			query['author'] = args['author']
		if 'date' in args:
			query['date'] = args['date']
		if 'type' in args:
			query['type'] = args['type']
		if 'configuration' in args:
			config_list = []
			for key, value in args['configuration'].items():
				config_list.append({'configuration': {'$elemMatch': {'name': key, 'value': value}}})
			query['$and'] = config_list
		return self.getTestsByQuery(query)

	def deleteTestById(self, id):
		return self.client.send_delete('tests/id/' + id)

	def updateTestById(self, id, data):
		bodyRequest = {}
		if 'configuration' in data:
			configuration = []
			for key, value in data['configuration'].items():
				configuration.append({'name': key, 'value': value})
			bodyRequest['configuration'] = configuration
		if 'date' in data:
			bodyRequest['date'] = data['date']
		return self.client.send_post('tests/id/' + id, bodyRequest)

	def getAllConfigurations(self):
		return self.client.send_get('tests/configurations')

	def getConfigurationsOfTestSubject(self, testSubject):
		return self.client.send_get('tests/configurations/' + testSubject)

	def downloadTestById(self, id, path):
		if not path.endswith('/'):
			path += '/'
		path += id + '.zip'
		return self.client.download('download/id/' + id, path)

class TestSubject:
	def __init__(self, client):
		self.client = client

	def getAllTestSubjects(self):
		return self.client.send_get('test-subjects')

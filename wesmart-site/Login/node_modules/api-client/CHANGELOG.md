1.1.2 / 2014-04-09
------------------
* Fix package.json dependencies

1.1.0 / 2014-01-13
------------------
* Change stubbing configuration to use objects

1.0.14 / 2014-01-13
------------------
* Add ability to stub using a string pattern as well as a regex object

1.0.11 / 2014-01-13
------------------
* Update dependencies

1.0.10 / 2013-11-21
------------------
* Add ability to stub requests for use in testing

1.0.8 / 2013-11-20
------------------
* Add timing details to request logging

1.0.7 / 2013-05-16
------------------
* If logger is set, log request start and stop if callback is provided

1.0.6 / 2013-05-16
------------------
* Add support for logging

1.0.4 / 2013-05-16
------------------
* BUGFIX: Don't allow loading more than once.

1.0.3 / 2013-05-13
------------------
* BUGFIX: Don't overwrite ApiClient.default_request_options

1.0.1 / 2013-05-01
------------------
* Fix bug with request_options handling.

1.0.0 / 2013-05-01
------------------
* Change ApiClient.load to be synchronous

0.0.8 / 2013-04-30
------------------
* Add real url test using bondjs to mock the request.
* Fix basic auth code, request docs are plain wrong.

0.0.7 / 2013-04-26
------------------
* Add patch_release task to Cakefile

0.0.6 / 2013-04-26
------------------
* Fix api_path() for VersionedApiClient to not have double slashes
* Add default request options and timeouts

0.0.5 / 2013-04-25
------------------
* Add index.js to export both classes.

0.0.4 / 2013-04-25
------------------
* Fix package.json
* Change config attribute to lowercase
* Remove dead code

0.0.3 / 2013-04-23
------------------
* Allow client supplied configuration
* Allow registration of client ApiClient subclasses

0.0.2 / 2013-04-17
------------------
* Add autoload function for clients
* Default port based on scheme
* Added example Twitter client

0.0.1 / 2013-02-01
------------------
* Intial release.

api-client
==========

node.js _request_ library wrapper and configuration management

Why?
----

Needed a driver for the _request_ library that clearly separated configuration
of web service API endpoints from the code that consumed them.



Installation
------------

    npm install api-client

Usage
-----

api-client manages configuration and creation of a set of named api
endpoints.  Endpoint configuration can be achieved in one of three ways:

  1.  The configuration can be supplied explicitly to the library by
      clients
  1.  The library can load a configuration using the *node_config*
      (See https://github.com/lorenwest/node-config) module.
  1.  Configuration can be added piecemeal by registering endpoint
      objects and corresponding configuration by calling a function

In the first two cases, the api-client library expects the config object
to have a single attribute, 'endpoints', pointing at a object.  The object
in turn contains any number endpoint configuration objects as attributes:

```coffeescript
endpoints:
  twitter:
    type: 'TwitterClient'
    host: 'api.twitter.com'
    options:
      protocol: 'https'
  other_api:
    host: 'other.com'
```

The above configuration object defines configuration of two named 
endpoints, 'twitter' and 'other_api'.  The configurations can be
referred to by name when creating instances of ApiClient for sending
requests to the web service api.  The configuration may specify a
'type' attribute, whose value is the name of a registered or 
pre-configured api client object.

Configuration
-------------

Each endpoint configuration object has the following layout:

```coffeescript
host: 'some.host.com'       # The only required attribute
port: '232'                 # Defaults to 80 or 443, depending on the
                            #   options.protocol attribute
type: 'StringClassName'     # Defaults to 'ApiClient'
options:
  protocol: 'http|https'    # Either 'http' or 'https', defaults to 'http'
  base_path: '/apibase'     # The base of all url paths for the service, defaults to ''
  username: 'user'          # Defaults to null, use to configure HTTP basic auth
  password: 'pass'          # Defaults to null, use to configure HTTP basic auth
  version: 'API_VERSION'    # Defaults to null, appended to base_path to form url, only
request_options:
  timeout:                # Defaults to 2000, request fails if it takes longer than this
```

The request_options object can be used to specify any option
allowed by the node.js request library.  See https://github.com/mikeal/request.

The url formed by the api-client will therefore be:

"#{options.protocol}://#{host}:#{port}#{base_path}[/#{version}]"

### Using the default configuration

```coffeescript
{ApiClient} = require 'api-client'

ApiClient.load null
console.log "Loaded API Client"

# Create an instance of TwitterClient.
twitter = ApiClient.create 'twitter'
  
twitter.user_info(1, 'TwitterAPI', {include_entities: true}, (err, response, body) ->
  console.log "Got Twitter JSON data: " + body
```

### Client supplied configuration

```coffeescript
{ApiClient} = require 'api-client'
my_config =
  endpoints:
    foo_client:
      host: 'foo.com'

ApiClient.load my_config
console.log "Loaded API Client"

foo_client = ApiClient.create('foo_client')

foo_client.get({...})
```

### Registering client created ApiClient subclasses

```coffeescript
{ApiClient} = require 'api-client'

class FooClient extends ApiClient
  test: ->
    console.log "Foo request: " + @url()

ApiClient.register('foo', FooClient, 'FooClient', {
  host: 'foo.com',
  type: 'FooClient',
  options:
    base_path: '/fooapi'
})

console.log "Registered FooClient, config = " + util.inspect(ApiClient.config)

fc = ApiClient.create('foo')

fc.test()
```

Versioned Api Client
--------------------

The library also exports a subclass of ApiClient called VersionedApiClient
that allows automatic handling of an API version in the request path.
This is of limited use, because the base_path configuration option can
just as well handle it.  To use it, provide endpoint config like the
following:

```coffeescript
endpoints:
  versioned:
    type: 'VersionedApiClient'
    host: 'somehost.com'
    options:
      base_path: '/api'
      version: 'v2'
```

Stubbing and Testing
--------------------

The api-client library is written to support testing against it by stubbing
requests by url regex.  Stubs can be set using the configuration mechanism
or set explicitly on an instance of the ApiClient class.

Via configuration:

```coffeescript
endpoints:
  myclient:
    type: 'ApiClient'
    host: 'somehost.com'
    options:
      base_path: '/foo'
    stubs: [
      [ /.*/, null, null, 'stub body' ]
    ] 
```

or programatically:

```coffeescript
myClient = ApiClient.create 'myclient'
myClient.stub_request [ /.*/, null, null, 'stub body' ]
```

The stub definition consists of an array of four objects:

  1. A regex that will test the url.  If the test is true, this stub will be used
  1. An error object to return if the stub is used
  1. A response object to return if the stub is used
  1. A body object to return if the stub is used.

In either of the above cases, any @get call against the client would result
in 'stub body' being returned as the body because the regex would match any
url.

The stub body can be either a static string, or an object with a 'file' attribute.
In the latter case, the file attribute is the path name of a file whose contents
are used as the stub body.

License
-------

MIT Licensed

Copyright (c) 2013-14 Douglas A. Seifert


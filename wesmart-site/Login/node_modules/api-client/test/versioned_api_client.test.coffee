config      = require 'config'
expect      = require('chai').expect
util = require('util')

ApiClient = require '../lib/api_client'
VersionedApiClient = require '../lib/versioned_api_client'

describe 'VersionedApiClient', ->
  describe 'with default config', ->
    beforeEach ->
      @endpoint = null
      ApiClient.load null
      @endpoint = ApiClient.create('subclass_api')

    it 'has the right path', ->
      expect(@endpoint.api_path()).to.equal("/apibase/v1")

    it 'has the right url', ->
      expect(@endpoint.url()).to.equal("http://versioned.com:99/apibase/v1")

  describe "with no base path", ->
    beforeEach ->
      @config =
        host: 'nobase.com'
        port: 42
        type: 'VersionedApiClient'
        options:
          version: 'v12.3.3'
      ApiClient.register 'no_base_path', VersionedApiClient, 'VersionedApiClient', @config
      @endpoint = ApiClient.create('no_base_path')

    it 'has the right path', ->
      expect(@endpoint.api_path()).to.equal("/v12.3.3")

    it 'has the right url', ->
      expect(@endpoint.url()).to.equal("http://nobase.com:42/v12.3.3")

  describe "with no version configured", ->
    beforeEach ->
      @config =
        host: 'noversion.com'
        port: 42
        type: 'VersionedApiClient'
      ApiClient.register 'no_version', VersionedApiClient, 'VersionedApiClient', @config

    it 'raises an error at create time', ->
      expect(-> ApiClient.create('no_version')).to.throw(Object)


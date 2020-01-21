ApiClient = require './api_client'

class VersionedApiClient extends ApiClient

  ApiClient.types['VersionedApiClient'] = VersionedApiClient

  constructor: (options) ->
    throw { name: "Error", message: "VersionedApiClient needs options.options.version attribute" } unless options.options? && options.options.version?
    super(options)

  api_path: ->
    path = super
    path = "#{path}/" unless path.match(/\/$/)
    "#{path}#{@options.version}"

module.exports = VersionedApiClient

ApiClient        = require './api_client'
{pick,extend}    = require 'underscore'

class TwitterClient extends ApiClient
  ApiClient.types['TwitterClient'] = TwitterClient

  api_path: ->
    "/#{@object_id}/#{@object_type}/show.#{@format}"

  user_info: (user_id, screen_name, options, cb = undefined) ->
    query = extend {screen_name: screen_name}, pick(options, 'include_entities')
    @object_type = 'users'
    @object_id = user_id
    @format = options.format || 'json'
    @get(query, {}, cb)

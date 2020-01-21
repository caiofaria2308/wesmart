fs                = require 'fs'

# Make sure $CWD/config exists
config_dir = process.cwd() + "/config"
if !fs.existsSync(config_dir)
  fs.mkdirSync(config_dir)
else if !fs.statSync(config_dir).isDirectory()
  raise "#{config_dir} must be a directory, not a regular file"

url               = require 'url'
default_config    = require 'config'
util              = require 'util'
request           = require 'request'
{extend, each, find} = require 'underscore'
{EventEmitter} = require 'events'

class ApiClient
  @create: (name) ->
    throw new Error("ApiClient not configured") unless @config?
    endpoint_config = @config.endpoints[name]
    throw new Error("ApiClient endpoint #{name} not configured") unless endpoint_config?
    clazz = ApiClient
    clazz = @types[endpoint_config.type] if endpoint_config.type
    new clazz(endpoint_config)

  @default_config = default_config

  @default_request_options =
    timeout: 2000

  @logger = null

  @types =
    'ApiClient': ApiClient

  @load: (config, dirname = __dirname) ->
    # Don't load twice
    return if @config

    @config = config || @default_config

    files = fs.readdirSync dirname
    each files, (file) ->
      full_path = "#{dirname}/#{file}"
      require full_path

  @register: (label, clazz, clazz_name, endpoint_config) ->
    @types ||= {}
    @types[clazz_name] = clazz
    @config ||= {}
    @config.endpoints ||= {}
    @config.endpoints[label] = endpoint_config


  constructor: (options) ->
    @host = options.host
    @port = options.port
    @options = options.options || {}
    if @options.protocol && @options.protocol == 'https'
      @port ||= 443
    else
      @port ||= 80

    # Merge default request opts and provided request opts,
    # but make sure we do it in a new object
    @request_options = extend {}, ApiClient.default_request_options, options.request_options

    # Allow stubs from config
    each options.stubs || [], (stub) =>
      @stub_request stub

  api_path: ->
    @options.base_path || "/"

  url_config: (params = {}) ->
    hostname: @host
    port: @port
    pathname: @api_path()
    protocol: @options.protocol || 'http'
    query: params

  url: (params = {}) ->
    url.format @url_config(params)

  stub_request: ({uriRegex, err, response, body}) ->
    if body?.file
      body = fs.readFileSync(body.file).toString()
    @stubs().push [uriRegex, err, response, body]

  stubs: ->
    @stubArray ||= []

  get: (params, headers, cb = undefined) ->
    request_opts =
      uri: @url(params)
      headers: headers
      method: 'GET'

    extend(request_opts, @request_options) if @request_options?

    # Handle stubs
    stub = find @stubs(), (stub) ->
      pattern = stub[0]
      unless pattern instanceof RegExp
        pattern = new RegExp pattern
      pattern.test(request_opts.uri)

    if stub
      if cb
        process.nextTick ->
          cb(stub[1], stub[2], stub[3])
        return null
      else
        e = new EventEmitter
        process.nextTick ->
          if stub[1]?
            e.emit('error', stub[1])
          else
            e.emit('complete', stub[2], stub[3])
        return e

    start = new Date
    if cb
      request_opts.callback = (err, response, body) ->
        stop = new Date
        delta = stop.getTime() - start.getTime()
        ApiClient.logger.info "[APICLIENT] request stop: #{response.statusCode}: #{request_opts.uri}, delta: #{delta}" if ApiClient.logger
        cb(err, response, body)

    if @options.username && @options.password
      extend request_opts, {user: @options.username, pass: @options.password}

    ApiClient.logger.info "[APICLIENT] request start: #{request_opts.uri}" if ApiClient.logger
    
    @request(request_opts)

  request: request

module.exports = ApiClient

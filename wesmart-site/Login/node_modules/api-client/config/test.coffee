module.exports =
  endpoints:
    test_api:
      host: "test.com"
      port: 80
      options:
        base_path: '/apibase'
    subclass_api:
      type: 'VersionedApiClient'
      host: 'versioned.com'
      port: 99
      options:
        base_path: '/apibase'
        version: 'v1'

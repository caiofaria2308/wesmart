{spawn} = require('child_process')
testutil = require('testutil')
async = require('async')
util = require('util')

coffee_path = "./node_modules/coffee-script/bin/coffee"
mocha_path = "./node_modules/mocha/bin/mocha"

if process.platform is 'darwin'
  growl = require('growl')

option '-g', '--grep [PATTERN]', 'only run tests matching <pattern>'

task 'patch_release', 'Create a patch release and publish to npmjs.org', ->
  async.waterfall [ (cb) ->
    npm = spawn('npm', ['version', 'patch'])
    npm.stderr.on 'data', (data) -> process.stderr.write data.toString()
    npm.stdout.on 'data', (data) -> process.stdout.write data.toString()
    npm.on 'exit', (code) ->
      if code is 0
        console.log 'Created patch release'
        cb(null, code)
      else
        console.log "Error creating patch release. Code: #{code}"
        cb(code, null)
  (code, cb) ->
    git = spawn('git', ['push'])
    git.stderr.on 'data', (data) -> process.stderr.write data.toString()
    git.stdout.on 'data', (data) -> process.stdout.write data.toString()
    git.on 'exit', (code) ->
      if code is 0
        console.log 'Pushed code'
        cb(null, code)
      else
        console.log "Error pushing code. Code: #{code}"
        cb(code, null)
  (code, cb) ->
    git = spawn('git', ['push', '--tags'])
    git.stderr.on 'data', (data) -> process.stderr.write data.toString()
    git.stdout.on 'data', (data) -> process.stdout.write data.toString()
    git.on 'exit', (code) ->
      if code is 0
        console.log 'Pushed tags'
        cb(null, code)
      else
        console.log "Error pushing tags. Code: #{code}"
        cb(code, null)
  ], (err, results) ->
    console.log "Done."

task 'build', 'build lib/ from src/', ->
  coffee = spawn coffee_path, ['-c', '-o', 'lib', 'src']
  coffee.stderr.on 'data', (data) -> process.stderr.write data.toString()
  coffee.stdout.on 'data', (data) -> process.stdout.write data.toString()
  coffee.on 'exit', (code) ->
    if code is 0
      console.log 'Successfully built.'
    else
      console.log "Error building. Code: #{code}"

task 'test', 'test project', (options) ->
  invoke 'build'
  process.env['NODE_ENV'] = 'test'
  testutil.fetchTestFiles './test', (files) ->
    files.unshift 'coffee:coffee-script/register'
    files.unshift '--compilers'
    files.unshift '--colors'
    if options.grep?
      files.unshift options.grep
      files.unshift '--grep'

    console.log "SPAWNING MOCHA: #{mocha_path} #{util.inspect files}"
    mocha = spawn mocha_path, files
    mocha.stdout.pipe(process.stdout, end: false);
    mocha.stderr.pipe(process.stderr, end: false);

 task 'watch', 'Watch src/ for changes', ->
    coffee = spawn coffee_path, ['-w', '-c', '-o', 'lib', 'src']
    coffee.stderr.on 'data', (data) -> 'ERR: ' + process.stderr.write data.toString()
    coffee.stdout.on 'data', (data) ->
      d = data.toString()
      if d.indexOf('compiled') > 0
        #invoke 'test'
        do (->)
      else
        if growl? then growl(d, title: 'Error', image: './resources/error.png')
        
      process.stdout.write data.toString()
    
    #mocha = spawn 'mocha', ['-w']

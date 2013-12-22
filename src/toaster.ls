# cmd line args
if process.argv.length isnt 4
  console.error('not enough arguments! need a directory to look at and a regex to filter by.')
  process.exit()
dir = process.argv[2]
regex = new RegExp(process.argv[3], \i)

# node packages
{ watch, exists, readdir } = require('fs')
{ exec } = require('child_process')

# rx
{ fromEvent } = require('rx').Observable

# tail
{ Tail } = require('tail')
lines = (filename) ->
  tailer = new Tail(dir + '/' + filename)
  fromEvent(tailer, 'line')

# util
clean = (str) -> str.replace(/'/g, "\\'")
notify = (title, message) -> exec("terminal-notifier -title '#{clean(title)}' -message '#{clean(message)}'", ->)

# main business
start = (filename) !->
  room = /#[^.]+/.exec(filename)?[0] ? 'unknown'
  lines(filename)
    .map (.split(/\t/g))
    .filter(-> it.1 not in [ '--', '<--', '-->' ])
    .map (.2)
    .filter (.match(regex))
    .bufferWithTime(250)
    .map ->
      | it.length > 4 => [ "#{it.length} mentions" ]
      | otherwise     => it
    .subscribe(!-> [ notify("IRC Mention: #room", mention) for mention in it ])

# run for existing files
do
  _, names <-! readdir(dir)
  [ start(name) for name in names ]

# watch for new files
do
  _, name <-! watch(dir)
  present <-! exists(name)
  start(name) if present is true


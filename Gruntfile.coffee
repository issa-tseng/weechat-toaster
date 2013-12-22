module.exports = (grunt) ->
  grunt.initConfig(
    clean:
      all:
        src: 'lib/**/*.js'

    livescript:
      all:
        expand: true
        cwd: 'src/'
        src: '**/*.ls'
        dest: 'lib'
        ext: '.js'
  )

  grunt.loadNpmTasks('grunt-contrib-clean')
  grunt.loadNpmTasks('grunt-livescript')

  grunt.registerTask('default', [ 'clean:all', 'livescript:all' ])


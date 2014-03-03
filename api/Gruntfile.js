
module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    watch: {
      options: {
        livereload: false
      },
      coffee: {
        files: ['src/**/*.coffee'],
        tasks: ['default']
      }
    },
    coffee: {
      main: {
        expand: true,
        cwd: 'src',
        src: ['**/*.coffee'],
        dest: 'lib',
        ext: '.js'
      }
    },
    clean: {
      lib: ['lib']
    },
    coffeelint: {
      options: {
        'max_line_length': {
          value: 120
        }
      },
      src: [
        'src/**/*.coffee'
      ]
    },
    jshint: {
      grunt: {
        src: ['Gruntfile.js']
      }
    },
    nodemon: {
      dev: {
        script: 'lib/amaging.js'
      }
    },
    concurrent: {
      dev: {
        tasks: [
          'nodemon:dev',
          'watch'
        ]
      },
      options: {
        logConcurrentOutput: true
      }
    }
  });

  grunt.registerTask('server', [
    'concurrent:dev'
  ]);

  grunt.registerTask('default', [
    'clean',
    'jshint',
    'coffeelint',
    'coffee'
  ]);

};

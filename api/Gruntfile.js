
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
        script: 'lib/samples/s3/sample.js',
        options: {
          watch: 'lib',
          nodeArgs: ['--debug'],
          delay: 10
        }
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['lib/test/test.js']
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
    },
    copy: {
      samples: {
        files: [{
          expand: true,
          cwd: 'src/samples/local/storage',
          src: ['**'],
          dest: 'lib/samples/local/storage'
        }]
      },
      test: {
        files: [{
          expand: true,
          cwd: 'src/test/fixtures/',
          src: ['storage/**', 'storage_cache/**'],
          dest: 'lib/test/fixtures/'
        }, {
          expand: true,
          cwd: 'src/test/expected/',
          src: ['**'],
          dest: 'lib/test/expected/'
        }, {
          expand: true,
          cwd: 'src/test/request/',
          src: ['testfile.json', 'igloo.jpg'],
          dest: 'lib/test/request/'
        }]
      }
    }
  });

  grunt.registerTask('server', [
    'build',
    'concurrent:dev'
  ]);

  grunt.registerTask('default', 'build');
  grunt.registerTask('test', [
    'build',
    'jshint',
    'copy:test',
    'mochaTest'
  ]);
  grunt.registerTask('build', [
    'clean',
    'jshint',
    'coffeelint',
    'coffee',
    'copy:samples'
  ]);

};

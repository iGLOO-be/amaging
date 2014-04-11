
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
        script: 'lib/samples/local/sample.js',
        options: {
          watch: 'lib',
          nodeArgs: ['--debug'],
          delay: 10
        }
      },
      s3: {
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
          reporter: 'spec',
          timeout: 400000,
          grep: process.env.GREP
        },
        src: ['lib/test/*_test.js']
      }
    },
    concurrent: {
      dev: {
        tasks: [
          'nodemon:dev',
          'watch'
        ]
      },
      s3: {
        tasks: [
          'nodemon:s3',
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
    },
    env: {
      coverage: {
        APP_SRV_COVERAGE: '../coverage/instrument/lib/amaging/server'
      },
      local: {
        TEST_ENV: 'local'
      },
      s3: {
        TEST_ENV: 's3'
      }
    },
    instrument: {
      files: [
        'lib/**/*.js'
      ],
      options: {
        lazy: true,
        basePath: 'lib/test/coverage/instrument'
      }
    },
    storeCoverage: {
      options: {
        dir: 'lib/test/coverage/reports'
      }
    },
    makeReport: {
      src: 'lib/test/coverage/reports/**/*.json',
      options: {
        type: 'lcov',
        dir: 'lib/test/coverage/reports',
        print: 'detail'
      }
    },
    open: {
      htmlReport: {
        path : 'lib/test/coverage/reports/lcov-report/index.html'
      }
    },
    coverage: {
      options: {
        thresholds: {
          'statements': 89,
          'branches': 50,
          'lines': 90,
          'functions': 90
        },
        dir: 'test/coverage',
        root: 'lib'
      }
    },
    release: {
      options: {
        npm: false
      }
    }
  });

  grunt.registerTask('server', [
    'build',
    'concurrent:dev'
  ]);

  grunt.registerTask('server:s3', [
    'build',
    'concurrent:s3'
  ]);

  grunt.registerTask('default', 'build');
  grunt.registerTask('build', [
    'clean',
    'jshint',
    'coffeelint',
    'coffee',
    'copy:samples'
  ]);
  grunt.registerTask('test', [
    'build',
    'copy:test',
    'env:local',
    'mochaTest'
  ]);
  grunt.registerTask('test:s3', [
    'build',
    'copy:test',
    'env:s3',
    'mochaTest'
  ]);
  grunt.registerTask('coverage-report', [
    'build',
    'copy:test',
    'env:coverage',
    'instrument',
    'env:local',
    'mochaTest',
    'storeCoverage',
    'makeReport',
    'coverage'
  ]);
  grunt.registerTask('coverage-report:s3', [
    'build',
    'copy:test',
    'env:coverage',
    'instrument',
    'env:s3',
    'mochaTest',
    'storeCoverage',
    'makeReport',
    'coverage'
  ]);
  grunt.registerTask('coverage-html', [
    'coverage-report',
    'open:htmlReport'
  ]);
  grunt.registerTask('coverage-html:s3', [
    'coverage-report:s3',
    'open:htmlReport'
  ]);
};

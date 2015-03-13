/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    // Task configuration.
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      dist: {
        src: 'src/**/*.js',
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    strip_code: {
      options: {
        start_comment : "start-test-code",
        end_comment   : "end-test-code"
      },
      your_target: {
        // a list of files you want to strip code from
        src: "<%= concat.dist.dest %>"
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: "<%= concat.dist.dest %>",
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },
    jasmine : {
      src : ['src/**/*.js','lib/<%= pkg.name %>.js'],
      options : {
        specs      : 'spec/**/*.js',
        keepRunner : true
      }
    },
    karma: {
      options: {
        
        frameworks: ['jasmine'],
        reporters: ['progress','coverage'],
        preprocessors: {
          'src/*.js': ['coverage']
        },
        coverageReporter: {
          type: 'html',
          dir: 'coverage/'
        },
        port: 9876,
        singleRun: true,
        colors: true,
        logLevel: 'DEBUG',
        browsers: ['Chrome']
      },
      
      unit: {
        files: {
          src: ['<%= jasmine.src %>',
                '<%= jasmine.options.specs %>']
        }
      }
    },
    jshint: {
      options: {
        curly   : true,
        eqeqeq  : true,
        immed   : true,
        latedef : true,
        newcap  : true,
        noarg   : true,
        sub     : true,
        undef   : true,
        unused  : true,
        boss    : true,
        eqnull  : true,
        es3     : true,
        globals : {
          jQuery  : true,
          window  : true,
          console : true
        }
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib_test: {
        src: ['lib/**/*.js', 'test/**/*.js', 'src/**/*.js']
      },
      spec_test: {
        src: ['spec/**/*.js']
      }
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      lib_test: {
        files: '<%= jshint.lib_test.src %>',
        tasks: ['jshint:lib_test', 'jasmine']
      },
      spec_test: {
        files: '<%= jshint.spec_test.src %>',
        tasks: ['jshint:lib_test','jshint:spec_test', 'jasmine']
      }
    },
    groc: {
      local : {
      javascript:["src/**/*.js"],
      src:["src/**/*.js"],
        options: {
          out: 'docs'
        }
      },
      pub : {
      javascript:["src/**/*.js"],
      src:["src/**/*.js"],
        options: {
          github: true
        }
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-strip-code');
  grunt.loadNpmTasks('grunt-groc');
  grunt.loadNpmTasks('grunt-karma');

  // Default task.
  grunt.registerTask('default', ['jshint', 'jasmine', 'karma', 'concat', 'strip_code', 'uglify']);
  grunt.registerTask('docs', ['groc:pub','groc:local']);

};

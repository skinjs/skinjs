module.exports = function(grunt) {
  "use strict";
  var readOptionalJSON = function(file) {
    var data = {};
    try { data = grunt.file.readJSON(file); } catch(e) {}
    return data;
  };

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    options: readOptionalJSON('options.json'),

    less: {
      options: {
        paths: ['source/styles'],
        yuicompress: true
      },
      files: {
        expand: true,
        cwd: 'source/styles',
        src: ['**/*.less'],
        dest: 'destination/styles/',
        ext: '.css'
      }
    },

    replace: {
      options: {
        variables: {
          'package': '<%= pkg.name %>',
          'description': '<%= pkg.description %>',
          'version': '<%= pkg.version %>',
          'author': '<%= pkg.author %>',
          'license': '<%= pkg.license %>',
          'licenseNotes': '<%= pkg.licenseNotes %>',
          'copyrightNotes': '© <%= grunt.template.today("yyyy") %> <%= pkg.author %>',
          'homepage': '<%= pkg.homepage %>',
          'year': '<%= grunt.template.today("yyyy") %>',
          'date': '<%= grunt.template.today("yyyy-mm-dd") %>'
        },
        prefix: '@@'
      },
      files: {
        expand: true,
        cwd: 'source/scripts',
        src: ['**/*.js'],
        dest: 'destination/scripts/',
        ext: '.js'
      }
    },

    uglify: {
      options: {
        beautify: true,
        mangle: false,
        banner: '/*! <%= pkg.name %> - <%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %> */'
      },
      files: {
        expand: true,
        cwd: 'destination/scripts/',
        src: ['**/*.js'],
        dest: 'destination/scripts/',
        ext: '.js'
      }
    },

    rsync: {
      scripts: {
        src: 'destination/scripts/',
        dest: '<%= options.rsync.scripts.dest %>',
        recursive: true,
        syncDest: true
      },
      styles: {
        src: 'destination/styles/',
        dest: '<%= options.rsync.styles.dest %>',
        recursive: true,
        syncDest: true
      }
    },

    jshint: {
      files: ['Gruntfile.js', 'source/**/*.js'],
      options: {
        'laxcomma': true,
        'undef': true,
        //'unused': true,
        'globals': {
          'window': false,
          'document': false,
          'console': false,
          'module': false,
          'define': false,
          'require': false,
          'curl': false
        }
      }
    },

    watch: {
      files: ['Gruntfile.js', 'source/**/*'],
      tasks: ['less', 'jshint', 'replace', 'rsync:styles', 'rsync:scripts']
    }

  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-rsync');

  grunt.registerTask('default', ['less', 'jshint', 'replace', 'uglify', 'rsync:styles', 'rsync:scripts']);
  grunt.registerTask('test', ['less', 'jshint']);
};
module.exports = function(grunt) {
  "use strict";
  var readOptionalJSON = function(file) {
    var data = {};
    try { data = grunt.file.readJSON(file); } catch(e) {}
    return data;
  };

  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    options: readOptionalJSON("options.json"),

    less: {
      options: {
        paths: ["source/styles"],
        yuicompress: true
      },
      files: {
        expand: true,
        cwd: "source/styles",
        src: ["**/*.less"],
        dest: "destination/styles/",
        ext: ".css",
      },
    },

    coffee: {
      options: {
        bare: true
      },
      files: {
        expand: true,
        cwd: "source/scripts",
        src: ["**/*.coffee"],
        dest: "destination/scripts/",
        ext: ".js",
      },
    },

    uglify: {
      options: {
        beautify: true,
        banner: '/*! <%= pkg.name %> - <%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %> */',
      },
      files: {
        expand: true,
        cwd: "source/scripts",
        src: ["**/*.js"],
        dest: "destination/scripts/",
        ext: ".js",
      },
    },

    rsync: {
      scripts: {
        src: "destination/scripts/",
        dest: "<%= options.rsync.scripts.dest %>",
        recursive: true,
        syncDest: true,
      },
      styles: {
        src: "destination/styles/",
        dest: "<%= options.rsync.styles.dest %>",
        recursive: true,
        syncDest: true,
      },
    },

    jshint: {
      files: ['gruntfile.js', 'source/**/*.js', 'test/**/*.js'],
      options: {
        "curly": true,
        "expr": true,
        "newcap": false,
        "quotmark": "double",
        "regexdash": true,
        "trailing": true,
        "undef": true,
        "unused": true,
        "maxerr": 100,
        "eqnull": true,
        "evil": true,
        "sub": true,
        "browser": true,
        "wsh": true,
        "predef": [
          "jQuery",
          "define",
          "module",
        ],
      },
    },

    qunit: {
      all: ['test/**/*.html'],
    },

    watch: {
      files: "source/**/*",
      tasks: ["less", "uglify", "rsync:styles", "rsync:scripts"],
    },

  });

  grunt.loadNpmTasks("grunt-contrib-coffee");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-less");
  grunt.loadNpmTasks("grunt-contrib-qunit");
  grunt.loadNpmTasks("grunt-contrib-requirejs");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-rsync");

  grunt.registerTask("default", ["less", "uglify", "rsync:styles", "rsync:scripts"]);
  grunt.registerTask("test", ["qunit"]);
}
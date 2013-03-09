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
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %> */',
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
        src: "source/scripts/",
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

    watch: {
      files: "source/**/*",
      tasks: ["less", "rsync:styles", "rsync:scripts"],
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

  grunt.registerTask("default", ["less", "rsync:styles", "rsync:scripts"]);
}
/*global module*/
/*jshint node: true*/

module.exports = function(grunt) {
    // Do grunt-related things in here

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-qunit');

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            options: {
                jshintrc: true
            },
            files: [
                'Gruntfile.js',
                'src/main/resources/idrviewer/js/*.js',
                '!src/main/resources/idrviewer/js/*.min.js',
                '!src/main/resources/idrviewer/js/idrviewer.annotations.js'
            ]
        },
        uglify: {
            options: {
                mangle: true,
                compress: true,
                banner: '/*! IDRViewer - v<%= pkg.version %> | Copyright <%= grunt.template.today("yyyy") %> IDRsolutions */\n'
            },
            dist: {
                files: {
                    'src/main/resources/idrviewer/js/idrviewer.min.js': ['src/main/resources/idrviewer/js/idrviewer.js']
                }
            }
        },
        qunit: {
            files: ['src/test/javascript/document/index.html'],
            options: {
                puppeteer: {
                    args: [
                        "--disable-web-security"
                    ],
                    defaultViewport: {
                        width: 1280,
                        height: 800
                    }
                }
            }
        }
    });

    grunt.registerTask('test', ['jshint', 'qunit']);
};
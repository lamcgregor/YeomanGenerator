'use strict';

module.exports = function (grunt) {
    var config = {
        source: 'source/',
        dest: 'dist/'
    };
    grunt.initConfig({
        config: config,
        connect: {
            options: {
                port: 9012,
                livereload: 35729,
                // Change this to '0.0.0.0' to access the server from outside
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    open: true,
                    base: '<%= config.dest %>'
                }
            },
            dist: {
                options: {
                    open: true,
                    base: '<%= config.dest %>',
                    livereload: false
                }
            }
        },
        assemble: {
            options: {
                flatten: false,
                partials: ['<%= config.source %>html/partials/**/*.{hbs,handlebars}'],
                layout: ['<%= config.source %>html/layouts/default.handlebars'],
                data: ['<%= config.source %>html/data/**/*.{json,yml}']
            },
            pages: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= config.source %>html/pages/',
                        dest: '<%= config.dest %>',
                        src: ['**/*.{hbs,handlebars}'],
                        ext: '.html'
                    }
                ]
            }
        },
        stylus: {
            dev: {
                options: {
                    linenos: true,
                    compress: false
                },
                files: {
                    '<%= config.dest %>css/global.css': '<%= config.source %>css/**/*.styl',
                    '<%= config.dest %>css/ie8.css': '<%= config.source %>css/ie8.styl',
                    '<%= config.dest %>css/ie9.css': '<%= config.source %>css/ie9.styl'
                }
            }
        },
        copy: {
            files: {
                files: [{
                    src: ['*.*'],
                    dest: '<%= config.dest %>images/',
                    cwd:  '<%= config.source %>images/',
                    expand: true
                }, {
                    src: ['*.*'],
                    dest: '<%= config.dest %>css/images/',
                    cwd:  '<%= config.source %>css/images/',
                    expand: true
                }]
            },
            js: {
                files: [{
                    src: ['*.js'],
                    dest: '<%= config.dest %>js/',
                    cwd:  '<%= config.source %>js/',
                    expand: true
                }]
            },
            fontsicons: {
                files: [
                    {
                        src: ['**/*.{svg,eot,woff,ttf,woff2,otf}'],
                        dest: '<%= config.dest %>css/',
                        cwd: '<%= config.source %>css/',
                        expand: true
                    }
                ]
            }
        },
        watch: {
            scripts: {
                options: {
                    livereload: true,
                },
                files: ['<%= config.source %>js/**/*.js'],
                tasks: ['copy:js'],
            },
            html: {
                options: { livereload: true },
                files: [
                    '<%= config.source %>html/**/*.{html,hbs,handlebars,json,yml}',
                    '!<%= config.source %>html/partials/fileList.{hbs,handlebars}'
                ],
                tasks: [
                    'listItems',
                    'assemble'
                ]
            },
            css: {
                options: {
                    livereload: true
                },
                files: ['<%= config.source %>/css/**/*.styl'],
                tasks: ['stylus:dev']
            },
            images: {
                options: {
                    livereload: true
                },
                files: ['<%= config.source %>images/*.*'],
                tasks: ['copy:files']
            },
            fontsicons: {
                options: { livereload: true },
                files: ['<%= config.source %>css/**/*.{svg,eot,woff,ttf,woff2,otf}'],
                tasks: ['copy:fontsicons']
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-stylus');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('assemble');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('build', [
        'listItems',
        'assemble',
        'stylus:dev',
        'copy:js',
        'copy:files',
        'copy:fontsicons'
    ]);
    grunt.registerTask('dev', [
        'listItems',
        'assemble',
        'stylus:dev',
        'copy:js',
        'copy:files',
        'copy:fontsicons'
    ]);
    grunt.registerTask('default', [
        'dev',
        'connect:livereload',
        'watch'
    ]);
    
    grunt.registerTask('icons', [
        'webfont',
        'dev'
    ]);
}
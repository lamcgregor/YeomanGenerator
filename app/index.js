var generators = require('yeoman-generator');
var yosay = require('yosay');
var path = require('path');
var mkdirp = require('mkdirp');
var configuration = {
    assemble: null,
    safeTitle: null,
    appTitle: null,
    appVersion: null,
    appDesc: null,
    appEmail: null
}
var createDir = function(name, obj) {
    mkdirp.sync(path.join(obj.destinationPath(), name));
}
module.exports = generators.Base.extend({
    initializing: function() {
        this.log(yosay("Welcome to the 'new project' generator built using Yeoman"));
    },
    prompting: function() {
        var done = this.async();
        var prompts =[
            {
                type: 'input',
                name: 'app-title',
                message: 'What would you like the project to be called?',
                default: 'New project'
            },
            {
                type: 'input',
                name: 'app-version',
                message: 'What version shall we start at`?',
                default: '0.1.1'
            },
            {
                type: 'input',
                name: 'app-description',
                message: 'Can you quickly describe it?',
                default: 'It is an awesome project'
            },
            {
                type: 'confirm',
                name: 'assemble-req',
                message: 'Would you like to use assemble?'
            },
            {
                type: 'confirm',
                name: 'add-email',
                message: 'Would you like to add your email?',
                default: false
            },
            {
                when: function(answers) {
                    return answers['add-email'];
                },
                type: 'input',
                name: 'email-address',
                message: 'Please enter your email',
                default: 'test@test.com'
            }
        ]
        this.prompt(prompts, function(answer) {
            if(answer['assemble-req']) {
                configuration.assemble = true;
                this.log(yosay("Ok assemble for you"));
            }
            else {
                this.log(yosay("No assemble"));
            }
            configuration.appTitle = answer['app-title'];
            configuration.safeTitle = answer['app-title'].toLowerCase().replace(/ /g,'_');
            configuration.appVersion = answer['app-version'];
            configuration.appDesc = answer['app-description'];
            if(answer['email-address']) {
                configuration.appEmail = "Built by " + answer['email-address'] + ".";
            }
            done();
        }.bind(this));
    },
    configuring: function() {
        this.config.save()
    },
    writing: function() {
        this.gruntfile.insertConfig("config", "{source: 'source/',dest: 'dist/'}")
        this.gruntfile.insertConfig("connect","{options: {port: 9012,livereload: 35729,hostname: 'localhost'},livereload: {options: {open: true,base: '<%= config.dest %>'}},dist: {options: {open: true,base: '<%= config.dest %>',livereload: false}}}");
        this.gruntfile.insertConfig("stylus", "{dev: {options: {linenos: true,compress: false},files: {'<%= config.dest %>css/global.css': '<%= config.source %>css/**/*.styl'}}}");
        this.gruntfile.insertConfig("copy", "{files: {files: [{src: ['*.*'],dest: '<%= config.dest %>css/images/',cwd:'<%= config.source %>css/images/',expand: true}]},js: {files: [{src: ['**/*.js'],dest: '<%= config.dest %>js/',cwd:'<%= config.source %>js/',expand: true}]},fontsicons: {files: [{src: ['**/*.{svg,eot,woff,ttf,woff2,otf}'],dest: '<%= config.dest %>css/',cwd: '<%= config.source %>css/',expand: true}]}}");
        this.gruntfile.insertConfig("watch", "{scripts: {options: {livereload: true,},files: ['<%= config.source %>js/**/*.js'],tasks: ['copy:js'],},html: {options: {livereload: true,},files: ['<%= config.source %>html/**/*.{html,hbs,handlebars,json,yml}', '!<%= config.source %>html/partials/fileList.{hbs,handlebars}'],tasks: ['listItems','assemble']},css: {options: {livereload: true},files: ['<%= config.source %>/css/**/*.styl'],tasks: ['stylus:dev']},images: {options: {livereload: true},files: ['<%= config.source %>images/*.*'],tasks: ['copy:files']},fontsicons: {options: { livereload: true },files: ['<%= config.source %>css/**/*.{svg,eot,woff,ttf,woff2,otf}'],tasks: ['copy:fontsicons']}}");
        if(configuration.assemble) {
            this.fs.copyTpl(
                this.templatePath('**/*'),
                this.destinationPath(''),
                { 
                    title: configuration.appTitle,
                    safeTitle: configuration.safeTitle,
                    version: configuration.appVersion,
                    description: configuration.appDesc,
                    email: configuration.appEmail
                }
            );
            createDir('source/html/partials', this);
            createDir('source/html/data', this);
            this.gruntfile.insertConfig("assemble", "{options: {flatten: false,partials: ['<%= config.source %>html/partials/**/*.{hbs,handlebars}'],layout: ['<%= config.source %>html/layouts/default.handlebars'],data: ['<%= config.source %>html/data/**/*.{json,yml}']},pages: {files: [{expand: true,cwd: '<%= config.source %>html/pages/',dest: '<%= config.dest %>',src: ['**/*.{hbs,handlebars}'],ext: '.html'}]}}");
        } else {
            this.log('Assemble not requested');
            this.fs.copyTpl(
                this.templatePath('package.json'),
                this.destinationPath('package.json'),
                { 
                    title: configuration.appTitle,
                    safeTitle: configuration.safeTitle,
                    version: configuration.appVersion,
                    description: configuration.appDesc,
                    email: configuration.appEmail
                }
            )
            createDir('source', this);
            createDir('source/html', this);
            this.fs.copyTpl(
                this.templatePath('source/html/layouts/default.hbs'),
                this.destinationPath('source/html/index.html'),
                { 
                    title: configuration.appTitle,
                    version: configuration.appVersion,
                    description: configuration.appDesc
                }
            );
            createDir('source/html', this);
        }
        createDir('source/images', this);
        createDir('source/js', this);
        createDir('source/css', this);
        createDir('dist', this);
        this.gruntfile.loadNpmTasks(['grunt-contrib-connect','grunt-contrib-stylus','grunt-contrib-copy','grunt-assemble','grunt-contrib-watch']);
        if(configuration.assemble) {
            this.gruntfile.loadNpmTasks('grunt-assemble');
            this.gruntfile.registerTask(
                'build', [
                    'listItems',
                    'assemble',
                    'stylus:dev',
                    'copy:js',
                    'copy:files',
                    'copy:fontsicons'
                ]
            );
            this.gruntfile.registerTask(
                'dev', [
                    'listItems',
                    'assemble',
                    'stylus:dev',
                    'copy:js',
                    'copy:files',
                    'copy:fontsicons'
                ]
            );
            this.gruntfile.prependJavaScript("grunt.registerTask('listItems', 'Lists the handlebars pages', function() {var sourceUrl = 'source/html/pages/';var files = grunt.file.expand(sourceUrl + '**/*.{hbs,handlebars}');if(files.length > 0) {var contents = '<h2>List of pages:</h2><ul>';for(var i = 0; i < files.length; i++) {var temp = files[i].split(sourceUrl);var title;if(temp[1].indexOf('handlebars') < 0) {title = temp[1].split('.hbs');} else {title = temp[1].split('.handlebars');}contents += '<li><a href=\"' + title[0] + '.html\">' + title[0] + '</a></li>';}contents += '</ul>';}grunt.file.write('source/html/partials/fileList.handlebars', contents);});");
        }
        else {
            this.gruntfile.registerTask(
                'build', [
                    'stylus:dev',
                    'copy:js',
                    'copy:files',
                    'copy:fontsicons'
                ]
            );
            this.gruntfile.registerTask(
                'dev', [
                    'stylus:dev',
                    'copy:js',
                    'copy:files',
                    'copy:fontsicons'
                ]
            );
        }
        this.gruntfile.registerTask('default', ['dev', 'connect:livereload', 'watch']);
    },
    install: function() {
        this.log(yosay("Running npm install for you"));
        this.installDependencies({
            callback: function() {
                this.spawnCommand('grunt');
            }.bind(this)
        });
    },
    end: function() {
        this.log(yosay("Thanks!"));
    }
});
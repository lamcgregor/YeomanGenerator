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
                default: '0.1.0'
            },
            {
                type: 'input',
                name: 'app-description',
                message: 'Can you quickly describe it?',
                default: 'It is an awesome project'
            },
            {
                type: 'list',
                name: 'gulp-true',
                message: 'Which task manager do you want to use?',
                choices: [
                    'gulp',
                    'grunt'
                ],
                default: 'gulp'
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
            configuration.gulp = answer['gulp-true'] == 'gulp';
            configuration.appTitle = answer['app-title'];
            configuration.safeTitle = answer['app-title'].toLowerCase().replace(/ /g,'_').replace(/\W/g,'');
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
        createDir('source/html/partials', this);
        createDir('source/html/data', this);
        createDir('source/images', this);
        createDir('source/content-images', this);
        createDir('source/js', this);
        createDir('source/css', this);
        createDir('dist', this);
        this.log(yosay("Writing templates"));
        this.fs.copy(
            this.templatePath('source/**/*'),
            this.destinationPath('source')
        );
        if(configuration.gulp) {
            this.log(yosay("Writing gulpfile"));
            this.fs.copyTpl(
                this.templatePath('gulp/package.json'),
                this.destinationPath('package.json'),
                { 
                    appTitle: configuration.appTitle,
                    safeTitle: configuration.safeTitle,
                    version: configuration.appVersion,
                    description: configuration.appDesc,
                    email: configuration.appEmail
                }
            );
            this.fs.copyTpl(
                this.templatePath('gulp/html/**/*'),
                this.destinationPath('source/html'),
                { 
                    appTitle: configuration.appTitle,
                    safeTitle: configuration.safeTitle,
                    version: configuration.appVersion,
                    description: configuration.appDesc,
                    email: configuration.appEmail
                }
            );
            this.fs.copy(
                this.templatePath('gulpfile.js'),
                this.destinationPath('gulpfile.js')
            );
        }
        else {
            this.log(yosay("Writing gruntfile"));
            this.fs.copyTpl(
                this.templatePath('grunt/package.json'),
                this.destinationPath('package.json'),
                { 
                    appTitle: configuration.appTitle,
                    safeTitle: configuration.safeTitle,
                    version: configuration.appVersion,
                    description: configuration.appDesc,
                    email: configuration.appEmail
                }
            );
            this.fs.copyTpl(
                this.templatePath('grunt/html/**/*'),
                this.destinationPath('source/html'),
                { 
                    appTitle: configuration.appTitle,
                    safeTitle: configuration.safeTitle,
                    version: configuration.appVersion,
                    description: configuration.appDesc,
                    email: configuration.appEmail
                }
            );
            this.fs.copy(
                this.templatePath('gruntfile.js'),
                this.destinationPath('gruntfile.js')
            );
        }
    },
    install: function() {
        this.log(yosay("Running npm install for you"));
        if(configuration.gulp) {
            this.installDependencies({
                callback: function() {
                    this.spawnCommand('gulp');
                }.bind(this)
            });
        }
        else {
            this.installDependencies({
                callback: function() {
                    this.spawnCommand('grunt');
                }.bind(this)
            });
        }
    },
    end: function() {
        this.log(yosay("Thanks!"));
    }
});
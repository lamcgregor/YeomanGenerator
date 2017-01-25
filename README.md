# YeomanGenerator

A front end environment builder using Yeoman

Should be installed after node and grunt(or gulp!) has been installed.

Once grunt and npm work globally then install yeoman:

    npm install -g yo

Once that has been run then the generator

    npm install -g https://github.com/lawoollett/YeomanGenerator.git
    
Create the folder you wish to create the environment in

    mkdir Company.Frontend
    
Navigate in to it

    cd Company.Frontend
    
And run the generator

    yo new-project
    
Follow the prompts, and it should install and run everything automagically. The default command ("grunt" or "gulp") runs the local server etc.

###PLEASE NOTE

The use of Babel (in the gulp environment) for the JS compiling is a preference, feel free to remove it, just take out the transforms line in the scripts task:

    gulp.task('scripts', function() {

        return gulp.src(config.source + 'js/main.js')
            .pipe(browserify({
                transform: ['babelify']
            }))
            .on('error', function(err) { console.error(err); this.emit('end'); })
            .pipe(gulp.dest(config.output + 'js/'))
            .pipe(connect.reload());

    });

Becomes:

    gulp.task('scripts', function() {

        return gulp.src(config.source + 'js/main.js')
            .pipe(browserify())
            .on('error', function(err) { console.error(err); this.emit('end'); })
            .pipe(gulp.dest(config.output + 'js/'))
            .pipe(connect.reload());

    });

You can then uninstall the babel stuff
    
    npm uninstall --save babelify

    npm uninstall --save-dev babel-preset-es2015

Likewise the creation of a carousel module and associated CSS/JS is also just an example of how a modular build who be put together, feel free to remove it and uninstall the libraries (jquery and slick)

    npm uninstall --save-dev jquery slick-carousel

##Updating

If you ever need to update the environment builder, just update it with npm

    npm update -g generator-new-project

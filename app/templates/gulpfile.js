var gulp = require('gulp'),
    ext = require('gulp-ext'),
    gutil = require('gulp-util'),
    through = require('through2'),
    fs = require('fs'),
    path = require('path'),
    rename = require('gulp-rename'),
    gutil = require('gulp-util');

//handlebars task dependencies
var handlebars = require('gulp-hb'),
    handlebarsLayouts = require('handlebars-layouts'),
    frontMatter = require('gulp-front-matter');

//styles task dependencies
var stylus = require('gulp-stylus');

//scripts task dependencies
var browserify = require('gulp-browserify'),
    babelify = require('babelify');

//server task dependencies
var connect = require('gulp-connect')
    open = require('gulp-open');

//iconfont task dependencies
var consolidate = require('gulp-consolidate'),
    args = require('yargs').argv,
    iconfont = require('gulp-iconfont');

var config = {
    source: 'source/',
    output: 'dist/'
}

gulp.task('build', ['handlebars','styles','scripts','copy']);

gulp.task('dev', ['handlebars','styles','scripts','copy']);

gulp.task('default', ['dev', 'server','watch']);


gulp.task('createList', function(done) {
    var fileList = '<h2>List of pages:</h2><ul>';
    var stream = gulp.src(config.source + 'html/pages/**/*.{hbs,handlebars}')
        .pipe(through.obj(function(file, enc, cb) {
            var filename = path.basename(file.path).split('.')[0];
            gutil.log("Building", "'" + gutil.colors.cyan(filename) + "'");
            fileList += '<li><a href="' + filename + '.html">' + filename + '</a></li>';
            return cb();
        }))
        .pipe(gulp.dest(config.source + 'testPage.handlebars'))
    stream.on('end', function() {
        fileList += '</ul>';
        require('fs').writeFileSync(config.source + 'html/partials/fileList.handlebars', fileList);
    })
    stream.on('finish', function() {
        done();
    });
})


gulp.task('handlebars', ['createList'], function() {

    return gulp.src(config.source + 'html/pages/**/*.{hbs,handlebars}')
        .pipe(frontMatter({
            property: 'data',
            remove: true
        }))
        .pipe(handlebars({
                helpers: handlebarsLayouts,
                data: config.source + 'html/data/**/*.{json,yaml}'
            })
            .partials(config.source + 'html/partials/**/*.{hbs,handlebars}')
            .partials(config.source + 'html/layouts/**/*.{hbs,handlebars}')
        )
        .on('error', function(err) { console.error(err); this.emit('end'); })
        .pipe(ext.replace('html'))
        .pipe(gulp.dest(config.output))
        .pipe(connect.reload());

});

gulp.task('styles', function() {

    return gulp.src(config.source + 'css/core.styl')
        .pipe(stylus({
            linenos: true
        }))
        .on('error', function(err) { console.error(err); this.emit('end'); })
        .pipe(gulp.dest(config.output + 'css/'))
        .pipe(connect.reload());

});

gulp.task('scripts', function() {

    return gulp.src(config.source + 'js/main.js')
        .pipe(browserify({
            transform: ['babelify']
        }))
        .on('error', function(err) { console.error(err); this.emit('end'); })
        .pipe(gulp.dest(config.output + 'js/'))
        .pipe(connect.reload());

});

gulp.task('copy', function() {

    return gulp.src([
            config.source + 'images/**/*.*',
            config.source + 'content-images/**/*.*'
        ])
        .on('error', function(err) { console.error(err); this.emit('end'); })
        .pipe(gulp.dest(config.output + 'images/'))
        .pipe(connect.reload());

});

gulp.task('connect', function() {

    return connect.server({
        root: config.output,
        port: 9012,
        livereload: true
    })

});

gulp.task('server', ['connect'], function() {
    return gulp.src(__filename)
        .pipe(open({
            uri: 'http://localhost:9012'
        }))

});

gulp.task('watch', function() {
    //HTML watch
    gulp.watch([
            config.source + 'html/**/*',
            '!' + config.source + 'html/partials/fileList.handlebars'
        ],
        ['handlebars']
    ).on('change', function(file) {
        watchMessage("HTML", file);
    })
    //Images watch
    gulp.watch([
            config.source + 'images/**/*',
            config.source + 'content-images/**/*.*'
        ],
        ['copy']
    ).on('change', function(file) {
        watchMessage("images", file);
    })
    //CSS watch
    gulp.watch(
        config.source + 'css/**/*',
        ['styles']
    ).on('change', function(file) {
        watchMessage("CSS", file);
    })
    //JS watch
    gulp.watch(
        config.source + 'js/**/*',
        ['scripts']
    ).on('change', function(file) {
        watchMessage("JS", file);
    })

});

function watchMessage(taskname, file) {
    return gutil.log(
        "File: ",
        gutil.colors.green(file.path),
        gutil.colors.cyan("caused " + taskname + " watch to run")
    );
}

/*

Versioning used for iconfont, syntax:
gulp [task] --version=2.0.1

*/

gulp.task('iconfont', function(){
    var version = args.version ? args.version.toString() : "1.0";
    gutil.log("font version: " + version);
    return gulp.src([config.source + 'images/icons/*.svg'])
        .pipe(iconfont({
            normalize: true,
            fontName: 'IconFont',
            formats: ['ttf', 'eot', 'woff', 'svg'],
            versionNumber: version,
            prependUnicode: false
        }))
        // automatically assign a unicode value to the icon
        .on('glyphs', function(glyphs, options) {
            glyphs.forEach(function(glyph, idx, arr) {
                arr[idx].unicode = glyph.unicode[0].charCodeAt(0).toString(16).toUpperCase();
            });
            gutil.log(glyphs);
            gutil.log(__dirname + '/icons-template.styl');
            return gulp.src(__dirname + '/icons-template.styl') // a template styl file, used to generate the styl code for all the icons
                .pipe(consolidate('lodash', {
                    // see the font-template.styl file to see how the following 'fontName' and 'fontPath' values are used
                    glyphs: glyphs,
                    versionNumber: options.versionNumber,
                    fontName: options.fontName,
                    fontPath: 'fonts/',
                    cssClass: 'icon'
                }))
                .pipe(rename('icons.styl'))
                .pipe(gulp.dest(config.source + 'css/imports')); // where to save "_icons.styl"
        })
        .pipe(gulp.dest(config.source + 'fonts'));
});
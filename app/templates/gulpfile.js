var gulp = require('gulp');
var ext = require('gulp-ext');
var gutil = require('gulp-util');
var through = require('through2');
var fs = require('fs');
var path = require('path');
var gutil = require('gulp-util');

//handlebars task dependencies
var handlebars = require('gulp-hb');
var handlebarsLayouts = require('handlebars-layouts');
var frontMatter = require('gulp-front-matter');

//styles task dependencies
var stylus = require('gulp-stylus');

//server task dependencies
var connect = require('gulp-connect');
var open = require('gulp-open');

var config = {
    source: 'source/',
    output: 'dist/'
}

gulp.task('build', ['handlebars','styles','copy']);

gulp.task('dev', ['handlebars','styles','copy']);

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
        .pipe(ext.replace('html'))
        .pipe(gulp.dest(config.output))
        .pipe(connect.reload());

});

gulp.task('styles', function() {

    return gulp.src(config.source + 'css/core.styl')
        .pipe(stylus({
            linenos: true
        }))
        .pipe(gulp.dest(config.output + 'css/'))
        .pipe(connect.reload());

});

gulp.task('copy', function() {

    return gulp.src([
            config.source + 'images/**/*.*',
            config.source + 'content-images/**/*.*'
        ])
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
            config.source + 'html/**/*.*',
            '!' + config.source + 'html/partials/fileList.handlebars'
        ],
        ['handlebars']
    ).on('change', function(file) {
        watchMessage("HTML", file);
    })
    //Images watch
    gulp.watch([
            config.source + 'images/**/*.*',
            config.source + 'content-images/**/*.*'
        ],
        ['copy']
    ).on('change', function(file) {
        watchMessage("images", file);
    })
    //CSS watch
    gulp.watch(
        config.source + 'css/**/*.*',
        ['styles']
    ).on('change', function(file) {
        watchMessage("CSS", file);
    })

});

function watchMessage(taskname, file) {
    return gutil.log(
        "File: ",
        gutil.colors.green(file.path),
        gutil.colors.cyan("caused " + taskname + " watch to run")
    );
}
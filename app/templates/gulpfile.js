var gulp = require('gulp');
var ext = require('gulp-ext');
var gutil = require('gulp-util');
var through = require('through2');
var fs = require('fs');
var path = require('path');

//handlebars task dependencies
var handlebars = require('gulp-hb');
var handlebarsLayouts = require('handlebars-layouts');
var frontMatter = require('gulp-front-matter');

//styles task dependencies
var stylus = require('gulp-stylus');
var sourcemaps = require('gulp-sourcemaps');

//server task dependencies
var connect = require('gulp-connect');
var open = require('gulp-open');

var config = {
    source: 'source/',
    output: 'dist/'
}

gulp.task('build', ['handlebars','styles','copy']);

gulp.task('dev', ['handlebars','styles','copy']);

gulp.task('default', ['server','watch']);


gulp.task('createList', function(done) {
    var fileList = '<h2>List of pages:</h2><ul>';
    var stream = gulp.src(config.source + 'html/pages/**/*.{hbs,handlebars}')
        .pipe(through.obj(function(file, enc, cb) {
            var filename = path.basename(file.path).split('.')[0];
            gutil.log(filename);
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
    })
})


gulp.task('handlebars', ['createList'], function() {

    gulp.src(config.source + 'html/pages/**/*.{hbs,handlebars}')
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

    gulp.src(config.source + 'css/core.styl')
        .pipe(sourcemaps.init())
        .pipe(stylus())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(config.output + 'css/'))
        .pipe(connect.reload());

});

gulp.task('copy', function() {

    gulp.src([
            config.source + 'images/**/*.*',
            config.source + 'content-images/**/*.*'
        ])
        .pipe(gulp.dest(config.output + 'images/'))
        .pipe(connect.reload());

});

gulp.task('connect', ['dev'], function() {

    connect.server({
        root: config.output,
        port: 9012,
        livereload: true
    })

});

gulp.task('server', ['connect'], function() {
    gulp.src(__filename)
        .pipe(open({
            uri: 'http://localhost:9012'
        }))

});

gulp.task('watch', function() {

    gulp.watch(config.source + 'html/pages/**/*.*', ['createList'])
    gulp.watch([
        config.source + 'html/**/*.*',
        '!' + config.source + 'html/pages/**/*.*'
    ], ['handlebars'])
    gulp.watch([
        config.source + 'images/**/*.*',
        config.source + 'content-images/**/*.*'
    ], ['copy'])
    gulp.watch(config.source + 'css/**/*.*', ['styles'])

});
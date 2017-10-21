'use strict';
const gulp = require('gulp'),
    gulpif = require('gulp-if'),
    changed = require('gulp-changed'),
    rename = require('gulp-rename'),
    plumber = require('gulp-plumber'), // 處理拋出的錯誤
    pump = require('pump'), // 錯誤定位，發生錯誤時阻止後續任務但不會終止watch task
    uglify = require('gulp-uglify'), // js壓縮
    eslint = require('gulp-eslint'), // js審查
    concat = require('gulp-concat'), // 文件合併

    // file path
    buildJs = 'build/*.js',
    BUILD_JS_PATH = 'build',
    distJs = 'dist/*.js',
    DIST_JS_PATH = 'dist';

let fileList = Array.from(require('./importFile'), (n) => DIST_JS_PATH + '/' + n + '.min.js');

let isFixed = file => file.eslint !== null && file.eslint.fixed;

// js lint
gulp.task('eslint', cb => {
    pump([
             gulp.src(buildJs),
             changed(buildJs),
             eslint({
                 fix: true
             }),
             eslint.format(),
             eslint.failAfterError(),
             gulpif(isFixed, gulp.dest(BUILD_JS_PATH))
         ],
         cb
    )
});

// minify js
gulp.task('jscompress', ['eslint'], cb => {
    pump([
             gulp.src(buildJs),
             uglify(),
             rename({suffix: '.min'}),
             gulp.dest(DIST_JS_PATH)
         ],
         cb
    );
});

// concat js
gulp.task('expo', ['jscompress'], cb => {
    gulp.src(fileList)
        .pipe(concat('JSPackage.js'))
        .pipe(gulp.dest(''));
    cb();
});

// watch js
gulp.task('watch', done => {
    gulp.watch(buildJs, ['expo'])
    .on('end', done);
});

// gulp
gulp.task('default', ['watch']);

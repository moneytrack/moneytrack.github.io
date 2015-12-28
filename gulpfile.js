/**
 * --------------------------------------------------------------------
 * Copyright 2015 Nikolay Mavrenkov
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * --------------------------------------------------------------------
 *
 * Author:  Nikolay Mavrenkov <koluch@koluch.ru>
 * Created: 03.11.2015 22:56
 */

var gulp = require('gulp'),
    gutil = require('gulp-util'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    watch = require('gulp-watch'),
    streamify = require('gulp-streamify'),
    uglify = require('gulp-uglify'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    watchify = require('watchify'),
    anybar = require('anybar')
    fs = require('fs'),
    babelify = require('babelify'),
    babelPresetEs2015 = require('babel-preset-es2015'),
    babelPresetReact = require('babel-preset-react');


var DEBUG_ROOT = './debug';
var SRC_ROOT = './src';
var PROD_ROOT = './public';

gulp.task('html', function(){
    var files = SRC_ROOT + '/**.html';
    return gulp.src(files)
        .pipe(gulp.dest(PROD_ROOT))
});

gulp.task('scripts', function(){
    var bundler = browserify(SRC_ROOT + '/scripts/main.jsx', {
        debug: false,
        cache: {},
        packageCache: {},
        fullPaths: true,
        extensions: [".js", ".jsx"]
    });

    function onError(err) {
        gutil.log(gutil.colors.red(err.message));
    }

    bundler = bundler.transform(babelify, {presets: [babelPresetEs2015, babelPresetReact]})

    return bundler.bundle()
        .on('error',  onError)
        .pipe(source('app.js'))
        .on('error', onError)
        .pipe(streamify(uglify()))
        .on('error', onError)
        .pipe(gulp.dest(PROD_ROOT + '/scripts'))
        .on('error', onError)
});

gulp.task('styles', function(){
    var files = SRC_ROOT + '/styles/**.scss';
    return gulp.src(files)
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({browsers: ['last 2 versions']}))
        .pipe(gulp.dest(PROD_ROOT + '/styles'))
});

gulp.task('images', function(){
    var files = SRC_ROOT + '/images/**';
    return gulp.src(files)
        .pipe(gulp.dest(PROD_ROOT + '/images'))
});

gulp.task('default', ['html', 'scripts', 'styles', 'images']);


//***************** Debug *****************

gulp.task('debug_html', function(){
    var files = SRC_ROOT + '/**.html';
    return gulp.src(files)
        .pipe(watch(files))
        .pipe(gulp.dest(DEBUG_ROOT))
});




gulp.task('debug_scripts', function(){
    var bundler = browserify(SRC_ROOT + '/scripts/main.jsx', {
        debug: true,
        cache: {},
        packageCache: {},
        fullPaths: true,
        extensions: [".js", ".jsx"]
    });

    bundler = bundler.transform(babelify, {presets: [babelPresetEs2015, babelPresetReact]})
    bundler = watchify(bundler);

    function onError(err) {
        anybar('red');
        gutil.log(gutil.colors.red(err.message));
        var notifier = require('node-notifier');
        notifier.notify({
          'title': 'ERROR',
          'message': err.message
        });        
    }

    function rebundle() {
        anybar('yellow');
        var bundle = bundler.bundle()
            .on('error',  onError)
            .pipe(source('app.js'))
            .on('error', onError)
            .pipe(gulp.dest(DEBUG_ROOT + '/scripts'))
            .on('error', onError)
            .on('end', function(){
                anybar('green');
            })
        return bundle
    }

    bundler.on('update', function() {
        var start = Date.now();
        gutil.log('Rebundle...');
        var bundle = rebundle();
        bundle.on('end', function(){
            gutil.log("Done! Time: " + (Date.now() - start));
        });
    });

    return rebundle();
});

gulp.task('debug_styles', function(){
    var files = SRC_ROOT + '/styles/**.scss';
    return gulp.src(files)
        .pipe(watch(files))
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(DEBUG_ROOT + '/styles'))
});

gulp.task('debug_images', function(){
    var files = SRC_ROOT + '/images/**';
    return gulp.src(files)
        .pipe(watch(files))
        .pipe(gulp.dest(DEBUG_ROOT + '/images'))
});

gulp.task('debug', ['debug_html', 'debug_scripts', 'debug_styles', 'debug_images']);

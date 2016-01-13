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
    rename = require('gulp-rename'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    watchify = require('watchify'),
    anybar = require('anybar')
    fs = require('fs'),
    babelify = require('babelify'),
    babelPresetEs2015 = require('babel-preset-es2015'),
    babelPresetReact = require('babel-preset-react')

    packageJson = require('./package.json');


var DEBUG_ROOT = './backend/target/backend-1.0-SNAPSHOT';
var SRC_ROOT = './src';
var PROD_ROOT = './backend/src/main/webapp';



gulp.task('html', function(){
    var files = SRC_ROOT + '/**.html';
    return gulp.src(files)
        .pipe(gulp.dest(PROD_ROOT))
});

gulp.task('vendor', function(){
    var bundler = browserify('./.noop.js', {
        debug: false,
        cache: {},
        packageCache: {},
        fullPaths: true,
        extensions: [".js", ".jsx"],
        require: Object.keys(packageJson.dependencies)
    });

    function onError(err) {
        gutil.log(gutil.colors.red(err.message));
    }

    bundler = bundler.transform(babelify, {
        global: true,
        presets: [babelPresetReact, babelPresetEs2015]
    })

    return bundler.bundle()
        .on('error',  onError)
        .pipe(source('vendor.js'))
        .on('error', onError)
        .pipe(streamify(uglify()))
        .on('error', onError)
        .pipe(gulp.dest(PROD_ROOT + '/scripts'))
        .on('error', onError)
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

    // Register all dependencies as external (they are loaded via vendor bundle)
    Object.keys(packageJson.dependencies).forEach((dep) => {
        bundler.external(dep)
    })

    bundler = bundler.transform(babelify, {
        global: true,
        presets: [babelPresetReact, babelPresetEs2015]
    })

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

gulp.task('default', ['html', 'vendor', 'scripts', 'styles', 'images']);


//***************** Debug *****************

gulp.task('debug_html', function(){
    var files = SRC_ROOT + '/**.html';
    return gulp.src(files)
        .pipe(watch(files))
        .pipe(gulp.dest(DEBUG_ROOT))
});

gulp.task('debug_vendor', function(){
    var bundler = browserify('./.noop.js', {
        debug: true,
        cache: {},
        packageCache: {},
        fullPaths: true,
        extensions: [".js", ".jsx"],
        require: Object.keys(packageJson.dependencies)
    });

    bundler = bundler.transform(babelify, {
        global: true,
        presets: [babelPresetReact, babelPresetEs2015]
    })
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
            .pipe(source('vendor.js'))
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
        gutil.log('Rebundle vendor...');
        var bundle = rebundle();
        bundle.on('end', function(){
            gutil.log("Done! Time: " + (Date.now() - start));
        });
    });

    return rebundle();

});

gulp.task('debug_scripts', function(){
    var bundler = browserify(SRC_ROOT + '/scripts/main.jsx', {
        debug: true,
        cache: {},
        packageCache: {},
        fullPaths: true,
        extensions: [".js", ".jsx"]
    });

    // Register all dependencies as external (they are loaded via vendor bundle)
    Object.keys(packageJson.dependencies).forEach((dep) => {
        bundler.external(dep)
    })

    bundler = bundler.transform(babelify, {
        presets: [babelPresetReact, babelPresetEs2015]
    })
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
        gutil.log('Rebundle app...');
        var bundle = rebundle();
        bundle.on('end', function(){
            gutil.log("Done! Time: " + (Date.now() - start));
        });
    });

    return rebundle();
});

gulp.task('__debug_styles', function(){
    var files = SRC_ROOT + '/styles/**.scss';
    return gulp.src(files)
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(DEBUG_ROOT + '/styles'))
});

gulp.task('debug_styles', ['__debug_styles'], function(){
    var files = SRC_ROOT + '/styles/**.scss';
    return gulp.watch(files, ['__debug_styles'])
});

gulp.task('debug_images', function(){
    var files = SRC_ROOT + '/images/**';
    return gulp.src(files)
        .pipe(watch(files))
        .pipe(gulp.dest(DEBUG_ROOT + '/images'))
});

gulp.task('debug', ['debug_html', 'debug_vendor', 'debug_scripts', 'debug_styles', 'debug_images']);

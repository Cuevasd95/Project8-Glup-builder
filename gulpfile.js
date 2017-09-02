'use strict';

/*-----------------------------------
Variables Declarations
-----------------------------------*/

var gulp = require('gulp'),
    concat = require('gulp-concat'),
    maps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    cleancss = require('gulp-clean-css'),
    useref = require('gulp-useref'),
    iff = require('gulp-if'),
    csso = require('gulp-csso'),
    del = require('del'),
    imagemin = require('gulp-imagemin'),
    runSequence = require('run-sequence'),
    browserSync = require('browser-sync'),
    connect = require('gulp-connect');

/*-----------------------------------
Concatenating the javascript scripts
-----------------------------------*/

gulp.task('concatScripts', function() {
  return gulp.src(['js/global.js',
                   'js/circle/circle.js',
                   'js/circle/autogrow.js'
                 ])
              .pipe(maps.init())
              .pipe(concat('scripts.js'))
              .pipe(maps.write('./'))
              .pipe(gulp.dest('js'));
});

/*-----------------------------------
Minimifying the javascript scripts
-----------------------------------*/

gulp.task('minifyScripts', ['concatScripts'], function() {
  return gulp.src('js/scripts.js')
             .pipe(uglify())
             .pipe(rename('all.min.js'))
             .pipe(gulp.dest('js'));
});

/*-----------------------------------
Creating a command to deploy a distributable minified js file
-----------------------------------*/

gulp.task('scripts', ['minifyScripts', 'concatScripts'], function() {
  return gulp.src(['js/all.min.js'])
             .pipe(gulp.dest('dist/scripts'));
});

/*-----------------------------------
Concatenating the sass styles
-----------------------------------*/

gulp.task('compileSass', function() {
  return gulp.src('sass/global.scss')
             .pipe(maps.init())
             .pipe(sass())
             .pipe(maps.write('./'))
             .pipe(gulp.dest('css'));
});

/*-----------------------------------
Minifying the sass styles
-----------------------------------*/

gulp.task('minifyStyles', ['compileSass'], function() {
  return gulp.src('css/global.css')
             .pipe(cleancss())
             .pipe(rename('all.min.css'))
             .pipe(gulp.dest('css'));
});

/*-----------------------------------
Creating a command to deploy a distributable minified css file
-----------------------------------*/

gulp.task('styles', ['compileSass', 'minifyStyles'], function() {
  return gulp.src('css/all.min.css')
             .pipe(gulp.dest('dist/styles'));
});

/*-----------------------------------
Optimizing the images
-----------------------------------*/

gulp.task('images', function() {
  return gulp.src(['images/*.jpg', 'images/*.png'])
             .pipe(imagemin())
             .pipe(gulp.dest('dist/content'));
});

/*-----------------------------------
Connecting to the port 3000
-----------------------------------*/

gulp.task('connect', function() {
  return connect.server({ port: 3000 });
});

/*-----------------------------------
Creating a cleaning function
-----------------------------------*/

gulp.task('clean', function() {
  del(['dist', 'css', 'js/all.min.js', 'js/scripts.*']);
});

/*-----------------------------------
Creating a single command to run and prepare the folder for deployment
-----------------------------------*/

gulp.task('builder', ['scripts', 'styles', 'images'], function() {
  return gulp.src(['index.html', 'icons/*'], { base : './'})
             .pipe(gulp.dest('dist'));
});

/*-----------------------------------
Making sure the builder command runs after the project is cleaned
-----------------------------------*/

gulp.task('build', ['clean'], function() {
  gulp.start('builder');
});

/*-----------------------------------
Watching for changes in our styles files
-----------------------------------*/

gulp.task('watch', function() {
  gulp.watch('sass/**/*.scss', ['styles']);
});

/*-----------------------------------
Syncing our server with our project so it knows when changes are done
-----------------------------------*/

gulp.task('sync', function() {
  browserSync.init({
    server: {
      baseDir: './'
    },
  });
});

/*-----------------------------------
Asigning the builder command to the default task, ensuring it also connects and syncs after its done
-----------------------------------*/

gulp.task('default', function(callback) {
  runSequence('build', 'connect', 'sync', callback);
});

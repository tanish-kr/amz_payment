'use strict';

var gulp = require('gulp');
var ts = require('gulp-typescript');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');


var config = {
  ts: {
    src: 'src/**/*.ts',
    dest: 'dest/',
    options: {
      target: 'ES5',
      removeComments: true,
      noImplicitAny: true,
      noLib: false,
      onoEmitOnErrorut: false
    }
  },
  uglify: {
    dest: 'dest/',
    options: {
      beautify: true,
      preserveComments: 'some'
    }
  }
}

gulp.task('compile', function(){
  var tsResult = gulp.src(config.ts.src)
      .pipe(sourcemaps.init())
      .pipe(ts(config.ts.options))
      .js
      .pipe(gulp.dest(config.ts.dest))
      .pipe(uglify(config.uglify.options))
      .pipe(gulp.dest(config.uglify.dest));
});

gulp.task('default', ['compile']);

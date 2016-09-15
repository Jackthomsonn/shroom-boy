'use strict';
import gulp from 'gulp';
import sass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import nodemon from 'gulp-nodemon';
import browserify from 'browserify';
import babelify from 'babelify';
import cleanCSS from 'gulp-clean-css';
import source from 'vinyl-source-stream';

gulp.task('set-dev-node-env', () => {
  return process.env.NODE_ENV = 'development';
});

// Nodemon - Run up our node server and set NODE_ENV to development
gulp.task('nodemon', ['set-dev-node-env'], () => {
  nodemon({
    script: './src/server/index.js',
    env: {
      'NODE_ENV': 'development'
    }
  });
});

// JS - Bundle all our JS files into one
gulp.task('js', () => {
  browserify({
    entries: 'src/client/index.js'
  })
  .transform(babelify, {presets: ['es2015']})
  .bundle()
  .pipe(source('app.js'))
  .pipe(gulp.dest('dist/app/'));
});

// HTML - Move our HTML, images & music to the dist folder
gulp.task('move', () => {
  gulp.src('./src/client/assets/images/**/**/*.jpg')
    .pipe(gulp.dest('dist/app/images'));

  gulp.src('./src/client/assets/music/**/**/*.mp3')
    .pipe(gulp.dest('dist/app/music'));

  gulp.src('./src/client/*.html')
    .pipe(gulp.dest('./dist/'));
});

// Sass - Compile, autoprefix, clean and move our Sass files to the dist folder
gulp.task('sass', () => {
  gulp.src('./src/client/assets/scss/**/**/*.scss')
    .pipe(sass())
    .pipe(cleanCSS())
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulp.dest('dist/app/'));
});

// Watch - Watch for any file changes and run appropiate task for each
gulp.task('watch', () => {
  gulp.watch('./src/client/**/*.js', ['js']);
  gulp.watch('./src/client/*.html', ['move']);
  gulp.watch('./src/client/assets/scss/**/**/*.scss', ['sass']);
});

// Default - Run all our tasks
gulp.task('default', ['js', 'move', 'sass', 'watch', 'nodemon']);
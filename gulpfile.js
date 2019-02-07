"use strict";

// Load plugins
const browsersync = require("browser-sync").create();
const gulp = require("gulp");
const sass = require("gulp-sass");
const plumber = require("gulp-plumber");
const imagemin = require("gulp-imagemin");
const newer = require("gulp-newer");
const pug = require('gulp-pug');
const del = require("del");


// BrowserSync
function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: "./dist"
    },
    port: 3000
  });
  done();
}

// BrowserSync Reload
function browserSyncReload(done) {
  browsersync.reload();
  done();
}

// Clean assets
function clean() {
  return del(["./dist/"]);
}

// CSS task
function css() {
  return gulp
    .src("./src/scss/**/*.scss")
    .pipe(plumber())
    .pipe(sass({ outputStyle: "expanded" }))
    .pipe(gulp.dest("./dist/css/"))
    //.pipe(rename({ suffix: ".min" }))
    //.pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(browsersync.stream());
}

// Optimize Images
function images() {
  return gulp
    .src("./src/imgs/**/*")
    .pipe(newer("./dist/imgs"))
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [
            {
              removeViewBox: false,
              collapseGroups: true
            }
          ]
        })
      ])
    )
    .pipe(gulp.dest("./dist/imgs"));
}

// Copy Asscets/ Fonts
function copyFonts() {
  return gulp
  .src('./src/fonts/**/*')
  .pipe(gulp.dest('./dist/fonts'));
}

// Copy Asscets/ Vendors
function copyVendors() {
  return gulp
  .src('./src/vendors/**/*')
  .pipe(gulp.dest('./dist/vendors'));
}

// HTML Generator
function htmlTemplates() {
  return gulp
  .src('./src/templates/*.pug')
  .pipe(pug(
    {
      pretty: true
    }
  )) 
  // tell gulp our output folder
  .pipe(gulp.dest('./dist')); 
}


// Transpile, concatenate and minify scripts
function scripts() {
  return (
    gulp
      .src(["./src/js/**/*"])
      .pipe(plumber())
      .pipe(webpackstream(webpackconfig, webpack))
      // folder only, filename is specified in webpack config
      .pipe(gulp.dest("./dist/js/"))
      .pipe(browsersync.stream())
  );
}


// Watch files
function watchFiles() {
  gulp.watch("./src/scss/**/*", css);
  //gulp.watch("./src/js/**/*", gulp.series(scripts));
  gulp.watch(
    [
      "./src/templates/_includes/**/*",
      "./src/templates/_layouts/**/*",
      "./src/templates/_partials/**/*",
      "./src/templates/*"
    ],
    gulp.series(htmlTemplates, browserSyncReload)
  );
  gulp.watch("./src/img/**/*", images);
}

// define complex tasks
//const js = gulp.series(scriptsLint, scripts);
const build = gulp.series(clean, gulp.parallel(css, images, copyVendors, copyFonts, htmlTemplates));
const serve = gulp.parallel(watchFiles, browserSync, copyVendors, css, images, copyFonts, htmlTemplates);


// export tasks
exports.images = images;
exports.css = css;
exports.copyFonts = copyFonts;
exports.copyVendors = copyVendors;
//exports.js = js;
exports.htmlTemplates = htmlTemplates;
exports.clean = clean;
exports.build = build;
exports.serve = serve;
exports.default = build;
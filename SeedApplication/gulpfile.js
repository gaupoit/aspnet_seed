/// <binding Clean='clean' />
"use strict";

var gulp = require("gulp"),
    rimraf = require("rimraf"),
    concat = require("gulp-concat"),
    cssmin = require("gulp-cssmin"),
    uglify = require("gulp-uglify"),
    browserify = require("browserify"),
    source = require("vinyl-source-stream"),
    buffer = require("vinyl-buffer"),
    tslint = require("gulp-tslint"),
    tsc = require("gulp-typescript"),
    sourcemaps = require("gulp-sourcemaps"),
    runSequence = require("run-sequence"),
    mocha = require("gulp-mocha"),
    istanbul = require("gulp-istanbul"),
    browserSync = require('browser-sync').create();;

var webroot = "./wwwroot/";

var paths = {
    js: webroot + "js/**/*.js",
    minJs: webroot + "js/**/*.min.js",
    css: webroot + "css/**/*.css",
    minCss: webroot + "css/**/*.min.css",
    concatJsDest: webroot + "js/site.min.js",
    concatCssDest: webroot + "css/site.min.css"
};

gulp.task("clean:js", function (cb) {
    rimraf(paths.concatJsDest, cb);
});

gulp.task("clean:css", function (cb) {
    rimraf(paths.concatCssDest, cb);
});

gulp.task("clean", ["clean:js", "clean:css"]);

gulp.task("min:js", function () {
    return gulp.src([paths.js, "!" + paths.minJs], {
        base: "."
    })
        .pipe(concat(paths.concatJsDest))
        .pipe(uglify())
        .pipe(gulp.dest("."));
});

gulp.task("min:css", function () {
    return gulp.src([paths.css, "!" + paths.minCss])
        .pipe(concat(paths.concatCssDest))
        .pipe(cssmin())
        .pipe(gulp.dest("."));
});

gulp.task("lint", function() {
   return gulp.src([
       "source/**/**.ts",
       "test/**/**.ts"
   ])
   .pipe(tslint({ }))
   .pipe(tslint.report("verbose")); 
});

var tsProject = tsc.createProject("tsconfig.json");

gulp.task("build-app", function() {
   return gulp.src([
       "source/**/**.ts",
        "typings/main.d.ts/",
        "source/interfaces/interfaces.d.ts"
   ]) 
   .pipe(tsc(tsProject))
   .js.pipe(gulp.dest("source/"));
});

gulp.task("bundle", function() {
   
   var libaryName = "seedApp";
   var mainTsFilePath = "source/main.js";
   var outputFolder = "dist/";
   var outputFileName = libaryName + ".min.js";
   
   var bundler = browserify({
       debug: true,
       standalone: libaryName
   });
   
   return bundler.add(mainTsFilePath)
       .bundle(source(outputFileName))
       .pipe(buffer())
       .pipe(sourcemaps.init({ loadMaps: true }))
       .pipe(uglify())
       .pipe(sourcemaps.write('./'))
       .pipe(gulp.dest(outputFolder));
});

gulp.task("watch", ["default"], function() {
    
    browserSync.init({
        server: "."
    });
    
    gulp.watch([ "source/**/**.ts", "test/**/*.ts"], ["default"]);
    gulp.watch("dist/*.js").on('change', browserSync.reload);    
});


gulp.task("min", ["min:js", "min:css"]);

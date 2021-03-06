"use strict";

//******************************************************************************
//* DEPENDENCIES
//******************************************************************************
const   gulp = require("gulp"),
        browserify = require("browserify"),
        source = require("vinyl-source-stream"),
        buffer = require("vinyl-buffer"),
        tslint = require("gulp-tslint"),
        tsc = require("gulp-typescript"),
        sourcemaps = require("gulp-sourcemaps"),
        uglify = require("gulp-uglify"),
        runSequence = require("run-sequence"),
        mocha = require("gulp-mocha"),
        istanbul = require("gulp-istanbul"),
        browserSync = require('browser-sync').create(),
        appFolder = "wwwroot/app/";
    
//******************************************************************************
//* LINT
//******************************************************************************
gulp.task("lint", function () {
    return gulp.src([
        appFolder + "source/**/**.ts",
        appFolder + "test/**/**.test.ts"
    ])
        .pipe(tslint({}))
        .pipe(tslint.report("verbose"));
});

//******************************************************************************
//* BUILD
//******************************************************************************
var tsProject = tsc.createProject("tsconfig.json");

gulp.task("build-app", function () {
    return gulp.src([
        appFolder + "source/**/**.ts",
        appFolder + "typings/main.d.ts/",
        appFolder + "source/interfaces/interfaces.d.ts"
    ])
        .pipe(tsc(tsProject))
        .js.pipe(gulp.dest(appFolder + "source/"));
});

var tsTestProject = tsc.createProject("tsconfig.json");

gulp.task("build-test", function () {
    return gulp.src([
        appFolder + "test/**/*.ts",
        appFolder + "typings/main.d.ts/",
        appFolder + "source/interfaces/interfaces.d.ts"
    ])
        .pipe(tsc(tsTestProject))
        .js.pipe(gulp.dest(appFolder + "test/"));
});

gulp.task("build", function (cb) {
    runSequence(["build-app", "build-test"], cb);
});

//******************************************************************************
//* TEST
//******************************************************************************
gulp.task("istanbul:hook", function () {
    return gulp.src(['source/**/*.js'])
    // Covering files
        .pipe(istanbul())
    // Force `require` to return covered files
        .pipe(istanbul.hookRequire());
});

gulp.task("test", ["istanbul:hook"], function () {
    return gulp.src('test/**/*.test.js')
        .pipe(mocha({ ui: 'bdd' }))
        .pipe(istanbul.writeReports());
});

//******************************************************************************
//* BUNDLE
//******************************************************************************
gulp.task("bundle", function () {

    var libraryName = "seed_app";
    var mainTsFilePath = appFolder + "source/main.js";
    var outputFolder = appFolder + "dist/";
    var outputFileName = libraryName + ".min.js";

    var bundler = browserify({
        debug: true,
        standalone: libraryName
    });

    return bundler.add(mainTsFilePath)
        .bundle()
        .pipe(source(outputFileName))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(outputFolder));
});

//******************************************************************************
//* DEV SERVER
//******************************************************************************
gulp.task("watch", ["default"], function () {

    browserSync.init();

    gulp.watch([appFolder + "source/**/**.ts", appFolder + "test/**/*.ts"], ["default"]);
    gulp.watch(appFolder + "dist/*.js").on('change', browserSync.reload);
});

//******************************************************************************
//* DEFAULT
//******************************************************************************
gulp.task("default", function (cb) {
    runSequence("lint", "build", "test", "bundle", cb);
});
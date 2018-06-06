const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const uglifyes = require('uglify-es');
const composer = require('gulp-uglify/composer');
const uglify = composer(uglifyes, console);
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const webp = require('gulp-webp');
const gzip = require('gulp-gzip');
const bs = require('browser-sync').create();
const gzipStatic = require("connect-gzip-static")("./dist")


gulp.task('server', function() {
    bs.init({
        server: {
            baseDir: "./dist"
        }
    },
    function (err, bs) {
        bs.addMiddleware("*", gzipStatic, {
            override: true
        });
    });
});

gulp.task('styles', function() {
	gulp.src('sass/**/*.scss')
		.pipe(sass({
			outputStyle: 'compressed'
		}).on('error', sass.logError))
		.pipe(autoprefixer({
			browsers: ['last 2 versions']
        }))
        .pipe(gzip())
		.pipe(gulp.dest('dist/css'))
		.pipe(bs.stream());
});

gulp.task('copy-html', function() {
    gulp.src('./*.html')
        .pipe(gzip())
		.pipe(gulp.dest('./dist'));
});

gulp.task('copy-images', function() {
    gulp.src('img/*')
        .pipe(webp())
		.pipe(gulp.dest('dist/img'));
});

gulp.task('scripts', function() {
    gulp.src('js/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(concat('all.js'))
        .pipe(sourcemaps.write())
        .pipe(gzip())
		.pipe(gulp.dest('dist/js'));
});

gulp.task('copy-manifest', function() {
    gulp.src('manifest.json')
        .pipe(gulp.dest('./dist'));
});


gulp.task('restaurant-list-dist', function() {
    gulp.src(['js/dbhelper.js', 'js/main.js', 'js/sw_register.js', 'js/idb.js', 'js/lozad.js'])
        .pipe(sourcemaps.init())
        .pipe(babel())
		.pipe(concat('restaurant_list.js'))
        .pipe(uglify().on('error', function(e){
            console.log(e);
         }))
        .pipe(sourcemaps.write('.'))
        .pipe(gzip())
		.pipe(gulp.dest('dist/js'));
});

gulp.task('restaurant-details-dist', function() {
    gulp.src(['js/dbhelper.js', 'js/restaurant_info.js', 'js/sw_register.js', 'js/idb.js','js/lozad.js'])
        .pipe(sourcemaps.init())
        .pipe(babel())
		.pipe(concat('restaurant_details.js'))
        .pipe(uglify().on('error', function(e){
            console.log(e);
         }))
        .pipe(sourcemaps.write('.'))
        .pipe(gzip())
		.pipe(gulp.dest('dist/js'));
});

gulp.task('sw-dist', function() {
    gulp.src(['sw.js'])
      .pipe(sourcemaps.init())
      .pipe(uglify())
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('dist'));
  });

gulp.task('build', ['copy-html', 'copy-images', 'copy-manifest','restaurant-list-dist','restaurant-details-dist',
'sw-dist', 'styles', 'server'], function () {
    gulp.watch('sass/*.scss', ['styles']);
	gulp.watch('*.html', ['copy-html']);
    gulp.watch('./dist/*.html').on('change', bs.reload);
    gulp.watch('sw.js', ['sw-dist']);
    gulp.watch('./dist/sw.js').on('change', bs.reload);
    gulp.watch(['js/dbhelper.js', 'js/main.js', 'js/sw_register.js'], ['restaurant-list-dist']);
    gulp.watch(['js/dbhelper.js', 'js/restaurant_info.js', 'js/sw_register.js'], ['restaurant-details-dist']);
    gulp.watch('.dist/js/**/*.js').on('change', bs.reload);
});
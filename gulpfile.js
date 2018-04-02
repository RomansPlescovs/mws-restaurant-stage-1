const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const bs = require('browser-sync').create();

gulp.task('browser-sync', function() {
    bs.init({
        server: {
            baseDir: "./dist"
        }
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
		.pipe(gulp.dest('dist/css'))
		.pipe(bs.stream());
});

gulp.task('copy-html', function() {
	gulp.src('./*.html')
		.pipe(gulp.dest('./dist'));
});

gulp.task('copy-images', function() {
	gulp.src('img/*')
		.pipe(gulp.dest('dist/img'));
});

gulp.task('scripts', function() {
    gulp.src('js/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(concat('all.js'))
        .pipe(sourcemaps.write())
		.pipe(gulp.dest('dist/js'));
});

gulp.task('scripts-dist', function() {
    gulp.src('js/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(babel())
		.pipe(concat('all.js'))
        .pipe(uglify().on('error', function(e){
            console.log(e);
         }))
        .pipe(sourcemaps.write())
		.pipe(gulp.dest('dist/js'));
});

gulp.task('default', ['copy-html', 'copy-images', 'scripts-dist', 'browser-sync', 'styles'], function () {
    gulp.watch('sass/*.scss', ['styles']);
	gulp.watch('*.html', ['copy-html']);
    gulp.watch('./dist/*.html').on('change', bs.reload);
    gulp.watch(['sw.js','js/**/*.js'], ['scripts-dist']);
    gulp.watch(['./dist/sw.js','.dist/js/**/*.js']).on('change', bs.reload);
});
var gulp = require('gulp'),
    compass = require('gulp-compass'),
	path = require('path');

gulp.task('compass',function(){
	gulp.src('./views/template/default/public/sass/index.scss')
	.pipe(compass({
		project: path.join(__dirname,'./public'),
		css: 'css',
		sass: 'sass',
		image: 'image'
	}));
});

gulp.task('sass:watch',function(){
	gulp.watch(
        './views/template/default/public/sass/**/*.scss',
        ['compass']
    );
});

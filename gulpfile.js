'use strict';
var path = require('path'),
	gulp = require('gulp'),
	config = require('./gulpfile.config.json'),
	argv = require('yargs').argv,
	$ = require('gulp-load-plugins')({
		pattern : ['gulp-*', 'main-bower-files', 'browser-sync', 'stream-series', 'merge-stream','del']
	});

//STREAMS
var component, 
	componentMin,
	bundleCss,
	bundleJs, 
	appJs,
	bowerCss,
	bowerJs, 
	componentJs, 
	componentHtml, 
	componentCss;

gulp
.task('clean:dist', function(){
	return $.del([
		'dist/**'
	]);
})
.task('bower:css', function(){
	bowerCss = gulp.src($.mainBowerFiles('**/*.css',{includeDev:true}))
	.pipe($.debug({title: 'BOWER CSS File:'}))
	.pipe($.concat('bower.css'));
})
.task('bower:js', function(){
	bowerJs = gulp.src($.mainBowerFiles('**/*.js',{includeDev:true}))
	.pipe($.debug({title: 'BOWER JS File:'}))
	.pipe($.concat('dependences.js'))
	.pipe($.uglify());
})
.task('bower:components', $.sequence('bower:js'))
.task('build:component:js', function(){
	componentJs = gulp.src(path.join('src',config.project.name,'*.js'))
	.pipe($.debug({title: 'BOWER JS File:'}))
	.pipe($.jshint())
	.pipe($.jshint.reporter('default'));
})
.task('build:component:html', function(){
	componentHtml = gulp.src(path.join('src',config.project.name,'*.html'))
	.pipe($.flatten())
	.pipe($.debug({title: 'BOWER HTML File:'}))
	.pipe($.minifyHtml({empty: true}))
	.pipe($.angularTemplatecache({module:config.project.name}));
})
.task('build:component:scss', function(){
	var str = '/* inject:scss */ /* endinject */';
	componentCss = $.file([config.project.name,'scss'].join('.'), str, { src: true })
  	.pipe($.debug({title: 'APP SASS File:'}))
  	.pipe($.inject(gulp.src(path.join('src',config.project.name,'*.scss'), {read: false}), {
            starttag: '/* inject:scss */',
            endtag: '/* endinject */',
            transform: function (filepath) {
                return '@import ".' + filepath + '";';
            }
    }))
    .pipe($.sass())
    .pipe($.debug({title: 'APP CSS File:'}))
    .pipe(gulp.dest('dist'));
})
.task('build:component:css', ['bower:css', 'build:component:scss'], function(){
	/*componentCss = gulp.src(path.join('src',config.project.name,'*.scss'))
	.pipe($.debug({title: 'BOWER SASS File:'}));*/

	bundleCss = $.mergeStream($.streamSeries(bowerCss, componentCss))
	.pipe($.concat('bundle.css'))
	.pipe(gulp.dest(config.project.public_dir));
})
.task('build:component',
['build:component:js', 'build:component:html', 'build:component:css'],
function(){
	component = $.mergeStream($.streamSeries(componentJs, componentHtml))
	.pipe($.concat([config.project.name,'js'].join('.')))

	bundleJs = $.mergeStream($.streamSeries(bowerJs, component))
	.pipe($.concat('bundle.js'))
	//.pipe($.uglify())
	.pipe(gulp.dest(config.project.public_dir));

	component
	.pipe(gulp.dest('dist'))
	.pipe($.rename([config.project.name,'min','js'].join('.')))
	.pipe(
		$.uglify({
			mangle: true,
			compress: {
				drop_console: true
			}
		})
	)
	.pipe(gulp.dest('dist'));
})
.task('copy:app:js', function(){
	console.log("SE COPIA DE NUEVO LA APP");
	appJs = gulp.src('src/app.js')
	.pipe($.jshint())
	.pipe($.jshint.reporter('default'))
	.pipe(gulp.dest(config.project.public_dir));
})
.task('build:index', function(){
	return gulp.src('src/index.html')
	.pipe($.inject(
		$.streamSeries(bundleCss, bundleJs, appJs),
	{
    	addRootSlash: false,
    	ignorePath : 'examples',
    	relative: false
    }))
    .pipe(gulp.dest(config.project.public_dir));
})
//.task('build', $.sequence('bower:components','build:component','copy:app:js','build:index'))
.task('build', function(callback){
	$.sequence('bower:js','build:component','copy:app:js','build:index')(callback);
})
.task('watch', function(){
	//console.log("WATCH", path.join('src', config.project.name, '*.js'));
	gulp.watch(path.join('src', 'index.html'), ['build']);
	gulp.watch(path.join('src', 'app.js'), ['copy:app:js']);
	gulp.watch(path.join('src', config.project.name, '*.js'), ['bower:js', 'build:component']);
	gulp.watch(path.join('src', config.project.name, '*.scss'), ['build:component:css']);
})
.task('serve', ['watch'], function(){
	console.log(path.join('src/*.*'));
	$.browserSync.init([
		path.join(config.project.public_dir,'*.*'),
		path.join('dist','*.*')
	],
	{
        server: {
            baseDir: path.join(config.project.public_dir)
        },
        port : 3220,
        ui : false,
        logLevel : 'info',
        ghostMode : false
    });
})
.task('run', $.sequence('clean:dist', 'build', 'serve'));
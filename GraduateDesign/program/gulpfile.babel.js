import gulp from 'gulp';
import sourcemaps from "gulp-sourcemaps";
import babelify from "babelify";
import browserify from 'browserify';
import source from "vinyl-source-stream";
import uglify from 'gulp-uglify';
import buffer from 'vinyl-buffer';
import webserver from 'gulp-webserver';

import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import minifycss from 'cssnano';

import RevAll from 'gulp-rev-all';      
import useref  from 'gulp-useref'; 
import atImport from "postcss-import";
import gulpif from 'gulp-if';
import del from 'del';
import precss from 'precss';
import jshint from 'gulp-jshint';

var watcher = gulp.watch(['src/css/index.css','src/js/poivis.js','src/js/taxivis.js','src/js/weibovis.js','src/js/index.js','src/index.html'], ['rev']);

watcher.on('change', (event)=> {
  console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
});

//清理dist目录
gulp.task('clean',()=>{
    return del(['dist/js/','dist/css/']);
});

// 打包 js
gulp.task("dis",['clean'],()=>{
  return browserify('src/js/index.js')
         .transform(babelify)
         .bundle()
         .pipe(source('bundle.js'))
         .pipe(buffer())
         .pipe(sourcemaps.init({ loadMaps: true }))
         //.pipe(uglify()) // Use any gulp plugins you want now
         .pipe(jshint())
         .pipe(jshint.reporter('default'))
         .pipe(sourcemaps.write('./'))
         .pipe(gulp.dest('./src/js'));
});


//web server
gulp.task('webserver', ['rev'],() => {
  gulp.src('./dist/')
    .pipe(webserver({
      livereload: true,
      directoryListing: false,
      port:8099,
      path: '/',
      open: '/'
    }));
});


//默认任务
gulp.task('rev',['dis'], ()=>{
    var revAll = new RevAll({   
        //不重命名文件  
        dontRenameFile: ['.html'] ,   
        //无需关联处理文件
        dontGlobal: [ /^\/favicon.ico$/ ,'.bat','.txt']
    });

    var processors=[atImport,precss,autoprefixer,minifycss()];

    return gulp.src(['src/index.html'])
            .pipe(useref())
            .pipe(gulpif('*.css', postcss(processors)))
            .pipe(gulpif('*.js',sourcemaps.init({ loadMaps: true })))
            .pipe(sourcemaps.write('.'))
            .pipe(revAll.revision())
            .pipe(gulp.dest('./dist'));
     
});  


gulp.task('default',['webserver'],()=>{

});
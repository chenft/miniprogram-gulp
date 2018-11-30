const gulp = require('gulp');
const less = require('gulp-less');
const rename = require('gulp-rename');
const del = require('del');
const imagemin = require('gulp-imagemin');
const path = require('path');
const eslint = require('gulp-eslint');
const jeditor = require('gulp-json-editor');

const srcPath = './src/**';
const distPath = './dist/';
const wxmlFiles = [`${srcPath}/*.wxml`, `!${srcPath}/_template/*.wxml`];
const lessFiles = [
  `${srcPath}/*.less`,
  `!${srcPath}/styles/**/*.less`,
  `!${srcPath}/_template/*.less`
];
const jsonFiles = [`${srcPath}/*.json`, `!${srcPath}/_template/*.json`];
const jsFiles = [
  `${srcPath}/*.js`,
  `!${srcPath}/_template/*.js`,
  `!${srcPath}/env/*.js`
];
const imgFiles = [
  `${srcPath}/resources/images/*.{png,jpg,gif,ico}`,
  `${srcPath}/resources/images/**/*.{png,jpg,gif,ico}`
];

/* 清除dist目录 */
gulp.task('clean', done => {
  del.sync(['dist/**/*']);
  done();
});

/* 编译wxml文件 */
const wxml = () => {
  return gulp
    .src(wxmlFiles, { since: gulp.lastRun(wxml) })
    .pipe(gulp.dest(distPath));
};
gulp.task(wxml);

/* 编译JS文件 */
const js = () => {
  return gulp
    .src(jsFiles, { since: gulp.lastRun(js) })
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(gulp.dest(distPath));
};
gulp.task(js);

/* 配置请求地址相关 */
const envJs = env => {
  return () => {
    return gulp
      .src(`./src/env/${env}.js`)
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(rename('env.js'))
      .pipe(gulp.dest(distPath));
  };
};
gulp.task('devEnv', envJs('development'));
gulp.task('testEnv', envJs('testing'));
gulp.task('prodEnv', envJs('production'));

/* 编译json文件 */
const json = () => {
  return gulp
    .src(jsonFiles, { since: gulp.lastRun(json) })
    .pipe(gulp.dest(distPath));
};
gulp.task(json);

/* 编译less文件 */
const wxss = () => {
  return gulp
    .src(lessFiles)
    .pipe(less())
    .pipe(rename({ extname: '.wxss' }))
    .pipe(gulp.dest(distPath));
};
gulp.task(wxss);

/* 编译压缩图片 */
const img = () => {
  return gulp
    .src(imgFiles, { since: gulp.lastRun(img) })
    .pipe(
      imagemin(
        [
          imagemin.gifsicle({
            interlaced: true
          }),
          imagemin.jpegtran({
            progressive: true
          }),
          imagemin.optipng(),
          imagemin.svgo()
        ],
        {
          verbose: false
        }
      )
    )
    .pipe(gulp.dest(distPath));
};
gulp.task(img);

/* watch */
gulp.task('watch', () => {
  let watchLessFiles = [...lessFiles];
  watchLessFiles.pop();
  gulp.watch(watchLessFiles, wxss);
  gulp.watch(jsFiles, js);
  gulp.watch(imgFiles, img);
  gulp.watch(jsonFiles, json);
  gulp.watch(wxmlFiles, wxml);
});

/* build */
gulp.task(
  'build',
  gulp.series(
    'clean',
    gulp.parallel('wxml', 'js', 'json', 'wxss', 'img', 'prodEnv')
  )
);

/* dev */
gulp.task(
  'dev',
  gulp.series(
    'clean',
    gulp.parallel('wxml', 'js', 'json', 'wxss', 'img', 'devEnv'),
    'watch'
  )
);

/* test */
gulp.task(
  'test',
  gulp.series(
    'clean',
    gulp.parallel('wxml', 'js', 'json', 'wxss', 'img', 'testEnv')
  )
);

/**
 * auto 自动创建page or template or component
 *  -s 源目录（默认为_template)
 * @example
 *   gulp auto -p mypage           创建路径为 pages/mypage 的 page 文件
 *   gulp auto -t mytpl            创建路径名为 templates/mytpl 的 template 文件
 *   gulp auto -c mycomponent      创建路径名为 components/mycomponent 的 component 文件
 *   gulp auto -s index -p mypage  复制 pages/index 中的文件创建路径为 pages/mypage 的页面
 *   gulp auto -d mypage           删除路径为 pages/mypage 的文件
 *   gulp auto -a mypage           删除路径为 pages/mypage 的目录
 */
const auto = done => {
  const yargs = require('yargs')
    .example('gulp auto -p mypage', '创建路径为 pages/mypage 的 page 文件')
    .example(
      'gulp auto -t mytpl',
      '创建路径名为 templates/mytpl 的 template 文件'
    )
    .example(
      'gulp auto -c mycomponent',
      '创建路径名为 components/mycomponent 的 component 文件'
    )
    .example('gulp auto -d mypage', '删除路径为 pages/mypage 的目录文件')
    .example('gulp auto -a mypage', '删除路径为 pages/mypage 的目录')
    .example(
      'gulp auto -s index -p mypage',
      '复制 pages/index 中的文件创建路径为 pages/mypage 的页面'
    )
    .option({
      s: {
        alias: 'src',
        default: '_template',
        describe: 'copy的模板',
        type: 'string'
      },
      p: {
        alias: 'page',
        describe: '生成的page名称',
        conflicts: ['t', 'c'],
        type: 'string'
      },
      t: {
        alias: 'template',
        describe: '生成的template名称',
        type: 'string',
        conflicts: ['c']
      },
      c: {
        alias: 'component',
        describe: '生成的component名称',
        type: 'string'
      },
      d: {
        alias: 'delete',
        describe: '删除目录下的文件',
        conflicts: ['p', 't', 'c'],
        type: 'string'
      },
      a: {
        alias: 'delete folder',
        describe: '删除目录',
        conflicts: ['p', 't', 'c'],
        type: 'string'
      },
      version: { hidden: true },
      help: { hidden: true }
    })
    .fail(msg => {
      done();
      console.error('创建失败!!!');
      console.error(msg);
      console.error('请按照如下命令执行...');
      yargs.parse(['--msg']);
      return;
    })
    .help('msg');

  const argv = yargs.argv;
  console.log(argv);
  const source = argv.s;
  const options = ['p', 't', 'c', 'd', 'a'];
  const typeEnum = {
    p: 'pages',
    t: 'templates',
    c: 'components'
  };
  let hasParams = false;
  let type;
  let dirname = '';
  let basename = '';
  let pathName = '';
  for (const key of options) {
    hasParams = hasParams || !!argv[key];
    if (argv[key]) {
      const pathReg = /^(.*)\/(.*)$/;
      const result = argv[key].match(pathReg);
      if (result) {
        basename = result[2];
        pathName = result[1];
      } else {
        basename = pathName = argv[key];
      }
      dirname = `pages/${pathName}/`;
      type = typeEnum[key];
    }
  }

  if (!hasParams) {
    done();
    yargs.parse(['--msg']);
  }
  // if add page or delete page, then modify app.json
  if (argv.p || argv.d || argv.a) {
    gulp
      .src('src/app.json')
      .pipe(
        jeditor(function(json) {
          const pagesData = json.pages;
          const key = basename === pathName ? dirname : dirname + basename;
          const index = pagesData.indexOf(key);
          if (argv.p && index < 0) {
            pagesData.push(key);
          } else if (argv.d && index > -1) {
            // 删除目录下的单个配置项
            pagesData.splice(index, 1);
          } else if (argv.a) {
            // 删除整个目录下的配置项
            json.pages = pagesData.filter(item => {
              const lastI = item.lastIndexOf('/');
              return !(
                item.slice(0, lastI).startsWith(key) &&
                !item.slice(0, lastI) !== key
              );
            });
          }
          return json;
        })
      )
      .pipe(gulp.dest('src'));
  }
  if (argv.d || argv.a) {
    const folderPath = path.join(
      __dirname,
      'src',
      dirname
      // basename === pathName ? dirname : dirname + basename,
    );
    if (argv.d) {
      del(`${folderPath}${basename}.*`).then(paths => {
        const folder = paths.join('\n');
        if (folder) {
          console.log('Deleted files:\n', folder);
        } else {
          console.log(
            "Can't find files:\n",
            `${folderPath}/${dirname}${basename}.*`
          );
        }
      });
    } else {
      del(`${folderPath}/${basename === pathName ? '' : basename}`).then(
        paths => {
          const folder = paths.join('\n');
          if (folder) {
            console.log('Deleted folder:\n', folder);
          } else {
            console.log(
              "Can't find folder:\n",
              `${folderPath}/${basename === pathName ? '' : basename}`
            );
          }
        }
      );
    }
    done();
    return;
  }
  const root = path.join(__dirname, 'src', type);
  return gulp
    .src(path.join(root, source, '*.*'))
    .pipe(
      rename({
        dirname: pathName,
        basename: basename
      })
    )
    .pipe(gulp.dest(path.join(root)));
};
gulp.task(auto);

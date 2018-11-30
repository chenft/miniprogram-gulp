# miniprogram-gulp
基于gulp+less构建的微信小程序工程项目，压缩图片、自动修改 app.json 等

## 使用
```
npm install gulp gulp-cli -g
npm run dev
```

```
gulp auto -p mypage           ## 创建路径为 pages/mypage 的 page 文件
gulp auto -t mytpl            ## 创建路径名为 templates/mytpl 的 template 文件
gulp auto -c mycomponent      ## 创建路径名为 components/mycomponent 的 component 文件
gulp auto -s index -p mypage  ## 复制 pages/index 中的文件创建路径为 pages/mypage 的页面
gulp auto -d mypage           ## 删除路径为 pages/mypage 的文件
gulp auto -a mypage           ## 删除路径为 pages/mypage 的目录
```

新建/删除页面会自动更新 app.json 文件
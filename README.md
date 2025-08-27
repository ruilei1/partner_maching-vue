
## 清空 node_modules 文件夹
```sh
Remove-Item -Recurse -Force node_modules
```

## 项目设置(安装package.json中全部依赖，下面就不需要手动安装)
```sh
npm install
```

### 运行程序，Compile and Hot-Reload for Development（用于开发的 Compile 和 Hot-Reload）
```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

# Partner Matching Vue

该项目是一个基于 Vue 3 的前端应用，用于实现合作伙伴匹配功能。

## 环境变量配置

项目支持根据不同的运行环境自动切换 API 地址：

- 开发环境: `http://localhost:8080/api`
- 生产环境: `http://100.94.217.82:8080/api`

环境变量文件：
- `.env`: 默认环境配置
- `.env.development`: 开发环境配置
- `.env.production`: 生产环境配置

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

### 构建项目
```bash
# 默认构建（使用默认环境变量，加载 .env 文件）
npm run build

# 生产环境构建（使用生产环境变量，加载 .env.production 文件）
npm run build:prod
```
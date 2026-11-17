# ONCLOUD 文档管理系统（前端）

Vue 2.7 + Element UI 实现的文档管理系统前端，后端仓库见
[oncloud-springboot](https://github.com/NaturePorter/oncloud-springboot)。

## 快速开始

```bash
npm install
npm run dev      # 开发环境，默认 http://localhost:4116
npm run build    # 生产构建，产物在 dist/
npm run preview  # 本地预览构建产物
```

开发环境下 `/api` 会代理到 `http://localhost:8797`（见 `vite.config.js`）。
如需直连其他后端地址，创建 `.env.local`：

```
VITE_API_BASE=http://your-server:8797/api/
```

默认账号：`admin / admin`。

### 部署说明

路由使用 history 模式，部署 `dist/` 到 Nginx 时需要把未匹配的路径回退到 `index.html`：

```nginx
location / {
    root   /usr/share/nginx/html;
    index  index.html;
    try_files $uri $uri/ /index.html;
}

location /api/ {
    proxy_pass http://127.0.0.1:8797/api/;
}
```

## 功能

- 登录 / 退出，token 存于 sessionStorage，失效自动跳回登录页
- 我的桌面：个人信息与当前时间
- 文件列表：搜索、分页、共享开关、下载、删除
- 文件上传：表单校验、格式与 50MB 大小限制、上传进度提示
- 文件大厅：浏览已共享且已审核的文档并下载
- 管理员列表：新增用户、启用/停用、删除、分配角色
- 待审核列表：管理员审核文档
- 按角色动态渲染左侧导航（菜单由后端 `/api/menu` 返回）

## 本次修复与优化

### 构建

- 原项目缺少 `build/` 目录（webpack 配置从未提交），且 `webpack 3 + node-sass 4` 无法在
  现代 Node 环境运行，`npm run dev/build` 完全不可用。
- 迁移到 **Vite 5 + Vue 2.7**，保留原有 Vue 2 / Element UI 写法与页面结构，删除失效的
  webpack/babel 配置，开发与构建可直接在 Node 18+ 运行。

### 功能缺陷

- 上传接口请求头写成了 `Authorization`，后端读的是 `token`，导致上传必然 401。
- 下载使用 `<a href>` 直链，无法携带 token，必然下载失败；改为 axios 请求 blob 后保存，
  并正确处理后端返回的 JSON 错误。
- `el-switch` 上使用 `v-model="row.isshared == 1"`（不是合法左值），模板编译报错；改为
  `:value` + `@change` 并在成功后更新行数据。
- 菜单项地址缺少 `/home/` 前缀，且存在指向未实现页面（角色管理、菜单管理）的菜单；已统一
  拼接路由前缀，并用兜底路由避免空白页。
- 表格多选相关的死代码（`docSelection`、错误的 `this` 指向）已删除。
- “修改用户”对话框无任何接口，已替换为可用的“分配角色”。
- 登录页无效的“测试”按钮、`Vue.use(router)` 等错误写法已清理。
- 修复路由 `name: 'login'` 重复、根路径无重定向、缺少 404 兜底的问题。

### 体验与健壮性

- 统一 axios 实例：自动携带 token、全局 loading（计数，不再重复创建遮罩层）、401 自动
  跳转登录并防抖、403/超时/断网给出明确提示。
- 请求参数统一使用 `URLSearchParams`，避免 axios 默认 JSON 与后端 `@RequestParam` 不匹配。
- 抽取 `formatDate` / `formatFileSize`，列表展示更易读。
- 登录支持 `redirect` 回跳，表单增加 loading 与回车提交。
- 上传前校验文档信息与文件大小，上传成功/失败均有明确反馈。

## 目录结构

```
src/
├── assets/css        全局样式
├── router            路由与登录守卫
├── utils             token 读写、格式化工具
├── views             登录、首页、桌面、文件、上传、大厅、用户、审核
├── App.vue
└── main.js           axios 拦截器与全局注册
```

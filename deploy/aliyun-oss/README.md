# 阿里云 OSS 部署指南（静态网站托管）

本项目为 Vite/React 前端，最适合用阿里云 OSS 进行静态网站托管。按照本文档完成一次性配置后，可一键上传 `dist/` 并生成可外网访问的链接。

## 一次性准备

1) 创建 AccessKey（必要）
- 登录阿里云控制台（主账号或 RAM 子账号）
- 前往「访问控制 RAM」> 安全设置，创建并启用 `AccessKey ID / AccessKey Secret`
- 切勿在代码中保存控制台密码，部署需使用 AK/SK。

2) 安装 ossutil（官方推荐上传工具）
- Windows 64 位下载地址（官方）：https://gosspublic.alicdn.com/ossutil/ossutil64.zip
- 将 `ossutil64.exe` 解压到 `C:\ossutil64\ossutil64.exe`（你也可以选择其它目录，但需要调整脚本路径）

3) 选择地域与桶名
- 推荐地域：`oss-cn-hangzhou`（华东 1）或就近地域，避免跨地域带来的时延
- 建议桶名：`bingli-h5-nick3419929572`（可自定义，但需全局唯一）

## 部署步骤（手动）

1) 构建生产包
```
npm run build
```
将生成 `dist/` 目录。

2) 初始化 ossutil 配置（首次）
```
ossutil64.exe config --endpoint oss-cn-hangzhou.aliyuncs.com \
  --accessKeyID <你的AK> --accessKeySecret <你的SK>
```

3) 创建 Bucket（若不存在）
```
ossutil64.exe mb oss://bingli-h5-nick3419929572 --endpoint oss-cn-hangzhou.aliyuncs.com
```

4) 设置静态网站与公开读权限（外网可访问）
```
ossutil64.exe set-bucket-website oss://bingli-h5-nick3419929572 \
  --index index.html --error index.html --endpoint oss-cn-hangzhou.aliyuncs.com

ossutil64.exe set-acl oss://bingli-h5-nick3419929572 public-read \
  --endpoint oss-cn-hangzhou.aliyuncs.com
```
说明：我们将错误文档也指向 `index.html`，以支持 `BrowserRouter` 的 SPA 路由回退。

5) 上传静态资源
```
ossutil64.exe cp -r dist oss://bingli-h5-nick3419929572/ --endpoint oss-cn-hangzhou.aliyuncs.com --force
```

6) 访问链接
- 直连 OSS 链接：`https://bingli-h5-nick3419929572.oss-cn-hangzhou.aliyuncs.com/`
- 如需绑定自定义域名与 HTTPS，请到「CDN」或「域名管理」配置加速与证书。

## 一键部署脚本
配合 PowerShell 脚本 `deploy-oss.ps1` 可实现一键构建+上传。执行前请在系统环境变量中设置：
- `ALIBABA_ACCESS_KEY_ID`
- `ALIBABA_ACCESS_KEY_SECRET`

执行：
```
# 在项目根目录
powershell -ExecutionPolicy Bypass -File .\deploy\aliyun-oss\deploy-oss.ps1 -Bucket bingli-h5-nick3419929572 -Region oss-cn-hangzhou -OssutilPath "C:\ossutil64\ossutil64.exe"
```

脚本会自动：
- 构建生产包
- 初始化 ossutil 配置（临时覆盖为当前会话）
- 创建 Bucket（如已存在会忽略错误）
- 设置公开读与静态网站托管
- 上传 `dist/` 到 OSS
- 输出外网访问链接

## 常见问题
- 访问 403：确认已设置 `public-read`，且文件成功上传到桶根路径。
- 单页路由 404：确认 `set-bucket-website` 的 `--error index.html` 已配置。
- 地域不符：所有命令的 `--endpoint` 必须与你的 Bucket 地域一致，例如 `oss-cn-shanghai.aliyuncs.com`。
- CORS：若网页需要跨域访问第三方 API，请在被访问的服务端配置 CORS 允许你的域名。

## 变更记录
- 初版：新增 OSS 部署说明与脚本，默认地域 `oss-cn-hangzhou`，桶名示例 `bingli-h5-nick3419929572`。
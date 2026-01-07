# PetMoments - GitHub 自动部署指南

## 📋 前置要求

1. GitHub 账号
2. Azure 存储账户（已启用静态网站功能）
3. Azure 存储账户连接字符串

---

## 🚀 部署步骤

### 1. 配置 Azure Storage 静态网站

在 Azure Portal 中：

1. 打开你的存储账户（如 `petmomentsstorage1`）
2. 左侧菜单选择 **"静态网站"**
3. 点击 **"启用"**
4. 设置：
   - 索引文档名称：`index.html`
   - 错误文档路径：`404.html`（可选）
5. 点击 **"保存"**
6. 记下 **主终结点 URL**（如：`https://petmomentsstorage1.z28.web.core.windows.net/`）

### 2. 获取存储账户连接字符串

1. 在存储账户页面，左侧菜单选择 **"访问密钥"**
2. 点击 **"显示密钥"**
3. 复制 **连接字符串**（key1 或 key2 都可以）

### 3. 配置 GitHub Secrets

1. 进入你的 GitHub 仓库：https://github.com/shenyu9099/pet
2. 点击 **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret**
4. 添加以下 Secret：
   - **Name**: `AZURE_STORAGE_CONNECTION_STRING`
   - **Value**: 粘贴你的 Azure 存储账户连接字符串
5. 点击 **Add secret**

### 4. 推送代码到 GitHub

```bash
cd PetMoments

# 初始化 Git 仓库（如果还没有）
git init

# 添加远程仓库
git remote add origin https://github.com/shenyu9099/pet.git

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: PetMoments frontend"

# 推送到 main 分支
git push -u origin main
```

### 5. 自动部署

推送代码后，GitHub Actions 会自动：
1. 检出代码
2. 上传所有前端文件到 Azure Blob Storage 的 `$web` 容器
3. 部署完成！

你可以在 GitHub 仓库的 **Actions** 标签查看部署进度。

---

## 🌐 访问你的网站

部署完成后，访问 Azure 静态网站 URL：
```
https://petmomentsstorage1.z28.web.core.windows.net/
```

---

## 🔄 后续更新

每次推送代码到 `main` 分支，都会自动触发部署：

```bash
# 修改代码后
git add .
git commit -m "Update: description of changes"
git push
```

或者在 GitHub 仓库的 **Actions** 标签手动触发部署。

---

## 📁 部署的文件

自动部署会上传以下文件：
- ✅ 所有 HTML 文件（`*.html`）
- ✅ CSS 文件夹（`/css/`）
- ✅ JavaScript 文件夹（`/js/`）
- ❌ Logic Apps 配置（`/logic-apps/` - 已在 `.gitignore` 中排除）
- ❌ 文档文件（可选）

---

## 🛠️ 故障排除

### 部署失败？

1. 检查 GitHub Actions 日志
2. 确认 `AZURE_STORAGE_CONNECTION_STRING` Secret 配置正确
3. 确认 Azure Storage 静态网站已启用
4. 确认连接字符串有效且有写入权限

### 网站无法访问？

1. 检查 Azure Storage 静态网站是否已启用
2. 检查 CORS 配置（如果需要跨域访问）
3. 检查防火墙规则

---

## 📝 注意事项

1. **API 端点配置**：确保 `js/config.js` 中的 Logic Apps URL 是正确的
2. **CORS 配置**：确保 Azure Blob Storage 已配置 CORS，允许从静态网站域名访问
3. **缓存**：浏览器可能会缓存旧版本，使用硬刷新（`Ctrl + Shift + R`）

---

## 🎉 完成！

现在你的 PetMoments 平台已经实现了自动化部署！每次推送代码都会自动更新线上网站。


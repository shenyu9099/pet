# 🚀 PetMoments 快速启动指南

> 5分钟了解如何创建和部署 PetMoments 平台

---

## 📋 准备工作

### 需要的工具
- ✅ Azure 账户（学生账户有 $100 免费额度）
- ✅ Azure CLI（命令行工具）
- ✅ 浏览器（Chrome/Edge）
- ✅ 文本编辑器（VS Code）

### 安装 Azure CLI

```bash
# Windows
winget install Microsoft.AzureCLI

# 登录
az login
```

---

## 🏗️ 创建 Azure 资源（按顺序）

### 1️⃣ 创建资源组

```bash
az group create --name PetMoments-RG --location uksouth
```

---

### 2️⃣ 创建 SQL Database（存储用户信息）

```bash
# 创建 SQL Server
az sql server create \
  --name petmoments-sqlserver \
  --resource-group PetMoments-RG \
  --location uksouth \
  --admin-user sqladmin \
  --admin-password "YourPassword123!"

# 允许 Azure 服务访问
az sql server firewall-rule create \
  --resource-group PetMoments-RG \
  --server petmoments-sqlserver \
  --name AllowAzure \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# 创建数据库
az sql db create \
  --resource-group PetMoments-RG \
  --server petmoments-sqlserver \
  --name PetMomentsDB \
  --service-objective Basic
```

**创建 Users 表**（在 Azure Portal 的 Query Editor 中执行）:

```sql
CREATE TABLE Users (
    UserId NVARCHAR(50) PRIMARY KEY,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    Name NVARCHAR(100) NOT NULL,
    PasswordHash NVARCHAR(255) NOT NULL,
    Avatar NVARCHAR(500),
    Bio NVARCHAR(500),
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);
CREATE INDEX IX_Users_Email ON Users(Email);
```

---

### 3️⃣ 创建 Cosmos DB（存储宠物和日记）

```bash
# 创建 Cosmos DB 账户
az cosmosdb create \
  --name petmomentsdb \
  --resource-group PetMoments-RG \
  --locations regionName=uksouth

# 创建数据库
az cosmosdb sql database create \
  --account-name petmomentsdb \
  --resource-group PetMoments-RG \
  --name PetMomentsDB

# 创建 Pets 容器
az cosmosdb sql container create \
  --account-name petmomentsdb \
  --resource-group PetMoments-RG \
  --database-name PetMomentsDB \
  --name pets \
  --partition-key-path "/userId" \
  --throughput 400

# 创建 PetMoments 容器
az cosmosdb sql container create \
  --account-name petmomentsdb \
  --resource-group PetMoments-RG \
  --database-name PetMomentsDB \
  --name petmoments \
  --partition-key-path "/userId" \
  --throughput 400
```

---

### 4️⃣ 创建 Blob Storage（存储照片/视频）

```bash
# 创建存储账户
az storage account create \
  --name petmomentsstorage \
  --resource-group PetMoments-RG \
  --location uksouth \
  --sku Standard_LRS

# 获取密钥
STORAGE_KEY=$(az storage account keys list \
  --account-name petmomentsstorage \
  --resource-group PetMoments-RG \
  --query "[0].value" -o tsv)

# 创建 media 容器
az storage container create \
  --name media \
  --account-name petmomentsstorage \
  --account-key $STORAGE_KEY \
  --public-access blob
```

---

### 5️⃣ 创建 AI Search（智能搜索）

```bash
# 创建搜索服务
az search service create \
  --name petmoments-search \
  --resource-group PetMoments-RG \
  --location uksouth \
  --sku basic
```

**创建搜索索引**（在 Azure Portal 或使用 REST API）:

1. 进入 Azure Portal → AI Search 服务
2. 点击 "Indexes" → "+ Add index"
3. 使用以下字段：
   - `id` (String, Key)
   - `title` (String, Searchable)
   - `description` (String, Searchable)
   - `petName` (String, Searchable, Filterable)
   - `petSpecies` (String, Filterable)
   - `tags` (Collection, Searchable)
   - `aiScene` (String, Filterable)
   - `coverImage` (String)
   - `createdAt` (DateTimeOffset, Sortable)

---

### 6️⃣ 创建 Computer Vision（AI 图像识别）

```bash
az cognitiveservices account create \
  --name petmoments-vision \
  --resource-group PetMoments-RG \
  --kind ComputerVision \
  --sku S1 \
  --location uksouth \
  --yes
```

---

## 🔗 创建 API Connections（在 Azure Portal）

### 步骤：
1. 搜索 "API connections"
2. 点击 "+ Create"
3. 创建以下 3 个连接：

#### ① SQL Connection
- 名称: `sql-connection`
- 类型: SQL Server
- 服务器: `petmoments-sqlserver.database.windows.net`
- 数据库: `PetMomentsDB`
- 用户名: `sqladmin`
- 密码: `YourPassword123!`

#### ② Cosmos DB Connection
- 名称: `documentdb-connection`
- 类型: Azure Cosmos DB
- 账户: `petmomentsdb`
- 访问密钥: [从 Cosmos DB → Keys 复制]

#### ③ Blob Storage Connection
- 名称: `azureblob-connection`
- 类型: Azure Blob Storage
- 存储账户: `petmomentsstorage`
- 访问密钥: [从 Storage → Access keys 复制]

---

## ⚡ 部署 Logic Apps

### 需要创建的 Logic Apps（8个核心）

| Logic App 名称 | JSON 文件 | 功能 |
|---------------|-----------|------|
| petmoments-register-user | register-user.json | 用户注册 |
| petmoments-login-user | login-user.json | 用户登录 |
| petmoments-create-pet | create-pet.json | 创建宠物 |
| petmoments-get-my-pets | get-my-pets.json | 获取宠物列表 |
| petmoments-create-moment | create-moment.json | 创建日记 |
| petmoments-get-moments | get-moments.json | 获取所有日记 |
| petmoments-get-moment-by-id | get-moment-by-id.json | 获取单个日记 |
| petmoments-delete-moment | delete-moment.json | 删除日记 |

### 部署步骤（每个 Logic App）:

1. Azure Portal → 搜索 "Logic Apps"
2. 点击 "+ Add"
3. 选择 "Consumption" 类型
4. 填写：
   - Resource Group: `PetMoments-RG`
   - Name: `petmoments-register-user`
   - Region: `UK South`
5. Create
6. 进入 Logic App → "Logic app code view"
7. 复制 `logic-apps/register-user.json` 的内容
8. 粘贴并保存
9. 复制 "Workflow URL"
10. 保存到 `js/config.js`

---

## 🎨 配置前端

### 更新 `js/config.js`

```javascript
const API_ENDPOINTS = {
    USERS: {
        REGISTER: 'https://prod-xx.uksouth.logic.azure.com/workflows/xxx/...',
        LOGIN: 'https://prod-xx.uksouth.logic.azure.com/workflows/xxx/...'
    },
    PETS: {
        CREATE: 'https://prod-xx.uksouth.logic.azure.com/workflows/xxx/...',
        GET_MY_PETS: 'https://prod-xx.uksouth.logic.azure.com/workflows/xxx/...'
    },
    MOMENTS: {
        CREATE: 'https://prod-xx.uksouth.logic.azure.com/workflows/xxx/...',
        GET_ALL: 'https://prod-xx.uksouth.logic.azure.com/workflows/xxx/...',
        GET_BY_ID: 'https://prod-xx.uksouth.logic.azure.com/workflows/xxx/...',
        DELETE: 'https://prod-xx.uksouth.logic.azure.com/workflows/xxx/...'
    }
};

const SEARCH_CONFIG = {
    ENDPOINT: 'https://petmoments-search.search.windows.net',
    API_KEY: 'YOUR_SEARCH_QUERY_KEY',
    INDEX_NAME: 'petmoments-index',
    API_VERSION: '2023-11-01'
};
```

---

## 🌐 部署前端

### 方法 1: Blob Storage 静态网站（推荐）

```bash
# 启用静态网站托管
az storage blob service-properties update \
    --account-name petmomentsstorage \
    --static-website \
    --index-document index.html

# 上传文件
az storage blob upload-batch \
    --account-name petmomentsstorage \
    --source . \
    --destination '$web' \
    --account-key $STORAGE_KEY
```

**访问 URL**: `https://petmomentsstorage.z33.web.core.windows.net/`

### 方法 2: Azure Static Web Apps

```bash
az staticwebapp create \
  --name petmoments-web \
  --resource-group PetMoments-RG \
  --location uksouth
```

---

## ✅ 测试

### 1. 测试 SQL Database

在 Azure Portal → SQL Database → Query Editor:

```sql
SELECT * FROM Users;
```

### 2. 测试 Cosmos DB

在 Azure Portal → Cosmos DB → Data Explorer:
- 查看 `pets` 和 `petmoments` 容器

### 3. 测试 Logic Apps

```bash
# 测试注册
curl -X POST https://your-logic-app-url/register \
  -H "Content-Type: application/json" \
  -d '{"name":"测试","email":"test@test.com","password":"123456"}'

# 测试登录
curl -X POST https://your-logic-app-url/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'
```

### 4. 测试前端

1. 打开浏览器访问前端 URL
2. 点击"登录"
3. 注册新用户
4. 创建宠物档案
5. 发布宠物日记
6. 测试搜索功能

---

## 📊 资源清单

创建完成后，你应该有以下资源：

- ✅ 1 个资源组 (`PetMoments-RG`)
- ✅ 1 个 SQL Server + 1 个数据库
- ✅ 1 个 Cosmos DB 账户 + 2 个容器
- ✅ 1 个 Blob Storage 账户
- ✅ 1 个 AI Search 服务
- ✅ 1 个 Computer Vision 服务
- ✅ 3 个 API Connections
- ✅ 8-11 个 Logic Apps
- ✅ 1 个静态网站

---

## 💰 成本预估

| 服务 | 月成本 |
|------|--------|
| SQL Database (Basic) | $5 |
| Cosmos DB (400 RU/s × 2) | $24 |
| Blob Storage (10GB) | $2 |
| AI Search (Basic) | $75 |
| Logic Apps (消费计划) | $1 |
| Computer Vision (S1) | $1 |
| **总计** | **~$108/月** |

**💡 提示**: Azure for Students 提供 $100/月免费额度！

---

## 🔧 常见问题

**Q: 如何获取 Logic App 的 URL？**  
A: Logic App → Overview → 复制 "Workflow URL"

**Q: 如何获取 Cosmos DB 密钥？**  
A: Cosmos DB → Keys → 复制 "Primary Key"

**Q: 如何获取 AI Search 密钥？**  
A: AI Search → Keys → 复制 "Query key"

**Q: CORS 错误怎么办？**  
A: 确保 Logic Apps 响应头包含 `Access-Control-Allow-Origin: *`

**Q: 如何查看 Logic App 错误？**  
A: Logic App → Runs history → 点击失败的运行 → 查看详细错误

---

## 📚 下一步

1. ✅ 完善 UI 设计
2. ✅ 添加更多 Logic Apps
3. ✅ 实现 AI 图像标记
4. ✅ 优化搜索功能
5. ✅ 添加用户头像上传
6. ✅ 实现评论和点赞

---

## 📞 获取帮助

- 详细部署指南: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- Logic Apps 说明: [logic-apps/README.md](logic-apps/README.md)
- Azure 文档: https://docs.microsoft.com/azure

---

**🎉 完成！现在你可以开始使用 PetMoments 了！**

访问你的网站，注册账户，开始分享宠物的精彩时刻吧！ 🐾


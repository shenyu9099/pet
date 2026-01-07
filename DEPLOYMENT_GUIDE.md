# PetMoments 完整部署指南

## 📋 项目概述

**PetMoments** 是一个基于 Azure 云服务的宠物时刻分享平台，使用天蓝色主题，支持照片、视频、音频分享，并集成 AI 智能标记和搜索功能。

### 技术架构

```
前端: HTML5 + CSS3 + JavaScript
    ↓
Azure Logic Apps (11个 API 端点)
    ↓
├── Azure SQL Database (用户信息)
├── Azure Cosmos DB (宠物档案 + 日记)
├── Azure Blob Storage (媒体文件)
├── Azure Computer Vision (AI 图像识别)
├── Azure AI Search (智能搜索)
└── Azure Event Grid (事件驱动)
```

---

## 🚀 完整部署步骤

### 前置准备

1. **Azure 账户**: 确保有有效的 Azure 订阅
2. **Azure CLI**: 安装 Azure CLI 工具
3. **权限**: 订阅的 Contributor 或 Owner 权限

```bash
# 安装 Azure CLI (Windows)
winget install Microsoft.AzureCLI

# 登录 Azure
az login

# 设置默认订阅
az account set --subscription "YOUR_SUBSCRIPTION_ID"
```

---

## 第一步：创建资源组

```bash
# 创建资源组
az group create \
  --name PetMoments-RG \
  --location uksouth

# 验证
az group show --name PetMoments-RG
```

---

## 第二步：创建 Azure SQL Database

### 2.1 创建 SQL Server

```bash
# 创建 SQL Server
az sql server create \
  --name petmoments-sqlserver \
  --resource-group PetMoments-RG \
  --location uksouth \
  --admin-user sqladmin \
  --admin-password "YourStrongPassword123!"

# 配置防火墙规则（允许 Azure 服务访问）
az sql server firewall-rule create \
  --resource-group PetMoments-RG \
  --server petmoments-sqlserver \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# 允许你的本地 IP 访问（用于测试）
az sql server firewall-rule create \
  --resource-group PetMoments-RG \
  --server petmoments-sqlserver \
  --name AllowMyIP \
  --start-ip-address YOUR_IP \
  --end-ip-address YOUR_IP
```

### 2.2 创建数据库

```bash
# 创建数据库
az sql db create \
  --resource-group PetMoments-RG \
  --server petmoments-sqlserver \
  --name PetMomentsDB \
  --service-objective Basic \
  --backup-storage-redundancy Local
```

### 2.3 创建 Users 表

使用 Azure Portal 或 SQL Server Management Studio 连接到数据库，执行以下 SQL：

```sql
-- 创建 Users 表
CREATE TABLE Users (
    UserId NVARCHAR(50) PRIMARY KEY,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    Name NVARCHAR(100) NOT NULL,
    PasswordHash NVARCHAR(255) NOT NULL,
    Avatar NVARCHAR(500),
    Bio NVARCHAR(500),
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);

-- 创建索引
CREATE INDEX IX_Users_Email ON Users(Email);

-- 插入测试用户（可选）
INSERT INTO Users (UserId, Email, Name, PasswordHash, CreatedAt)
VALUES ('user-test-001', 'test@petmoments.com', '测试用户', '123456', GETUTCDATE());

-- 验证
SELECT * FROM Users;
```

**连接字符串**（保存备用）:
```
Server=tcp:petmoments-sqlserver.database.windows.net,1433;Initial Catalog=PetMomentsDB;Persist Security Info=False;User ID=sqladmin;Password=YourStrongPassword123!;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
```

---

## 第三步：创建 Azure Cosmos DB

### 3.1 创建 Cosmos DB 账户

```bash
# 创建 Cosmos DB 账户
az cosmosdb create \
  --name petmomentsdb \
  --resource-group PetMoments-RG \
  --locations regionName=uksouth failoverPriority=0 \
  --default-consistency-level Session \
  --enable-automatic-failover false
```

### 3.2 创建数据库

```bash
# 创建数据库
az cosmosdb sql database create \
  --account-name petmomentsdb \
  --resource-group PetMoments-RG \
  --name PetMomentsDB \
  --throughput 400
```

### 3.3 创建容器

```bash
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

### 3.4 获取连接信息

```bash
# 获取 Primary Key
az cosmosdb keys list \
  --name petmomentsdb \
  --resource-group PetMoments-RG \
  --type keys

# 获取连接字符串
az cosmosdb keys list \
  --name petmomentsdb \
  --resource-group PetMoments-RG \
  --type connection-strings
```

**保存以下信息**:
- Endpoint: `https://petmomentsdb.documents.azure.com:443/`
- Primary Key: `[复制的密钥]`

---

## 第四步：创建 Azure Blob Storage

### 4.1 创建存储账户

```bash
# 创建存储账户
az storage account create \
  --name petmomentsstorage \
  --resource-group PetMoments-RG \
  --location uksouth \
  --sku Standard_LRS \
  --kind StorageV2 \
  --access-tier Hot

# 获取连接字符串
az storage account show-connection-string \
  --name petmomentsstorage \
  --resource-group PetMoments-RG \
  --output tsv
```

### 4.2 创建容器（Blob Containers）

```bash
# 获取账户密钥
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

# 创建子文件夹（通过上传空文件）
# 这些会在上传文件时自动创建：
# - media/covers/
# - media/photos/
# - media/videos/
# - media/audio/
```

### 4.3 配置 CORS（允许前端访问）

```bash
az storage cors add \
  --services b \
  --methods GET POST PUT DELETE \
  --origins "*" \
  --allowed-headers "*" \
  --exposed-headers "*" \
  --max-age 3600 \
  --account-name petmomentsstorage \
  --account-key $STORAGE_KEY
```

**Blob Storage URL 格式**:
```
https://petmomentsstorage.blob.core.windows.net/media/photos/xxx.jpg
```

---

## 第五步：创建 Azure AI Search

### 5.1 创建搜索服务

```bash
# 创建 AI Search 服务
az search service create \
  --name petmoments-search \
  --resource-group PetMoments-RG \
  --location uksouth \
  --sku basic

# 获取管理密钥
az search admin-key show \
  --service-name petmoments-search \
  --resource-group PetMoments-RG
```

### 5.2 创建搜索索引

使用 REST API 或 Azure Portal 创建索引。将以下 JSON 保存为 `search-index.json`:

```json
{
  "name": "petmoments-index",
  "fields": [
    {"name": "id", "type": "Edm.String", "key": true, "searchable": false},
    {"name": "title", "type": "Edm.String", "searchable": true, "analyzer": "zh-Hans.microsoft"},
    {"name": "description", "type": "Edm.String", "searchable": true, "analyzer": "zh-Hans.microsoft"},
    {"name": "petName", "type": "Edm.String", "searchable": true, "filterable": true},
    {"name": "petSpecies", "type": "Edm.String", "filterable": true, "facetable": true},
    {"name": "tags", "type": "Collection(Edm.String)", "searchable": true, "filterable": true},
    {"name": "aiScene", "type": "Edm.String", "searchable": true, "filterable": true},
    {"name": "aiDescription", "type": "Edm.String", "searchable": true, "analyzer": "zh-Hans.microsoft"},
    {"name": "coverImage", "type": "Edm.String", "searchable": false},
    {"name": "userId", "type": "Edm.String", "filterable": true},
    {"name": "createdAt", "type": "Edm.DateTimeOffset", "filterable": true, "sortable": true}
  ],
  "suggesters": [
    {
      "name": "sg-petmoments",
      "searchMode": "analyzingInfixMatching",
      "sourceFields": ["title", "tags", "petName"]
    }
  ]
}
```

使用 PowerShell 或 curl 创建索引：

```powershell
# PowerShell
$headers = @{
    "api-key" = "YOUR_ADMIN_KEY"
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "https://petmoments-search.search.windows.net/indexes/petmoments-index?api-version=2023-11-01" `
    -Method PUT `
    -Headers $headers `
    -Body (Get-Content search-index.json -Raw)
```

**保存以下信息**:
- Search Endpoint: `https://petmoments-search.search.windows.net`
- Admin Key: `[复制的密钥]`
- Query Key: `[复制的查询密钥]`

---

## 第六步：创建 Computer Vision (可选但推荐)

### 6.1 创建 Computer Vision 资源

```bash
# 创建 Computer Vision
az cognitiveservices account create \
  --name petmoments-vision \
  --resource-group PetMoments-RG \
  --kind ComputerVision \
  --sku S1 \
  --location uksouth \
  --yes

# 获取密钥
az cognitiveservices account keys list \
  --name petmoments-vision \
  --resource-group PetMoments-RG
```

**保存以下信息**:
- Endpoint: `https://uksouth.api.cognitive.microsoft.com/`
- Key: `[复制的密钥]`

---

## 第七步：创建 Event Grid Topic (可选)

```bash
# 创建 Event Grid Topic
az eventgrid topic create \
  --name petmoments-events \
  --resource-group PetMoments-RG \
  --location uksouth

# 获取端点和密钥
az eventgrid topic show \
  --name petmoments-events \
  --resource-group PetMoments-RG \
  --query "endpoint" --output tsv

az eventgrid topic key list \
  --name petmoments-events \
  --resource-group PetMoments-RG
```

---

## 第八步：创建 Application Insights (监控)

```bash
# 创建 Application Insights
az monitor app-insights component create \
  --app petmoments-insights \
  --location uksouth \
  --resource-group PetMoments-RG \
  --application-type web

# 获取连接字符串
az monitor app-insights component show \
  --app petmoments-insights \
  --resource-group PetMoments-RG \
  --query "connectionString" -o tsv
```

---

## 第九步：创建 API Connections (Logic Apps 需要)

在 Azure Portal 中手动创建以下连接：

### 9.1 SQL Server Connection

1. 搜索 "API connections" → "+ Create"
2. 搜索 "SQL Server" → 选择
3. 填写：
   - **Connection name**: `sql-connection`
   - **Server name**: `petmoments-sqlserver.database.windows.net`
   - **Database name**: `PetMomentsDB`
   - **Username**: `sqladmin`
   - **Password**: `YourStrongPassword123!`
4. Create

### 9.2 Cosmos DB Connection

1. 搜索 "API connections" → "+ Create"
2. 搜索 "Azure Cosmos DB" → 选择
3. 填写：
   - **Connection name**: `documentdb-connection`
   - **Account ID**: `petmomentsdb`
   - **Access Key**: [从第三步获取的 Primary Key]
4. Create

### 9.3 Blob Storage Connection

1. 搜索 "API connections" → "+ Create"
2. 搜索 "Azure Blob Storage" → 选择
3. 填写：
   - **Connection name**: `azureblob-connection`
   - **Storage Account**: 选择 `petmomentsstorage`
   - **Access Key**: [自动填充或手动输入]
4. Create

### 9.4 Event Grid Connection (可选)

1. 搜索 "API connections" → "+ Create"
2. 搜索 "Azure Event Grid" → 选择
3. 填写：
   - **Connection name**: `eventgrid-connection`
   - 使用 Azure AD 认证或密钥
4. Create

---

## 第十步：部署 Logic Apps

### 10.1 使用 Azure Portal 部署

对于每个 Logic App JSON 文件：

1. 在 Azure Portal 搜索 "Logic Apps"
2. 点击 "+ Add"
3. 选择 "Consumption" 类型
4. 填写：
   - **Resource Group**: `PetMoments-RG`
   - **Logic App name**: `petmoments-register-user` (根据功能命名)
   - **Region**: `UK South`
5. Create
6. 创建后，进入 Logic App
7. 点击 "Logic app code view"
8. 复制对应的 JSON 文件内容（如 `register-user.json`）
9. 替换 JSON 中的占位符：
   - `YOUR_SUBSCRIPTION_ID` → 你的订阅 ID
   - 连接 ID 路径 → 你创建的 API Connection 的完整路径
10. 保存
11. 点击 "Overview" → 复制 "Workflow URL"
12. 保存 URL 到 `js/config.js`

### 10.2 需要创建的 Logic Apps 列表

| Logic App 名称 | JSON 文件 | 用途 |
|---------------|-----------|------|
| petmoments-register-user | register-user.json | 用户注册 |
| petmoments-login-user | login-user.json | 用户登录 |
| petmoments-create-pet | create-pet.json | 创建宠物 |
| petmoments-get-my-pets | get-my-pets.json | 获取我的宠物 |
| petmoments-create-moment | create-moment.json | 创建日记 |
| petmoments-get-moments | get-moments.json | 获取所有日记 |
| petmoments-get-moment-by-id | get-moment-by-id.json | 获取单个日记 |
| petmoments-update-moment | update-moment.json | 更新日记 |
| petmoments-delete-moment | delete-moment.json | 删除日记 |

---

## 第十一步：配置前端

### 11.1 更新 API 端点

编辑 `js/config.js`，替换所有 Logic Apps 的 URL：

```javascript
const API_ENDPOINTS = {
    USERS: {
        REGISTER: 'https://prod-xx.uksouth.logic.azure.com:443/workflows/xxx/triggers/manual/paths/invoke?api-version=2016-10-01&sp=xxx&sv=1.0&sig=xxx',
        LOGIN: 'https://prod-xx.uksouth.logic.azure.com:443/workflows/xxx/...'
    },
    // ... 其他端点
};

const SEARCH_CONFIG = {
    ENDPOINT: 'https://petmoments-search.search.windows.net',
    API_KEY: 'YOUR_SEARCH_QUERY_KEY',
    INDEX_NAME: 'petmoments-index',
    API_VERSION: '2023-11-01'
};
```

### 11.2 部署前端到 Azure Static Web Apps

```bash
# 创建 Static Web App
az staticwebapp create \
  --name petmoments-web \
  --resource-group PetMoments-RG \
  --location uksouth

# 手动上传文件
# 1. 在 Azure Portal 打开 Static Web App
# 2. 点击 "Browse" 查看部署 token
# 3. 使用 VS Code 的 Azure Static Web Apps 扩展部署
# 或者直接上传到 GitHub 并配置 GitHub Actions
```

或者使用 Blob Storage 静态网站托管：

```bash
# 启用静态网站托管
az storage blob service-properties update \
    --account-name petmomentsstorage \
    --static-website \
    --index-document index.html \
    --404-document index.html

# 上传文件
az storage blob upload-batch \
    --account-name petmomentsstorage \
    --source . \
    --destination '$web' \
    --account-key $STORAGE_KEY
```

**访问 URL**:
```
https://petmomentsstorage.z33.web.core.windows.net/
```

---

## 📊 成本估算

| 服务 | 配置 | 月成本（USD） |
|------|------|--------------|
| SQL Database | Basic (5 DTU) | $5 |
| Cosmos DB | 400 RU/s × 2 容器 | $24 |
| Blob Storage | 10GB + 操作 | $2 |
| AI Search | Basic 层 | $75 |
| Logic Apps | 消费计划 (10K 执行) | $1 |
| Computer Vision | S1 (1000 次) | $1 |
| Event Grid | 100K 事件 | $0.60 |
| Application Insights | 5GB 数据 | $11 |
| **总计** | | **$119.60/月** |

**节省成本建议**:
- 开发/测试环境使用免费层或更低配置
- Cosmos DB 使用 Serverless 模式
- AI Search 使用 Free 层（有限制）

---

## ✅ 验证部署

### 测试清单

1. **SQL Database**
   ```bash
   # 使用 Azure Data Studio 连接并查询
   SELECT * FROM Users;
   ```

2. **Cosmos DB**
   - 在 Azure Portal → Data Explorer 中查看容器

3. **Blob Storage**
   - 上传一张测试图片，验证 URL 可访问

4. **AI Search**
   ```powershell
   # 测试搜索
   Invoke-RestMethod -Uri "https://petmoments-search.search.windows.net/indexes/petmoments-index/docs/search?api-version=2023-11-01" `
       -Method POST `
       -Headers @{"api-key"="YOUR_QUERY_KEY"; "Content-Type"="application/json"} `
       -Body '{"search":"*","top":10}'
   ```

5. **Logic Apps**
   ```bash
   # 测试注册接口
   curl -X POST https://your-logic-app-url/register \
     -H "Content-Type: application/json" \
     -d '{"name":"测试","email":"test@test.com","password":"123456"}'
   ```

6. **前端**
   - 打开浏览器访问前端 URL
   - 测试注册、登录、创建日记等功能

---

## 🔧 故障排查

### 常见问题

**1. Logic App 连接失败**
- 检查 API Connection 是否正确创建
- 验证连接字符串和密钥
- 查看 Logic App 运行历史中的错误信息

**2. CORS 错误**
- 确保 Blob Storage 配置了 CORS
- Logic Apps 响应中包含 `Access-Control-Allow-Origin: *`

**3. Cosmos DB 查询失败**
- 确认 partition key 正确（`/userId`）
- 检查查询语法

**4. 搜索不工作**
- 验证索引是否创建成功
- 检查 API Key 是否正确
- 确认索引中有数据

---

## 📚 下一步

1. ✅ 完善 Logic Apps（添加更多功能）
2. ✅ 实现 AI 图像标记
3. ✅ 添加用户头像上传
4. ✅ 实现评论和点赞功能
5. ✅ 优化搜索算法
6. ✅ 添加移动端适配
7. ✅ 配置 CDN 加速

---

## 📞 支持

如有问题，请查看：
- [Azure 文档](https://docs.microsoft.com/azure)
- [Logic Apps 文档](https://docs.microsoft.com/azure/logic-apps)
- [Cosmos DB 文档](https://docs.microsoft.com/azure/cosmos-db)

---

**部署完成！🎉**

访问你的 PetMoments 平台，开始分享宠物的精彩时刻吧！


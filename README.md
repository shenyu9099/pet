# 🐾 PetMoments - 宠物时刻分享平台

> 基于 Microsoft Azure 云服务的宠物社交平台  
> COM682 云开发课程项目

![Azure](https://img.shields.io/badge/Azure-0078D4?style=for-the-badge&logo=microsoft-azure&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

## 📖 项目简介

**PetMoments** 是一个云原生的宠物时刻分享平台，让宠物主人可以：
- 📷 分享宠物的照片、视频和音频
- 🐕 创建宠物档案和日记
- 🤖 使用 AI 自动识别宠物场景
- 🔍 智能搜索感兴趣的内容
- ☁️ 安全可靠的云端存储

### 设计特色
- 🎨 **天蓝色主题** - Azure Blue 配色方案
- 🐾 **宠物元素** - 爪印、相机等可爱图标
- 📱 **响应式设计** - 支持手机和桌面端
- 🌐 **中文界面** - 完全中文化的用户体验

---

## 🏗️ 技术架构

### 前端
- **HTML5** - 页面结构
- **CSS3** - 天蓝色主题样式
- **原生 JavaScript** - 交互逻辑
- **Fetch API** - HTTP 请求

### 后端 (Azure 服务)
- **Azure Logic Apps** - 无服务器 API (11个端点)
- **Azure SQL Database** - 用户信息存储
- **Azure Cosmos DB** - 宠物档案和日记 (NoSQL)
- **Azure Blob Storage** - 媒体文件存储
- **Azure AI Search** - 智能搜索引擎
- **Azure Computer Vision** - AI 图像识别
- **Azure Event Grid** - 事件驱动架构
- **Application Insights** - 应用监控和日志记录 📊

### 架构图

```
┌─────────────────────────────────────────────────────────┐
│                    前端 (HTML5)                          │
│          index.html | search.html | my-pets.html        │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Azure Logic Apps (11个)                     │
│  register | login | create-pet | create-moment | ...    │
└─────┬──────────┬──────────┬──────────┬─────────────────┘
      │          │          │          │
      ▼          ▼          ▼          ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐
│   SQL    │ │ Cosmos   │ │   Blob   │ │  AI Search   │
│ Database │ │    DB    │ │ Storage  │ │              │
│  (Users) │ │(Pets+日记)│ │ (媒体)   │ │  (搜索索引)  │
└──────────┘ └──────────┘ └──────────┘ └──────────────┘
                                              ▲
                                              │
                                        ┌─────┴──────┐
                                        │ Computer   │
                                        │  Vision    │
                                        │ (AI标记)   │
                                        └────────────┘
```

---

## 📁 项目结构

```
PetMoments/
├── index.html              # 首页
├── search.html             # 搜索页
├── my-pets.html            # 我的宠物页
├── create-moment.html      # 创建日记页
├── moment-detail.html      # 日记详情页
│
├── css/
│   ├── style.css           # 主样式（天蓝色主题）
│   └── search.css          # 搜索页专用样式
│
├── js/
│   ├── config.js           # API 配置
│   ├── auth.js             # 用户认证
│   ├── api.js              # API 调用封装
│   ├── logger.js           # Application Insights 日志记录
│   ├── app.js              # 首页逻辑
│   └── search.js           # 搜索页逻辑
│
├── logic-apps/             # Logic Apps 配置
│   ├── README.md           # Logic Apps 部署说明
│   ├── register-user.json  # 用户注册
│   ├── login-user.json     # 用户登录
│   ├── create-pet.json     # 创建宠物
│   ├── create-moment.json  # 创建日记
│   └── ...                 # 其他 Logic Apps
│
├── DEPLOYMENT_GUIDE.md          # 完整部署指南 ⭐
├── APPLICATION_INSIGHTS_GUIDE.md # Application Insights 使用指南 📊
└── README.md                    # 本文件
```

---

## 🚀 快速开始

### 前置要求

- Azure 账户（有效订阅）
- Azure CLI 工具
- 文本编辑器（VS Code 推荐）
- 浏览器（Chrome/Edge 推荐）

### 部署步骤

#### 1. 克隆项目

```bash
git clone https://github.com/your-repo/PetMoments.git
cd PetMoments
```

#### 2. 创建 Azure 资源

**详细步骤请查看 [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)**

快速命令：

```bash
# 登录 Azure
az login

# 创建资源组
az group create --name PetMoments-RG --location uksouth

# 创建 SQL Database
az sql server create --name petmoments-sqlserver --resource-group PetMoments-RG --location uksouth --admin-user sqladmin --admin-password "YourPassword123!"
az sql db create --resource-group PetMoments-RG --server petmoments-sqlserver --name PetMomentsDB --service-objective Basic

# 创建 Cosmos DB
az cosmosdb create --name petmomentsdb --resource-group PetMoments-RG --locations regionName=uksouth
az cosmosdb sql database create --account-name petmomentsdb --resource-group PetMoments-RG --name PetMomentsDB
az cosmosdb sql container create --account-name petmomentsdb --database-name PetMomentsDB --name pets --partition-key-path "/userId"
az cosmosdb sql container create --account-name petmomentsdb --database-name PetMomentsDB --name petmoments --partition-key-path "/userId"

# 创建 Blob Storage
az storage account create --name petmomentsstorage --resource-group PetMoments-RG --location uksouth --sku Standard_LRS
az storage container create --name media --account-name petmomentsstorage --public-access blob

# 创建 AI Search
az search service create --name petmoments-search --resource-group PetMoments-RG --location uksouth --sku basic

# 创建 Computer Vision
az cognitiveservices account create --name petmoments-vision --resource-group PetMoments-RG --kind ComputerVision --sku S1 --location uksouth --yes
```

#### 3. 创建数据库表

连接到 SQL Database 并执行：

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

#### 4. 部署 Logic Apps

在 Azure Portal 中：
1. 创建 API Connections (SQL, Cosmos DB, Blob Storage)
2. 为每个 JSON 文件创建 Logic App
3. 复制 Workflow URL

#### 5. 配置前端

编辑 `js/config.js`，填入 Logic Apps 的 URL：

```javascript
const API_ENDPOINTS = {
    USERS: {
        REGISTER: 'https://prod-xx.uksouth.logic.azure.com/...',
        LOGIN: 'https://prod-xx.uksouth.logic.azure.com/...'
    },
    // ...
};
```

#### 6. 部署前端

```bash
# 方法 1: Azure Static Web Apps
az staticwebapp create --name petmoments-web --resource-group PetMoments-RG --location uksouth

# 方法 2: Blob Storage 静态网站
az storage blob service-properties update --account-name petmomentsstorage --static-website --index-document index.html
az storage blob upload-batch --account-name petmomentsstorage --source . --destination '$web'
```

#### 7. 访问应用

```
https://petmomentsstorage.z33.web.core.windows.net/
```

---

## 🎯 核心功能

### 1. 用户管理
- ✅ 用户注册（存储在 SQL Database）
- ✅ 用户登录（JWT 或 Session）
- ✅ 个人资料管理

### 2. 宠物档案
- ✅ 创建宠物档案（Cosmos DB）
- ✅ 宠物信息：名字、品种、年龄、照片
- ✅ 查看我的宠物列表

### 3. 宠物日记
- ✅ 创建日记（标题、描述、标签）
- ✅ 上传照片、视频、音频
- ✅ 浏览所有日记
- ✅ 查看日记详情
- ✅ 编辑和删除日记

### 4. AI 智能功能 ⭐
- ✅ **自动图像识别** - Computer Vision API
  - 识别宠物类型（猫、狗、兔子等）
  - 识别场景（玩耍、睡觉、吃饭）
  - 自动生成描述
- ✅ **智能搜索** - Azure AI Search
  - 全文搜索
  - 按标签筛选
  - 按宠物类型筛选
  - 按 AI 识别场景筛选
  - 搜索建议

### 5. 事件驱动
- ✅ Event Grid 集成
- ✅ 照片上传 → 触发 AI 标记
- ✅ 日记创建 → 更新搜索索引

### 6. 应用监控 📊
- ✅ **Application Insights 集成**
  - 自动记录所有 API 请求
  - 记录请求耗时和响应状态
  - 追踪用户行为（登录、注册、登出）
  - 自动捕获错误和异常
  - 页面浏览量统计
  - 实时性能监控
  - 详细使用指南: [APPLICATION_INSIGHTS_GUIDE.md](APPLICATION_INSIGHTS_GUIDE.md)

---

## 📊 数据模型

### SQL Database - Users
```sql
UserId (PK) | Email | Name | PasswordHash | Avatar | Bio | CreatedAt
```

### Cosmos DB - Pets
```json
{
  "id": "pet-001",
  "userId": "user-001",
  "petName": "小白",
  "species": "cat",
  "breed": "英国短毛猫",
  "age": 2
}
```

### Cosmos DB - PetMoments
```json
{
  "id": "moment-001",
  "userId": "user-001",
  "petId": "pet-001",
  "title": "小白今天玩毛线球",
  "media": {
    "photos": [...],
    "videos": [...],
    "audio": [...]
  },
  "tags": ["猫咪", "玩耍"],
  "aiTags": [{"name": "cat", "confidence": 0.98}],
  "aiScene": "playing"
}
```

---

## 💰 成本估算

| 服务 | 配置 | 月成本 |
|------|------|--------|
| SQL Database | Basic (5 DTU) | $5 |
| Cosmos DB | 400 RU/s × 2 | $24 |
| Blob Storage | 10GB | $2 |
| AI Search | Basic | $75 |
| Logic Apps | 消费计划 | $1 |
| Computer Vision | S1 | $1 |
| **总计** | | **~$108/月** |

**学生优惠**: 使用 Azure for Students 可获得 $100 免费额度

---

## 🎨 UI 设计

### 配色方案（天蓝色主题）
- **主色**: `#0078D4` (Azure Blue)
- **辅助色**: `#50E6FF` (浅蓝)
- **强调色**: `#FFB900` (橙黄)
- **背景色**: `#F3F2F1` (浅灰)

### 设计元素
- 🐾 爪印图标
- 📷 相机图标
- 圆角卡片
- 渐变背景
- 悬浮动画

---

## 📸 截图

### 首页
![首页](docs/screenshots/home.png)

### 搜索页
![搜索](docs/screenshots/search.png)

### 日记详情
![详情](docs/screenshots/detail.png)

---

## 🧪 测试

### 手动测试

```bash
# 测试注册
curl -X POST https://your-logic-app-url/register \
  -H "Content-Type: application/json" \
  -d '{"name":"测试用户","email":"test@test.com","password":"123456"}'

# 测试登录
curl -X POST https://your-logic-app-url/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'
```

### 浏览器测试
1. 打开 `index.html`
2. 点击"登录"按钮
3. 注册新用户
4. 创建宠物档案
5. 发布宠物日记
6. 测试搜索功能

---

## 🔧 故障排查

### 常见问题

**Q: Logic App 返回 500 错误**  
A: 检查 API Connection 是否正确配置，查看运行历史中的详细错误

**Q: CORS 错误**  
A: 确保 Logic Apps 响应头包含 `Access-Control-Allow-Origin: *`

**Q: 图片无法显示**  
A: 检查 Blob Storage 容器的公共访问级别是否设置为 "Blob"

**Q: 搜索不工作**  
A: 确认 AI Search 索引已创建，且 API Key 正确

---

## 📚 参考文档

### Azure 官方文档
- [Azure Logic Apps](https://learn.microsoft.com/azure/logic-apps/)
- [Azure Cosmos DB](https://learn.microsoft.com/azure/cosmos-db/)
- [Azure AI Search](https://learn.microsoft.com/azure/search/)
- [Azure Computer Vision](https://learn.microsoft.com/azure/cognitive-services/computer-vision/)
- [Azure Blob Storage](https://learn.microsoft.com/azure/storage/blobs/)

### 课程资源
- COM682 云开发课程材料
- Azure for Students: https://azure.microsoft.com/free/students/

---

## 👨‍💻 作者

**学生信息**
- 姓名: [你的姓名]
- 学号: B***
- 课程: COM682 云开发
- 学期: 2024/2025

---

## 📄 许可证

本项目仅用于教育目的。

---

## 🙏 致谢

- Microsoft Azure 提供的云服务
- COM682 课程团队
- 所有宠物爱好者 🐾

---

**🎉 开始使用 PetMoments，分享你的宠物时刻吧！**


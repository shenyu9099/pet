# Application Insights 集成指南

## 概述

PetMoments 项目已集成 Azure Application Insights,用于监控前端应用的性能、API 请求和用户行为。

## 配置信息

- **Instrumentation Key**: `2645c1d8-9be8-471b-821d-8473022d0afc`
- **Ingestion Endpoint**: `https://francecentral-1.in.applicationinsights.azure.com/v2/track`
- **Application ID**: `e389e2b0-308a-4d95-941c-29ff9a555e5a`
- **资源名称**: `pet-Insights`
- **位置**: France Central

## 功能特性

### 1. 自动日志记录

系统会自动记录以下事件:

#### API 请求日志
- **记录内容**: 
  - 请求方法 (GET/POST/PUT/DELETE)
  - 请求 URL 和端点名称
  - 响应状态码
  - 请求耗时
  - 请求数据 (敏感信息已脱敏)
  - 响应数据 (前 500 字符)
  - 错误信息 (如果有)

- **脱敏处理**:
  - 密码字段显示为 `***`
  - Base64 图片/视频数据显示为 `[BASE64_DATA]`
  - 媒体文件仅记录数量

#### 页面浏览日志
- 每次页面加载时自动记录
- 包含页面标题和 URL
- 关联用户会话 ID

#### 用户行为日志
- 用户登录事件
- 用户注册事件
- 用户登出事件

#### 错误日志
- 自动捕获未处理的 JavaScript 错误
- 自动捕获未处理的 Promise 拒绝
- 包含错误堆栈信息

### 2. 会话管理

- 每个浏览器会话生成唯一的会话 ID
- 会话 ID 格式: `session-{timestamp}-{random}`
- 用户登录后关联用户 ID

### 3. 用户标识

- 未登录用户标记为 `anonymous`
- 登录用户使用实际的 `userId`
- 用户 ID 在登录时自动设置

## 在 Azure Portal 中查看日志

### 1. 访问 Application Insights

1. 登录 [Azure Portal](https://portal.azure.com)
2. 导航到资源组 `PetMoments`
3. 选择 `pet-Insights` Application Insights 资源

### 2. 查看实时指标

- 点击左侧菜单 **"实时指标"** (Live Metrics)
- 实时查看请求、失败和性能数据

### 3. 查看日志和遥测数据

#### 查看所有请求
```kusto
requests
| where timestamp > ago(24h)
| project timestamp, name, url, resultCode, duration, success
| order by timestamp desc
```

#### 查看失败的请求
```kusto
requests
| where timestamp > ago(24h)
| where success == false
| project timestamp, name, url, resultCode, duration
| order by timestamp desc
```

#### 查看特定端点的请求
```kusto
requests
| where timestamp > ago(24h)
| where name contains "login-user"
| project timestamp, url, resultCode, duration, customDimensions
| order by timestamp desc
```

#### 查看用户行为事件
```kusto
customEvents
| where timestamp > ago(24h)
| where name in ("UserLogin", "UserRegistration", "UserLogout")
| project timestamp, name, customDimensions
| order by timestamp desc
```

#### 查看错误和异常
```kusto
exceptions
| where timestamp > ago(24h)
| project timestamp, type, outerMessage, innermostMessage, severityLevel
| order by timestamp desc
```

#### 查看页面浏览量
```kusto
pageViews
| where timestamp > ago(24h)
| summarize count() by name
| order by count_ desc
```

#### 按用户分析请求
```kusto
requests
| where timestamp > ago(24h)
| extend userId = tostring(customDimensions.userId)
| where userId != "anonymous"
| summarize requestCount = count(), avgDuration = avg(duration) by userId
| order by requestCount desc
```

### 4. 创建仪表板

1. 在 Application Insights 中点击 **"仪表板"**
2. 点击 **"新建仪表板"**
3. 添加以下图表:
   - 请求数量趋势
   - 失败请求率
   - 平均响应时间
   - 用户活跃度
   - 错误数量

### 5. 设置警报

#### 创建失败率警报
1. 点击 **"警报"** > **"新建警报规则"**
2. 选择指标: `Failed requests`
3. 设置条件: `当失败率 > 5% 时`
4. 配置操作组 (发送邮件/短信)

#### 创建响应时间警报
1. 点击 **"警报"** > **"新建警报规则"**
2. 选择指标: `Server response time`
3. 设置条件: `当平均响应时间 > 3000ms 时`
4. 配置操作组

## 开发者使用

### 手动记录自定义事件

在任何页面的 JavaScript 代码中:

```javascript
// 记录自定义事件
if (window.AppInsightsLogger) {
    window.AppInsightsLogger.logEvent('CustomEventName', {
        property1: 'value1',
        property2: 'value2'
    });
}
```

### 手动记录异常

```javascript
try {
    // 你的代码
} catch (error) {
    if (window.AppInsightsLogger) {
        window.AppInsightsLogger.logException(error, 4); // 4 = Error level
    }
}
```

### 禁用日志记录

如果需要在开发环境中禁用日志记录,编辑 `js/logger.js`:

```javascript
const APP_INSIGHTS_CONFIG = {
    instrumentationKey: '2645c1d8-9be8-471b-821d-8473022d0afc',
    ingestionEndpoint: 'https://francecentral-1.in.applicationinsights.azure.com/v2/track',
    enabled: false // 设置为 false 禁用
};
```

## 性能影响

- 日志记录使用 `navigator.sendBeacon()` API,不会阻塞页面
- 如果浏览器不支持 `sendBeacon`,则使用 `fetch()` 的 `keepalive` 模式
- 所有日志记录都是异步的,不影响用户体验
- 敏感数据已脱敏,不会记录完整的密码或大型文件内容

## 数据保留

- Application Insights 默认保留数据 **90 天**
- 可以在 Azure Portal 中配置更长的保留期限
- 建议定期导出重要数据进行长期存储

## 隐私和合规

- 所有密码字段已脱敏
- Base64 媒体数据不会完整记录
- 用户 ID 是匿名的系统生成 ID,不包含个人身份信息
- 符合 GDPR 和数据保护要求

## 故障排除

### 日志没有出现在 Application Insights

1. **检查浏览器控制台**:
   - 打开浏览器开发者工具
   - 查看是否有 `[AppInsights]` 前缀的日志
   - 检查是否有网络错误

2. **验证配置**:
   - 确认 Instrumentation Key 正确
   - 确认 `enabled: true` 在 `logger.js` 中

3. **检查网络**:
   - 确认可以访问 `https://francecentral-1.in.applicationinsights.azure.com`
   - 检查是否有防火墙或代理阻止

4. **等待延迟**:
   - Application Insights 可能有 1-5 分钟的延迟
   - 使用"实时指标"查看实时数据

### CORS 错误

如果遇到 CORS 错误,Application Insights 的 ingestion endpoint 应该已经配置了正确的 CORS 头。如果仍有问题:

1. 使用 `sendBeacon()` 而不是 `fetch()` (已默认配置)
2. 确认请求头中的 `Content-Type` 为 `application/json`

## 最佳实践

1. **定期检查仪表板**: 每天查看关键指标
2. **设置警报**: 为关键错误和性能问题设置警报
3. **分析用户行为**: 使用日志数据优化用户体验
4. **监控 API 性能**: 识别慢速端点并优化
5. **追踪错误**: 及时修复生产环境中的错误

## 相关资源

- [Azure Application Insights 文档](https://docs.microsoft.com/azure/azure-monitor/app/app-insights-overview)
- [Kusto 查询语言 (KQL) 参考](https://docs.microsoft.com/azure/data-explorer/kusto/query/)
- [Application Insights REST API](https://docs.microsoft.com/rest/api/application-insights/)

## 支持

如有问题,请联系开发团队或查看 Azure 支持文档。


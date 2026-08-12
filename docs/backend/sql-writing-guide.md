# SQL 书写指南

本文约束 Pi UI Server 中所有 SQLite Schema、Migration 和 Mapper SQL。新增或修改 SQL 时必须遵守。

## 1. 基本原则

- SQLite 只保存产品元数据，不重复保存 Pi JSONL 中的完整消息。
- Schema 变更只能通过版本化 Migration 完成。
- Mapper 只负责数据读写，不负责建表或修改表结构。
- Service 负责业务校验、关联完整性和事务边界。
- SQL 必须明确、可迁移、可索引、可测试，不依赖 SQLite 的隐式行为。

## 2. 禁止事项

### 2.1 禁止外键

禁止书写 `FOREIGN KEY`、`REFERENCES`、`ON DELETE CASCADE` 和 `ON UPDATE CASCADE`。

原因：

- 级联行为隐藏删除范围，容易误删项目、会话或任务数据。
- 表拆分和数据迁移时增加顺序与兼容成本。
- 跨版本恢复、导入和局部修复更困难。
- 当前为本地单进程应用，Service 层可以明确控制关联更新。

关联字段仍应保留并建立必要索引：

```sql
CREATE TABLE conversation (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  title TEXT NOT NULL
);

CREATE INDEX conversation_project_id_idx ON conversation(project_id);
```

删除项目时由 Service 显式执行事务：先处理关联会话，再删除项目。禁止依赖数据库隐式级联。

### 2.2 禁止在 Mapper 中写 DDL

Mapper 中禁止 `CREATE TABLE`、`ALTER TABLE`、`DROP TABLE` 和 `CREATE INDEX`。DDL 只能写入
`Storage/Database/Migrations`。

### 2.3 禁止修改已发布 Migration

已执行过的 Migration 不得改名、改版本或修改 SQL。结构变化必须追加新版本。

### 2.4 禁止 `SELECT *`

查询必须显式列出字段，避免新增字段改变映射结果或无意读取大字段。

```sql
SELECT id, project_id, title, updated_at
FROM conversation
WHERE id = ?;
```

### 2.5 禁止拼接输入生成 SQL

所有值必须使用占位符绑定。表名、列名和排序字段若需要动态选择，必须从代码内固定白名单映射。

### 2.6 禁止隐式类型和模糊布尔值

- 主键、路径、名称使用 `TEXT`。
- 时间统一使用 Unix 毫秒 `INTEGER`。
- 布尔值使用 `INTEGER NOT NULL DEFAULT 0`，只允许 `0` 或 `1`，并增加 `CHECK`。
- 枚举使用 `TEXT` 并增加 `CHECK`，或由 Service 严格校验。
- 金额等精确数值禁止使用 `REAL`。

```sql
is_archived INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0, 1))
```

### 2.7 禁止无边界批量修改和删除

`UPDATE`、`DELETE` 必须包含明确的 `WHERE` 条件。确需全表操作时只能放在 Migration 中，并注明原因。

### 2.8 禁止依赖行的默认顺序

需要稳定顺序的查询必须包含 `ORDER BY`。分页必须同时提供稳定的次级排序键，例如：

```sql
ORDER BY updated_at DESC, id DESC
```

### 2.9 禁止存储可推导的展示状态

“最近”“展开显示”和蓝点样式不是独立数据。优先存储 `last_message_at`、`unread_count`、`status` 等原始事实，
由查询或 VO 计算展示状态。

## 3. 命名规范

- 表名和列名使用小写 `snake_case`。
- 表名使用单数，例如 `project`、`conversation`、`runtime_session`。
- 主键统一命名为 `id`；领域已有明确标识时可以使用 `runtime_slot_id`。
- 索引命名：`<table>_<columns>_idx`。
- 唯一索引命名：`<table>_<columns>_uidx`。
- Migration 文件命名：`NNN-description.ts`，版本号严格递增。

## 4. 表设计规范

- 每张业务表必须有明确主键。
- 可变业务表通常包含 `created_at` 和 `updated_at`。
- 软删除仅在业务确实需要恢复时使用；不要同时混用 `is_deleted` 和 `deleted_at`。
- JSON 字段只用于结构不稳定、无需关联查询的数据；核心可查询字段必须拆列。
- 大文本、二进制和完整消息内容不直接写入产品元数据表。
- 高频过滤、排序和关联字段必须评估索引；避免为低选择性布尔字段单独建索引。

## 5. Migration 规范

- 每个 Migration 在独立事务中执行。
- 一个版本只完成一个可描述的结构变更。
- Migration 必须同时处理历史数据回填。
- 增加 `NOT NULL` 字段时，必须先提供默认值或分阶段回填。
- SQLite 无法安全直接修改的结构，使用“新表、复制、校验、替换”流程。
- 新数据库从 `001` 顺序执行到最新版本；旧数据库只执行缺失版本。
- Migration 必须测试首次执行、重复启动和从上一版本升级。

## 6. Mapper 规范

- 一个 Mapper 面向一个主要聚合或表，不把所有 SQL 放入通用 Mapper。
- Mapper 参数和返回值使用明确类型。
- Mapper 不包含业务判断，不调用其他 Service，不发送 Socket 事件。
- 写操作应返回受影响行数或明确实体；需要存在性保证时由 Service 判断。
- 多步业务写入由 Service 开启事务并按明确顺序调用 Mapper。

## 7. 审查清单

- 没有外键、级联更新或级联删除。
- 没有 `SELECT *` 和输入字符串拼接。
- DDL 只存在于新 Migration。
- 已发布 Migration 没有被修改。
- 查询顺序和分页稳定。
- 关联列、高频过滤列有合理索引。
- 时间、布尔、枚举和空值语义明确。
- 迁移失败能够完整回滚。
- Mapper 和 Migration 测试覆盖新行为。

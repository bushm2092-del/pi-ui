# Database

该目录负责 SQLite 连接和版本迁移：

- `database.ts`：连接生命周期和 SQLite 配置。
- `migration.ts`：迁移排序、记录、事务和一致性检查。
- `Migrations/`：只能追加的 Schema 版本。

所有 SQL 必须遵守 [`docs/backend/sql-writing-guide.md`](../../../../../docs/backend/sql-writing-guide.md)。
DDL 只能出现在 `Migrations/`，Mapper 中不得建表或修改表结构。

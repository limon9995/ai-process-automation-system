import { db } from './database.js';

const columnExists = (tableName, columnName) => {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
  return columns.some((column) => column.name === columnName);
};

const addColumnIfMissing = (tableName, columnSql) => {
  const columnName = columnSql.trim().split(/\s+/)[0];
  if (!columnExists(tableName, columnName)) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnSql}`);
  }
};

export const initDb = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      is_available INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      raw_text TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'manual',
      email_sender TEXT,
      email_subject TEXT,
      external_id TEXT UNIQUE,
      classification TEXT NOT NULL DEFAULT 'other',
      extracted_data TEXT,
      generated_reply TEXT,
      workflow_status TEXT NOT NULL DEFAULT 'pending',
      processing_state TEXT NOT NULL DEFAULT 'queued',
      reply_status TEXT NOT NULL DEFAULT 'not_applicable',
      reply_error TEXT,
      error_message TEXT,
      retry_count INTEGER NOT NULL DEFAULT 0,
      reply_retry_count INTEGER NOT NULL DEFAULT 0,
      email_processed_at TEXT,
      last_processed_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      workflow_type TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(message_id) REFERENCES messages(id) ON DELETE CASCADE,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message_id INTEGER NOT NULL UNIQUE,
      customer_name TEXT,
      phone TEXT,
      product TEXT,
      quantity INTEGER,
      address TEXT,
      city TEXT,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      assigned_user_id INTEGER,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(message_id) REFERENCES messages(id) ON DELETE CASCADE,
      FOREIGN KEY(assigned_user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS support_tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message_id INTEGER NOT NULL UNIQUE,
      customer_name TEXT,
      phone TEXT,
      subject TEXT,
      issue_summary TEXT,
      priority TEXT NOT NULL DEFAULT 'medium',
      status TEXT NOT NULL DEFAULT 'open',
      assigned_user_id INTEGER,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(message_id) REFERENCES messages(id) ON DELETE CASCADE,
      FOREIGN KEY(assigned_user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS query_cases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message_id INTEGER NOT NULL UNIQUE,
      requester_name TEXT,
      email TEXT,
      phone TEXT,
      organization TEXT,
      subject TEXT,
      inquiry_summary TEXT,
      city TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      assigned_user_id INTEGER,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(message_id) REFERENCES messages(id) ON DELETE CASCADE,
      FOREIGN KEY(assigned_user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS automation_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message_id INTEGER,
      step TEXT NOT NULL,
      status TEXT NOT NULL,
      detail TEXT NOT NULL,
      metadata TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(message_id) REFERENCES messages(id) ON DELETE CASCADE
    );

    CREATE TRIGGER IF NOT EXISTS messages_updated_at
    AFTER UPDATE ON messages
    FOR EACH ROW
    BEGIN
      UPDATE messages SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END;

    CREATE TRIGGER IF NOT EXISTS orders_updated_at
    AFTER UPDATE ON orders
    FOR EACH ROW
    BEGIN
      UPDATE orders SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END;

    CREATE TRIGGER IF NOT EXISTS support_tickets_updated_at
    AFTER UPDATE ON support_tickets
    FOR EACH ROW
    BEGIN
      UPDATE support_tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END;

    CREATE TRIGGER IF NOT EXISTS query_cases_updated_at
    AFTER UPDATE ON query_cases
    FOR EACH ROW
    BEGIN
      UPDATE query_cases SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END;
  `);

  addColumnIfMissing('messages', "source TEXT NOT NULL DEFAULT 'manual'");
  addColumnIfMissing('messages', 'email_sender TEXT');
  addColumnIfMissing('messages', 'email_subject TEXT');
  addColumnIfMissing('messages', 'external_id TEXT');
  addColumnIfMissing('messages', "reply_status TEXT NOT NULL DEFAULT 'not_applicable'");
  addColumnIfMissing('messages', 'reply_error TEXT');
  addColumnIfMissing('messages', 'reply_retry_count INTEGER NOT NULL DEFAULT 0');
  addColumnIfMissing('messages', 'email_processed_at TEXT');

  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_messages_external_id ON messages(external_id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_messages_source ON messages(source)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_messages_processing_state ON messages(processing_state)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_logs_step ON automation_logs(step)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_logs_message_id ON automation_logs(message_id)');
};
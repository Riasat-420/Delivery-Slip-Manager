import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'delivery.db');

let dbInstance: any = null;
let SQL: any = null;

async function getSQL() {
  if (SQL) return SQL;
  const initSqlJs = require('sql.js');
  SQL = await initSqlJs();
  return SQL;
}

export async function getDb() {
  if (dbInstance) return dbInstance;

  const sql = await getSQL();
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    dbInstance = new sql.Database(fileBuffer);
  } else {
    dbInstance = new sql.Database();
  }

  initSchema(dbInstance);
  saveDb(dbInstance);
  return dbInstance;
}

export function saveDb(db: any) {
  const data = db.export();
  const buffer = Buffer.from(data);
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DB_PATH, buffer);
}

function initSchema(db: any) {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS counters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      location TEXT UNIQUE NOT NULL,
      count INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS delivery_slips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      serial_no TEXT UNIQUE NOT NULL,
      location TEXT DEFAULT 'OLD CITY 1',
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      site_no TEXT,
      lpo_no TEXT,
      vehicle_no TEXT NOT NULL,
      company_name TEXT NOT NULL,
      tip TEXT,
      cash_trip TEXT,
      refund TEXT,
      receiver_name TEXT,
      driver_name TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS delivery_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slip_id INTEGER NOT NULL,
      description TEXT NOT NULL,
      m3 REAL,
      ton REAL,
      trips TEXT,
      FOREIGN KEY (slip_id) REFERENCES delivery_slips(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tax_invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_no TEXT UNIQUE NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      vat_reg TEXT,
      po_no TEXT,
      del_no TEXT,
      received_by TEXT,
      discount REAL DEFAULT 0,
      subtotal REAL DEFAULT 0,
      vat_total REAL DEFAULT 0,
      grand_total REAL DEFAULT 0,
      amount_words TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tax_invoice_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER NOT NULL,
      description TEXT NOT NULL,
      unit TEXT DEFAULT 'M3',
      qty REAL DEFAULT 1,
      rate REAL DEFAULT 0,
      amount REAL DEFAULT 0,
      tax_pct REAL DEFAULT 5,
      vat_amount REAL DEFAULT 0,
      gross_amount REAL DEFAULT 0,
      FOREIGN KEY (invoice_id) REFERENCES tax_invoices(id) ON DELETE CASCADE
    );
  `);

  // Seed default data
  const users = db.exec("SELECT COUNT(*) as cnt FROM users");
  if (users[0]?.values[0][0] === 0) {
    const bcrypt = require('bcryptjs');
    const hash = bcrypt.hashSync('admin123', 10);
    db.run("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", ['admin', hash, 'admin']);
    const hash2 = bcrypt.hashSync('user123', 10);
    db.run("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", ['user1', hash2, 'user']);
  }

  const counters = db.exec("SELECT COUNT(*) as cnt FROM counters");
  if (counters[0]?.values[0][0] === 0) {
    db.run("INSERT INTO counters (location, count) VALUES (?, ?)", ['OLD CITY 1', 18446]);
    db.run("INSERT INTO counters (location, count) VALUES (?, ?)", ['OLD CITY 2', 14276]);
  }

  const mats = db.exec("SELECT COUNT(*) as cnt FROM materials");
  if (mats[0]?.values[0][0] === 0) {
    const defaults = ['3/8 Aggregate', 'Black Sand Crushed', 'Black Sand Washed', 'Construction Waste (Concrete)', 'Gabbro', 'White Sand'];
    defaults.forEach(m => db.run("INSERT OR IGNORE INTO materials (name) VALUES (?)", [m]));
  }
}

export function dbAll(db: any, sql: string, params: any[] = []) {
  try {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const rows: any[] = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
  } catch (e) {
    return [];
  }
}

export function dbGet(db: any, sql: string, params: any[] = []) {
  const rows = dbAll(db, sql, params);
  return rows[0] || null;
}

export function dbRun(db: any, sql: string, params: any[] = []) {
  db.run(sql, params);
}

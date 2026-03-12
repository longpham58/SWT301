const sql = require("mssql");

// Đọc cấu hình kết nối từ biến môi trường
// Bạn cần set các biến sau trong môi trường hoặc file .env:
//   MSSQL_SERVER, MSSQL_USER, MSSQL_PASSWORD, MSSQL_DATABASE (mặc định: OSCE)
const config = {
  server: process.env.MSSQL_SERVER || "localhost",
  user: process.env.MSSQL_USER || "",
  password: process.env.MSSQL_PASSWORD || "",
  database: process.env.MSSQL_DATABASE || "OSCE",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let poolPromise;

async function getPool() {
  if (!poolPromise) {
    poolPromise = sql
      .connect(config)
      .then((pool) => {
        console.log("[MSSQL] Connected to", config.database);
        return pool;
      })
      .catch((err) => {
        console.error("[MSSQL] Connection error:", err);
        poolPromise = undefined;
        throw err;
      });
  }
  return poolPromise;
}

async function query(queryText, params = {}) {
  const pool = await getPool();
  const request = pool.request();
  Object.entries(params).forEach(([key, value]) => {
    request.input(key, value);
  });
  const result = await request.query(queryText);
  return result;
}

module.exports = {
  sql,
  query,
  getPool,
};


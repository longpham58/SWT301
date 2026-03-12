const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { query } = require("../db");

const JWT_SECRET = process.env.JWT_SECRET || "osce-dev-secret";
const JWT_EXPIRES_IN = "8h";

function mapUserRow(row) {
  return {
    id: String(row.id),
    username: row.username,
    name: row.full_name || row.username,
  };
}

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: "Thiếu username hoặc password" });
    }

    const result = await query(
      "SELECT TOP 1 id, username, password_hash, full_name, role, is_active FROM users WHERE username = @username",
      { username }
    );
    if (!result.recordset.length) {
      return res.status(401).json({ message: "Username hoặc mật khẩu không đúng" });
    }
    const userRow = result.recordset[0];
    if (!userRow.is_active) {
      return res.status(401).json({ message: "Tài khoản đã bị khóa" });
    }

    const ok = await bcrypt.compare(password, userRow.password_hash || "");
    if (!ok) {
      return res.status(401).json({ message: "Username hoặc mật khẩu không đúng" });
    }

    const user = mapUserRow(userRow);
    const token = jwt.sign(
      { sub: user.id, username: user.username, role: userRow.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      accessToken: token,
      user,
    });
  } catch (err) {
    console.error("auth.login error", err);
    res.status(500).json({ message: "Lỗi server, vui lòng thử lại sau" });
  }
};

// POST /api/auth/forgot/verify
exports.verifyUsername = async (req, res) => {
  try {
    const { username } = req.body || {};
    if (!username) {
      return res.status(400).json({ message: "Thiếu username", valid: false });
    }

    const result = await query(
      "SELECT COUNT(1) AS cnt FROM users WHERE username = @username",
      { username }
    );
    const exists = result.recordset[0].cnt > 0;
    res.json({ valid: exists });
  } catch (err) {
    console.error("auth.verifyUsername error", err);
    res.status(500).json({ message: "Lỗi xác minh username", valid: false });
  }
};

// POST /api/auth/forgot/reset
exports.resetPassword = async (req, res) => {
  try {
    const { username, newPassword } = req.body || {};
    if (!username || !newPassword) {
      return res.status(400).json({ message: "Thông tin không đầy đủ" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Mật khẩu phải dài ít nhất 6 ký tự" });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    const result = await query(
      "UPDATE users SET password_hash = @hash, updated_at = SYSDATETIME() WHERE username = @username",
      { username, hash }
    );
    const rows = result.rowsAffected && result.rowsAffected[0];
    if (!rows) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản" });
    }

    res.json({ message: "Mật khẩu đã được thay đổi thành công" });
  } catch (err) {
    console.error("auth.resetPassword error", err);
    res.status(500).json({ message: "Lỗi thay đổi mật khẩu" });
  }
};


import mysql from 'mysql2/promise';

async function patchUsersTable() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_pusat_informasi'
  });

  try {
    const [cols] = await pool.query("SHOW COLUMNS FROM users LIKE 'email'");
    if (cols.length === 0) {
      await pool.query("ALTER TABLE users ADD COLUMN email VARCHAR(100) AFTER name");
      console.log('✓ Column email added');
    }
  } catch (err) {
    console.error('Error email:', err.message);
  }

  try {
    const [cols] = await pool.query("SHOW COLUMNS FROM users LIKE 'phone'");
    if (cols.length === 0) {
      await pool.query("ALTER TABLE users ADD COLUMN phone VARCHAR(30) AFTER email");
      console.log('✓ Column phone added');
    }
  } catch (err) {
    console.error('Error phone:', err.message);
  }

  try {
    const [cols] = await pool.query("SHOW COLUMNS FROM users LIKE 'last_login'");
    if (cols.length === 0) {
      await pool.query("ALTER TABLE users ADD COLUMN last_login TIMESTAMP NULL AFTER role");
      console.log('✓ Column last_login added');
    }
  } catch (err) {
    console.error('Error last_login:', err.message);
  }

  try {
    await pool.query("ALTER TABLE users MODIFY COLUMN role ENUM('superadmin', 'admin', 'operator') DEFAULT 'admin'");
    console.log('✓ Column role updated');
  } catch (err) {
    console.error('Error role:', err.message);
  }

  console.log('Users table schema verified.');
  process.exit(0);
}

patchUsersTable();

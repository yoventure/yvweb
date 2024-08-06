const mysql = require('mysql2');

// 创建数据库连接
const connection = mysql.createConnection({
  host: 'rm-uf6460x8sj8242fn64o.mysql.rds.aliyuncs.com',
  user: 'yj_sale',
  port: '3306',
  password: 'sale@2023',
  database: 'sale_resource'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');

  // 创建 users 表
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      phone VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // 创建 demo_requests 表
  const createDemoRequestsTable = `
    CREATE TABLE IF NOT EXISTS demo_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      company VARCHAR(255),
      requirements TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;

  connection.query(createUsersTable, (err, results) => {
    if (err) {
      console.error('Error creating users table:', err);
      return;
    }
    console.log('Users table created or already exists');
  });

  connection.query(createDemoRequestsTable, (err, results) => {
    if (err) {
      console.error('Error creating demo_requests table:', err);
      return;
    }
    console.log('DemoRequests table created or already exists');
  });
});

module.exports = connection;

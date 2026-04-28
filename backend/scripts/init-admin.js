import bcrypt from 'bcrypt';
import initializeDatabase from '../database/index.js';
import dotenv from 'dotenv';

dotenv.config();

async function createAdminUser() {
  const db = initializeDatabase(process.env.DB_PATH || './database.sqlite');

  const adminEmail = 'admin@localhost';
  const adminPassword = 'admin123';

  try {
    // Check if admin already exists
    const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(adminEmail);
    if (existing) {
      console.log('✓ Admin user already exists');
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const stmt = db.prepare(
      'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)'
    );

    stmt.run(adminEmail, passwordHash, 'admin');

    console.log('✓ Admin user created!');
    console.log(`\nCredentials:\nEmail: ${adminEmail}\nPassword: ${adminPassword}\n`);
    console.log('⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
}

createAdminUser();

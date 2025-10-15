import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
});

// A helper function to test the database connection
export async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to PostgreSQL!');
    client.release(); // Release the client back to the pool
  } catch (err) {
    console.error('Error connecting to PostgreSQL:', err.stack);
    process.exit(1); // Exit the process with an error code
  }
}

export default pool;

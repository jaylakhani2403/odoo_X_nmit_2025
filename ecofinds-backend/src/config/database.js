// src/config/database.js - Updated to match your project style
const { Pool } = require('pg');

// Parse DATABASE_URL (matching your existing project pattern)
const getDatabaseConfig = () => {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (databaseUrl) {
    // Parse the DATABASE_URL format: postgres://username:password@host:port/database
    const url = new URL(databaseUrl);
    return {
      host: url.hostname,
      port: url.port,
      database: url.pathname.slice(1), // Remove leading slash
      user: url.username,
      password: url.password,
      ssl: process.env.NODE_ENV === 'production' ? 
        JSON.parse(process.env.DIALECT_OPTIONS || '{"ssl": {"require": true, "rejectUnauthorized": false}}') : 
        false
    };
  }
  
  // Fallback to individual environment variables
  return {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'ecommerce',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'root',
    ssl: process.env.NODE_ENV === 'production' ? 
      JSON.parse(process.env.DIALECT_OPTIONS || '{}') : 
      false
  };
};

// Database connection configuration
const config = getDatabaseConfig();
const pool = new Pool({
  ...config,
  max: 20, // maximum number of connections in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 5000, // how long to try connecting before timing out
});

// Test database connection
pool.on('connect', (client) => {
  console.log(`✅ Connected to PostgreSQL database: ${config.database}`);
  console.log(`📍 Host: ${config.host}:${config.port}`);
});

pool.on('error', (err, client) => {
  console.error('❌ Database connection error:', err);
  if (process.env.NODE_ENV !== 'production') {
    console.error('💡 Make sure your DATABASE_URL is correct:', process.env.DATABASE_URL);
  }
});

// Helper function to execute queries with logging
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Query executed in ${duration}ms:`, text.substring(0, 60) + (text.length > 60 ? '...' : ''));
    }
    
    return res;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`❌ Database query error (${duration}ms):`, error.message);
    console.error('🔍 Query:', text.substring(0, 100));
    throw error;
  }
};

// Helper function to get a client from the pool
const getClient = async () => {
  try {
    const client = await pool.connect();
    return client;
  } catch (error) {
    console.error('❌ Error getting database client:', error);
    throw error;
  }
};

// Test database connection on startup
const testConnection = async () => {
  try {
    const result = await query('SELECT NOW() as current_time, version() as version');
    console.log(' Database connection successful!');
    console.log(` Server time: ${result.rows[0].current_time}`);
    console.log(`PostgreSQL version: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}`);
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    if (process.env.NODE_ENV !== 'production') {
      console.error(' Check your DATABASE_URL and ensure PostgreSQL is running');
    }
    process.exit(1);
  }
};

// Initialize connection test
if (process.env.NODE_ENV !== 'test') {
  testConnection();
}

module.exports = {
  pool,
  query,
  getClient,
  testConnection
};
require('dotenv').config();

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_DATABASE || 'mydb',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
      ssl: process.env.DB_SSL === 'true' || process.env.DB_SSL === '1' ? { rejectUnauthorized: false } : undefined,
    },
    migrations: {
      directory: './migrations',
    },
    seeds: {
      directory: './seeds',
    },
  },
};

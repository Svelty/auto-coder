// Update this configuration with your DB details or use environment variables
require('dotenv').config();

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.PGHOST || '127.0.0.1',
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'password',
      database: process.env.PGDATABASE || 'mydb',
      port: process.env.PGPORT || 5432
    },
    migrations: {
      directory: './migrations',
    },
    seeds: {
      directory: './seeds',
    },
  },
};

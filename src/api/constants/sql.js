const mariadb = require('mariadb');
const config = require('../../../config.json');

class Database {
  constructor() {
    if (!Database.instance) {
      this.pool = mariadb.createPool({
        host: config.db.host,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database,
        port: config.db.port, // Specify the custom port here
        connectionLimit: 5
      });
      Database.instance = this;
    }
    return Database.instance;
  }

  async query(sql, params) {
    let connection;
    try {
      connection = await this.pool.getConnection();
      const result = await connection.query(sql, params);
      return result;
    } catch (err) {
      console.error('Error executing query:', err);
      throw err;
    } finally {
      if (connection) connection.release();
    }
  }

  async close() {
    try {
      await this.pool.end();
      console.log('Database connection pool closed.');
    } catch (err) {
      console.error('Error closing the database connection pool:', err);
    }
  }
  
}



module.exports = new Database();
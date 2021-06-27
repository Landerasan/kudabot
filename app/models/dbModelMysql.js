const mysql = require('mysql2');

class DbModelMysql {
    constructor(HOST, USER, PASS, DBNAME) {
        if (DbModelMysql.exists) {
            return DbModelMysql.instance
        }
        DbModelMysql.instance = this
        DbModelMysql.exists = true
        this.connection = mysql.createConnection({
            host: HOST,
            user: USER,
            database: DBNAME,
            password: PASS
        });
    }

    getConnection() {
        return this.connection
    }
}

module.exports = DbModelMysql
const mysql = require('mysql2');

class DbModelMysql {
    constructor(HOST ,PORT, USER, PASS, DBNAME) {
        if (DbModel.exists) {
            return DbModel.instance
        }
        DbModel.instance = this
        DbModel.exists = true
        this.HOST = HOST
        this.PORT = PORT
        this.USER = USER
        this.PASS = PASS
        this.DBNAME = DBNAME
        this.connection = mysql.createConnection(
            host: HOST,
            user: USER,
            userdb: DBNAME,
            password: PASS
    );
    }

    getConnection() {
        return this.connection
    }
}
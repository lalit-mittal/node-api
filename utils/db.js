const mongoose = require('mongoose');

class DBConnection {
    constructor() {
        this.dbConnection = null;
    }

    async connectDB() {
        if (this.dbConnection) return this.dbConnection;

        try {
            this.dbConnection = await mongoose.connect(process.env.DB_URL + process.env.DB_NAME);
            console.log(`MongoDB Connected: ${this.dbConnection.connection.host}`);
        } catch (err) {
            console.error(err);
            process.exit(1);
        }

        return this.dbConnection;
    }
}

module.exports = new DBConnection();


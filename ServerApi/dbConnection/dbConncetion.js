const { MongoClient } = require('mongodb');

// MongoDB connection URL and database name
const url = 'mongodb://localhost:27017';
const dbName = 'TheCircleDB';

let db;

const connectDB = async () => {
    try {
        const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
        db = client.db(dbName);
        console.log(`Connected to database: ${dbName}`);
        return db;
    } catch (error) {
        console.error('Error connecting to database:', error);
        throw error;
    }
};

module.exports = connectDB;

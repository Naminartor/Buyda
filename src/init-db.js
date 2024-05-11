const sqlite3 = require('sqlite3').verbose();

import { DB } from './config.js';
// Create a new database connection

const db = new sqlite3.Database(DB);


/**
 * Create a new table named 'items; with @type {Item}
 */
db.serialize(function() {
    db.run("CREATE TABLE IF NOT EXISTS items (name TEXT, price REAL, img TEXT, majorCategory TEXT, subCategory TEXT)");

    /**
     * Create a new table named 'orders; with @type {Order}
     */
    db.run("CREATE TABLE IF NOT EXISTS orders (userid INTEGER, item TEXT, amount INTEGER, price REAL, date TEXT)");


    /**
    * Create a new table named 'User; with @type {User}
    */
    db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER, username TEXT, password TEXT, address TEXT, zipCode TEXT, city TEXT, firstName TEXT, lastName TEXT)");

    /**
     * Create a new table named 'sessions; with @type {Sessions}
     */
    db.run("CREATE TABLE IF NOT EXISTS sessions (userid INTEGER, sessionID TEXT, timestamp INTEGER)");

    /**
     * Create a new table named 'stock; with @type {Stock}
     */
    db.run("CREATE TABLE IF NOT EXISTS stock (item TEXT, amount INTEGER)");

    /**
     * Create a new table named 'cart; with @type {Cart}
     */
    db.run("CREATE TABLE IF NOT EXISTS cart (userid INTEGER, item TEXT, amount INTEGER)");
});

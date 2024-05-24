const sqlite3 = require("sqlite3").verbose();

const { DB } = require("./constants.js");
// Create a new database connection

const db = new sqlite3.Database(DB);
db.on("error", function(error) {
    console.log("Getting an error : ", error);
}); 
/**
 * Create a new table named 'items; with @type {Item}
 */
db.serialize(function () {
	db.run("CREATE TABLE IF NOT EXISTS items (name TEXT PRIMARY KEY, price REAL, img TEXT, majorCategory TEXT, subCategory TEXT, description TEXT, behavior TEXT, habitatSize INTEGER, feed TEXT, breeding TEXT, count TEXT, size TEXT , origin TEXT, phMin REAL, phMax REAL, tempMin REAL, tempMax REAL, h2OHardness TEXT)");

	/**
	 * Create a new table named 'orders; with @type {Order}
	 */
	db.run("CREATE TABLE IF NOT EXISTS orders (userid INTEGER, item TEXT, amount INTEGER, price REAL, timestamp TEXT)");

	/**
	 * Create a new table named 'User; with @type {User}
	 */
	db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT, address TEXT, zipCode TEXT, city TEXT, firstName TEXT, lastName TEXT)");

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
// process env == test
if (process.env.NODE_ENV === "test") {
    console.log("Creating test user");
    const crypto = require("crypto");
    let pw = crypto.createHash("sha256").update("test").digest("hex");
    db.run("INSERT INTO users (username, password, address, zipCode, city, firstName, lastName) VALUES (?, ?, ?, ?, ?, ?, ?)", ["testname", pw, "test", "test", "21312", "test", "test"], (err) => {
        if (err) {
            console.log("Error: " + err);
        }
    });
}

//find file baed on name form root
const fs = require("fs");
// Recursive function to get files
function findFile(filename, dir, files = []) {
	// Get an array of all files and directories in the passed directory using fs.readdirSync
	const fileList = fs.readdirSync(dir);
	// Create the full path of the file/directory by concatenating the passed directory and file/directory name
	for (const file of fileList) {
		const name = `${dir}/${file}`;
		// Check if the current file/directory is a directory using fs.statSync
		if (fs.statSync(name).isDirectory()) {
			// If it is a directory, recursively call the getFiles function with the directory path and the files array
			findFile(filename, name, files);
		} else {
			// If it is a file, push the full path to the files array
			if (name.toLowerCase().includes(filename)) {
				return files.push(name);
			}
		}
	}
	return files;
}

// Load the items data
const items = require("../data.json");
//insert item data into database
db.serialize(() => {
items.forEach((item, i) => {
	//defualt item with deufault values
	let defaultItem = {
		name: null,
		description: null,
        behavior: null,
        habitatSize: null,
		feed: null,
		breeding: null,
		count: null,
		size: null,
		origin: null,
		phMin: null,
		phMax: null,
		tempMin: null,
		tempMax: null,
		h2OHardness: null,
	};
	item = { ...defaultItem, ...item };

	let name = item.name.toLowerCase();
	let img = findFile(name, "./public/images")[0];
	if (!img) {
		console.log(`Image not found for ${name}`);
		return;
	}
	const split = img.split("/");
	item.majorCategory = split[3];
	if (split.length > 4) {
		item.subCategory = split[4];
	}
	//random price
	item.price = Math.round(Math.random() * 10000) / 100;
	item.img = split.slice(2).join("/");
	let sql = "";
	if (item.feed) {
		sql = `INSERT INTO items (name, price, img, majorCategory, subCategory, description, behavior, habitatSize, feed, breeding, count, size, origin, phMin, phMax, tempMin, tempMax, h2OHardness) 
    VALUES (
        '${item.name}',
        ${item.price},
        '${item.img}',
        '${item.majorCategory}',
        '${item.subCategory}',
        '${item.description}',
        '${item.act}',
        ${item.aquaSize},
        '${item.feed}',
        '${item.breeding}',
        '${item.count}',
        '${item.size}',
        '${item.origin}',
        ${item.phMin},
        ${item.phMax},
        ${item.tempMin},
        ${item.tempMax},
        '${item.h2OHardness}'
    )`;
	} else {
		sql = `INSERT INTO items (name, price, img, majorCategory, subCategory, description) 
    VALUES (
        '${item.name}',
        ${item.price},
        '${item.img}',
        '${item.majorCategory}',
        '${item.subCategory}',
        '${item.description}'
    )`;
	}

    db.run(sql, (err)=>{
        if(err){
            console.log(i+ " Error: "+err);
            console.log(sql);
        }
    });
    db.run("INSERT INTO stock (item, amount) VALUES (?, ?)", [item.name, Math.floor(Math.random() * 100) + 1], (err) => {
        if (err) {
            console.log("Error: " + err);
        }
    });
	
});
});
db.close();

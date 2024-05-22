const { DB } = require("./constants");
const sqlite3 = require("sqlite3");
const crypto = require("crypto");
const sessionTimeout = require("./constants").SESSION_TIMEOUT;
const db = new sqlite3.Database(DB);

module.exports = function (app) {
    app.use(["/api/user", "/api/user/*"], (req, res, next) => {
		const sessionid = req.cookies?.sessionid;
        console.log(sessionid)
		if (!sessionid) {
			res.status(401).send();
		} else {
			db.get(`SELECT * FROM sessions WHERE sessionid = "${sessionid}"`, (err, row) => {
				if (err) {
					res.status(500).send();
				} else {
					if (row) {
						const sessionTimestamp = row.timestamp;

						if (currentTime - sessionTimestamp > sessionTimeout) {
							res.clearCookie("sessionid");
							res.status(401).send();
						} else {
							req.params.userid = row.userid;
							next();
						}
					} else {
						res.status(401).send();
					}
				}
			});
		}
	});
	app.get("/api/items/search", (req, res) => {
		console.log(req.query)
		const query = req.query.query;
		const limit = req.query.limit;
		const offset = req.query.offset;
		db.all(`SELECT * FROM items WHERE name LIKE '%${query}%' LIMIT ${limit} OFFSET ${offset}`, (err, rows) => {
			if (err) {
				console.log(err)
				res.status(500).send();
			} else {
				console.log("rows", rows)
				res.send(rows);
			}
		});
	});
	app.get("/api/items/:name", (req, res) => {
		const itemName = req.params.name;
		db.get(`SELECT * FROM items WHERE name = "${itemName}"`, (err, row) => {
			if (err) {
				res.status(500).send();
			} else {
				
				res.send(row);
			}
		});
	});

	app.get("/api/item/:name/stock", (req, res) => {
		const itemName = req.params.name;
		db.get(`SELECT amount FROM stock WHERE item = "${itemName}"`, (err, row) => {
			if (err) {
				console.log(err)
				res.status(500).send();
			} else {
				res.send(row.amount.toString());
			}
		});
	});

	app.get("/api/items", (req, res) => {
		const limit = req.query.limit;
		const offset = req.query.offset;
		/**@type {Array|null} */
		const category = req.query.majorCategory?.split(',');
		/**@type {Array|null} */
		const subcategory = req.query.subCategory?.split(',');

		let query = `SELECT * FROM items`;
		let where = false;
		if (category) {
			category.forEach((cat, i) => {
				if (i === 0) {
					where = true;
					query += ` WHERE majorCategory = "${cat}"`;
				} else {
					query += ` OR majorCategory = "${cat}"`;
				}
			});
		}
		if (subcategory) {
			if (where) {
				query += " AND";
			} else {
				query += " WHERE";
			}
			subcategory.forEach((subcat, i) => {
				if (i === 0) {
					query += ` subCategory = "${subcat}"`;
				} else {
					query += ` OR subCategory = "${subcat}"`;
				}
			});
		}

		if (limit) {
			query += ` LIMIT ${limit}`;
		}

		if (offset) {
			query += ` OFFSET ${offset}`;
		}
		console.log(query)
		db.all(query, (err, rows) => {
			if (err) {
				res.status(500).send();
			} else {
				res.send(rows);
			}
		});
	});
	app.get("/api/categories", (req, res) => {
		db.all(`SELECT DISTINCT majorCategory FROM items ASC`, (err, rows) => {
			if (err) {
				res.status(404).send();
			} else {
				console.log(rows)
				res.send(rows.map((row) => row.majorCategory));
			}
		});
	});
	app.get("/api/categories/:category", (req, res) => {
		const category = req.params.category;
		db.all(`SELECT DISTINCT subCategory FROM items WHERE majorCategory = "${category}"`, (err, rows) => {
			if (err) {
				console.log(err)
				res.status(500).send();
			} else {
				res.send(rows.map((row) => row.subCategory));
			}
		});
	});

	app.post("/api/user/cart/update", (req, res) => {
		const userid = req.body.userid;
		const item = req.body.item;
		const amount = req.body.amount;
		db.run(`INSERT INTO cart (userid, item, amount) VALUES (?, ?, ?)`, [userid, item, amount], (err) => {
			if (err) {
				res.status(500).send();
			} else {
				res.send("Item added to cart successfully");
			}
		});
	});

	app.post("/api/user/cart/delete", (req, res) => {
		const userid = req.body.userid;
		const item = req.body.item;
		db.run(`DELETE FROM cart WHERE userid = "${userid}" AND item = "${item}"`, (err) => {
			if (err) {
				res.status(500).send();
			} else {
				res.send("Item removed from cart successfully");
			}
		});
	});

	app.get("/api/user/cart/", (req, res) => {
		const userid = req.params.userid;
		db.all(`SELECT * FROM cart WHERE userid = "${userid}"`, (err, rows) => {
			if (err) {
				res.status(500).send();
			} else {
				res.send(rows);
			}
		});
	});

	app.get("/api/user/checkout", (req, res) => {
		const username = req.params.username;
		db.all(`SELECT * FROM cart WHERE username = "${username}"`, (err, rows) => {
			if (err) {
				res.status(500).send();
			} else {
				const order = rows.map((row) => ({
					item: row.item,
					amount: row.amount,
					username: row.username,
				}));

				const timestamp = Date.now();
				db.run(
					`INSERT INTO orders (item, amount, username, timestamp) VALUES (?, ?, ?, ?)`,
					order.map((o) => [o.item, o.amount, o.username, timestamp]),
					(err) => {
						if (err) {
							res.status(500).send();
						} else {
							res.redirect("/thank-you");
						}
					}
				);
				db.run(`UPDATE amount FROM stock WHERE item = '${item}'`, (err) => {
					if (err) {
						res.status(500).send();
					} else {
						res.send("Item removed from cart successfully");
					}
				});
			}
		});
	});

	app.get("/api/user/orders/", (req, res) => {
		const userid = req.params.userid;
		db.all(`SELECT * FROM orders WHERE userid = "${userid}"`, (err, rows) => {
			if (err) {
				res.status(500).send();
			} else {
				res.send(rows);
			}
		});
	});

	app.get("/api/user", (req, res) => {
		const userid = req.params.userid;
		db.get(`SELECT * FROM users WHERE userid = "${userid}"`, (err, row) => {
			if (err) {
				res.status(500).send();
			} else {
				res.send(row);
			}
		});
	});

	app.post("/api/user/password", (req, res) => {
		app.post("/api/user/update", (req, res) => {
			const userid = req.body.userid;
			const currentPassword = req.body.currentPassword;
			const newPassword = req.body.newPassword;
			const hashedCurrentPassword = crypto.createHash("sha256").update(currentPassword).digest("hex");
			const hashedNewPassword = crypto.createHash("sha256").update(newPassword).digest("hex");

			db.get(`SELECT * FROM users WHERE userid = "${userid}" AND password = "${hashedCurrentPassword}"`, (err, row) => {
				if (err) {
					res.status(500).send();
				} else {
					if (row) {
						db.run(`UPDATE users SET password = "${hashedNewPassword}" WHERE userid = "${userid}"`, (err) => {
							if (err) {
								res.status(500).send();
							} else {
								res.send("Password updated successfully");
							}
						});
					} else {
						res.status(401).send("Invalid current password");
					}
				}
			});
		});
	});

	app.post("/api/user/update", (req, res) => {
		const userid = req.body.userid;
		const username = req.body.username;
		const firstName = req.body.firstName;
		const lastName = req.body.lastName;

		db.run(`UPDATE users SET username = "${username}", firstName = "${firstName}", lastName = "${lastName}" WHERE userid = "${userid}"`, (err) => {
			if (err) {
				res.status(500).send();
			} else {
				res.send("User updated successfully");
			}
		});
	});

	app.post("/api/user/adress", (req, res) => {
		const userid = req.body.userid;
		const address = req.body.address;
		const zipCode = req.body.zipCode;
		const city = req.body.city;

		db.run(`UPDATE users SET address = "${address}", zipCode = "${zipCode}", city = "${city}" WHERE userid = "${userid}"`, (err) => {
			if (err) {
				res.status(500).send();
			} else {
				res.send("Address updated successfully");
			}
		});
	});

	app.post("/api/signup", (req, res) => {
		const username = req.body.username;
		const password = req.body.password;
		const email = req.body.email;
		const age = req.body.age;
		const address = req.body.address;
		const city = req.body.city;
		const zip = req.body.zip;
		const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
		db.run(`INSERT INTO users (username, password, email, age, address, city, zip) VALUES (?, ?, ?, ?, ?, ?, ?)`, [username, hashedPassword, email, age, address, city, zip], (err) => {
			if (err) {
				res.status(500).send();
			} else {
				res.redirect("/signin");
			}
		});
	});
	app.post("/api/signin", (req, res) => {
		const username = req.body.username;
		const password = req.body.password;
		const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

		db.get(`SELECT * FROM users WHERE username = "${username}" AND password = "${hashedPassword}"`, (err, row) => {
			if (err) {
				res.status(500).send();
			} else {
				if (row) {
					const sessionid = crypto.randomBytes(16).toString("hex");
					res.cookie("sessionid", sessionid, { maxAge: sessionTimeout });
					const currentTime = Date.now();
					const sessionExpiration = currentTime + sessionTimeout;
					db.run(`UPDATE sessions SET timestamp = ${sessionExpiration} WHERE sessionid = "${sessionid}"`, (err) => {
						if (err) {
							res.status(500).send();
						} else {
							res.redirect("/account");
						}
					});
					const timestamp = Date.now();
					db.run(`INSERT INTO sessions (sessionid, timestamp, username) VALUES (?, ?, ?)`, [sessionid, timestamp, username], (err) => {
						if (err) {
							res.status(500).send();
						} else {
							res.redirect("/account");
						}
					});
				} else {
					res.status(401).send();
				}
			}
		});
	});

    
	
};

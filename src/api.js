const { DB, sessionTimeout } = require("./constants");
const sqlite3 = require("sqlite3");
const crypto = require("crypto");
const db = new sqlite3.Database(DB);

module.exports = function (app) {
	//update session timestamp
	app.use((req, res, next) => {
		const sessionid = req.cookies?.sessionid;
		const currentTime = Date.now();
		if (sessionid) {
			db.run(`UPDATE sessions SET timestamp = ${currentTime} WHERE sessionid = '${sessionid}' AND timestamp > ${currentTime - sessionTimeout}`, (err) => {
				next();
			});
		} else {
			next();
		}
	});

	app.use(["/api/user", "/api/user/*"], (req, res, next) => {
		const sessionid = req.cookies?.sessionid;
		console.log(sessionid);
		if (!sessionid) {
			res.status(401).send();
		} else {
			db.get(`SELECT * FROM sessions WHERE sessionid = "${sessionid}"`, (err, row) => {
				if (err) {
					res.status(500).send();
				} else {
					if (row) {
						const currentTime = Date.now();
						const sessionTimestamp = row.timestamp;
						if (currentTime - sessionTimestamp > sessionTimeout * 1000) {
							res.clearCookie("sessionid");
							res.status(401).send();
							db.run(`DELETE FROM sessions WHERE sessionid = "${sessionid}"`);
						} else {
							//inject userid into request
							req.userid = row.userid;
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
		console.log(req.query);
		const query = req.query.query;
		const limit = req.query.limit;
		const offset = req.query.offset;
		console.log(`SELECT * FROM items WHERE name LIKE '%${query}%' LIMIT ${limit} OFFSET ${offset}`);
		db.all(`SELECT * FROM items WHERE name LIKE '%${query}%' LIMIT ${limit} OFFSET ${offset}`, (err, rows) => {
			if (err) {
				console.log(err);
				res.status(500).send();
			} else {
				console.log("rows", rows);
				res.send(rows);
			}
		});
	});
	app.get("/api/item/:name", (req, res) => {
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
				console.log(err);
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
		const category = req.query.majorCategory?.split(",");
		/**@type {Array|null} */
		const subcategory = req.query.subCategory?.split(",");

		let query = `SELECT * FROM items`;
		let where = false;
		if (category) {
			category.forEach((cat, i) => {
				if (i === 0) {
					where = true;
					query += ` WHERE (majorCategory = "${cat}"`;
				} else {
					query += ` OR majorCategory = "${cat}"`;
				}
			});
			if (where) {
				query += ")";
			}
		}
		if (subcategory) {
			if (where) {
				query += " AND";
			} else {
				query += " WHERE";
			}
			let subfilter = false;
			subcategory.forEach((subcat, i) => {
				if (i === 0) {
					subfilter = true;
					query += ` (subCategory = "${subcat}"`;
				} else {
					query += ` OR subCategory = "${subcat}"`;
				}
			});
			if (subfilter) {
				query += ")";
			}
		}

		if (limit) {
			query += ` LIMIT ${limit}`;
		}

		if (offset) {
			query += ` OFFSET ${offset}`;
		}
		console.log(query);
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
				console.log(rows);
				res.send(rows.map((row) => row.majorCategory));
			}
		});
	});
	app.get("/api/categories/:category", (req, res) => {
		const category = req.params.category;
		db.all(`SELECT DISTINCT subCategory FROM items WHERE majorCategory = "${category}"`, (err, rows) => {
			if (err) {
				console.log(err);
				res.status(500).send();
			} else {
				res.send(rows.map((row) => row.subCategory));
			}
		});
	});
	app.post("/api/user/cart/add", (req, res) => {
		const userid = req.userid;
		const item = req.body.item;
		const amount = req.body.amount;
		db.serialize(() => {
			db.get(`SELECT amount FROM cart WHERE userid = "${userid}" AND item = "${item}"`, (err, row) => {
				if (err) {
					res.status(500).send();
				} else {
					if (row) {
						db.run(`UPDATE cart SET amount = "${row.amount + amount}" WHERE userid = "${userid}" AND item = "${item}"`, (err) => {
							if (err) {
								res.status(500).send();
							} else {
								res.send("Item added to cart successfully");
							}
						});
					} else {
						db.run(`INSERT INTO cart (userid, item, amount) VALUES (?, ?, ?)`, [userid, item, amount], (err) => {
							if (err) {
								res.status(500).send();
							} else {
								res.send("Item added to cart successfully");
							}
						});
					}
				}
			});
		});
	});
	app.post("/api/user/cart/update", (req, res) => {
		const userid = req.userid;
		const item = req.body.item;
		const amount = req.body.amount;
		db.run(`UPDATE cart SET amount = "${amount}" WHERE userid = "${userid}" AND item = "${item}"`, (err) => {
			if (err) {
				db.run(`INSERT INTO cart (userid, item, amount) VALUES (?, ?, ?)`, [userid, item, amount], (err) => {
					if (err) {
						res.status(500).send();
					} else {
						res.send("Item added to cart successfully");
					}
				});
			}
		});
	});

	app.post("/api/user/cart/delete", (req, res) => {
		const userid = req.userid;
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
		const userid = req.userid;
		db.all(`SELECT * FROM cart JOIN items ON cart.item = items.name WHERE userid = "${userid}"`, (err, rows) => {
			if (err) {
				res.status(500).send();
			} else {
				res.send(rows);
			}
		});
	});

	app.post("/api/user/checkout", (req, res) => {
		const username = req.userid;
		db.all(`SELECT * FROM cart WHERE userid = "${username}"`, (err, rows) => {
			if (err) {
				res.status(500).send();
			} else {
				const order = rows.map((row) => ({
					item: row.item,
					amount: row.amount,
					username: row.userid,
				}));
				const timestamp = Date.now();
				//update stock
				const result = Promise.all(
					order.map((o) => {
						return new Promise((resolve, reject) => {
							db.get(`SELECT amount FROM stock WHERE item = "${o.item}"`, (err, row) => {
								if (err) {
									reject(500);
								} else if (row.amount < o.amount) {
									reject(400);
								} else {
									console.log("bought:", row);

									resolve([row, o]);
								}
							});
						});
					})
				);
				result
					.then((val) => {
						console.log("res", val);
						val.forEach(([row,o]) => {
							console.log("row", row);
							db.run(`UPDATE stock SET amount = "${row.amount - o.amount}" WHERE item = "${o.item}"`, (err) => {
								if (err) {
									throw 500;
								}
							});
							db.run(`DELETE FROM cart WHERE userid = "${username}"`, (err) => {
								if (err) {
									throw 500;
								}
							});
							db.run(`INSERT INTO orders (item, amount, userid, timestamp) VALUES (?, ?, ?, ?)`, [o.item, o.amount, o.username, timestamp], (err) => {
								if (err) {
									res.status(500).send();
								}
							});
						});
						res.status(200).send();
					}).catch((err) => {
					if (err === 400) {
							res.status(400).send("Not enough stock available");
						} else if (err === 500) {
							res.status(500).send();
						}
					});
			}
		});
	});
	app.get("/api/user/orders/", (req, res) => {
		const userid = req.userid;
		db.all(`SELECT * FROM orders JOIN items ON orders.item = items.name WHERE userid = "${userid}"`, (err, rows) => {
			if (err) {
				res.status(500).send();
			} else {
				res.send(rows);
			}
		});
	});

	app.get("/api/user", (req, res) => {
		const userid = req.userid;
		db.get(`SELECT * FROM users WHERE id = "${userid}"`, (err, row) => {
			if (err) {
				res.status(500).send();
			} else {
				res.send(row);
			}
		});
	});

	app.post("/api/user/password", (req, res) => {
		const userid = req.userid;
		const currentPassword = req.body.currentPassword;
		const newPassword = req.body.newPassword;
		const hashedCurrentPassword = crypto.createHash("sha256").update(currentPassword).digest("hex");
		const hashedNewPassword = crypto.createHash("sha256").update(newPassword).digest("hex");

		db.get(`SELECT * FROM users WHERE id = "${userid}" AND password = "${hashedCurrentPassword}"`, (err, row) => {
			if (err) {
				res.status(500).send();
			} else {
				if (row) {
					db.run(`UPDATE users SET password = "${hashedNewPassword}" WHERE id = "${userid}"`, (err) => {
						if (err) {
							res.status(500).send();
						} else {
							res.status(200).send();
						}
					});
				} else {
					res.status(401).send("Invalid current password");
				}
			}
		});
	});

	app.post("/api/user/update", (req, res) => {
		const userid = req.userid;
		const username = req.body.username;
		const firstName = req.body.firstName;
		const lastName = req.body.lastName;

		db.run(`UPDATE users SET username = '${username}', firstName = '${firstName}', lastName = '${lastName}' WHERE id = "${userid}"`, (err) => {
			if (err) {
				res.status(500).send();
			} else {
				res.status(200).send();
			}
		});
	});

	app.post("/api/user/address", (req, res) => {
		const userid = req.userid;
		const address = req.body.address;
		const zipCode = req.body.zipCode;
		const city = req.body.city;

		db.run(`UPDATE users SET address = "${address}", zipCode = "${zipCode}", city = "${city}" WHERE id = "${userid}"`, (err) => {
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
		const address = req.body.address;
		const city = req.body.city;
		const zip = req.body.zipCode;
		const firstName = req.body.firstName;
		const lastName = req.body.lastName;
		const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
		db.run(`INSERT INTO users (username, password, address, zipCode, city, firstName, lastName) VALUES (?, ?, ?, ?, ?, ?, ?)`, [username, hashedPassword, address, zip, city, firstName, lastName], (err) => {
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
					res.cookie("sessionid", sessionid, { maxAge: sessionTimeout * 1000 });
					db.serialize(() => {
						const timestamp = Date.now();
						db.run(`DELETE FROM sessions WHERE userid = ${row.id}`);
						db.run(`INSERT INTO sessions (sessionid, timestamp, userid) VALUES (?, ?, ?)`, [sessionid, timestamp, row.id], (err) => {
							if (err) {
								res.status(500).send();
							} else {
								res.status(200).send();
							}
						});
					});
				} else {
					res.status(401).send();
				}
			}
		});
	});
};

/**
 * @typedef {Object} Item
 * @property {string} name
 * @property {string} img
 * @property {number} price
 * @property {string} category
 * @property {string|undefined} subCategory
 */
/**
 * @typedef {Object} Order
 * @property {Item} item
 * @property {int} amount
 * @property {number} price
 * @property {string} date
 */

const img_path = "BuydaDaten/Bilder";
function flat(data, arr) {
	Object.values(data).forEach((e) => {
		if (!e.name) {
			flat(e, arr);
		} else {
			arr.push(e);
		}
	});
	return arr;
}

const data = {
	Shop: {
		Zierfische: {
			Zahnkarpfen: {
				Bärblinge: ["Zwergbärbling", "Perlhuhnbärbling"],
				Salmler: ["Blauer Neon", "Schmucksalmler", "Rotkopfsalmler", "Glühlichtsalmler", "Feuertetra"],
				Buntbarsche: ["Borellis Zwergbuntbarsch", "Purpurprachtbuntbarsch"],
				Welse: ["Ohrgitterharnischwels", "Pandapanzerwels", "Antennenwels L 144"],
				Guppys: ["Cobra-Guppy", "Cobra Flower", "Endlerguppy", "Guppy Neon Flamme", "Guppy Panda", "Guppy Tuxedo"],
				Mollys: ["Black Mollys", "Dalmatiner Molly", "Salt and Pepper Molly", "Gold Molly"],
				Schwerttäger: ["Schwerttäger Rot", "Schwerttäger Gold", "Schwerttäger Schwarz", "Lyra-Schwerttäger"],
				Platys: ["Platy Rot", "Miki Mouse Platy", "Platy Red Miki Mouse", "Platy Weiß", "Pfeffer und Salz Platy"],
			},
			Wirbellose: {
				Granelen: [
					{
						Neocaridina: ["Red Fire Garnele", "Orange Rili Garnele", "Yello Fire Garnele", "Blue Velvet Garnele", "Rote Sakura Garnele"],
						Caridina: ["Armano Garnelen", "Black Bee Garnele", "Red Bee Garnele", "Snow White Garnele"],
					},
				],
				Schnecken: ["Posthornschnecke", "Zebrarennschnecke", "Geweihschnecke", "Teufeldornschnecke", "Gelbe Felsenschnecke", "Raubschnecke"],
			},
		},
		Pfanzen: {
			Stängelpfanzen: ["Rotala rotundifolia", "Rotala Wallichii", "Bacopa caroliniana", "Limnophelia sessiliflora"],
			Bodendecker: ["Elatine hydropiper", "Hemianthus micranthemoides", "Micranthemumtweediei Monte Carlo"],
			Rosette: ["Cryptocoryne usteriana", "Cryptocoryne crispatula", "Echinodorus Reni", "Helantium bolivianum"],
			Wurzelstock: ["Anubias gracilis", "Bucephalandra pygmaea", "Anubias barteri"],
		},
		Futter: {
			Flocken: ["JBL NOVO BEL alle Arten S", "ALOHA Fresh APANA CARNE Flakes", "Dehner Aqua Zierfischfutter Flockenmix"],
			Granulat: ["JBL NOVO BEL alle Arten XS"],
			Tabletten: ["JBL Novo Pleco", "Tetra Wafer MiniMix"],
			Spezialfutter: ["Tubifex Würfel", "Rote Mückenlaven"],
		},
		Pfelge: {
			Dünger: [
				{
					Tablettendüngung: ["Crypto"],
				},
			],
			Wasserzusatz: [
				{
					Wasseraufbereitung: ["Aquasafe", "Seemandelbaumblätter", "FilterActive", "Wasserteststreifen"],
				},
			],
			Medikamente: ["sera baktopur", "sera mycopur", "sera omnipur A", "sera med Nematol", "sera med Protazol", "Hexamita"],
		},
	},
};
function dataToItems(data) {
	Object.entries(data.Shop).forEach(([majorCategory, mcat]) => {
		Object.entries(mcat).forEach(([subCategory, items]) => {
			if (Array.isArray(items)) {
				items.forEach((item, i) => {
					items[i] = {
						name: item,
						img: `${img_path}/${majorCategory}/${subCategory}/${item}.jpg`,
						price: Math.floor(Math.random() * 12) + 1,
						category: majorCategory,
						subCategory: subCategory,
					};
				});
			} else {
				Object.entries(items).forEach(([scat, subItems], i) => {
					subItems.forEach((subItem, i) => {

						subItems[i] = {
							name: subItem,
							img: `${img_path}/${scat}/${subItem}.jpg`,
							price: Math.floor(Math.random() * 12) + 1,
							category: majorCategory,
							subCategory: subCategory,
						};
					});
				});
			}
		});
	});
	return data;
}

const api = {
	data: dataToItems(data),
	getMajorCategories: async function () {
		return Object.keys(this.data.Shop);
	},

	getSubCategories: async function (majorCategory) {
		return Object.keys(this.data.Shop[majorCategory]);
	},

	getItemsByCategory: async function (majorCategory) {
		return this.data.Shop[majorCategory][subCategory];
	},
	/**
	 * returns item by name
	 * @param {str} name
	 * @returns {Promise<Item|null>}
	 */
	getItemByName: async function (name) {
		for (const majorCategory in this.data.Shop) {
			for (const subCategory in this.data.Shop[majorCategory]) {
				for (const item of this.data.Shop[majorCategory][subCategory]) {
					if (item === name) {
						return item;
					}
				}
			}
		}
		return null;
	},
	/**
	 * gets items
	 * @param {Object} opt
	 * @property {number|undefined} limit the number of items to return
	 * @property {number|undefined} offset the number of items to skip
	 * @returns
	 */
	getItems: async function (opt) {
		opt = opt || {};
		opt.offset = opt.offset || 0;
		start = opt.offset;
		end = opt.limit ? start + opt.limit : undefined;
		return flat(this.data.Shop, []).slice(start, end);
	},
    /**
	 * @param {Object} opt
     * @property {number|undefined} limit the number of orders to return
     * @property {number|undefined} offset the number of orders to skip
     * @returns {Promise<Order[]>}
     */
    getOrderHistory: async function (opt) {
        opt = opt || {};
        opt.offset = opt.offset || 0;
        start = opt.offset;
        end = opt.limit ? start + opt.limit : undefined;
        return [{
            item: {
                name: "item",
                img: "item.jpg",
                price: 1.00,
                category: "category",
                subCategory: "subCategory"
            },
            amount: 2,
            price: 1.00,
            date: "2022-01-01T00:00:00.000Z",
        }, {
            item: {
                name: "item",
                img: "item.jpg",
                price: 1.00,
                category: "category",
                subCategory: "subCategory"
            },
            amount: 1,
            price: 3.00,
            date: "2022-01-02T00:00:00.000Z",
        }, {
            item: {
                name: "item",
                img: "item.jpg",
                price: 1.00,
                category: "category",
                subCategory: "subCategory"
            },
            amount: 1,
            price: 1.00,
            date: "2022-01-03T00:00:00.000Z",
        }, {
            item: {
                name: "item",
                img: "item.jpg",
                price: 1.00,
                category: "category",
                subCategory: "subCategory"
            },
            amount: 1,
            price: 5.00,
            date: "2022-01-05T00:00:00.000Z",
        }, {
            item: {
                name: "i2tem",
                img: "item.jpg",
                price: 1.00,
                category: "category",
                subCategory: "subCategory"
            },
            amount: 1,
            price: 18.00,
            date: "2022-01-05T00:00:00.000Z",
        }].slice(start, end);
    },
    addToCart: async function (item, amount) {
        console.log(`Added ${amount} ${item.name} to cart`);
    },
    getCart: async function () {
        return [{
            item: {
                name: "item",
                img: "item.jpg",
                price: 1.00,
                category: "category",
                subCategory: "subCategory"
            },
            amount: 2,
            price: 2.00,
        }, {
            item: {
                name: "item",
                img: "item.jpg",
                price: 1.00,
                category: "category",
                subCategory: "subCategory"
            },
            amount: 1,
            price: 3.00,
        }];
    },
    checkout: async function () {
        console.log("checkout");
    },
    login: async function (username, password){
        console.log(`login as ${username}`);
    },
};

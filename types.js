/**
 * @typedef {Object} Item
 * @property {string} name
 * @property {string} img
 * @property {number} price
 * @property {Categories} category
 * @property {SubCategory} subCategory
 * @property {string} description
 * @property {string} feed
 * @property {string} breeding
 * @property {string} count
 * @property {string} size
 * @property {string} origin
 * @property {number} phMin
 * @property {number} phMax
 * @property {number} tempMin
 * @property {number} tempMax
 * @property {string} h2OHardness
 */
/**
 * @typedef {Object} Order
 * @property {Item} item
 * @property {int} amount
 * @property {number} price
 * @property {number} timestamp
 * @property {int} userid
 */
/**
 * @typedef {"Zierfische"|"Pfanzen"|"Futter"|"Pfelge"} Categories
 * @typedef {"Zahnkarpfen"|"Wirbellose"|"Stängelpfanzen"|"Bodendecker"|"Rosette"|"Wurzelstock"|"Flocken"|"Granulat"|"Tabletten"|"Spezialfutter"|"Dünger"|"Wasserzusatz"|"Medikamente"} SubCategory
 *
 * @typedef {Object} User
 * @property {int} id
 * @property {string} username
 * @property {string} password
 * @property {string} address
 * @property {string} zipCode
 * @property {string} city
 * @property {string} firstName
 * @property {string} lastName
 * 
 * 
 * @typedef {Object} Sessions
 * @property  {int} userid
 * @property {string} sessionID
 * @property {int} timestamp
 * 
 * @typedef {Object} Stock
 * @property {Item} item
 * @property {int} amount
 * 
 * @typedef {Object} Cart
 * @property {Item} item
 * @property {int} amount
 * @property {int} userid
 */

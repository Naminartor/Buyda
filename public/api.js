/**
 * The API object provides methods to interact with the server's API.
 * @namespace
 */
const api = {
    /**
     * Retrieves the major categories from the server.
     * @async
     * @function
     * @returns {Promise<Array>} A promise that resolves to an array of major categories.
     */
    getMajorCategories: async function() {
        try {
            const response = await fetch('/api/categories');
            const data = await response.json();
            // Process the data or return it as needed
            return data;
        } catch (error) {
            console.error('Error:', error);
            // Handle the error appropriately
        }
    },

    /**
     * Retrieves the sub-categories for a given major category from the server.
     * @async
     * @function
     * @param {string} majorCategory - The major category for which to retrieve the sub-categories.
     * @returns {Promise<Array>} A promise that resolves to an array of sub-categories.
     */
    getSubCategories: async function(majorCategory) {
        try {
            const response = await fetch(`/api/categories/${majorCategory}`);
            const data = await response.json();
            // Process the data or return it as needed
            return data;
        } catch (error) {
            console.error('Error:', error);
            // Handle the error appropriately
        }
    },
    /**
     * Retrieves items from the server based on the provided search query.
     * @async
     * @function
     * @param {string} search - The search query.
     * @param {Object} opt - The options for retrieving items.
     * @param {number} opt.limit - The maximum number of items to retrieve.
     * @param {number} opt.offset - The offset for pagination.
     * @returns {Promise<Array>} A promise that resolves to an array of items.
     * 

     */
    searchItems: async function(search,opt) {
        try {
            const response = await fetch(`/api/items/search?query=${search}&limit=${opt.limit}&offset=${opt.offset}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error:', error);
        }
    },
    /**
     * Retrieves an item by its name from the server.
     * @async
     * @function
     * @param {string} name - The name of the item to retrieve.
     * @returns {Promise<Object>} A promise that resolves to the item object.
     */
    getItemByName: async function(name) {
        try {
            const response = await fetch(`/api/item/${name}`);
            const data = await response.json();
            // Process the data or return it as needed
            return data;
        } catch (error) {
            console.error('Error:', error);
            // Handle the error appropriately
        }
    },
    /**
     * Retrieves the stock count of an item from the server.
     * @param {string} name name of item
     * @returns count of item in stock
     */
    getItemStock: async function(name) {
        try {
            const response = await fetch(`/api/item/${name}/stock`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error:', error);
        }
    },
    /**
     * Retrieves items from the server based on the provided options.
     * @async
     * @function
     * @param {Object} opt - The options for retrieving items.
     * @param {number} opt.limit - The maximum number of items to retrieve.
     * @param {number} opt.offset - The offset for pagination.
     * @param {string} opt.majorCategory - The major category to filter items by.
     * @param {string} opt.subCategory - The sub-category to filter items by.
     * @returns {Promise<Array>} A promise that resolves to an array of items.
     */
    getItems: async function(opt) {
        try {
            url = '/api/items?' 
            if (opt.limit) {
                url += `limit=${opt.limit}&`
            }
            if (opt.offset) {
                url += `offset=${opt.offset}&`
            }
            if (opt.majorCategory) {
                url += `majorCategory=${opt.majorCategory}&`
            }
            if (opt.subCategory) {
                url += `subCategory=${opt.subCategory}`
            }
            const response = await fetch(url);
            const data = await response.json();
            // Process the data or return it as needed
            return data;
        } catch (error) {
            console.error('Error:', error);
            // Handle the error appropriately
        }
    },
    /**
     * Retrieves the order history for the current user from the server.
     * @returns {Promise<Array>} A promise that resolves to an array of items.
     */
    getOrderHistory: async function() {
        try {
            const response = await this.authFetch('/api/user/orders');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error:', error);
        }
    },
    addCart: async function(item, amount) {
        try {
            const response = await this.authFetch('/api/user/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ item, amount }),
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error:', error);
        }
    },
    updateCart: async function(item, amount) {
        try {
            const response = await this.authFetch('/api/user/cart/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ item, amount }),
            });
            if (response.status === 200) {
                return true;
            }
        } catch (error) {
            console.error('Error:', error);
        }
    },
    deleteCart: async function(item) {
        try {
            const response = await this.authFetch('/api/user/cart/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ item }),
            });
            if (response.status === 200) {
                return true;
            }
        } catch (error) {
            console.error('Error:', error);
        }
    },
    getCart: async function() {
        try {
            const response = await this.authFetch('/api/user/cart');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error:', error);
        }
    },
    checkout: async function() {
        try {
            const response = await this.authFetch('/api/user/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}),
            });
            if (response.status === 200) {
                return false
            }
            return await response.text();
        } catch (error) {
            console.error('Error:', error);
            return null;
        }
    },
    getAccount: async function() {
        try {
            const response = await this.authFetch('/api/user');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error:', error);
        }
    },
    updateAccount: async function(user) {
        try {
            const response = await this.authFetch('/api/user/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(user),
            });
            if (response.status === 200) {
                return true;
            }
        } catch (error) {
            console.error('Error:', error);
        }
    },
    updateAddress: async function(address) {
        try {
            const response = await this.authFetch('/api/user/address', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(address),
            });
            if (response.status === 200) {
                return true;
            }
        } catch (error) {
            console.error('Error:', error);
        }
    },
    updatePassword: async function(password) {
        try {
            const response = await this.authFetch('/api/user/password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(password),
            });
            if (response.status === 200) {
                return true;
            }else{
                return false
            }
        } catch (error) {
            console.error('Error:', error);
        }
    },
    authFetch: async function(url, options) {
        try {
            const response = await fetch(url, options);
            if (response.status === 401) {
                window.location.replace('/signin');
            }
            return response;
        } catch (error) {
            console.error('Error:', error);
        }
    },
    signin: async function(username, password) {
        try {
            const response = await fetch('/api/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
            if (response.status === 200) {
                window.location.replace('/account');
            }else{
                return false
            }
        } catch (error) {
            console.error('Error:', error);
        }
        return true
    },
    signup: async function(user) {
        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(user),
            });
            if (response.status === 200) {
                window.location.replace('/signin');
            }else{
                return false
            }
        } catch (error) {
            console.error('Error:', error);
        }
        return true
    },
};


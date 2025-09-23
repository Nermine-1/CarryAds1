const pool = require('../config/db'); // Your MySQL connection pool

class User {
    /**
     * Finds a user by their email address in the carryads_user table.
     * @param {string} email - The email of the user to find.
     * @returns {Promise<Object|undefined>} The user object if found, otherwise undefined.
     */
    static async findByEmail(email) {
        const [rows] = await pool.execute('SELECT * FROM carryads_user WHERE email = ?', [email]);
        return rows[0]; // Returns the user object from carryads_user table
    }

    /**
     * Creates a new user entry in the carryads_user table.
     * @param {string} username - The user's chosen username.
     * @param {string} email - The user's email.
     * @param {string} hashedPassword - The hashed password.
     * @param {string[]} roles - An array of roles (e.g., ['ROLE_ANNONCEUR']). Stored as JSON string.
     * @param {string|null} phone - The user's
     * phone number, can be null.
     * @returns {Promise<number>} The insert ID of the newly created user.
     */
    static async createUser(username, email, hashedPassword, roles, phone) {
        const [result] = await pool.execute(
            'INSERT INTO carryads_user (username, email, password, roles, phone) VALUES (?, ?, ?, ?, ?)',
            [username, email, hashedPassword, JSON.stringify(roles), phone]
        );
        return result.insertId;
    }

    /**
     * Creates a new customer (annonceur) entry in the carryads_customers table.
     * @param {number} userId - The foreign key linking to the carryads_user table.
     * @param {string} companyName - The name of the customer's company.
     * @param {string} adress - The customer's address (using 'adress' to match the database).
     * @param {string} city - The customer's city.
     * @param {string} postalCode - The customer's postal code.
     * @param {string} country - The customer's country.
     * @param {number|null} latitude - The geographical latitude, can be null.
     * @param {number|null} longitude - The geographical longitude, can be null.
     * @returns {Promise<number>} The insert ID of the newly created customer.
     */
    static async createCustomer(userId, companyName, adress, city, postalCode, country, latitude, longitude) {
        const [result] = await pool.execute(
            'INSERT INTO carryads_customers (user_id, company_name, adress, city, postal_code, country, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [userId, companyName, adress, city, postalCode, country, latitude, longitude]
        );
        return result.insertId;
    }

    /**
     * Creates a new distributor entry in the carryads_distributers table.
     * @param {number} userId - The foreign key linking to the carryads_user table.
     * @param {string} adress - The distributor's address (using 'adress' to match the database).
     * @param {string} city - The distributor's city.
     * @param {string} postalCode - The distributor's postal code.
     * @param {string} country - The distributor's country.
     * @param {number|null} latitude - The geographical latitude, can be null.
     * @param {number|null} longitude - The geographical longitude, can be null.
     * @returns {Promise<number>} The insert ID of the newly created distributor.
     */
    static async createDistributer(userId, adress, city, postalCode, country, latitude, longitude) {
        const [result] = await pool.execute(
            'INSERT INTO carryads_distributers (user_id, adress, city, postal_code, country, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, adress, city, postalCode, country, latitude, longitude]
        );
        return result.insertId;
    }

    /**
     * Finds a customer's detailed profile by their user ID.
     * @param {number} userId - The ID of the user (from carryads_user table).
     * @returns {Promise<Object|undefined>} The customer's profile object if found, otherwise undefined.
     */
    static async findCustomerDetails(userId) {
        const [rows] = await pool.execute('SELECT * FROM carryads_customers WHERE user_id = ?', [userId]);
        return rows[0];
    }

    /**
     * Finds a distributor's detailed profile by their user ID.
     * @param {number} userId - The ID of the user (from carryads_user table).
     * @returns {Promise<Object|undefined>} The distributor's profile object if found, otherwise undefined.
     */
    static async findDistributerDetails(userId) {
        const [rows] = await pool.execute('SELECT * FROM carryads_distributers WHERE user_id = ?', [userId]);
        return rows[0];
    }
}

module.exports = User;

class Session {
    // Session Core Data
    #id;
    #request;
    #response;
    #signed_id;
    #session_data = {};
    #session_engine;
    #prefixes = {
        duration: '__cust_dur',
    };

    // Session State Booleans
    #parsed_id = false;
    #ready = false;
    #from_database = false;
    #persist = false;
    #destroyed = false;

    constructor(request, response, session_engine) {
        // Store request, response and session engine object to be used by instance throughout operation
        this.#request = request;
        this.#response = response;
        this.#session_engine = session_engine;

        // Bind a hook on 'send' event for performing closure at the end of request
        response.hook('send', () => this._perform_closure());
    }

    /**
     * This method asynchronously generates a strong cryptographically random session id.
     *
     * @returns {Promise} Promise -> String
     */
    async generate_id() {
        return await this.#session_engine.methods.id();
    }

    /**
     * This method sets the current session's id to provided session_id.
     * Note! This method does not perform any verification on provided session_id
     * and thus is not recommended to be used with any user a provided id.
     *
     * @param {String} id
     * @returns {Session} Session (chainable)
     */
    set_id(session_id) {
        if (typeof session_id !== 'string') throw new Error('set_id(id) -> id must be a string');
        this.#id = session_id;
        this.#parsed_id = true;
        return this;
    }

    /**
     * This method sets the current session's id to provided signed session id.
     * Note! This method is recommended over .set_id() as this method will attempt to
     * unsign the the provided id and thus verifies user input.
     *
     * @param {String} signed_id Signed Session ID
     * @param {String} secret Optional (Utilizes SessionEngine.options.cookie.secret by default)
     * @returns {Boolean}
     */
    set_signed_id(signed_id, secret) {
        // Attempt to unsign provided id and secret with fallback to Session Engine secret
        const final_secret = secret || this.#session_engine.options.cookie.secret;
        const unsigned_id = this.#request.unsign(signed_id, final_secret);

        // Return false if unsigning process fails, likely means bad signature
        if (unsigned_id === false) return false;

        // Set provided unsigned/signed_id to Session state
        this.#id = unsigned_id;
        this.#signed_id = signed_id;
        this.#parsed_id = true;
        return true;
    }

    /**
     * This method is used to change the duration of current session to a custom value in milliseconds.
     *
     * @param {Number} duration In Milliseconds
     * @returns {Session} Session (Chainable)
     */
    set_duration(duration) {
        // Ensure provided duration is a valid number in milliseconds
        if (typeof duration !== 'number' || duration < 1)
            throw new Error(
                'SessionEngine: Session.set_duration(duration) -> duration must be a valid number in milliseconds.'
            );

        // Store custom duration as a part of the session data
        return this.set(this.#prefixes.duration, duration);
    }

    /**
     * This method is used to start a session for incoming request.
     * Note! This method is asynchronous as it performs the 'read' operation to read session data.
     *
     * @returns {Promise} Promise
     */
    async start() {
        // Return if session has already started
        if (this.#ready) return;

        // Retrieve session id to determine if a session cookie was sent with request
        const session_id = this.id;
        if (typeof session_id !== 'string' || session_id.length == 0) {
            // Generate a new session id since no session cookie was sent with request
            this.#id = await this.generate_id();
            this.#parsed_id = true;
            this.#ready = true;
            return; // Return since this is a brand new session and we do not need to perform a 'read'
        }

        // Perform 'read' operation to retrieve any associated data for this session
        const session_data = await this.#session_engine.methods.read(this);
        if (session_data && typeof session_data == 'object') {
            this.#from_database = true;
            this.#session_data = session_data;
        } else {
            // This will be useful to user for choosing between INSERT or UPDATE operation during 'write' operation
            this.#from_database = false;
        }

        // Mark session as ready so rest of the methods can be used
        this.#ready = true;
    }

    /**
     * Throws an Error alerting user for a session not being started for ready only methods.
     * @private
     */
    _session_not_started(method) {
        throw new Error(
            'SessionEngine: Session was not started. Please call Request.session.start() before calling Request.session.' +
                method +
                '()'
        );
    }

    /**
     * Rolls current session's id to a new session id.
     * Note! This operation performs 2 underlying operations as it first
     * deletes old session and then persists session data under new session id.
     *
     * @returns {Promise} Promise -> Boolean (true || false)
     */
    async roll() {
        // Throw not started error if session was not started/ready
        if (!this.#ready) return this._session_not_started('roll');

        // Destroy old session if it is from database
        if (this.#from_database) await this.destroy();

        // Generate a new session id for current session
        this.#id = await this.generate_id();
        this.#signed_id = null; // Since we generated a new session id, we will need to re-sign
        this.#parsed_id = true;
        this.#destroyed = false; // This is to override the destroy() method
        this.#from_database = false;
        this.#persist = true; // This is so the new session persists at the end of this request
        return true;
    }

    /**
     * This method performs the 'touch' operation updating session's expiry in storage.
     *
     * @returns {Promise} Promise
     */
    touch() {
        // Return if no session cookie was sent with request
        if (typeof this.id !== 'string') return;

        // Invocate touch operation from session engine
        return this.#session_engine.methods.touch(this);
    }

    /**
     * This method is used to destroy the current session.
     * Note! This method is asynchronous as it instantly triggers
     * the 'destroy' operation causing session to be deleted from storage mechanism.
     *
     * @returns {Promise}
     */
    async destroy() {
        // Return if session has already been destroyed
        if (this.#destroyed) return;

        // Return if no session cookie was sent with request
        if (typeof this.id !== 'string') return;

        // Make sure session has been started before we attempt to destroy it
        if (!this.#ready) await this.start();

        // Perform 'destroy' operation to delete session data from storage
        if (this.#from_database) await this.#session_engine.methods.destroy(this);

        // Empty local session data and mark instance to be destroyed
        this.#session_data = {};
        this.#destroyed = true;
    }

    /**
     * This method is used to set one or multiple session data values.
     * You may provide a name and value argument to update a single value.
     * You may provide an Object of keys/values to update multiple values in one operation.
     *
     * @param {String|Object} name
     * @param {Any} value
     * @returns {Session} Session (Chainable)
     */
    set(name, value) {
        // Ensure session has been started before trying to set values
        if (!this.#ready) return this._session_not_started('set');

        // Update local session data based on provided format
        if (typeof name == 'string') {
            this.#session_data[name] = value;
        } else {
            Object.keys(name).forEach((key) => (this.#session_data[key] = name[key]));
        }

        // Mark session instance to be persisted
        this.#persist = true;
        return this;
    }

    /**
     * This method replaces current session data values with provided data values object.
     *
     * @param {Object} data
     * @returns {Session} Session (Chainable)
     */
    reset(data = {}) {
        // Ensure data is an object
        if (data === null || typeof data !== 'object')
            throw new Error('SessionEngine: Session.reset(data) -> data must be an Object.');

        // Ensure session has been started before trying to set values
        if (!this.#ready) return this._session_not_started('set');

        // Overwrite all session data and mark instance to be persisted
        this.#session_data = data;
        this.#persist = true;
        return this;
    }

    /**
     * This method is used to retrieve data values from current session.
     * You may retrieve all session data values by providing no name.
     *
     * @param {String} name Optional
     * @returns {Any|Object|undefined}
     */
    get(name) {
        // Ensure session is started before trying to read values
        if (!this.#ready) return this._session_not_started('get');

        // Return all session data if no name is provided
        if (name == undefined) return this.#session_data;

        // Return specific session data value if name is provided
        return this.#session_data[name];
    }

    /**
     * This method is used to delete data values from current session.
     * You may delete all session data values by providing no name.
     *
     * @param {String} name
     * @returns {Session} Session (Chainable)
     */
    delete(name) {
        // Ensure session is started before trying to delete values
        if (!this.#ready) return this._session_not_started('delete');

        // Delete single or all values depending on name parameter
        if (name) {
            delete this.#session_data[name];
        } else {
            this.#session_data = {};
        }

        // Mark instance to be persisted
        this.#persist = true;
        return this;
    }

    /**
     * Performs session closure by persisting any data and writing session cookie header.
     * @private
     */
    async _perform_closure() {
        // Set set-cookie header depending on session state
        const cookie = this.#session_engine.options.cookie;
        if (this.#destroyed) {
            // Delete session cookie as session was destroyed
            this.#response.delete_cookie(cookie.name);
        } else if (typeof this.#signed_id == 'string') {
            // Write session cookie without signing to save on CPU operations
            this.#response.cookie(cookie.name, this.#signed_id, this.duration, cookie, false);
        } else if (typeof this.#id == 'string') {
            // Write session cookie normally as we do not have a cached signed id
            this.#response.cookie(cookie.name, this.#id, this.duration, cookie);
        }

        // Return if session has been destroyed as we have nothing to persist
        if (this.#destroyed) return;

        try {
            // Execute 'touch' operation if automatic_touch is enabled
            const automatic_touch = this.#session_engine.options.automatic_touch;
            if (this.#from_database && automatic_touch === true) {
                await this.touch();
            } else if (this.#persist) {
                // Execute 'write' operation to persist changes
                await this.#session_engine.methods.write(this);
            }
        } catch (error) {
            // Pipe error to the global error handler
            this.#response.throw_error(error);
        }
    }

    /* Session Getters */

    /**
     * Parses and returns session id from current request based on session cookie.
     *
     * @returns {String|undefined}
     */
    get id() {
        // Return from cache if id has already been parsed once
        if (this.#parsed_id) return this.#id;

        // Attempt to read session cookie from request headers
        const cookie_options = this.#session_engine.options.cookie;
        const signed_cookie_id = this.#request.cookies[cookie_options.name];
        if (signed_cookie_id) {
            // Unsign the raw cookie header value
            const unsigned_value = this.#request.unsign(signed_cookie_id, cookie_options.secret);

            // Store raw id and signed id locally for faster access in future operations
            if (unsigned_value !== false) {
                this.#id = unsigned_value;
                this.#signed_id = signed_cookie_id;
            }
        }

        // Mark session id as parsed for faster lookups
        this.#parsed_id = true;
        return this.#id;
    }

    /**
     * This method is an alias of .id() except it returns the raw signed id.
     *
     * @returns {String|undefined}
     */
    get signed_id() {
        // Check cache for faster lookup
        if (this.#signed_id) return this.#signed_id;

        // Retrieve parsed session id and sign it with session engine specified signature
        const id = this.id;
        const secret = this.#session_engine.options.cookie.secret;
        if (id) this.#signed_id = this.#request.sign(id, secret);

        return this.#signed_id;
    }

    /**
     * Returns whether session is ready and its data has been retrieved.
     */
    get ready() {
        return this.#ready;
    }

    /**
     * Returns whether session has already been stored in database or not.
     * This is helpful for choosing between INSERT/UPDATE operations for SQL based implementations.
     */
    get stored() {
        return this.#from_database;
    }

    /**
     * Returns the current session's lifetime duration in milliseconds.
     */
    get duration() {
        const default_duration = this.#session_engine.options.duration;
        const custom_duration = this.#session_data[this.#prefixes.duration];
        return typeof custom_duration == 'number' ? custom_duration : default_duration;
    }

    /**
     * Returns the expiry unix timestamp in milliseconds of current session.
     */
    get expires_at() {
        return Date.now() + this.duration;
    }
}

module.exports = Session;

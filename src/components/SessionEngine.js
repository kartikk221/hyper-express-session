const Session = require('./Session.js');
const UidSafe = require('uid-safe');
const { wrap_object } = require('../shared/operators.js');

class SessionEngine {
    #middleware;
    #options = {
        automatic_touch: true,
        duration: 1000 * 60 * 30,
        cookie: {
            name: 'default_sess',
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            secret: null,
        },
    };

    /**
     * @param {Object} options SessionEngine Options
     * @param {Number} options.duration Session lifetime duration in milliseconds. Default: 1000 * 60 * 30 (30 Minutes)
     * @param {Boolean} options.automatic_touch Specifies whether all sessions should automatically be touched regardless of any changes.
     * @param {Object} options.cookie Session cookie options
     * @param {String} options.cookie.name Session cookie name
     * @param {String} options.cookie.path Session cookie path
     * @param {Boolean} options.cookie.httpOnly Whether to add httpOnly flag to session cookie
     * @param {Boolean} options.cookie.secure Whether to add secure flag to session cookie
     * @param {String|Boolean} options.cookie.sameSite Session cookie sameSite directive
     * @param {String} options.cookie.secret Session cookie signature secret. Note! this is required!
     */
    constructor(options) {
        // Ensure options is a valid object
        if (options == null || typeof options !== 'object')
            throw new Error('new SessionEngine(options) -> options must be an object.');

        // Wrap local options object from provided options
        wrap_object(this.#options, options);

        // Ensure the session duration is a valid number
        const duration = this.#options.duration;
        if (typeof duration !== 'number' || duration < 1)
            throw new Error('new SessionEngine(options.duration) -> duration must be a valid number in milliseconds.');

        // Ensure user has specified a secret as it is required
        const secret = this.#options.cookie.secret;
        if (typeof secret !== 'string' || secret.length < 10)
            throw new Error(
                'new SessionEngine(options.cookie.secret) -> secret must be a unique and strong random string.'
            );

        // Create and store a middleware function that attaches Session to each request
        const session_engine = this;
        this.#middleware = (request, response, next) => {
            // Bind Session component to each request on the 'session' property
            request.session = new Session(request, response, session_engine);
            next();
        };
    }

    /**
     * This method throws a session engine unhandled operation error.
     *
     * @private
     * @param {String} type
     */
    _not_setup_method(type) {
        throw new Error(
            `SessionEngine '${type}' operation is not being handled. Please use SessionEngine.use('${action}', some_handler) to handle this session engine operation.`
        );
    }

    #methods = {
        id: () => UidSafe(24), // generates 32 length secure id
        touch: () => this._not_setup_method('touch'),
        read: () => this._not_setup_method('read'),
        write: () => this._not_setup_method('write'),
        destroy: () => this._not_setup_method('destroy'),
        cleanup: () => this._not_setup_method('cleanup'),
    };

    /**
     * This method is used to specify a handler for session engine operations.
     *
     * @param {String} type [id, touch, read, write, destroy]
     * @param {function(Session):void} handler
     * @returns {SessionEngine} SessionEngine (Chainable)
     */
    use(type, handler) {
        // Ensure type is valid string that is supported
        if (typeof type !== 'string' || this.#methods[type] == undefined)
            throw new Error('SessionEngine.use(type, handler) -> type must be a string that is a supported operation.');

        // Ensure handler is an executable function
        if (typeof handler !== 'function')
            throw new Error('SessionEngine.use(type, handler) -> handler must be a Function.');

        // Store handler and return self for chaining
        this.#methods[type] = handler;
        return this;
    }

    /**
     * Triggers 'cleanup' operation based on the assigned "cleanup" handler.
     */
    cleanup() {
        return this.#methods.cleanup();
    }

    /* SessionEngine Getters */

    /**
     * SessionEngine constructor options.
     */
    get options() {
        return this.#options;
    }

    /**
     * SessionEngine assigned operation method handlers.
     */
    get methods() {
        return this.#methods;
    }

    /**
     * SessionEngine middleware function to be passed into HyperExpress.use() method.
     * @returns {Function}
     */
    get middleware() {
        return this.#middleware;
    }
}

module.exports = SessionEngine;

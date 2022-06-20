/**
 * This interface allows you to declare additional properties on your session object using [declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html).
 *
 * @example
 * import 'hyper-express-session/types/components/Session';
 * 
 * declare module 'hyper-express-session/types/components/Session' {
 *     interface SessionData {
 *         views: number;
 *     }
 * }
 *
 */
export interface SessionData {};

export default class Session {
    /* Session Methods */

    /**
     * This method asynchronously generates a strong cryptographically random session id.
     *
     * @returns {Promise<string>}
     */
    generate_id(): Promise<string>;

    /**
     * This method sets the current session's id to provided session_id.
     * Note! This method does not perform any verification on provided session_id
     * and thus is not recommended to be used with any user a provided id.
     *
     * @param {String} id
     * @returns {Session} Session (chainable)
     */
    set_id(session_id: string): Session;

    /**
     * This method sets the current session's id to provided signed session id.
     * Note! This method is recommended over .set_id() as this method will attempt to
     * unsign the the provided id and thus verifies user input.
     *
     * @param {String} signed_id Signed Session ID
     * @param {String=} secret Optional (Utilizes SessionEngine.options.cookie.secret by default)
     * @returns {Boolean}
     */
    set_signed_id(signed_id: string, secret?: string): boolean;

    /**
     * This method is used to change the duration of current session to a custom value in milliseconds.
     *
     * @param {Number} duration In Milliseconds
     * @returns {Session} Session (Chainable)
     */
    set_duration(duration: number): Session;

    /**
     * This method is used to start a session for incoming request.
     * Note! This method is asynchronous as it performs the 'read' operation to read session data.
     *
     * @returns {Promise}
     */
    start(): Promise<void>;

    /**
     * Rolls current session's id to a new session id.
     * Note! This operation performs 2 underlying operations as it first
     * deletes old session and then persists session data under new session id.
     *
     * @returns {Promise<Boolean>}
     */
    roll(): Promise<boolean>;

    /**
     * This method performs the 'touch' operation updating session's expiry in storage.
     *
     * @returns {Promise}
     */
    touch(): Promise<void>;

    /**
     * This method is used to destroy the current session.
     * Note! This method is asynchronous as it instantly triggers
     * the 'destroy' operation causing session to be deleted from storage mechanism.
     *
     * @returns {Promise}
     */
    destroy(): Promise<void>;

    /**
     * This method is used to set one or multiple session data values.
     * You may provide a name and value argument to update a single value.
     * You may provide an Object of keys/values to update multiple values in one operation.
     */
    set<T extends keyof SessionData>(name: T, value: SessionData[T]): Session;
    set(sessionData: SessionData): Session;

    /**
     * This method replaces current session data values with provided data values object.
     *
     * @param {SessionData} data
     * @returns {Session} Session (Chainable)
     */
    reset(data: SessionData): Session;

    /**
     * This method is used to retrieve data values from current session.
     * You may retrieve all session data values by providing no name parameter.
     *
     * @param {String=} name Optional
     * @returns {Any|Object|undefined}
     */
    get<T extends keyof SessionData>(name: T): SessionData[T];
    get(): SessionData;

    /**
     * This method is used to delete data values from current session.
     * You may delete all session data values by providing no name.
     *
     * @param {String} name
     * @returns {Session} Session (Chainable)
     */
    delete(name: string): Session;
    delete(): Session;

    /* Session Getters */

    /**
     * Parses and returns session id from current request based on session cookie.
     *
     * @returns {String|void}
     */
    get id(): string | void;

    /**
     * This method is an alias of .id() except it returns the raw signed id.
     *
     * @returns {String|undefined}
     */
    get signed_id(): string | void;

    /**
     * Returns whether session is ready and its data has been retrieved.
     * @returns {Boolean}
     */
    get ready(): boolean;

    /**
     * Returns whether session has already been stored in database or not.
     * This is helpful for choosing between INSERT/UPDATE operations for SQL based implementations.
     * @returns {Boolean}
     */
    get stored(): boolean;

    /**
     * Returns the current session's lifetime duration in milliseconds.
     * @returns {Number}
     */
    get duration(): number;

    /**
     * Returns the expiry UNIX timestamp in milliseconds of current session.
     * @returns {Number}
     */
    get expires_at(): number;
}
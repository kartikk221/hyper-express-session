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
export interface SessionData {
    /**
     * This property is used to internally store the custom session duration in milliseconds.
     * DO NOT DIRECTLY MODIFY THIS PROPERTY.
     */
    __cust_dur?: number;
}

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
     */
    set_id(session_id: string): Session;

    /**
     * This method sets the current session's id to provided signed session id.
     * Note! This method is recommended over .set_id() as this method will attempt to
     * unsign the the provided id and thus verifies user input.
     */
    set_signed_id(signed_id: string, secret?: string): boolean;

    /**
     * This method is used to change the duration of current session to a custom value in milliseconds.
     */
    set_duration(duration: number): Session;

    /**
     * This method is used to start a session for incoming request.
     * Note! This method is asynchronous as it performs the 'read' operation to read session data.
     */
    start(): Promise<void>;

    /**
     * Rolls current session's id to a new session id.
     * Note! This operation performs 2 underlying operations as it first
     * deletes old session and then persists session data under new session id.
     */
    roll(): Promise<boolean>;

    /**
     * This method performs the 'touch' operation updating session's expiry in storage.
     */
    touch(): Promise<void>;

    /**
     * This method is used to destroy the current session.
     * Note! This method is asynchronous as it instantly triggers
     * the 'destroy' operation causing session to be deleted from storage mechanism.
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
     */
    reset(data: SessionData): Session;

    /**
     * This method is used to retrieve data values from current session.
     * You may retrieve all session data values by providing no name parameter.
     */
    get<T extends keyof SessionData>(name: T): SessionData[T];
    get(): SessionData;

    /**
     * This method is used to delete data values from current session.
     * You may delete all session data values by providing no name.
     */
    delete<T extends keyof SessionData>(name: T): Session;
    delete(): Session;

    /* Session Getters */

    /**
     * Parses and returns session id from current request based on session cookie.
     */
    get id(): string | void;

    /**
     * This method is an alias of .id() except it returns the raw signed id.
     */
    get signed_id(): string | void;

    /**
     * Returns whether session is ready and its data has been retrieved.
     */
    get ready(): boolean;

    /**
     * Returns whether session has already been stored in database or not.
     * This is helpful for choosing between INSERT/UPDATE operations for SQL based implementations.
     */
    get stored(): boolean;

    /**
     * Returns the current session's lifetime duration in milliseconds.
     */
    get duration(): number;

    /**
     * Returns the expiry UNIX timestamp in milliseconds of current session.
     */
    get expires_at(): number;
}

import Session from './Session';

type EngineHandler = (session: Session) => void | Promise<void>;

interface EngineMethods {
    [name: string]: Function
}

export default class SessionEngine {
    /* SessionEngine Methods */

    /**
     * This method is used to specify a handler for session engine operations.
     *
     * @param {String} type [id, touch, read, write, destroy]
     * @param {EngineHandler} handler
     * @returns {SessionEngine} SessionEngine (Chainable)
     */
    use(type: string, handler: EngineHandler): SessionEngine;

    /**
     * Triggers 'cleanup' operation based on the assigned "cleanup" handler.
     */
    cleanup(): void;

    /* SessionEngine Getters */

    /**
     * SessionEngine constructor options.
     * @returns {Object}
     */
    get options(): object;

    /**
     * SessionEngine assigned operation method handlers.
     * @returns {EngineMethods}
     */
    get methods(): EngineMethods;

    /**
     * SessionEngine middleware function to be passed into HyperExpress.use() method.
     * @returns {Function}
     */
    get middleware(): Function;
}
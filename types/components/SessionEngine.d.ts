import Session from './Session';
import { SessionData } from './Session';
import { SessionEngineOptions } from './SessionEngineOptions';

type EngineActionHandler = (session: Session) => void | Promise<void>;
type EngineReactionHandler = (session: Session) => SessionData | Promise<SessionData>;

interface EngineMethods {
    read?: EngineReactionHandler;
    touch?: EngineActionHandler;
    write?: EngineActionHandler;
    destroy?: EngineActionHandler;
    id?: () => string;
    cleanup?: () => void;
}

export default class SessionEngine {
    /**
     *
     * @param options SessionEngine Options
     */
    constructor(options: SessionEngineOptions);

    /* SessionEngine Methods */

    /**
     * This method is used to specify a handler for session engine operations.
     */
    use(type: 'touch' | 'write' | 'destroy', handler: EngineActionHandler): SessionEngine;
    use(type: 'read', handler: EngineReactionHandler): SessionEngine;
    use(type: 'id', handler: () => string): SessionEngine;
    use(type: 'cleanup', handler: () => void): SessionEngine;

    /**
     * Triggers 'cleanup' operation based on the assigned "cleanup" handler.
     */
    cleanup(): void;

    /* SessionEngine Getters */

    /**
     * SessionEngine constructor options.
     * @returns {SessionEngineOptions}
     */
    get options(): SessionEngineOptions;

    /**
     * SessionEngine assigned operation method handlers.
     */
    get methods(): EngineMethods;

    /**
     * SessionEngine middleware function to be passed into HyperExpress.use() method.
     * @returns {Function}
     */
    get middleware(): Function;
}

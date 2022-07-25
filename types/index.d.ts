import SessionEngine from "./components/SessionEngine";
export default SessionEngine;

import Session from 'hyper-express-session/types/components/Session';
import { Router as _Router } from 'hyper-express/types/components/router/Router';

declare module 'hyper-express' {
    interface Request {
        session: Session
    }

    class Router extends _Router {
        use(sessionMiddleware: SessionEngine): void;
        use(pattern: string, sessionMiddleware: SessionEngine): void;
    }
}

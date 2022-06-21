import SessionEngine from "./components/SessionEngine";
export default SessionEngine;

import Session from 'hyper-express-session/types/components/Session';

declare module 'hyper-express' {
    interface Request {
        session: Session
    }

    interface Router {
        use(sessionMiddleware: Function): void;
        use(pattern: string, sessionMiddleware: Function): void;
    }
}
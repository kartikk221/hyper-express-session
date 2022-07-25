import SessionEngine from "./components/SessionEngine";
export default SessionEngine;

import Session from 'hyper-express-session/types/components/Session';
import { Router as _Router } from 'hyper-express/types/components/router/Router';
import { MiddlewareHandler } from 'hyper-express/types/components/middleware/MiddlewareHandler';

declare module 'hyper-express' {
    interface Request {
        session: Session
    }

    class Router extends _Router {
        use(sessionMiddleware: SessionEngine): void;
        use(pattern: string, sessionMiddleware: SessionEngine): void;
        use(router: Router): void;
        use(...routers: Router[]): void;
        use(...middlewares: MiddlewareHandler[]): void;
        use(pattern: string, router: Router): void;
        use(pattern: string, ...routers: Router[]): void;
        use(pattern: string, ...middlewares: MiddlewareHandler[]): void;
    }
}

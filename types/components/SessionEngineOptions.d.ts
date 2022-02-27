export interface SessionEngineCookieOptions {
    /**
     * Session cookie name
     */
    name?: string;

    /**
     * Session cookie path
     */
    path?: string;

    /**
     * Whether to add httpOnly flag to session cookie
     */
    httpOnly?: boolean;

    /**
     * Whether to add secure flag to session cookie
     */
    secure?: boolean;

    /**
     * Session cookie sameSite directive
     */
    sameSite?: string | boolean;

    /**
     * Session cookie signature secret. Note: this is required!
     */
    secret: string;
}

export interface SessionEngineOptions {
    /**
     * Session lifetime duration in milliseconds. Default: 1000 * 60 * 30 (30 Minutes)
     */
    duration?: number;

    /**
     * Specifies whether all sessions should automatically be touched regardless of any changes.
     */
    automatic_touch?: boolean;
}

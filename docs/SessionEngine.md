# SessionEngine
Below is a breakdown of the `SessionEngine` object class generated while creating a new session engine instance. A single session engine can be shared across multiple `HyperExpress.Server` instances.

#### SessionEngine Constructor Options
* `duration`[`Number`]: Specifies the lifetime of sessions in **milliseconds**.
    * **Default:** `1000 * 60 * 30` (30 Minutes)
* `automatic_touch`[`Boolean`]: Specifies whether active sessions should be `touched` regardless of data changes upon each request.
    * **Default:** `true`
* `cookie`[`Object`]: Specifies session cookie options.
    * `name`[`String`]: Cookie Name
    * `domain`[`String`]: Cookie Domain
    * `path`[`String`]: Cookie Path
    * `secure`[`Boolean`]: Adds Secure Flag
    * `httpOnly`[`Boolean`]: Adds httpOnly Flag
    * `sameSite`[`Boolean`, `'none'`, `'lax'`, `'strict'`]: Cookie Same-Site Preference
    * `secret`[`String`]: Specifies secret value used to sign/authenticate session cookies.
* **Note!** a strong and unique string is required for `cookie.secret`.

### SessionEngine Instance Properties
| Property  | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `middleware` | `Function` | Middleware handler to be used with `HyperExpress.use()`. |

#### SessionEngine Methods
* `use(String: type, Function: handler)`: Binds a handler for specified operation `type`.
    * **Note** you must use your own storage implementation in combination with available operations below.
    * **Supported Operations:**
        * [`read`]: Must read and return session data as an `Object` from your storage.
            * **Parameters**: `(Session: session) => {}`.
            * **Expects** A `Promise` which then resolves to an `Object` or `undefined` type.
            * **Required**
        * [`touch`]: Must update session expiry timestamp in your storage.
            * **Parameters**: `(Session: session) => {}`.
            * **Expects** A `Promise` which is then resolved to `Any` type.
            * **Required**
        * [`write`]: Must write session data and update expiry timestamp to your storage.
            * **Parameters**: `(Session: session) => {}`.
              * You can use `session.stored` to determine if you need to `INSERT` or `UPDATE` for SQL based implementations.
            * **Expects** A `Promise` which then resolves to `Any` type.
            * **Required**
        * [`destroy`]: Must destroy session from your storage.
            * **Parameters**: `(Session: session) => {}`.
            * **Expects** A `Promise` which then resolves to `Any` type.
            * **Required**
        * [`id`]: Must return a promise that generates and resolves a cryptographically random id.
            * **Parameters**: `() => {}`.
            * **Expects** A `Promise` which then resolves to `String` type.
            * **Optional**
        * [`cleanup`]: Must clean up expired sessions from your storage.
            * **Parameters**: `() => {}`.
            * **Expects** A `Promise` which then resolves to `Any` type.
            * **Optional**
    * See [`> [Session]`](./Session.md) for working with the `session` parameter.
* `cleanup()`: Triggers `cleanup` operation handler to delete expired sessions from storage.
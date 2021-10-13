## Session
Below is a breakdown of the `session` object made available through the `request.session` property in route/middleware handler(s).

#### Session Properties
| Property  | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `id`      | `Number` | Raw session id for current request. |
| `signed_id` | `Number`  | Signed session id for current request. |
| `ready` | `Boolean`  | Specifies whether session has been started. |
| `stored` | `Boolean`  | Specifies whether session is already stored in database. |
| `duration` | `Number`  | Duration in **milliseconds** of current session. |
| `expires_at` | `Number`  | Expiry timestamp in **milliseconds** of current session. |

#### Session Methods
Methods that return `Session` are chainable to allow for cleaner code.

* `generate_id()`: Asynchronously generates and returns a new session id from `'id'` session engine event.
    * **Returns** `Promise`->`String`
* `set_id(String: session_id)`: Overwrites/Sets session id for current request session.
    * **Returns** `Session`
    * **Note** this method is not recommended in conjunction with user input as it performs no verification.
* `set_signed_id(String: signed_id, String: secret)`: Overwrites/Sets session id for current request session.
    * **Returns** `Session`
    * **Note** this method is **recommended** over `set_id` as it will first unsign/verify the provided signed id and then update the state of current session.
    * `secret` is **optional** as this method uses the underlying `SessionEngine.cookie.secret` by default.
* `set_duration(Number: duration)`: Sets a custom session lifetime duration for current session.
    * **Returns** `Session`
    * **Note** this method stores the custom duration value as a part of the session data in a prefix called `__cust_dur`.
* `start()`: Starts session on incoming request and loads session data from storage source.
    * **Returns** `Promise`.
* `roll()`: Rolls current session's id by migrating current session data to a new session id.
    * **Returns** `Promise` -> `Boolean`
* `touch()`: Updates current session's expiry timestamp in storage.
    * **Returns** `Promise`
    * **Note** This method is automatically called at the end of each request when `automatic_touch` is enabled in `SessionEngine` options.
* `destroy()`: Destroys current session from storage and set's cookie header to delete session cookie.
    * **Returns** `Promise`
* `set(String: name, Any: value)`: Sets session data value. You set multiple values by passing an `Object` parameter.
    * **Returns** `Promise`
    * **Single Example:** `session.set('id', 'some_id')`
    * **Multiple Example:** `session.set({ id: 'some_id', email: 'some_email' })`
* `reset(Object: data)`: Replaces existing session data values with values from the provided `data` object.
    * **Returns** `Promise`
* `get(String: name)`: Returns session data value for specified name. You may **omit** `name` to get **all** session data values.
    * **Returns** `Any`, `Object`, `undefined`
    * **Get One Example**: `session.get('email');` will return the session data value for `email` or `undefined` if it is not set.
    * **Get All Example**: `session.get()` will return all session data values in an `Object`.
* `delete(String: name)`: Deletes session data value at specified name. You may **omit** `name` to delete **all** session data values.
    * **Returns** `Promise`
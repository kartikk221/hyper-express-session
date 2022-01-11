# Examples & Snippets
Below are various examples and snippets that make use of `SessionEngine` and `Session` components.

#### Example: Initializing & Binding A Session Engine With Redis Store Implementation
```javascript
const SessionEngine = require('hyper-express-session');
const TestEngine = new SessionEngine({
    duration: 1000 * 60 * 45, // Default duration is 45 Minutes
    cookie: {
        name: 'example_sess',
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        secret: 'SomeSuperSecretForSigningCookies'
    }
});

// Bind session engine handlers for storing sessions in Redis store
TestEngine.use('read', async (session) => {
    const data = await redis.get('session:' + session.id);
    if(typeof data == 'string') return JSON.parse(data);
});

TestEngine.use('touch', async (session) => {
    return await redis.pexpireat('session:' + session.id, session.expires_at);
});

TestEngine.use('write', async (session) => {
    const key = 'session:' + session.id;

    // We use redis pipeline to perform two operations in one go
    return await redis.pipeline()
    .set(key, JSON.stringify(session.get()))
    .pexpireat(key, session.expires_at)
    .exec();
});

TestEngine.use('destroy', async (session) => {
    return await redis.del('session:' + session.id);
});

// Use middleware from TestEngine in a HyperExpress webserver instance
webserver.use(TestEngine);
```

#### Example: Initiating and storing visits in a session
```js
// Assume a SessionEngine instance has already been setup for this route
webserver.get('/dashboard/news', async (request, response) => {
   // Initiate a session asynchronously
   await request.session.start();
   
   // Read session for visits property and iterate
   let visits = request.session.get('visits');
   if (visits == undefined){
        request.session.set('visits', 1); // Initiate visits property in session
   } else {
        request.session.set('visits', visits + 1); // Iterate visists by 1
   }
   
   return response.html(news_html);
});
```
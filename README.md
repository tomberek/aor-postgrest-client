# JSON REST Client for admin-on-rest

For testing purpose with [admin-on-rest](https://github.com/marmelab/admin-on-rest), use the `jsonRestClient` function that simply takes a JavaScript object, and serves as a regular REST client.

## Installation

```sh
npm install aor-json-rest-client --save-dev
```

## Usage

```js
// in src/App.js
import React from 'react';
import { Admin, Resource } from 'admin-on-rest';
import jsonRestClient from 'aor-json-rest-client';
import data from './data';
/**
 * data looks like:
 * {
 *   posts: [
 *     { id: 0, title, 'Hello, world!' },
 *     { id: 1, title, 'FooBar' },
 *   ],
 *   comments: [
 *     { id: 0, post_id: 0, author: 'John Doe', body: 'Sensational!' },
 *     { id: 1, post_id: 0, author: 'Jane Doe', body: 'I agree' },
 *   ],
 * }
 */
import { PostList } from './posts';

const App = () => (
    <Admin restClient={jsonRestClient(data, loggingEnabled = true)}>
        <Resource name="posts" list={PostList} />
    </Admin>
);

export default App;
```

This REST client doesn't even use the HTTP transport - everything happens within the browser memory. That means that all changes are lost upon refresh. Do NOT use this client in production.

## License

This library is licensed under the [MIT Licence](LICENSE), and sponsored by [marmelab](http://marmelab.com).

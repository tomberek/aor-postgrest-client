# postgREST Client for admin-on-rest

For using [postgREST](https://github.com/begriffs/postgrest) with [admin-on-rest](https://github.com/marmelab/admin-on-rest), use the `postgrestClient` function to convert AOR's REST dialect into one compatible with postgREST.

## Installation

```sh
npm install aor-postgrest-client --save
```

or
```
yarn add aor-postgrest-client
```

make sure do this to build the missing step in https://github.com/tomberek/aor-postgrest-client
```
yarn add aor-postgrest-client
yarn
cd node_modules/aor-postgrest-client
make build
```

## Usage

```js
// in src/App.js
import React from 'react';
import { Admin, Resource } from 'admin-on-rest';
import postgrestClient from 'aor-postgrest-client';
import { PostList } from './posts';

const App = () => (
    <Admin restClient={postgrestClient('/mypostgrestendpoint')}>
        <Resource name="posts" list={PostList} />
    </Admin>
);

export default App;
```

## add token support

### hard code mode
```js
// in src/App.js
import React from 'react';
import { Admin, Resource } from 'admin-on-rest';
import postgrestClient from 'aor-postgrest-client';
import { PostList } from './posts';

// add hard code token
const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJyb2xlIjoid2VidXNlciJ9.uSsS2cukBlM6QXe4Y0H90fsdkJSGcle9b7p_kMV1Ymk";
localStorage.setItem("token", token);

const App = () => (
    <Admin restClient={postgrestClient('/mypostgrestendpoint')}>
        <Resource name="posts" list={PostList} />
    </Admin>
);

export default App;
```

### use auth client
    checkout the document of Admin-on-Rest to setup your AuthClient.js , make sure add the code like this:
```js
localStorage.setItem("token", token);
```

## License

This library is licensed under the [MIT Licence](LICENSE), and sponsored by [tomberek](https://tomberek.info).

# postgREST Client for admin-on-rest

For using [postgREST](https://github.com/begriffs/postgrest) with [admin-on-rest](https://github.com/marmelab/admin-on-rest), use the `postgrestClient` function to convert AOR's REST dialect into one compatible with postgREST.

## Installation

```sh
npm install aor-postgrest-client --save
```

## Usage

See the example in `App.js.example`

```js
// in src/App.js
import React from 'react';
import { Admin, Resource } from 'react-admin';
import postgrestClient from 'aor-postgrest-client';
import { List, Datagrid, TextField, NumberField } from 'react-admin';

import { ShowButton, EditButton, Edit, SimpleForm, DisabledInput, TextInput, NumberInput } from 'react-admin';
import { Create} from 'react-admin';
import { Show, SimpleShowLayout } from 'react-admin';

const BookList = (props) => (
    <List {...props}>
        <Datagrid>
            <ShowButton />
            <EditButton />
            <TextField source="author" />
            <NumberField source="count" />
        </Datagrid>
    </List>
);
export const BookShow = (props) => (
    <Show {...props}>
        <SimpleShowLayout>
            <TextField source="author" />
            <NumberField source="count" />
        </SimpleShowLayout>
    </Show>
);
export const BookEdit = (props) => (
    <Edit {...props}>
        <SimpleForm>
            <DisabledInput source="id" />
            <TextInput source="author" />
            <NumberInput source="count" />
        </SimpleForm>
    </Edit>
);
export const BookCreate = (props) => (
    <Create {...props}>
        <SimpleForm>
            <TextInput source="author" />
            <NumberInput source="count" />
        </SimpleForm>
    </Create>
);
const App = () => (
    <Admin dataProvider={postgrestClient('http://localhost:3000')}>
        <Resource name="books" show={BookShow} create={BookCreate} edit={BookEdit} list={BookList} />
    </Admin>
);

export default App;
```

## License

This library is licensed under the [MIT Licence](LICENSE), and sponsored by [tomberek](https://tomberek.info).

# Hapi OpenAPI 3

Generates OpenAPI 3 for Hapi.
Validator should be Joi.
Inspired by hapi-swagger.

## Installation

```
npm install hapi-openapi3
```

## Basic setup

```javascript
const hapiOpenApi3 = require("hapi-openapi3");
const Hapi = require("hapi");
const Joi = require("joi");

const start = async () => {
  const server = Hapi.Server({
    host: "localhost",
    port: 3000,
  });

  await server.register({
    plugin: hapiOpenApi3,
    options: {
      info: {
        title: "Test API Documentation",
        version: "1.0.0",
      },
    },
  });

  server.route({
    path: "/example",
    method: "get",
    options: {
      validate: {
        headers: {
          authorization: Joi.string().required(),
        },
      },
    },
  });

  await server.start();
};

start();
```

Then open `/openapi.json`

## Options

### Server Plugin Options

- `jsonPath` - path to open api 3 json definition. (type: string, default: /openapi.json)
- `pathPrefixSize` - selects what segment of the URL path is used to group endpoints. (type: number, default: 1)
- `includeFn` - function that determines if route will be included in open api definition (type: (route: RequestRoute) => boolean, required: true)
- `info` - info about the project (type: [info](#info))
- `servers` - array of server URL, this will automatically be derived from hapi's server configuration if left blank (type: [server](#server)[])

### Route Options

See [examples](./examples/route-options.md)

- `options.validate` - used by this plugin to define headers, params, query and payload schema (type: Hapi.RouteOptionsValidate)
- `options.response.schema` - Schema of response, status code defaults to 200 (type: Joi.Schema)
- `options.response.status` - schema of response per status code (type: object<string, Joi.schema>)
- `options.plugins["hapi-openapi3"].request` - You can add examples here. (type: [requestOptions](#requestOptions))
- `options.plugins["hapi-openapi3"].response.schema` - You can add examples here. You can also add your schema here (type: [responseOptions](#responseOptions))
- `options.plugins["hapi-openapi3"].response.status` - You can add examples here per status code. You can also add your schema here (type: object<string, [responseOptions](#responseOptions)>)

### References:

<h4 id="info">info:</h4>

| field            | description              | type   | default            | required |
| ---------------- | ------------------------ | ------ | ------------------ | -------- |
| `title`          | Project Title            | string | Documentation Page | true     |
| `version`        | Project Version          | string | 1.0.0              | false    |
| `description`    | Project Description      | string |                    | false    |
| `termsOfService` | Project Terms of Service | string |                    | false    |
| `termsOfService` | Project Terms of Service | string |                    | false    |
| `contact.name`   | Contact Name             | string |                    | false    |
| `contact.url`    | Contact URL              | string |                    | false    |
| `contact.email`  | Contact Email            | string |                    | false    |
| `license.email`  | License Name             | string |                    | false    |
| `license.url`    | License URL              | string |                    | false    |

<h4 id="server">server:</h4>

| field         | description     | type   | default      | required |
| ------------- | --------------- | ------ | ------------ | -------- |
| `url`         | Server URL      | string | <server_url> | true     |
| `description` | Project Version | string |              | false    |

<h4 id="requestOptions">requestOptions:</h4>

| option     | description       | type                  | default | required |
| ---------- | ----------------- | --------------------- | ------- | -------- |
| `example`  | Single Example    | any                   |         | false    |
| `examples` | Multiple Examples | object\<string, any\> |         | false    |

<h4 id="responseOptions">responseOptions:</h4>

| option     | description           | type                  | default | required |
| ---------- | --------------------- | --------------------- | ------- | -------- |
| `header`   | Joi Schema of Header  | string                |         | false    |
| `payload`  | Joi Schema of Payload | string                |         | false    |
| `example`  | Single Example        | any                   |         | false    |
| `examples` | Multiple Examples     | object\<string, any\> |         | false    |

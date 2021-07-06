import { RequestRoute, Server } from "hapi";

import schema from "./schema";

const defaultResponse = {
  200: {
    description: "OK",
  },
};

const getPaths = (
  server: Server,
  includeFn: (route: RequestRoute) => boolean
) => {
  const paths = {};
  server
    .table()
    .filter(includeFn)
    .forEach((route) => {
      const validate = route.settings.validate;
      if (!paths[route.path]) {
        paths[route.path] = {
          [route.method]: {
            description: route.settings.description,
            operationId: route.settings.id,
            ...((validate.headers || validate.query || validate.params) && {
              parameters: schema.getParameters(validate),
            }),
            ...(validate.payload && {
              requestBody: schema.getRequestBody(validate),
            }),
            responses: defaultResponse,
          },
        };
      }
    });

  return paths;
};

export default {
  getPaths,
};

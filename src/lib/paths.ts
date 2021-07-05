import { RequestRoute, Server } from "hapi";

import { getParametersSchema } from "./schema";

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
      if (!paths[route.path]) {
        paths[route.path] = {
          [route.method]: {
            description: route.settings.description,
            operationId: route.settings.id,
            parameters: getParametersSchema(route.settings.validate),
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

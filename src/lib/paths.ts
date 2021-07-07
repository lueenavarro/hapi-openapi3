import { RequestRoute, Server } from "hapi";

import fields from "./fields";

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
      const settings = route.settings;
      if (settings) {
        paths[route.path] = paths[route.path] || {};
        paths[route.path][route.method] = {
          description: settings.description,
          parameters: fields.getParameters(settings.validate),
          requestBody: fields.getRequestBody(settings.validate),
          responses: fields.getResponseBody(settings) || defaultResponse,
        };
      }
    });
  return paths;
};

export default {
  getPaths,
};

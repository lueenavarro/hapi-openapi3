import { RequestRoute, Server } from "hapi";

import parameters from "./parameters";
import requestBody from "./requestBody";
import response from "./response";

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
          parameters: parameters.get(settings.validate),
          requestBody: requestBody.get(settings.validate),
          responses: response.get(settings) || defaultResponse,
        };
      }
    });
  return paths;
};

export default {
  getPaths,
};

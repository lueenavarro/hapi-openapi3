import { RequestRoute, Server } from "hapi";
import { ServerPluginOptions } from "../types";

import parameters from "./parameters";
import requestBody from "./requestBody";
import response from "./response";

const defaultResponse = {
  200: {
    description: "OK",
  },
};

const get = (server: Server, options: ServerPluginOptions) => {
  const paths = {};
  server
    .table()
    .filter(options.includeFn)
    .forEach((route) => {
      const settings = route.settings;
      paths[route.path] = paths[route.path] || {};
      if (settings) {
        paths[route.path][route.method] = {
          description: settings.description,
          tags: [getTag(route, options)],
          parameters: parameters.get(settings.validate),
          requestBody: requestBody.get(settings.validate),
          responses: response.get(settings) || defaultResponse,
        };
      }
    });
  return paths;
};

const getTag = (route: RequestRoute, options: ServerPluginOptions) => {
  const paths = route.path.split("/").filter((val) => val !== "");
  const tagPaths = paths.slice(0, options.pathPrefixSize);
  return tagPaths.join("/");
};

export default {
  get,
};

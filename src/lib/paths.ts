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
    .filter((route) => isRouteIncluded(route, options))
    .forEach((route) => {
      route.path = options.pathFn ? options.pathFn(route.path) : route.path;
      paths[route.path] = paths[route.path] || {};

      const routeTags = {
        tags: [getTag(route, options)],
        responses: defaultResponse,
      };
      const settings = route.settings;
      const routeDetails = settings && {
        description: settings.description,
        parameters: parameters.get(
          settings.validate,
          options.singleSchemaInParams
        ),
        requestBody: requestBody.get(settings),
        responses: response.get(settings) || defaultResponse,
      };

      paths[route.path][route.method] = { ...routeTags, ...routeDetails };
    });
  return paths;
};

const isRouteIncluded = (route: RequestRoute, options: ServerPluginOptions) => {
  return options.includeFn(route) && route.path !== options.jsonPath;
};

const getTag = (route: RequestRoute, options: ServerPluginOptions) => {
  const paths = route.path.split("/").filter((val) => val !== "");
  const tagPaths = paths.slice(0, options.pathPrefixSize);
  return tagPaths.join("/");
};

export default {
  get,
};

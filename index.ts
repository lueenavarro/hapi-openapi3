import { Server } from "hapi";
import { builder, options } from "./src/lib";
import { ServerPluginOptions } from "./src/types";

import { name, version, description } from "./package.json";

export const pkg = {
  name,
  version,
  description,
};

export const register = async (server: Server, opts: ServerPluginOptions) => {
  opts = options.setDefault(opts);

  server.route({
    method: "GET",
    path: opts.jsonPath,
    handler: (request) => builder(request, opts),
  });
};

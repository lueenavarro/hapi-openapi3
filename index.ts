import { Server } from "hapi";
import { builder, options } from "./src/lib";
import { Options } from "./src/types";
import packageJson from "./package.json";

export const pkg = packageJson;
export const register = async (server: Server, opts: Options) => {
  opts = options.setDefault(opts);

  server.route({
    method: "GET",
    path: opts.jsonPath,
    handler: (request) => builder(request, opts),
  });
};

import { Server } from "hapi";
import { handler, options } from "./src/lib";
import { Options } from "./src/types";

module.exports = {
  pkg: require("./package.json"),
  register: async (server: Server, opts: Options) => {
    const { jsonPath } = options.setDefault(opts);

    server.route({
      method: "GET",
      path: jsonPath,
      handler,
    });
  },
};

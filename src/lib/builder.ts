import { Request } from "hapi";
import { ServerPluginOptions } from "../types";
import paths from "./paths";

const builder = (request: Request, options: ServerPluginOptions) => {
  return {
    openapi: "3.0.0",
    info: options.info,
    servers: options.servers || [{ url: getUrl(request) }],
    paths: paths.get(request.server, options),
  };
};

const getUrl = (request: Request) => {
  return (
    request.headers["x-forwarded-proto"] ||
    request.server.info.protocol + "://" + request.info.host
  );
};

export default builder;

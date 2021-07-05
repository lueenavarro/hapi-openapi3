import { Request } from "hapi";
import { Options } from "../types";
import paths from "./paths";

const builder = (request: Request, options: Options) => {
  return {
    openapi: "3.0.0",
    info: options.info,
    servers: options.servers || [{ url: getUrl(request) }],
    paths: paths.getPaths(request.server, options.includeFn),
  };
};

const getUrl = (request: Request) => {
  return (
    request.headers["x-forwarded-proto"] ||
    request.server.info.protocol + "://" + request.info.host
  );
};

export default builder;

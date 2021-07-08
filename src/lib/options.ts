import { ServerPluginOptions } from "../types";

const setDefault = (options: ServerPluginOptions): ServerPluginOptions => {
  return {
    jsonPath: "/openapi.json",
    pathPrefixSize: 1,
    ...options,
  };
};

export default { setDefault };

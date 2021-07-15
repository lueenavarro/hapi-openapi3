import { ServerPluginOptions } from "../types";

const setDefault = (options: ServerPluginOptions): ServerPluginOptions => {
  return {
    jsonPath: "/openapi.json",
    pathPrefixSize: 1,
    ignoreAlternativesInParams: false,
    info: {
      title: "Documentation Page",
      version: "1.0.0",
    },
    ...options,
  };
};

export default { setDefault };

import { Options } from "../types";

const setDefault = (options: Options): Options => {
  return {
    jsonPath: "/swagger.json",
    pathPrefixSize: 1,
    ...options,
  };
};

export default { setDefault };

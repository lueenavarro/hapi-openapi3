const getProp = (
  object: any,
  keys: string[] | string,
  defaultVal?: string
): any => {
  keys = Array.isArray(keys) ? keys : keys.split(".");
  object = object[keys[0]];
  if (object && keys.length > 1) {
    return getProp(object, keys.slice(1));
  }
  return object === undefined ? defaultVal : object;
};

export default {
  getProp,
};

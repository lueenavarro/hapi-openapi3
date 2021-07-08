const get = (
  object: any,
  keys: string[] | string,
  defaultVal?: string
): any => {
  keys = Array.isArray(keys) ? keys : keys.split(".");
  object = object[keys[0]];
  if (object && keys.length > 1) {
    return get(object, keys.slice(1), defaultVal);
  }

  return object === undefined ? defaultVal : object;
};

const isEmpty = (object: any) => {
  return Object.keys(object).length === 0;
};

const mapObject = (obj: any, fn: Function) =>
  Object.fromEntries(Object.entries(obj).map(([k, v], i) => [k, fn(v, k, i)]));

export default {
  get,
  isEmpty,
  mapObject,
};

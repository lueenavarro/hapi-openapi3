const getProp = (
  object: any,
  keys: string[] | string,
  defaultVal?: string,
  nullish: boolean = false
): any => {
  keys = Array.isArray(keys) ? keys : keys.split(".");
  object = object[keys[0]];
  if (object && keys.length > 1) {
    return getProp(object, keys.slice(1), defaultVal, nullish);
  }

  return object === undefined ? defaultVal : object;
};

const isEmpty = (object: any) => {
  return Object.keys(object).length === 0;
};

const mapObject = (obj: any, fn: Function) =>
  Object.fromEntries(Object.entries(obj).map(([k, v], i) => [k, fn(v, k, i)]));

export default {
  getProp,
  isEmpty,
  mapObject,
};

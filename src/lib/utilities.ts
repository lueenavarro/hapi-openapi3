const get = (object: any, keys: string[] | string, defaultVal?: any): any => {
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

const mapObject = (
  obj: any,
  fn: (value: any, key: any, index: number) => any
) =>
  Object.fromEntries(Object.entries(obj).map(([k, v], i) => [k, fn(v, k, i)]));

const uniq = (arr: any[]) => {
  return arr.filter(
    (v, i, a) =>
      a.findIndex((t) => JSON.stringify(t) === JSON.stringify(v)) === i
  );
};

export default {
  get,
  isEmpty,
  mapObject,
  uniq,
};

import { RouteOptionsValidate } from "hapi";
import { Schema } from "joi";

import schema from "./schema";

const get = (validators: RouteOptionsValidate) => {
  if (!validators.payload) return undefined;
  const joiDescription = (validators.payload as Schema).describe();
  const payloadSchema = schema.traverse(joiDescription);
  return { content: { "application/json": { schema: payloadSchema } } };
};

export default {
  get,
};

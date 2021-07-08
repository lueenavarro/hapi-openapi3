import { RouteOptionsValidate } from "hapi";
import { Schema } from "joi";

import schema from "./schema";

export const get = (validators: RouteOptionsValidate) => {
  const parameters = [
    ...mapParameters(validators.headers as Schema, "header"),
    ...mapParameters(validators.query as Schema, "query"),
    ...mapParameters(validators.params as Schema, "params"),
  ];

  if (parameters.length === 0) return undefined;

  return parameters;
};

const mapParameters = (joiSchema: Schema, paramIn: string) => {
  if (!joiSchema) return [];
  if (joiSchema.type !== "object") throw new Error("Invalid Parameter Schema");

  return Object.entries(joiSchema.describe().keys).map(
    ([key, subDescription]) => ({
      in: paramIn,
      name: key,
      schema: schema.traverseSchema(subDescription, {}),
      required: schema.isRequired(subDescription),
    })
  );
};

export default {
  get,
};

import { RouteOptionsValidate } from "hapi";
import { Schema } from "joi";

import schema from "./schema";

export const getParameters = (validators: RouteOptionsValidate) => {
  let parameters: any[] = [];

  if (validators.headers) {
    parameters = parameters.concat(
      mapParameters(validators.headers as Schema, "header")
    );
  }

  if (validators.query) {
    parameters = parameters.concat(
      mapParameters(validators.query as Schema, "query")
    );
  }

  if (validators.params) {
    parameters = parameters.concat(
      mapParameters(validators.params as Schema, "params")
    );
  }

  return parameters;
};

const mapParameters = (joiSchema: Schema, paramIn: string) => {
  if (joiSchema.type !== "object") throw new Error("Invalid Schema");

  return Object.entries(joiSchema.describe().keys).map(
    ([key, subDescription]) => ({
      in: paramIn,
      name: key,
      schema: schema.traverseSchema(subDescription, {}),
      required: schema.isRequired(subDescription),
    })
  );
};

export const getRequestBody = (validators: RouteOptionsValidate) => {
  const x = validators.payload
    ? schema.traverseSchema((validators.payload as Schema).describe(), {})
    : {};
  return { content: { "application/json": { schema: x } } };
};

export default {
  getParameters,
  getRequestBody,
};

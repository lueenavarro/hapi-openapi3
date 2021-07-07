import { RouteOptions, RouteOptionsValidate } from "hapi";
import { Schema } from "joi";
import status from "statuses";

import schema from "./schema";
import util from "./utilities";

export const getParameters = (validators: RouteOptionsValidate) => {
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

export const getRequestBody = (validators: RouteOptionsValidate) => {
  if (!validators.payload) return undefined;
  const joiDescription = (validators.payload as Schema).describe();
  const payloadSchema = schema.traverseSchema(joiDescription, {});
  return { content: { "application/json": { schema: payloadSchema } } };
};

export const getResponseBody = (routeOptions: RouteOptions) => {
  const statusCodes: Record<number, any> =
    routeOptions.response.status ||
    routeOptions.plugins["hapi-openapi3"]?.responses;
  if (!statusCodes) return undefined;

  const response = {};
  for (let [code, options] of Object.entries(statusCodes)) {
    response[code] = {
      description: options.description || status(parseInt(code, 10)),
      content: {
        "application/json": {
          schema: schema.traverseSchema(options.payload.describe(), {}),
          example: options.example,
          examples: options.examples && mapExamples(options.examples),
        },
      },
    };
  }
  return response;
};

const mapExamples = (examples: any) =>
  util.mapObject(examples, (example: any) => ({
    value: example,
  }));

export default {
  getParameters,
  getResponseBody,
  getRequestBody,
};

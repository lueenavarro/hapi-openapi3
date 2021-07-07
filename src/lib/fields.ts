import { RouteOptions, RouteOptionsValidate } from "hapi";
import { Schema } from "joi";
import status from "statuses";

import schema from "./schema";
import util from "./utilities";

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

  if (parameters.length === 0) return undefined;

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
  if (!validators.payload) return undefined;
  const payloadSchema = schema.traverseSchema(
    (validators.payload as Schema).describe(),
    {}
  );
  return { content: { "application/json": { schema: payloadSchema } } };
};

export const getResponseBody = (routeOptions: RouteOptions) => {
  const statusCodes: Record<number, any> =
    routeOptions.plugins["hapi-openapi3"]?.responses;
  if (!statusCodes) return undefined;

  const response = {};
  for (let [code, options] of Object.entries(statusCodes)) {
    response[code] = {
      description: status(parseInt(code, 10)),
      content: {
        "application/json": {
          schema: schema.traverseSchema(options.payload.describe(), {}),
          examples:
            options.examples &&
            util.mapObject(options.examples, (example: any) => ({
              value: example,
            })),
          example: options.example,
        },
      },
    };
  }
  return response;
};

export default {
  getParameters,
  getResponseBody,
  getRequestBody,
};

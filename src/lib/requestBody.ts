import { RouteOptions } from "hapi";
import Joi, { Schema } from "joi";

import schema from "./schema";
import logger from "./logger";
import { RoutePluginOptions } from "../types";

const get = (routeOptions: RouteOptions) => {
  const pluginRequest: RoutePluginOptions["request"] =
    routeOptions.plugins?.["hapi-openapi3"]?.request ?? {};
  validateRequestOptions(pluginRequest);

  if (!routeOptions.validate?.payload) return undefined;
  const joiDescription = (routeOptions.validate.payload as Schema).describe();
  const payloadSchema = schema.traverse(joiDescription);
  return {
    content: {
      "application/json": {
        schema: payloadSchema,
        example: pluginRequest.example,
        examples: pluginRequest.examples,
      },
    },
  };
};

const validateRequestOptions = (
  requestOptions: RoutePluginOptions["request"]
) => {
  const validator = Joi.object({
    example: Joi.any(),
    examples: Joi.object(),
  }).without("example", "examples");

  const result = validator.validate(requestOptions);
  if (result.error) {
    if (result.error) {
      logger.error("REQUEST_PLUGIN_OPTION_ERROR", result.error.message);
      throw result.error;
    }
  }
};

export default {
  get,
};

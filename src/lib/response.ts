import { RouteOptions, RouteOptionsResponse } from "hapi";
import Joi, { isSchema, Schema } from "joi";
import status from "statuses";
import { RoutePluginOptions } from "../types";

import schema from "./schema";
import _ from "./utilities";

const mapExamples = (examples: any) =>
  _.mapObject(examples, (example: any) => ({
    value: example,
  }));

export const get = (routeOptions: RouteOptions) => {
  const hapiResponse: RouteOptionsResponse = routeOptions.response ?? {};
  const customResponse: RoutePluginOptions["responses"] =
    routeOptions.plugins["hapi-openapi3"]?.responses ?? {};

  if (hapiResponse.schema)
    return mapResponseSchema(hapiResponse, customResponse, false);
  else if (hapiResponse.status) {
    return mapHapiResponseStatus(hapiResponse, customResponse);
  } else if (customResponse.schema) {
    return mapResponseSchema(hapiResponse, customResponse, true);
  } else if (customResponse.status) {
    return mapCustomResponseStatus(hapiResponse, customResponse);
  }

  return undefined;
};

const mapResponseSchema = (
  hapiResponse: RouteOptionsResponse,
  customResponse: RoutePluginOptions["responses"],
  useCustom: boolean
) => {
  validateResponseOptions(hapiResponse, customResponse);

  const defaultStatusCode = 200;
  const responseSchema = schema.traverseSchema(
    useCustom
      ? customResponse.schema.schema?.describe()
      : (hapiResponse.schema as Schema).describe()
  );

  if (!responseSchema) return undefined;
  return {
    [defaultStatusCode]: {
      content: {
        "application/json": {
          schema: responseSchema,
          example: customResponse.schema?.example,
          examples: customResponse.schema?.examples,
        },
      },
    },
  };
};

const mapHapiResponseStatus = (
  hapiResponse: RouteOptionsResponse,
  customResponse: RoutePluginOptions["responses"]
) => {
  const response = {};
  for (let [code, joiSchema] of Object.entries(hapiResponse.status)) {
    validateResponseOptions(hapiResponse, customResponse, code);

    const customResponseOptions = _.get(customResponse, ["status", code]);

    response[code] = {
      description: status(code),
      content: {
        "application/json": {
          schema: schema.traverseSchema((joiSchema as Schema).describe()),
          example: customResponseOptions?.example,
          examples:
            customResponseOptions?.examples &&
            mapExamples(customResponseOptions.examples),
        },
      },
    };
  }

  if (_.isEmpty(response)) return undefined;
  return response;
};

const mapCustomResponseStatus = (
  hapiResponse: RouteOptionsResponse,
  customResponse: RoutePluginOptions["responses"]
) => {
  const response = {};
  for (let [code, options] of Object.entries(customResponse.status)) {
    validateResponseOptions(hapiResponse, customResponse, code);

    response[code] = {
      description: options.description || status(code),
      content: {
        "application/json": {
          schema: schema.traverseSchema(options.schema?.describe()),
          example: options.example,
          examples: options.examples && mapExamples(options.examples),
        },
      },
    };
  }

  if (_.isEmpty(response)) return undefined;
  return response;
};

const validateResponseOptions = (
  hapiResponse: RouteOptionsResponse,
  customResponse: RoutePluginOptions["responses"],
  statusCode?: string
) => {
  const responseOptionValidator = Joi.object({
    schema: Joi.custom((value) => isSchema(value)),
    description: Joi.string(),
    example: Joi.any(),
    examples: Joi.object(),
  }).oxor("example", "examples");

  const validator = Joi.object({
    response: Joi.object({
      schema: Joi.custom((value) => isSchema(value)),
      status: Joi.custom((value) => isSchema(value)),
    }).without("schema", "status"),
    customResponse: Joi.object({
      schema: responseOptionValidator,
      status: responseOptionValidator,
    }).without("schema", "status"),
  })
    .oxor("response.schema", "customResponse.schema.schema")
    .oxor("response.status", "customResponse.status.schema")
    .when(
      Joi.object().or(
        "customResponse.schema.example",
        "customResponse.schema.examples"
      ),
      {
        then: Joi.object().or(
          "response.schema",
          "customResponse.schema.schema"
        ),
      }
    )
    .when(
      Joi.object().or(
        "customResponse.status.example",
        "customResponse.status.examples"
      ),
      {
        then: Joi.object().or(
          "response.status",
          "customResponse.status.schema"
        ),
      }
    );

  const result = validator.validate({
    response: {
      schema: _.get(hapiResponse, "schema") ?? undefined,
      status: _.get(hapiResponse, ["status", statusCode]) ?? undefined,
    },
    customResponse: {
      schema: _.get(customResponse, "schema") ?? undefined,
      status: _.get(customResponse, ["status", statusCode]) ?? undefined,
    },
  });

  if (result.error) {
    console.error(result.error);
    throw result.error;
  }
};

export default {
  get,
};

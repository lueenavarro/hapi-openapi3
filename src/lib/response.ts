import { RouteOptions, RouteOptionsResponse } from "hapi";
import Joi, { Schema, ValidationResult } from "joi";
import status from "statuses";

import schema from "./schema";
import logger from "./logger";
import _ from "./utilities";
import { RoutePluginOptions } from "../types";

const mapExamples = (examples: any) =>
  _.mapObject(examples, (example: any) => ({
    value: example,
  }));

export const get = (routeOptions: RouteOptions) => {
  const hapiResponse: RouteOptionsResponse = routeOptions.response ?? {};
  const pluginResponse: RoutePluginOptions["response"] =
    routeOptions.plugins?.["hapi-openapi3"]?.response ?? {};

  validateResponseOptions(hapiResponse, pluginResponse);

  if (hapiResponse.schema)
    return mapResponseSchema(hapiResponse, pluginResponse, false);
  else if (hapiResponse.status) {
    return mapHapiResponseStatus(hapiResponse, pluginResponse);
  } else if (pluginResponse.schema) {
    return mapResponseSchema(hapiResponse, pluginResponse, true);
  } else if (pluginResponse.status) {
    return mapCustomResponseStatus(pluginResponse);
  }

  return undefined;
};

const mapResponseSchema = (
  hapiResponse: RouteOptionsResponse,
  pluginResponse: RoutePluginOptions["response"],
  useCustom: boolean
) => {
  const defaultStatusCode = 200;
  const responseSchema = schema.traverse(
    useCustom
      ? pluginResponse.schema.payload?.describe()
      : (hapiResponse.schema as Schema).describe()
  );

  if (!responseSchema) return undefined;
  return {
    [defaultStatusCode]: {
      headers: parseHeader(pluginResponse.schema.header),
      content: {
        "application/json": {
          schema: responseSchema,
          example: pluginResponse.schema?.example,
          examples: pluginResponse.schema?.examples,
        },
      },
    },
  };
};

const mapHapiResponseStatus = (
  hapiResponse: RouteOptionsResponse,
  pluginResponse: RoutePluginOptions["response"]
) => {
  const response = {};
  for (let [code, joiSchema] of Object.entries(hapiResponse.status)) {
    const pluginResponseOptions = _.get(pluginResponse, ["status", code]);

    response[code] = {
      description: status(code),
      headers: parseHeader(pluginResponseOptions.header),
      content: {
        "application/json": {
          schema: schema.traverse((joiSchema as Schema).describe()),
          example: pluginResponseOptions?.example,
          examples:
            pluginResponseOptions?.examples &&
            mapExamples(pluginResponseOptions.examples),
        },
      },
    };
  }

  if (_.isEmpty(response)) return undefined;
  return response;
};

const mapCustomResponseStatus = (
  pluginResponse: RoutePluginOptions["response"]
) => {
  const response = {};
  for (let [code, options] of Object.entries(pluginResponse.status)) {
    response[code] = {
      headers: parseHeader(options.header),
      description: options.description || status(code),
      content: {
        "application/json": {
          schema: schema.traverse(options.payload?.describe()),
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
  pluginResponse: RoutePluginOptions["response"]
) => {
  const options = {
    response: {
      schema: _.get(hapiResponse, "schema") ?? undefined,
      status: _.get(hapiResponse, "status") ?? undefined,
    },
    pluginResponse: {
      schema: _.get(pluginResponse, "schema") ?? undefined,
      status: _.get(pluginResponse, "status") ?? undefined,
    },
  };

  const isJoiSchema = (value: any, helper: any, message: string) => {
    if (!(value instanceof Joi.constructor)) {
      return helper.message(message);
    }

    return true;
  };

  const pluginOptionValidator = (schemaErrorMessage: string) =>
    Joi.object({
      header: Joi.custom((value, helper) =>
        isJoiSchema(value, helper, "header" + schemaErrorMessage)
      ),
      payload: Joi.custom((value, helper) =>
        isJoiSchema(value, helper, "payload" + schemaErrorMessage)
      ),
      description: Joi.string(),
      example: Joi.any(),
      examples: Joi.object(),
    }).oxor("example", "examples");

  const validator = Joi.object({
    response: Joi.object({
      schema: Joi.custom((value, helper) =>
        isJoiSchema(value, helper, "response.schema is not a joi schema")
      ),
      status: Joi.object()
        .unknown()
        .pattern(
          /^/,
          Joi.custom((value, helper) =>
            isJoiSchema(value, helper, "response.status is not a joi schema")
          )
        ),
    }).without("schema", "status"),
    pluginResponse: Joi.object({
      schema: pluginOptionValidator("pluginReponse is not a joi schema"),
      status: Joi.object()
        .unknown()
        .pattern(
          /^/,
          pluginOptionValidator("pluginResponse.status is not a schema")
        ),
    }).without("schema", "status"),
  });

  const validatorResult = validator.validate(options);
  checkValidationResult(validatorResult);

  const schemaValidator = Joi.object()
    .oxor("response.schema", "pluginResponse.schema.payload")
    .when(
      Joi.object().or(
        "pluginResponse.schema.example",
        "pluginResponse.schema.examples"
      ),
      {
        then: Joi.object().or(
          "response.schema",
          "pluginResponse.schema.payload"
        ),
      }
    );
  const schemaValidatorResult = schemaValidator.validate(options);
  checkValidationResult(schemaValidatorResult);

  const statusValidator = (statusCode: string) =>
    Joi.object().oxor(
      `response.status.${statusCode}`,
      `pluginResponse.status.${statusCode}.payload`
    );

  if (pluginResponse.status) {
    Object.keys(pluginResponse.status).forEach((statusCode) => {
      const statusValidatorResult =
        statusValidator(statusCode).validate(options);
      checkValidationResult(statusValidatorResult);
    });
  }
};

const checkValidationResult = (result: ValidationResult) => {
  if (result.error) {
    logger.error("RESPONSE_PLUGIN_OPTION_ERROR", result.error.message);
    throw result.error;
  }
};

const parseHeader = (headerSchema: Schema) => {
  if (!headerSchema) return undefined;

  const headerDescription = headerSchema.describe();
  if (headerDescription.type !== "object") {
    const errorMessage = "header schema is not of type object";
    logger.error("RESPONSE_PLUGIN_OPTION_ERROR", errorMessage);
    throw new Error(errorMessage);
  }

  const headerProperties = headerSchema.describe().keys;
  if (!headerProperties) return undefined;

  return _.mapObject(headerProperties, (value) => ({
    schema: schema.traverse(value),
  }));
};

export default {
  get,
};

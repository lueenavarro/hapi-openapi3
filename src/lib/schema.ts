import { RouteOptionsValidate } from "hapi";
import { Description, Schema } from "joi";

import utils from "./utilities";

export const getParameters = (validators: RouteOptionsValidate) => {
  const parameters: any[] = [];

  if (validators.headers) {
    const description = (validators.headers as Schema).describe();
    traverseParameters(description, parameters, null, "header");
  }

  if (validators.query) {
    const description = (validators.query as Schema).describe();
    traverseParameters(description, parameters, null, "query");
  }

  if (validators.params) {
    const description = (validators.params as Schema).describe();
    traverseParameters(description, parameters, null, "params");
  }

  return parameters;
};

const traverseParameters = (
  description: Description,
  parameters: any[],
  descKey: string,
  paramIn: string
) => {
  if (!description.keys) {
    parameters.push({
      in: paramIn,
      name: descKey,
      schema: traverseSchema(description, {}),
      required: isRequired(description),
    });
    return;
  }

  Object.keys(description.keys).forEach((key) => {
    traverseParameters(description.keys[key], parameters, key, paramIn);
  });
};

export const getRequestBody = (validators: RouteOptionsValidate) => {
  const schema = validators.payload
    ? traverseSchema((validators.payload as Schema).describe(), {})
    : {};
  return { content: { "application/json": { schema } } };
};

const traverseSchema = (description: Description, apiSchema: any) => {
  try {
    if (description.keys) {
      apiSchema.type = "object";
      apiSchema.properties = {};
      for (let [key, childDescription] of Object.entries(description.keys)) {
        if (isRequired(childDescription)) {
          apiSchema.required = apiSchema.required || [];
          apiSchema.required.push(key);
        }
        apiSchema.properties[key] = traverseSchema(childDescription, {});
      }
      return apiSchema;
    } else if (description.items) {
      apiSchema.type = "array";
      for (let anotherDescription of description.items) {
        apiSchema.items = traverseSchema(anotherDescription, {});
      }
      return apiSchema;
    }

    defineFinalSchema(description, apiSchema);
    return apiSchema;
  } catch (error) {
    console.error(error);
  }
};

const defineFinalSchema = (description: Description, apiSchema: any) => {
  if (description.type === "date") {
    apiSchema.type = "string";
    apiSchema.format = "date-time";
    return;
  }
  apiSchema.type = description.type;
};

const isRequired = (description: Description) => {
  return utils.getProp(description, "flags.presence") === "required";
};

export default {
  getParameters,
  getRequestBody,
};

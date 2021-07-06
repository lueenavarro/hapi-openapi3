import { RouteOptionsValidate } from "hapi";
import { Description, GetRuleOptions, Schema } from "joi";

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

  return parameters;
};

const mapParameters = (joiSchema: Schema, paramIn: string) =>
  Object.entries(joiSchema.describe().keys).map(([key, subDescription]) => ({
    in: paramIn,
    name: key,
    schema: traverseSchema(subDescription, {}),
    required: isRequired(subDescription),
  }));

export const getRequestBody = (validators: RouteOptionsValidate) => {
  const schema = validators.payload
    ? traverseSchema((validators.payload as Schema).describe(), {})
    : {};
  return { content: { "application/json": { schema } } };
};

const traverseSchema = (joiDescription: Description, apiSchema: any) => {
  try {
    if (joiDescription.type === "object") {
      apiSchema.type = joiDescription.type;
      apiSchema.properties = {};
      for (let [key, subDescription] of Object.entries(joiDescription.keys)) {
        if (isRequired(subDescription)) {
          apiSchema.required = apiSchema.required || [];
          apiSchema.required.push(key);
        }
        apiSchema.properties[key] = traverseSchema(subDescription, {});
      }
    } else if (joiDescription.type === "array") {
      apiSchema.type = joiDescription.type;
      for (let subDescription of joiDescription.items) {
        apiSchema.items = traverseSchema(subDescription, {});
      }
    } else parseFinalSchema(joiDescription, apiSchema);

    return apiSchema;
  } catch (error) {
    console.error(error);
  }
};

const parseFinalSchema = (joiDescription: Description, apiSchema: any) => {
  // open api 3 does not have date type
  apiSchema.type = joiDescription.type;
  if (joiDescription.type === "date") parseDate(joiDescription, apiSchema);
  if (joiDescription.rules) parseRules(joiDescription, apiSchema);

  const hasEnum =
    joiDescription.allow && (joiDescription.flags as Record<string, any>)?.only;
  if (hasEnum) {
    apiSchema.enum = joiDescription.allow;
  }
};

const parseDate = (joiDescription: Description, apiSchema: any) => {
  const dateFormat = (joiDescription.flags as Record<string, any>)?.format;
  if (dateFormat === "timestamp" || dateFormat === "javascript") {
    apiSchema.type = "integer";
  } else if (dateFormat === "iso") {
    apiSchema.type = "string";
    apiSchema.format = "date-time";
  } else {
    apiSchema.type = "string";
    apiSchema.format = "date";
  }
};

const parseRules = (joiDescription: Description, apiSchema: any) => {
  const rulesMap = mapRules(joiDescription.rules);
  const pattern = rulesMap["pattern"];
  if (pattern) apiSchema.pattern = pattern.args.regex;
  const min = rulesMap["min"];
  if (min) {
    if (apiSchema.type === "string") apiSchema.minLength = min.args.limit;
    if (apiSchema.type === "number") apiSchema.min = min.args.limit;
  }
  const max = rulesMap["max"];
  if (max) {
    if (apiSchema.type === "string") apiSchema.maxLength = max.args.limit;
    if (apiSchema.type === "number") apiSchema.max = max.args.limit;
  }
};

const mapRules = (rules: GetRuleOptions[]) => {
  let rulesMap = {};
  rules.forEach((rule: GetRuleOptions) => {
    rulesMap[rule.name] = rule;
  });
  return rulesMap;
};

const isRequired = (joiDescription: Description) => {
  return util.getProp(joiDescription, "flags.presence") === "required";
};

export default {
  getParameters,
  getRequestBody,
};

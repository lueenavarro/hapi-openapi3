import { Description, GetRuleOptions } from "joi";

import util from "./utilities";

const traverseSchema = (joiDescription: Description, apiSchema: any) => {
  try {
    if (joiDescription.type === "object") {
      apiSchema.type = joiDescription.type;
      apiSchema.properties = {};
      parseRules(joiDescription, apiSchema);
      for (let [key, subDescription] of Object.entries(joiDescription.keys)) {
        if (isRequired(subDescription)) {
          apiSchema.required = apiSchema.required || [];
          apiSchema.required.push(key);
        }
        apiSchema.properties[key] = traverseSchema(subDescription, {});
      }
    } else if (joiDescription.type === "array") {
      apiSchema.type = joiDescription.type;
      parseRules(joiDescription, apiSchema);
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
  apiSchema.type = joiDescription.type;
  // open api 3 does not have date type
  if (joiDescription.type === "date") parseDate(joiDescription, apiSchema);
  parseRules(joiDescription, apiSchema);
  parseEnums(joiDescription, apiSchema);
  parseNullable(joiDescription, apiSchema);
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
  if (!apiSchema.type) throw new Error("ApiSchema type not defined");
  if (!joiDescription.rules) return;

  const rulesMap = mapRules(joiDescription.rules);
  const patterRule = rulesMap["pattern"];
  if (patterRule) apiSchema.pattern = patterRule.args.regex;
  const minRule = rulesMap["min"];
  if (minRule) {
    if (apiSchema.type === "string") apiSchema.minLength = minRule.args.limit;
    else if (apiSchema.type === "number") apiSchema.min = minRule.args.limit;
    else if (apiSchema.type === "array")
      apiSchema.minItems = minRule.args.limit;
    else if (apiSchema.type === "object")
      apiSchema.minProperties = minRule.args.limit;
  }
  const maxRule = rulesMap["max"];
  if (maxRule) {
    if (apiSchema.type === "string") apiSchema.maxLength = maxRule.args.limit;
    else if (apiSchema.type === "number") apiSchema.max = maxRule.args.limit;
    else if (apiSchema.type === "array")
      apiSchema.maxItems = maxRule.args.limit;
    else if (apiSchema.type === "object")
      apiSchema.maxProperties = maxRule.args.limit;
  }
};

const mapRules = (rules: GetRuleOptions[]): Record<string, any> => {
  let rulesMap = {};
  if (rules) {
    rules.forEach((rule: GetRuleOptions) => {
      rulesMap[rule.name] = rule;
    });
  }
  return rulesMap;
};

const parseEnums = (joiDescription: Description, apiSchema: any) => {
  const hasEnum =
    joiDescription.allow && (joiDescription.flags as Record<string, any>)?.only;
  if (!hasEnum) return;

  apiSchema.enum = joiDescription.allow.filter(
    (item: any) => !(item === null || item === "")
  );
};

const parseNullable = (joiDescription: Description, apiSchema: any) => {
  if (joiDescription.allow?.includes(null)) apiSchema.nullable = true;
};

const isRequired = (joiDescription: Description) => {
  return util.getProp(joiDescription, "flags.presence") === "required";
};

export default {
  isRequired,
  parseDate,
  parseEnums,
  parseRules,
  parseNullable,
  traverseSchema,
};

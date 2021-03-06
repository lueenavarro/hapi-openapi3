import { Description, GetRuleOptions } from "joi";

import _ from "./utilities";
import logger from "./logger";

const traverse = (
  joiDescription: Description,
  ignoreAlternatives = false,
  apiSchema: any = {}
) => {
  if (!joiDescription) return undefined;

  try {
    joiDescription.type =
      extendTypeName(joiDescription.type) || joiDescription.type;

    if (joiDescription.type === "object") {
      apiSchema.type = joiDescription.type;
      apiSchema.properties = {};
      parseObject(joiDescription, apiSchema);
      parseRules(joiDescription, apiSchema);
    } else if (joiDescription.type === "array") {
      apiSchema.type = joiDescription.type;
      parseArray(joiDescription, apiSchema);
      parseRules(joiDescription, apiSchema);
    } else if (joiDescription.type === "alternatives" && !ignoreAlternatives) {
      for (let match of joiDescription.matches) {
        apiSchema.anyOf = apiSchema.anyOf || [];
        match.then && apiSchema.anyOf.push(traverse(match.then));
        match.otherwise && apiSchema.anyOf.push(traverse(match.otherwise));
        match.schema && apiSchema.anyOf.push(traverse(match.schema));
      }
    } else parseFinalSchema(joiDescription, apiSchema);

    return apiSchema;
  } catch (error) {
    logger.error("SCHEMA_ERROR", error);
  }
};

const parseArray = (joiDescription: Description, apiSchema: any) => {
  if (joiDescription.items) {
    for (let subDescription of joiDescription.items) {
      apiSchema.items = traverse(subDescription);
    }
  }
};

const parseObject = (joiDescription: Description, apiSchema: any) => {
  if (joiDescription.keys) {
    for (let [key, subDescription] of Object.entries(joiDescription.keys)) {
      if (isRequired(subDescription)) {
        apiSchema.required = apiSchema.required || [];
        apiSchema.required.push(key);
      }
      apiSchema.properties[key] = traverse(subDescription);
    }
  }
};

const parseFinalSchema = (joiDescription: Description, apiSchema: any) => {
  if (["string", "boolean", "number"].includes(joiDescription.type)) {
    apiSchema.type = joiDescription.type;
  } else if (joiDescription.type === "date") {
    // open api 3 does not have date type
    parseDate(joiDescription, apiSchema);
  } else if (["link", "symbol", "binary"].includes(joiDescription.type)) {
    apiSchema.type = "string";
    apiSchema.format = joiDescription.type;
  }

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
  if (!apiSchema.type) return;
  if (!joiDescription.rules) return;

  const rulesMap = mapRules(joiDescription.rules);
  const patterRule = rulesMap["pattern"];
  if (patterRule)
    apiSchema.pattern = patterRule.args.regex
      .replace(/^\//, "")
      .replace(/\/$/, "");
  const minRule = rulesMap["min"];
  if (minRule) {
    if (apiSchema.type === "string") apiSchema.minLength = minRule.args.limit;
    else if (apiSchema.type === "number")
      apiSchema.minimum = minRule.args.limit;
    else if (apiSchema.type === "array")
      apiSchema.minItems = minRule.args.limit;
    else if (apiSchema.type === "object")
      apiSchema.minProperties = minRule.args.limit;
  }
  const maxRule = rulesMap["max"];
  if (maxRule) {
    if (apiSchema.type === "string") apiSchema.maxLength = maxRule.args.limit;
    else if (apiSchema.type === "number")
      apiSchema.maximum = maxRule.args.limit;
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

const extendTypeName = (type: string) => {
  const shortcutsMap = {
    bool: "boolean",
    func: "function",
    alt: "alternatives",
  };
  if (shortcutsMap[type]) return shortcutsMap[type];
};

const isRequired = (joiDescription: Description) => {
  return _.get(joiDescription, "flags.presence") === "required";
};

export default {
  isRequired,
  parseDate,
  parseEnums,
  parseRules,
  parseNullable,
  traverse,
};

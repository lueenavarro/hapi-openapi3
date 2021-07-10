import { RouteOptionsValidate } from "hapi";
import { Description, Schema } from "joi";

import schema from "./schema";
import _ from "./utilities";

export const get = (validators: RouteOptionsValidate) => {
  const parameters = [
    ...mapParameters(describeSchema(validators.headers), "header"),
    ...mapParameters(describeSchema(validators.query), "query"),
    ...mapParameters(describeSchema(validators.params), "params"),
  ];

  if (parameters.length === 0) return undefined;

  return parameters;
};

const mapParameters = (joiDescription: Description, paramIn: string) => {
  if (!joiDescription) return [];
  if (joiDescription.type === "object") {
    return Object.entries(joiDescription.keys).map(([key, subDescription]) => ({
      in: getIn(paramIn),
      name: key,
      schema: schema.traverseSchema(subDescription),
      required: schema.isRequired(subDescription),
    }));
  } else if (joiDescription.type === "alternatives") {
    const collector: any[] = [];
    for (let match of joiDescription.matches) {
      collector.push(...mapParameters(match.then, paramIn));
      collector.push(...mapParameters(match.otherwise, paramIn));
      collector.push(...mapParameters(match.schema, paramIn));
    }

    // remove params that are exactly the same
    const params = _.uniq(collector);

    // join schemas of params that have the same name
    return params
      .map((param, index, thisArr) => {
        if (param.processed) return undefined;

        const duplicates = thisArr.filter(
          (otherParam, otherIndex) =>
            otherParam.name === param.name && otherIndex !== index
        );

        if (duplicates.length > 0) {
          const duplicatesSchema = duplicates.map((duplicate) => {
            duplicate.processed = true;
            return duplicate.schema;
          });

          param.schema = {
            anyOf: [param.schema].concat(duplicatesSchema),
          };
        }

        // always mark params in alternatives as not required
        param.required = false;

        return param;
      })
      .filter((param) => param);
  }
};

const getIn = (paramIn: string) => {
  if (paramIn === "params") return "path";
  return paramIn;
};

const describeSchema = (sch: any) => {
  return (sch as Schema)?.describe();
};

export default {
  get,
};

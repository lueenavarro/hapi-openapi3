import { RouteOptionsValidate } from "hapi";
import { Description, Schema } from "joi";

import util from "./utilities";

export const getParametersSchema = (validators: RouteOptionsValidate) => {
  const schemas: any[] = [];

  if (validators.headers) {
    const description = (validators.headers as Schema).describe();
    traverseParameter(description, schemas, null, "header");
  }

  if (validators.query) {
    const description = (validators.query as Schema).describe();
    traverseParameter(description, schemas, null, "query");
  }

  if (validators.params) {
    const description = (validators.params as Schema).describe();
    traverseParameter(description, schemas, null, "params");
  }

  return schemas;
};

const traverseParameter = (
  description: Description,
  schemas: any[],
  key: string,
  paramIn: string
) => {
  if (!description.keys) {
    schemas.push({
      in: paramIn,
      name: key,
      schema: {
        type: description.type,
      },
      required: util.getProp(description, "flags.presence") === "required",
    });
    return;
  }

  const descriptionKeys = Object.keys(description.keys);
  descriptionKeys.forEach((descKey) => {
    traverseParameter(description.keys[descKey], schemas, descKey, paramIn);
  });
};

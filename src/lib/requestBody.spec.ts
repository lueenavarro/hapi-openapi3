import Joi from "joi";
import sinon from "sinon";
import { expect } from "chai";

import requestBody from "./requestBody";
import schema from "./schema";

describe("requestBody.ts", () => {
  beforeEach(() => sinon.restore());

  describe("get", () => {
    it("should return request body with examples", () => {
      const mockValidators = {
        validate: {
          payload: Joi.object(),
        },
        plugins: {
          "hapi-openapi3": {
            request: { examples: { firstExample: {}, secondExample: null } },
          },
        },
      };

      sinon.stub(schema, "traverse").returns({ type: "object" });

      const result = requestBody.get(mockValidators);
      const content = result.content["application/json"];

      expect(content.schema.type).to.equal("object");
      expect(content.examples.firstExample).to.eql({});
    });

    it("should throw error on request option conflict", () => {
      const mockValidators = {
        plugins: {
          "hapi-openapi3": {
            request: {
              examples: {},
              example: {},
            },
          },
        },
      };

      let error;
      try {
        requestBody.get(mockValidators);
      } catch (err) {
        error = err;
      }

      expect(error).to.be.an("error");
    });

    it("should return undefined", () => {
      const mockValidators = {};
      const result = requestBody.get(mockValidators);
      expect(result).to.be.undefined;
    });
  });
});

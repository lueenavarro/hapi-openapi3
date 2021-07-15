import Joi from "joi";
import sinon from "sinon";
import { expect } from "chai";

import parameters from "./parameters";
import schema from "./schema";

describe("parameters.ts", () => {
  beforeEach(() => sinon.restore());

  describe("get", () => {
    it("should map validators", () => {
      const mockValidators = {
        headers: Joi.object({
          authorization: Joi.string(),
        }),
        query: Joi.object({
          sort: Joi.number(),
        }),
        params: Joi.object({
          id: Joi.string(),
        }),
      };

      const mockOption = {
        singleSchemaInParams: false,
        includeFn: () => true,
      };

      sinon.stub(schema, "traverse").returns({ type: "string" });
      sinon.stub(schema, "isRequired").returns(true);

      const result = parameters.get(mockValidators, mockOption);

      expect(result[0]).to.eql({
        in: "header",
        name: "authorization",
        schema: {
          type: "string",
        },
        required: true,
      });
      expect(result[1]).to.eql({
        in: "query",
        name: "sort",
        schema: {
          type: "string",
        },
        required: true,
      });
      expect(result[2]).eql({
        in: "path",
        name: "id",
        schema: {
          type: "string",
        },
        required: true,
      });
    });

    it("should map validators of type alternatives", () => {
      const mockValidators = {
        query: Joi.alternatives(
          Joi.object({
            x: Joi.string(),
          }),
          Joi.object({
            x: Joi.number(),
          })
        ),
      };

      const mockOption = {
        singleSchemaInParams: false,
        includeFn: () => true,
      };

      const traverseStube = sinon.stub(schema, "traverse");
      traverseStube.onCall(0).returns({ type: "string" });
      traverseStube.onCall(1).returns({ type: "number" });
      sinon.stub(schema, "isRequired").returns(true);

      const result = parameters.get(mockValidators, mockOption);

      expect(result).to.eql([
        {
          in: "query",
          name: "x",
          schema: { anyOf: [{ type: "string" }, { type: "number" }] },
          required: false,
        },
      ]);
      expect(result.every((param) => param.required)).to.equal(false);
    });

    it("should ignore params of type alternatives", () => {
      const mockValidators = {
        query: Joi.alternatives(
          Joi.object({
            x: Joi.string(),
          }),
          Joi.object({
            x: Joi.number(),
          })
        ),
      };

      const mockOption = {
        singleSchemaInParams: true,
        includeFn: () => true,
      };

      sinon.stub(schema, "isRequired").returns(true);

      const result = parameters.get(mockValidators, mockOption);
      expect(result).to.equal(undefined);
    });
  });
});

import sinon from "sinon";
import { expect } from "chai";

import schema from "./schema";
import Joi from "joi";

describe("schema.ts", () => {
  beforeEach(() => sinon.restore());
  describe("isRequired", () => {
    it("should return true", () => {
      const mockDescription = {
        type: "string",
        flags: { presence: "required" },
      };
      const result = schema.isRequired(mockDescription);
      expect(result).to.equal(true);
    });
    it("should return false", () => {
      const mockDescription = {
        type: "string",
        flags: {},
      };
      const result = schema.isRequired(mockDescription);
      expect(result).to.equal(false);
    });
  });

  describe("traverse", () => {
    it("should parse nested objects", () => {
      const mockDescription = Joi.object({
        x: Joi.object({
          y: Joi.array().items({
            z: Joi.string().required(),
          }),
        }),
      }).describe();
      const result = schema.traverse(mockDescription);
      expect(result).to.eql({
        type: "object",
        properties: {
          x: {
            type: "object",
            properties: {
              y: {
                type: "array",
                items: {
                  type: "object",
                  properties: { z: { type: "string" } },
                  required: ["z"],
                },
              },
            },
          },
        },
      });
    });

    it("should parse dates", () => {
      const mockDateIso = Joi.date().iso().describe();
      const mockDateTimeStamp = Joi.date().timestamp().describe();
      const mockDate = Joi.date().describe();

      expect(schema.traverse(mockDateTimeStamp)).to.eql({
        type: "integer",
      });
      expect(schema.traverse(mockDateIso)).eql({
        type: "string",
        format: "date-time",
      });
      expect(schema.traverse(mockDate)).to.eql({
        type: "string",
        format: "date",
      });
    });

    it("should parse nullable", () => {
      const mockNullable = Joi.string().allow(null).describe();

      expect(schema.traverse(mockNullable)).to.eql({
        type: "string",
        nullable: true,
      });
    });

    it("should parse enums", () => {
      const mockNullable = Joi.string().valid("x", "y").describe();

      expect(schema.traverse(mockNullable)).to.eql({
        type: "string",
        enum: ["x", "y"],
      });
    });

    it("should parse other types of string", () => {
      const mockLink = Joi.link().describe();
      const mockSymbol = Joi.symbol().describe();
      const mockBinary = Joi.binary().describe();

      const linkResult = schema.traverse(mockLink);
      const symbolResult = schema.traverse(mockSymbol);
      const binaryResult = schema.traverse(mockBinary);

      expect(linkResult.type).to.equal("string");
      expect(linkResult.format).to.equal("link");
      expect(symbolResult.type).to.equal("string");
      expect(symbolResult.format).to.equal("symbol");
      expect(binaryResult.type).to.equal("string");
      expect(binaryResult.format).to.equal("binary");
    });

    it("should parse rules", () => {
      const mockMinStr = Joi.string().min(2).describe();
      const mockMinArr = Joi.array().min(2).describe();
      const mockMinNum = Joi.number().min(2).describe();
      const mockMinObj = Joi.object().min(2).describe();
      const mockMaxStr = Joi.string().max(3).describe();
      const mockMaxArr = Joi.array().max(3).describe();
      const mockMaxNum = Joi.number().max(3).describe();
      const mockMaxObj = Joi.object().max(3).describe();
      const mockPattern = Joi.string().pattern(/.+/).describe();

      const minStrResult = schema.traverse(mockMinStr);
      const minArrResult = schema.traverse(mockMinArr);
      const minNumResult = schema.traverse(mockMinNum);
      const minObjResult = schema.traverse(mockMinObj);
      const maxStrResult = schema.traverse(mockMaxStr);
      const maxArrResult = schema.traverse(mockMaxArr);
      const maxNumResult = schema.traverse(mockMaxNum);
      const maxObjResult = schema.traverse(mockMaxObj);
      const patternResult = schema.traverse(mockPattern);

      expect(minStrResult.minLength).to.equal(2);
      expect(minArrResult.minItems).to.equal(2);
      expect(minNumResult.minimum).to.equal(2);
      expect(minObjResult.minProperties).to.equal(2);
      expect(maxStrResult.maxLength).to.equal(3);
      expect(maxArrResult.maxItems).to.equal(3);
      expect(maxNumResult.maximum).to.equal(3);
      expect(maxObjResult.maxProperties).to.equal(3);
      expect(patternResult.pattern).to.equal("/.+/");
    });

    it("should parse alternatives", () => {
      const mockAlteratives = Joi.alternatives(Joi.string(), Joi.number())
        .conditional(Joi.object({}), {
          then: Joi.date().iso(),
          otherwise: Joi.string(),
        })
        .describe();
      const alternativeResults = schema.traverse(mockAlteratives);
      expect(alternativeResults.anyOf).to.eql([
        { type: "string" },
        { type: "number" },
        { type: "string", format: "date-time" },
        { type: "string" },
      ]);
    });

    it("should ignore alternatives", () => {
      const mockAlteratives = Joi.alternatives(Joi.string(), Joi.number())
        .conditional(Joi.object({}), {
          then: Joi.date().iso(),
          otherwise: Joi.string(),
        })
        .describe();
      const alternativeResults = schema.traverse(mockAlteratives, true);
      expect(alternativeResults).to.eql({});
    });

    it("should return undefined", () => {
      expect(schema.traverse(null)).to.be.undefined;
    });
  });
});

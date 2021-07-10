import Joi from "joi";
import sinon from "sinon";
import { expect } from "chai";

import requestBody from "./requestBody";
import schema from "./schema";

describe("requestBody.ts", () => {
  beforeEach(() => sinon.restore());

  describe("get", () => {
    it("should return request body", () => {
      const mockValidators = {
        payload: Joi.object(),
      };

      sinon.stub(schema, "traverse").returns({ type: "object" });

      const result = requestBody.get(mockValidators);

      expect(result).to.eql({
        content: { "application/json": { schema: { type: "object" } } },
      });
    });
  });
});

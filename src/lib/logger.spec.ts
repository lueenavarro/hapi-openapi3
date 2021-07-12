import { expect } from "chai";
import sinon from "sinon";

import logger from "./logger";

describe("logger.ts", () => {
  describe("error", () => {
    it("should log error", () => {
      const consoleStub = sinon.stub(console, "error");

      logger.error("RESPONSE_PLUGIN_OPTION_ERROR", "Random error message");

      expect(consoleStub.firstCall.args[0]).to.equal("HAPI_OPENAPI3_ERROR: ");
      expect(consoleStub.firstCall.args[1]).to.eql({
        type: "RESPONSE_PLUGIN_OPTION_ERROR",
        message: "Random error message",
      });
    });
  });
});

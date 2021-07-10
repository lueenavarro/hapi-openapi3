import { expect } from "chai";
import options from "./options";

describe("options.ts", () => {
  describe("setDefault", () => {
    it("should return default options", () => {
      const serverOptions = {
        includeFn: () => true,
      };
      const result = options.setDefault(serverOptions);
      expect(result.info.title).to.equal("Documentation Page");
      expect(result.info.version).to.equal("1.0.0");
      expect(result.jsonPath).to.equal("/openapi.json");
      expect(result.pathPrefixSize).to.equal(1);
    });
  });
});

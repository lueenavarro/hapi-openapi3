import sinon from "sinon";
import { expect } from "chai";

import builder from "./builder";
import paths from "./paths";

describe("builder.ts", () => {
  beforeEach(() => sinon.restore());

  describe("builder", () => {
    it("should add options to builder results", () => {
      const mockRequest: any = {
        server: {},
      };

      const mockOptions = {
        info: {
          title: "Mock Title",
          version: "1.0.0",
        },
        servers: [],
        includeFn: () => true,
      };

      sinon.stub(paths, "get").returns([]);

      const result = builder(mockRequest, mockOptions);

      expect(result.openapi).to.equal("3.0.0");
      expect(result.info.title).to.equal("Mock Title");
      expect(result.servers).to.eql([]);
    });

    it("should add default server", () => {
      const mockRequest: any = {
        headers: {},
        server: { info: { protocol: "http" } },
        info: {
          host: "localhost:4000",
        },
      };

      sinon.stub(paths, "get").resolves([]);

      const result = builder(mockRequest, {} as any);

      expect(result.servers).to.eql([{ url: "http://localhost:4000" }]);
    });

    it("should give host when using serversFn option", () => {
      const mockRequest: any = {
        headers: {},
        server: { info: { protocol: "http" } },
        info: {
          host: "localhost:4000",
        },
      };

      sinon.stub(paths, "get").resolves([]);

      const result = builder(mockRequest, {
        serversFn: (url) => [{ url: url + "/basePath" }],
        includeFn: () => true,
      });

      expect(result.servers).to.eql([
        { url: "http://localhost:4000/basePath" },
      ]);
    });

    it("should use x-forwarded-proto ", () => {
      const mockRequest: any = {
        headers: {
          "x-forwarded-proto": "https://example.com",
        },
        server: { info: { protocol: "http" } },
        info: {
          host: "localhost:4000",
        },
      };

      sinon.stub(paths, "get").returns([]);

      const result = builder(mockRequest, {} as any);

      expect(result.servers).to.eql([{ url: "https://example.com" }]);
    });
  });
});

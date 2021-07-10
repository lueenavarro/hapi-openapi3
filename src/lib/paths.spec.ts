import { expect } from "chai";
import sinon from "sinon";

import paths from "./paths";
import parameters from "./parameters";
import requestBody from "./requestBody";
import response from "./response";
import Joi from "joi";

describe("paths.ts", () => {
  beforeEach(() => sinon.restore());

  describe("get", () => {
    it("should return paths", () => {
      const mockServer: any = {
        table: () => {
          return [
            { path: "/first-route", method: "get" },
            { path: "/first-route", method: "post" },
            { path: "/second-route", method: "get" },
          ];
        },
      };
      const mockOptions = {
        includeFn: () => true,
        pathPrefixSize: 2,
      };

      sinon.stub(parameters, "get").returns(undefined);
      sinon.stub(requestBody, "get").returns(undefined);
      sinon.stub(response, "get").returns(undefined);

      const result = paths.get(mockServer, mockOptions);
      expect(result["/first-route"].get.tags).to.eql(["first-route"]);
      expect(result["/first-route"].get.responses).to.eql({
        200: {
          description: "OK",
        },
      });
      expect(result["/first-route"].post.tags).to.eql(["first-route"]);
      expect(result["/second-route"].get.tags).to.eql(["second-route"]);
    });

    it("should add properties when route.settings is present", () => {
      const mockServer: any = {
        table: () => {
          return [
            {
              path: "/first-route",
              method: "get",
              settings: {
                description: "First route",
                validate: {
                  authorization: Joi.object(),
                },
                response: Joi.object(),
              },
            },
          ];
        },
      };
      const mockOptions = {
        includeFn: () => true,
      };

      sinon.stub(parameters, "get").returns([
        {
          in: "header",
          name: "authorization",
          schema: { type: "object" },
          required: true,
        },
      ]);
      sinon.stub(requestBody, "get").returns(undefined);
      sinon.stub(response, "get").returns({
        200: {
          content: { "application/json": { schema: { type: "object" } } },
        },
      });

      const result = paths.get(mockServer, mockOptions);
      expect(result["/first-route"].get.description).to.equal("First route");
      expect(result["/first-route"].get.responses[200].content).to.not.be
        .undefined;
    });
  });
});

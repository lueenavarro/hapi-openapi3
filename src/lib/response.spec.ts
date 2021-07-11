import Joi from "joi";
import sinon from "sinon";
import { expect } from "chai";

import response from "./response";
import _ from "./utilities";

describe("response.ts", () => {
  beforeEach(() => sinon.restore());

  describe("get", () => {
    it("should map hapi response schema", () => {
      const mockRouteOption: any = {
        response: {
          schema: Joi.object(),
        },
        plugins: {
          "hapi-openapi3": {
            response: {
              schema: {
                example: {},
              },
            },
          },
        },
      };

      const result = response.get(mockRouteOption);
      const content = _.get(result, ["200", "content", "application/json"]);

      expect(content.schema.type).to.equal("object");
      expect(content.example).to.eql({});
    });

    it("should map custom schema", () => {
      const mockRouteOption: any = {
        plugins: {
          "hapi-openapi3": {
            response: {
              schema: {
                schema: Joi.object(),
                example: {},
              },
            },
          },
        },
      };

      const result = response.get(mockRouteOption);
      const content = _.get(result, ["200", "content", "application/json"]);

      expect(content.schema.type).to.equal("object");
      expect(content.example).to.eql({});
    });

    it("should map hapi status", () => {
      const mockRouteOption: any = {
        response: {
          status: {
            201: Joi.object(),
          },
        },
        plugins: {
          "hapi-openapi3": {
            response: {
              status: {
                201: {
                  examples: {
                    firstExample: {},
                    secondExample: null,
                  },
                },
              },
            },
          },
        },
      };

      const result = response.get(mockRouteOption);
      const content = _.get(result, ["201", "content", "application/json"]);

      expect(content.schema.type).to.equal("object");
      expect(content.examples.firstExample.value).to.eql({});
      expect(content.examples.secondExample.value).to.equal(null);
    });

    it("should map custom response status", () => {
      const mockRouteOption: any = {
        plugins: {
          "hapi-openapi3": {
            response: {
              status: {
                201: {
                  schema: Joi.object(),
                  examples: {
                    firstExample: {},
                    secondExample: null,
                  },
                },
              },
            },
          },
        },
      };

      const result = response.get(mockRouteOption);
      const content = _.get(result, ["201", "content", "application/json"]);

      expect(content.schema.type).to.equal("object");
      expect(content.examples.firstExample.value).to.eql({});
      expect(content.examples.secondExample.value).to.equal(null);
    });

    it("should throw error on response option conflict", () => {
      const mockRouteOption: any = {
        response: {
          schema: Joi.object(),
        },
        plugins: {
          "hapi-openapi3": {
            response: {
              schema: {
                schema: Joi.object(),
                example: {},
              },
            },
          },
        },
      };

      let error: any;
      try {
        response.get(mockRouteOption);
      } catch (err) {
        error = err;
      }

      expect(error).to.be.an("error");
    });

    it("should throw error on response option conflict", () => {
      const mockRouteOption: any = {
        plugins: {
          "hapi-openapi3": {
            response: {
              schema: {
                schema: Joi.object(),
              },
              status: {
                201: {
                  schema: Joi.number(),
                },
              },
            },
          },
        },
      };

      let error: any;
      try {
        response.get(mockRouteOption);
      } catch (err) {
        error = err;
      }

      expect(error).to.be.an("error");
    });

    it("should throw error on response option conflict", () => {
      const mockRouteOption: any = {
        response: {
          status: {
            201: Joi.object(),
          },
        },
        plugins: {
          "hapi-openapi3": {
            response: {
              status: {
                201: {
                  schema: Joi.number(),
                },
              },
            },
          },
        },
      };

      let error: any;
      try {
        response.get(mockRouteOption);
      } catch (err) {
        error = err;
      }

      expect(error).to.be.an("error");
    });

    it("should return undefined", () => {
      const mockRouteOption = {};
      const result = response.get(mockRouteOption);
      expect(result).to.be.undefined;
    });
  });
});

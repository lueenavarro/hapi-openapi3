import { expect } from "chai";

import _ from "./utilities";

describe("utilities.ts", () => {
  describe("get", () => {
    it("should return value", () => {
      const mockObject = {
        flags: {
          presence: true,
        },
      };

      const resultDot = _.get(mockObject, "flags.presence");
      const resultArr = _.get(mockObject, ["flags", "presence"]);
      const resultDef = _.get(mockObject, "info", false);

      expect(resultDot).to.equal(true);
      expect(resultArr).to.equal(true);
      expect(resultDef).to.equal(false);
    });
  });

  describe("isEmpty", () => {
    it("should return true", () => {
      const mockObject = {};
      const result = _.isEmpty(mockObject);
      expect(result).to.equal(true);
    });

    it("should return false", () => {
      const mockObject = { name: "Louie" };
      const result = _.isEmpty(mockObject);
      expect(result).to.equal(false);
    });
  });

  describe("mapObject", () => {
    it("should map object", () => {
      const mockObject = { isComplete: false };
      const result = _.mapObject(mockObject, (value) => ({ value }));
      expect(result.isComplete.value).to.equal(false);
    });
  });

  describe("uniq", () => {
    it("remove duplicate object", () => {
      const mockObject = [
        { name: "Louie" },
        { name: "Louie" },
        { name: "John" },
      ];
      const result = _.uniq(mockObject);
      expect(result).to.eql([{ name: "Louie" }, { name: "John" }]);
    });
  });
});

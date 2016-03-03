import { expect } from "chai";
import Sample from "../source/main";

describe("Sample Class", () => {
    it("Should set message when an instance is created", () => {
        let expected = "world!";
        let sample = new Sample(expected);
        expect(sample.message).eql(expected);
    });
    // it("Should greate", () => {

    // });
});


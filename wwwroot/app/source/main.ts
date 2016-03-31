/**
 * Sample
 */
import * as $ from "jquery";

class Sample {
    public message: string;
    constructor(message: string) {
        this.message = message;
    }
}

$("body").html(`<h1>Hello</h1>`);
export default Sample;


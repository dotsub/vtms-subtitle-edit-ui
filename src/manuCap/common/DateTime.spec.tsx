import moment from "moment";
import DateTime from "./DateTime";
import { render } from "@testing-library/react";

describe("DateTime", () => {
    afterEach(() => {
        Object.defineProperty(navigator, "languages", {
            get() { return [ "en" ]; },
            configurable: true
        });
    });

    it("renders date and time in default locale", () => {
        // GIVEN
        const dateTime = "2016-08-17T12:34:33Z";
        const expectedTime = moment(dateTime).format("LT");
        const expectedDate = moment(dateTime).format("L");
        const expectedNode = render(<span>{`${expectedDate}, ${expectedTime}`}</span>);

        // WHEN
        const actualNode = render(<DateTime value={dateTime} />);

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders empty span with undefined dateTime", () => {
        // GIVEN
        const dateTime = undefined;
        const expectedNode = render(<span />);

        // WHEN
        const actualNode = render(<DateTime value={dateTime} />);

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders empty span with no dateTime value", () => {
        // GIVEN
        const expectedNode = render(<span />);

        // WHEN
        const actualNode = render(<DateTime />);

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders date and time in 'de' locale", () => {
        // GIVEN
        Object.defineProperty(navigator, "languages", {
            get() { return [ "de" ]; },
            configurable: true
        });
        const dateTime = "2016-08-17T12:34:33Z";
        const expectedTime = moment(dateTime).locale("de").format("LT");
        const expectedDate = moment(dateTime).locale("de").format("L");
        const expectedNode = render(<span>{`${expectedDate}, ${expectedTime}`}</span>);

        // WHEN
        const actualNode = render(<DateTime value={dateTime} />);

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });
});

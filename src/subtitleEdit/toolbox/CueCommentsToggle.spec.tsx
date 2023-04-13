import "../../testUtils/initBrowserEnvironment";
import { Provider } from "react-redux";
import { fireEvent, render } from "@testing-library/react";
import { createTestingStore } from "../../testUtils/testingStore";
import CueCommentsToggle from "./CueCommentsToggle";

jest.mock("lodash", () => ({
    debounce: (callback: Function): Function => callback
}));

let testingStore = createTestingStore();

describe("CueCommentsToggle", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
    });

    it("renders", () => {
        // GIVEN
        const expectedNode = render(
            <button type="button" className="flex items-center justify-between">
                <span>
                    <i className="w-7 fa-duotone fa-comments text-blue-primary" />
                    <span>Comments</span>
                </span>
                <span className="sbte-badge font-medium sbte-badge-sm sbte-badge-secondary">HIDDEN</span>
            </button>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueCommentsToggle onClick={jest.fn()} />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("changes icon/text on toggle", () => {
        // GIVEN
        const expectedNode = render(
            <button
                type="button"
                className="flex items-center justify-between outline-0 active"
            >
                <span>
                    <i className="w-7 fa-duotone fa-comments text-blue-primary" />
                    <span>Comments</span>
                </span>
                <span className="sbte-badge font-medium sbte-badge-sm sbte-badge-success">SHOWN</span>
            </button>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueCommentsToggle onClick={jest.fn()} />
            </Provider>
        );
        fireEvent.click(actualNode.container.querySelector("button") as Element);

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("toggles show comments in store on toggle", () => {
        // GIVEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueCommentsToggle onClick={jest.fn()} />
            </Provider>
        );

        // WHEN
        fireEvent.click(actualNode.container.querySelector("button") as Element);

        // THEN
        expect(testingStore.getState().commentsVisible).toEqual(true);
    });
});

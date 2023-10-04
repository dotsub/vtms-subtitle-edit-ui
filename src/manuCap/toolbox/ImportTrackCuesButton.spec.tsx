import "../../testUtils/initBrowserEnvironment";
import ImportTrackCuesButton from "./ImportTrackCuesButton";
import { createTestingStore } from "../../testUtils/testingStore";
import { Provider } from "react-redux";
import { fireEvent, render } from "@testing-library/react";

let testingStore = createTestingStore();

describe("ImportTrackCuesButton", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
    });
   it("renders", () => {
       // GIVEN
       const expectedNode = render(
           <button
               id="importFileBtn"
               className="sbte-import-button sbte-btn sbte-btn-light"
               data-pr-tooltip="Import File"
               data-pr-position="top"
               data-pr-at="center+2 top-2"
           >
               <i className="fa-duotone fa-file-import fa-lg" />
           </button>
       );

       // WHEN
       const actualNode = render(
           <Provider store={testingStore}>
               <ImportTrackCuesButton handleImport={jest.fn()} />
           </Provider>
       );

       // THEN
       expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
   });

    it("renders disabled", () => {
        // GIVEN
        const expectedNode = render(
            <button
                id="importFileBtn"
                disabled
                className="sbte-import-button sbte-btn sbte-btn-light"
                data-pr-tooltip="Import File"
                data-pr-position="top"
                data-pr-at="center+2 top-2"
            >
                <i className="fa-duotone fa-file-import fa-lg" />
            </button>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <ImportTrackCuesButton handleImport={jest.fn()} disabled />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("calls handleImport when clicked", () => {
        // GIVEN
        const mockHandleImport = jest.fn();
        const actualNode = render(
            <Provider store={testingStore}>
                <ImportTrackCuesButton handleImport={mockHandleImport} />
            </Provider>
        );

        // WHEN
        fireEvent.click(actualNode.container.querySelector(".sbte-import-button") as Element);

        // THEN
        expect(mockHandleImport).toHaveBeenCalled();
    });
});

import "../../testUtils/initBrowserEnvironment";
import { Provider } from "react-redux";
import { AnyAction } from "@reduxjs/toolkit";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { CueError } from "../model";
import { createTestingStore } from "../../testUtils/testingStore";
import { setValidationErrors } from "./edit/cueEditorSlices";
import CueErrorAlert from "./CueErrorAlert";
import { act } from "react-dom/test-utils";
import { removeIds } from "../../testUtils/testUtils";

let testingStore = createTestingStore();

jest.setTimeout(15000);

describe("CueErrorAlert", () => {
    beforeEach(() => {
        jest.resetAllMocks();
        testingStore = createTestingStore();
    });

    it("shows cue errors alert when cue has validation errors", async () => {
        // GIVEN
        testingStore.dispatch(setValidationErrors([CueError.LINE_CHAR_LIMIT_EXCEEDED]) as {} as AnyAction);

        const expectedNode = render(
            <div
                className="p-toast p-component p-toast-top-center w-half
                    border-none overflow-hidden max-w-none !z-100"
            >
                <div>
                    <div
                        className="p-toast-message p-toast-message-error
                        p-toast-message-enter-done"
                        role="alert"
                        aria-live="assertive"
                        aria-atomic="true"
                    >
                        <div
                            className="p-toast-message-content bg-red-lighter px-6
                                py-4 border-red-dark text-red-primary"
                        >
                            <span className="p-toast-message-icon pi pi-times" />
                            <div className="p-toast-message-text">
                                <span className="p-toast-summary">
                                    Unable to complete action due to the following error(s):
                                </span>
                                <div className="p-toast-detail">
                                    Max Characters Per Line Exceeded
                                </div>
                            </div>
                            <div>
                                <button type="button" className="p-toast-icon-close p-link" aria-label="Close">
                                    <span className="p-toast-icon-close-icon pi pi-times" aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );

        //WHEN
        const actualNode = await render(
            <Provider store={testingStore}>
                <CueErrorAlert />
            </Provider>
        );

        // THEN
        //@ts-ignore value should not be null
        await waitFor(async () => {
            expect(removeIds(actualNode.container.outerHTML)).toEqual(expectedNode.container.outerHTML);
        });
    });

    it("closes cue errors alert if dismiss button is clicked", async () => {
        // GIVEN
        testingStore.dispatch(setValidationErrors([CueError.LINE_CHAR_LIMIT_EXCEEDED]) as {} as AnyAction);

        const expectedNode = render(
            <>
                <div
                    className="p-toast p-component p-toast-top-center w-half
                        border-none overflow-hidden max-w-none !z-100"
                >
                    <div />
                </div>
            </>
        );

        //WHEN
        const actualNode = await render(
            <Provider store={testingStore}>
                <CueErrorAlert />
            </Provider>
        );
        await act(async () => new Promise(resolve => setTimeout(resolve, 200)));

        // WHEN
        //@ts-ignore value should not be null
        await fireEvent.click(actualNode.container.querySelector("button.p-toast-icon-close") as HTMLElement);

        // THEN
        await waitFor(() => {
            expect(removeIds(actualNode.container.outerHTML)).toEqual(expectedNode.container.outerHTML);
        });
    });

    it("closes cue errors alert automatically", async () => {
        // GIVEN
        testingStore.dispatch(setValidationErrors([CueError.LINE_CHAR_LIMIT_EXCEEDED]) as {} as AnyAction);

        const expectedNode = render(
            <>
                <div
                    className="p-toast p-component p-toast-top-center w-half
                        border-none overflow-hidden max-w-none !z-100"
                >
                    <div />
                </div>
            </>
        );

        //WHEN
        const actualNode = await render(
            <Provider store={testingStore}>
                <CueErrorAlert />
            </Provider>
        );

        // WHEN
        //@ts-ignore value should not be null
        actualNode.rerender(
            <Provider store={testingStore}>
                <CueErrorAlert />
            </Provider>
        );

        // THEN
        await waitFor(() => {
            expect(removeIds(actualNode.container.outerHTML)).toEqual(expectedNode.container.outerHTML);
        });
    });

    it("closes cue errors alert automatically debounced", async () => {
        // GIVEN
        testingStore.dispatch(setValidationErrors([CueError.LINE_CHAR_LIMIT_EXCEEDED]) as {} as AnyAction);
        const expectedNode = render(
            <div
                className="p-toast p-component p-toast-top-center w-half
                    border-none overflow-hidden max-w-none !z-100"
                style={{}}
            >
                <div>
                    <div
                        className="p-toast-message p-toast-message-error p-toast-message-enter-done"
                        role="alert"
                        aria-live="assertive"
                        aria-atomic="true"
                    >
                        <div
                            className="p-toast-message-content bg-red-lighter
                                px-6 py-4 border-red-dark text-red-primary"
                        >
                            <span className="p-toast-message-icon pi pi-times" />
                            <div className="p-toast-message-text">
                                <span className="p-toast-summary">
                                    Unable to complete action due to the following error(s):
                                </span>
                                <div className="p-toast-detail">
                                    Max Characters Per Line Exceeded
                                </div>
                            </div>
                            <div>
                                <button type="button" className="p-toast-icon-close p-link" aria-label="Close">
                                    <span className="p-toast-icon-close-icon pi pi-times" aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
        const { container, rerender } = render(
            <Provider store={testingStore}>
                <CueErrorAlert />
            </Provider>
        );
        // debounce delay is 8 seconds, so change validation errors after 7 seconds, wait 4 seconds, then
        // ensure alert is still visible.
        await act(async () => new Promise(resolve => setTimeout(resolve, 7000)));
        testingStore.dispatch(setValidationErrors([CueError.LINE_CHAR_LIMIT_EXCEEDED]) as {} as AnyAction);
        await act(async () => new Promise(resolve => setTimeout(resolve, 4000)));

        // WHEN
        rerender(
            <Provider store={testingStore}>
                <CueErrorAlert />
            </Provider>
        );

        // THEN
        expect(container.outerHTML.replace(/ ?style=""/g, ""))
            .toEqual(expectedNode.container.outerHTML);
    });

    it("auto sets validation error to false after receiving it", (done) => {
        // GIVEN
        render(
            <Provider store={testingStore}>
                <CueErrorAlert />
            </Provider>
        );

        // WHEN
        testingStore.dispatch(setValidationErrors([CueError.LINE_CHAR_LIMIT_EXCEEDED]) as {} as AnyAction);

        // THEN
        setTimeout(() => {
            expect(testingStore.getState().validationErrors).toEqual([]);
            done();
        }, 1100);
    });

    it("clears all toasts and only show one", async () => {
        // GIVEN
        testingStore.dispatch(setValidationErrors([CueError.LINE_CHAR_LIMIT_EXCEEDED]) as {} as AnyAction);
        const component = <Provider store={testingStore}> <CueErrorAlert /> </Provider>;

        //WHEN
        const node = render(component);
        node.rerender(component);
        node.rerender(component);
        node.rerender(component);
        node.rerender(component);

        // THEN
        await waitFor(async () => {
            await expect(document.body.querySelectorAll(".p-toast-message")
                .length).toEqual(1);
        });
    });
});

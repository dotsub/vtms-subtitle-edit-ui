import "../../testUtils/initBrowserEnvironment";
import { Provider } from "react-redux";
import { AnyAction } from "@reduxjs/toolkit";
import { fireEvent, render } from "@testing-library/react";

import { Track } from "../model";
import CaptionOverlapToggle from "./CaptionOverlapToggle";
import { createTestingStore } from "../../testUtils/testingStore";
import { updateEditingTrack } from "../trackSlices";
import { callSaveTrack, setAutoSaveSuccess, setSaveTrack } from "../cues/saveSlices";

jest.mock("lodash", () => ({
    debounce: (callback: Function): Function => callback,
    sortBy: jest.requireActual("lodash/sortBy"),
    findIndex: jest.requireActual("lodash/findIndex")
}));

let testingStore = createTestingStore();

describe("CaptionOverlapToggle", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
    });
    const saveTrack = jest.fn();
    beforeEach(() => {
        // GIVEN
        saveTrack.mockReset();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
    });

   it("renders", () => {
       // GIVEN
       const expectedNode = render(
           <button type="button" className="flex items-center justify-between">
               <span>
                   <i className="w-7 fa-duotone fa-arrow-down-square-triangle text-blue-primary" />
                   <span>Overlapping</span>
               </span>
               <span className="sbte-badge font-medium sbte-badge-sm sbte-badge-secondary">
                   NOT ALLOWED
               </span>
           </button>
       );

       // WHEN
       const actualNode = render(
           <Provider store={testingStore}>
               <CaptionOverlapToggle onClick={jest.fn()} />
           </Provider>
       );

       // THEN
       expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
   });

    it("changes icon on toggle", () => {
        // GIVEN
        const expectedNode = render(
            <button
                type="button"
                className="flex items-center justify-between outline-0 active"
                disabled
            >
                <span>
                    <i className="w-7 fa-duotone fa-arrow-down-square-triangle text-blue-primary" />
                    <span>Overlapping</span>
                </span>
                <span className="sbte-badge font-medium sbte-badge-sm sbte-badge-success">ALLOWED</span>
            </button>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CaptionOverlapToggle onClick={jest.fn()} />
            </Provider>
        );
        fireEvent.click(actualNode.container.querySelector("button") as Element);

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("changes icon back on double toggle", () => {
        // GIVEN
        const testingTrack = {
            type: "CAPTION",
            language: { id: "en-US" },
            default: true,
            overlapEnabled: true
        } as Track;

        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);

        const expectedNode = render(
            <button type="button" className="flex items-center justify-between" disabled>
                <span>
                    <i className="w-7 fa-duotone fa-arrow-down-square-triangle text-blue-primary" />
                    <span>Overlapping</span>
                </span>
                <span className="sbte-badge font-medium sbte-badge-sm sbte-badge-secondary">
                    NOT ALLOWED
                </span>
            </button>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CaptionOverlapToggle onClick={jest.fn()} />
            </Provider>
        );

        fireEvent.click(actualNode.container.querySelector("button") as Element);
        fireEvent.click(actualNode.container.querySelector("button") as Element);

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("toggles overlap caption flag in store on toggle", () => {
        // GIVEN
        const testingTrack = {
            type: "CAPTION",
            language: { id: "en-US" },
            default: true,
            overlapEnabled: false
        } as Track;
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        const actualNode = render(
            <Provider store={testingStore}>
                <CaptionOverlapToggle onClick={jest.fn()} />
            </Provider>
        );

        // WHEN
        fireEvent.click(actualNode.container.querySelector("button") as Element);

        // THEN
        expect(testingStore.getState().editingTrack.overlapEnabled).toEqual(true);
    });

    it("disables button while saving", () => {
        // GIVEN
        const testingTrack = { type: "CAPTION", language: { id: "en-US" }, default: true } as Track;
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        const actualNode = render(
            <Provider store={testingStore}>
                <CaptionOverlapToggle onClick={jest.fn()} />
            </Provider>
        );

        // WHEN
        callSaveTrack(testingStore.dispatch, testingStore.getState);

        // THEN
        expect(actualNode.container.querySelector("button") as Element).toBeDisabled();
    });

    it("enables button after successful save", () => {
        // GIVEN
        const testingTrack = { type: "CAPTION", language: { id: "en-US" }, default: true } as Track;
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        const actualNode = render(
            <Provider store={testingStore}>
                <CaptionOverlapToggle onClick={jest.fn()} />
            </Provider>
        );

        // WHEN
        callSaveTrack(testingStore.dispatch, testingStore.getState);
        testingStore.dispatch(setAutoSaveSuccess(true) as {} as AnyAction);

        // THEN
        expect(actualNode.container.querySelector("button") as Element).toBeEnabled();
    });

    it("enables button after failed save", () => {
        // GIVEN
        const testingTrack = { type: "CAPTION", language: { id: "en-US" }, default: true } as Track;
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        const actualNode = render(
            <Provider store={testingStore}>
                <CaptionOverlapToggle onClick={jest.fn()} />
            </Provider>
        );

        // WHEN
        callSaveTrack(testingStore.dispatch, testingStore.getState);
        testingStore.dispatch(setAutoSaveSuccess(false) as {} as AnyAction);

        // THEN
        expect(actualNode.container.querySelector("button") as Element).toBeEnabled();
    });
});

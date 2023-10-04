import "../../testUtils/initBrowserEnvironment";
import { createTestingStore } from "../../testUtils/testingStore";
import { Provider } from "react-redux";
import { fireEvent, render } from "@testing-library/react";
import MergeCuesButton from "./MergeCuesButton";
import SearchReplaceButton from "./SearchReplaceButton";
import { updateEditingTrack } from "../trackSlices";
import { AnyAction } from "@reduxjs/toolkit";
import { Language, Track } from "../model";

let testingStore = createTestingStore();

const testTrack = {
    type: "CAPTION",
    mediaTitle: "testingTrack",
    language: { id: "en-US", name: "English", direction: "LTR" },
    timecodesUnlocked: true
};

const testTranslationTrack = {
    type: "TRANSLATION",
    language: { id: "fr-FR", name: "French (France)" } as Language,
    sourceLanguage: { id: "en-US", name: "English (US)" } as Language,
    default: true,
    mediaTitle: "This is the video title",
    mediaLength: 4000,
} as Track;

describe("MergeCuesButton", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
        testingStore.dispatch(updateEditingTrack(testTrack as Track) as {} as AnyAction);
    });

    it("renders", () => {
        // GIVEN
        const expectedNode = render(
            <button
                className="sbte-merge-cues-button flex items-center"
                title="Unlock timecodes to enable"
            >
                <i className="w-7 fa-duotone fa-merge text-blue-primary" />
                <span>Merge Cues</span>
            </button>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <MergeCuesButton onClick={jest.fn()} />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders enabled if timecodes are locked but track is caption", () => {
        // GIVEN
        const expectedNode = render(
            <button
                className="sbte-merge-cues-button flex items-center"
                title="Unlock timecodes to enable"
            >
                <i className="w-7 fa-duotone fa-merge text-blue-primary" />
                <span>Merge Cues</span>
            </button>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <MergeCuesButton onClick={jest.fn()} />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders disabled if timecodes are locked and track is translation", () => {
        // GIVEN
        testingStore.dispatch(
            updateEditingTrack( { ...testTranslationTrack, timecodesUnlocked: false } as Track) as {} as AnyAction);
        const expectedNode = render(
            <button
                className="sbte-merge-cues-button flex items-center"
                disabled
                title="Unlock timecodes to enable"
            >
                <i className="w-7 fa-duotone fa-merge text-blue-primary" />
                <span>Merge Cues</span>
            </button>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <MergeCuesButton onClick={jest.fn()} />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("sets merge visible on button click", () => {
        // GIVEN
        const { getByText } = render(
            <Provider store={testingStore}>
                <MergeCuesButton onClick={jest.fn()} />
            </Provider>
        );
        const mergeButton = getByText("Merge Cues");

        // WHEN
        fireEvent.click(mergeButton);

        // THEN
        expect(testingStore.getState().mergeVisible).toBeTruthy();
    });

    it("hides search/replace on button click", () => {
        // GIVEN
        const { container, getByText } = render(
            <Provider store={testingStore}>
                <SearchReplaceButton />
                <MergeCuesButton onClick={jest.fn()} />
            </Provider>
        );
        const searchButton = container.querySelector(".sbte-search-replace-button") as Element;
        const mergeButton = getByText("Merge Cues");

        // WHEN
        fireEvent.click(searchButton);
        fireEvent.click(mergeButton);

        // THEN
        expect(testingStore.getState().searchReplaceVisible).toBeFalsy();
    });
});

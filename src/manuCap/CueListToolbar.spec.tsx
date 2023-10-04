import "../testUtils/initBrowserEnvironment";
import { createTestingStore } from "../testUtils/testingStore";
import { setSaveTrack } from "./cues/saveSlices";
import { AnyAction } from "@reduxjs/toolkit";
import { mount } from "enzyme";
import { Provider } from "react-redux";
import CueListToolbar from "./CueListToolbar";
import { Language, Track } from "./model";

const testingTrack = {
    type: "CAPTION",
    language: { id: "en-US", name: "English (US)" } as Language,
    default: true,
    mediaTitle: "This is the video title",
    mediaLength: 4000,
    progress: 50
} as Track;

let testingStore = createTestingStore();

describe("CueListToolbar", () => {
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
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div className="space-x-2 flex items-center mt-1.5">
                    <button
                        className="sbte-btn sbte-btn-primary sbte-view-all-tracks-sbte-btn"
                        type="button"
                    >
                        View Track History
                    </button>
                    <button
                        id="jumpToFirstButton"
                        className="sbte-btn sbte-btn-light sbte-jump-to-first-button"
                        type="button"
                        data-pr-tooltip="Scroll to top"
                        data-pr-position="top"
                        data-pr-at="center top-2"
                    >
                        <i className="fa-duotone fa-angle-double-up" />
                    </button>
                    <button
                        id="jumpToLastButton"
                        className="sbte-btn sbte-btn-light sbte-jump-to-last-button"
                        type="button"
                        data-pr-tooltip="Scroll to bottom"
                        data-pr-position="top"
                        data-pr-at="center top-2"
                    >
                        <i className="fa-duotone fa-angle-double-down" />
                    </button>
                    <button
                        id="editCueButton"
                        data-testid="sbte-jump-to-edit-cue-button"
                        className="sbte-btn sbte-btn-light"
                        type="button"
                        data-pr-tooltip="Scroll to currently editing subtitle"
                        data-pr-position="top"
                        data-pr-at="center top-2"
                    >
                        <i className="fa-duotone fa-edit" />
                    </button>
                    <button
                        id="playbackCueButton"
                        data-testid="sbte-jump-to-playback-cue-button"
                        className="sbte-btn sbte-btn-light"
                        type="button"
                        data-pr-tooltip="Scroll to subtitle in playback position"
                        data-pr-position="top"
                        data-pr-at="center top-2"
                    >
                        <i className="fa-duotone fa-video" />
                    </button>
                    <button
                        hidden
                        id="translatedCueButton"
                        data-testid="sbte-jump-to-last-translated-cue-button"
                        className="sbte-btn sbte-btn-light"
                        type="button"
                        data-pr-tooltip="Scroll to last translated subtitle"
                        data-pr-position="top"
                        data-pr-at="center top-2"
                    >
                        <i className="fa-duotone fa-language" />
                    </button>
                    <button
                        id="cueErrorButton"
                        data-testid="sbte-jump-error-cue-button"
                        className="sbte-btn sbte-btn-light"
                        type="button"
                        data-pr-tooltip="Scroll to next subtitle error"
                        data-pr-position="top"
                        data-pr-at="center top-2"
                    >
                        <i className="fa-duotone fa-bug" />
                    </button>
                    <span style={{ flexGrow: 2 }} />
                    <div className="space-x-4 flex items-center">
                        <div className="font-medium">
                            <span hidden className="flex items-center ">
                                <span className="leading-none" />
                                <i className="ml-2" />
                            </span>
                        </div>
                        <button
                            type="button"
                            className="sbte-btn sbte-btn-primary sbte-complete-subtitle-sbte-btn"
                        >
                            Complete
                        </button>
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueListToolbar
                    editingTrack={testingTrack}
                    onComplete={jest.fn()}
                    onViewTrackHistory={jest.fn()}
                    saveState="NONE"
                />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders with edit disabled", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div className="space-x-2 flex items-center mt-1.5">
                    <button
                        className="sbte-btn sbte-btn-primary sbte-view-all-tracks-sbte-btn"
                        type="button"
                    >
                        View Track History
                    </button>
                    <button
                        id="jumpToFirstButton"
                        className="sbte-btn sbte-btn-light sbte-jump-to-first-button"
                        type="button"
                        data-pr-tooltip="Scroll to top"
                        data-pr-position="top"
                        data-pr-at="center top-2"
                    >
                        <i className="fa-duotone fa-angle-double-up" />
                    </button>
                    <button
                        id="jumpToLastButton"
                        className="sbte-btn sbte-btn-light sbte-jump-to-last-button"
                        type="button"
                        data-pr-tooltip="Scroll to bottom"
                        data-pr-position="top"
                        data-pr-at="center top-2"
                    >
                        <i className="fa-duotone fa-angle-double-down" />
                    </button>
                    <button
                        id="editCueButton"
                        data-testid="sbte-jump-to-edit-cue-button"
                        className="sbte-btn sbte-btn-light"
                        type="button"
                        data-pr-tooltip="Scroll to currently editing subtitle"
                        data-pr-position="top"
                        data-pr-at="center top-2"
                    >
                        <i className="fa-duotone fa-edit" />
                    </button>
                    <button
                        id="playbackCueButton"
                        data-testid="sbte-jump-to-playback-cue-button"
                        className="sbte-btn sbte-btn-light"
                        type="button"
                        data-pr-tooltip="Scroll to subtitle in playback position"
                        data-pr-position="top"
                        data-pr-at="center top-2"
                    >
                        <i className="fa-duotone fa-video" />
                    </button>
                    <button
                        hidden
                        id="translatedCueButton"
                        data-testid="sbte-jump-to-last-translated-cue-button"
                        className="sbte-btn sbte-btn-light"
                        type="button"
                        data-pr-tooltip="Scroll to last translated subtitle"
                        data-pr-position="top"
                        data-pr-at="center top-2"
                    >
                        <i className="fa-duotone fa-language" />
                    </button>
                    <button
                        id="cueErrorButton"
                        data-testid="sbte-jump-error-cue-button"
                        className="sbte-btn sbte-btn-light"
                        type="button"
                        data-pr-tooltip="Scroll to next subtitle error"
                        data-pr-position="top"
                        data-pr-at="center top-2"
                    >
                        <i className="fa-duotone fa-bug" />
                    </button>
                    <span style={{ flexGrow: 2 }} />
                    <div className="space-x-4 flex items-center">
                        <div className="font-medium">
                            <span className="text-green-primary">
                                Edits are disabled, task is already completed
                            </span>
                        </div>
                        <button
                            type="button"
                            className="sbte-btn sbte-btn-primary sbte-complete-subtitle-sbte-btn"
                            disabled
                        >
                            Complete
                        </button>
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueListToolbar
                    editingTrack={testingTrack}
                    onComplete={jest.fn()}
                    onViewTrackHistory={jest.fn()}
                    editDisabled
                    saveState="NONE"
                />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

});

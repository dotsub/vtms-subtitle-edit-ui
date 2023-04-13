import "../testUtils/initBrowserEnvironment";
import { createRef, ReactElement } from "react";
import { Provider } from "react-redux";
import { AnyAction } from "@reduxjs/toolkit";
import { mount } from "enzyme";
import { fireEvent, render, waitFor } from "@testing-library/react";
import ReactDOM from "react-dom";

import { CueDto, Language, ScrollPosition, Track, CueError } from "./model";
import {
    fixVideoPlayerInvalidTime,
    removeBackgroundColorStyle,
    removeDraftJsDynamicValues,
    removeVideoPlayerDynamicValue,
} from "../testUtils/testUtils";
import { updateCues } from "./cues/cuesList/cuesListActions";
import { updateEditingTrack } from "./trackSlices";
import CueLine from "./cues/cueLine/CueLine";
import SubtitleEdit from "./SubtitleEdit";
import { SubtitleSpecification } from "./toolbox/model";
import Toolbox from "./toolbox/Toolbox";
import VideoPlayer from "./player/VideoPlayer";
import { createTestingStore } from "../testUtils/testingStore";
import { readSubtitleSpecification } from "./toolbox/subtitleSpecifications/subtitleSpecificationSlice";
import AddCueLineButton from "./cues/edit/AddCueLineButton";
import { callSaveTrack, SaveState, setSaveTrack } from "./cues/saveSlices";
import * as cuesListScrollSlice from "./cues/cuesList/cuesListScrollSlice";
import { showSearchReplace } from "./cues/searchReplace/searchReplaceSlices";
import SearchReplaceEditor from "./cues/searchReplace/SearchReplaceEditor";
import { updateSourceCues } from "./cues/view/sourceCueSlices";
import { lastCueChangeSlice } from "./cues/edit/cueEditorSlices";
import { showMerge } from "./cues/merge/mergeSlices";
import MergeEditor from "./cues/merge/MergeEditor";
import { act } from "react-dom/test-utils";
import CueListToolbar from "./CueListToolbar";

jest.mock("lodash", () => ({
    debounce: (callback: Function): Function => callback,
    isEmpty: jest.requireActual("lodash/isEmpty"),
    sortBy: jest.requireActual("lodash/sortBy"),
    findIndex: jest.requireActual("lodash/findIndex"),
    findLastIndex: jest.requireActual("lodash/findLastIndex")
}));

// We are mocking here.
// eslint-disable-next-line react/display-name
jest.mock("./cues/CueErrorAlert", () => (): ReactElement => <div>CueErrorAlert</div>);

Element.prototype.scrollIntoView = jest.fn();

let testingStore = createTestingStore();

const cues = [
    { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE", errors: []},
    { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE", errors: []},
] as CueDto[];

const cuesWithIndexes = [
    { index: 0, cue: cues[0] },
    { index: 1, cue: cues[1] },
];

const matchedCues = [
    { targetCues: [cuesWithIndexes[0]], sourceCues: []},
    { targetCues: [cuesWithIndexes[1]], sourceCues: []},
];

const testingTrack = {
    type: "CAPTION",
    language: { id: "en-US", name: "English (US)" } as Language,
    default: true,
    mediaTitle: "This is the video title",
    mediaLength: 4000,
    progress: 50
} as Track;

const testingTranslationTrack = {
    type: "TRANSLATION",
    language: { id: "fr-FR", name: "French (France)" } as Language,
    sourceLanguage: { id: "en-US", name: "English (US)" } as Language,
    default: true,
    mediaTitle: "This is the video title",
    mediaLength: 4000,
} as Track;

jest.setTimeout(9000);

describe("SubtitleEdit", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
        jest.clearAllMocks();
    });

    it("renders", () => {
        // GIVEN
        const expectedNode = render(
            <Provider store={testingStore}>
                <div
                    className="sbte-subtitle-edit"
                    style={{
                        display: "flex",
                        flexFlow: "column",
                        padding: "10px",
                        height: "100%",
                        overflow: "hidden"
                    }}
                >
                    <div>CueErrorAlert</div>
                    <div style={{ display: "flex", alignItems: "flex-start", height: "100%" }}>
                        <div style={{ flex: "1 1 40%", display: "flex", flexFlow: "column", paddingRight: "10px" }}>
                            <div className="video-player-wrapper">
                                <VideoPlayer
                                    mp4="dummyMp4"
                                    poster="dummyPoster"
                                    tracks={[testingTrack]}
                                    languageCuesArray={[]}
                                    lastCueChange={null}
                                />
                            </div>
                            <Toolbox
                                handleImportFile={jest.fn()}
                                handleExportSourceFile={jest.fn()}
                                handleExportFile={jest.fn()}
                            />
                        </div>
                        <div
                            style={{
                                flex: "1 1 60%",
                                height: "100%",
                                paddingLeft: "10px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between"
                            }}
                        >
                            <div
                                style={{
                                    flex: "1 1 60%",
                                    height: "90%",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between"
                                }}
                            >
                                <div style={{ overflow: "auto" }} className="sbte-cue-list">
                                    <CueLine
                                        data={{ targetCues: [cuesWithIndexes[0]]}}
                                        rowIndex={0}
                                        rowProps={{
                                            targetCuesLength: 2,
                                            withoutSourceCues: true,
                                            matchedCues,
                                            commentAuthor: "Linguist"
                                        }}
                                        rowRef={createRef()}
                                    />
                                    <CueLine
                                        data={{ targetCues: [cuesWithIndexes[1]]}}
                                        rowIndex={1}
                                        rowProps={{
                                            targetCuesLength: 2,
                                            withoutSourceCues: true,
                                            matchedCues,
                                            commentAuthor: "Linguist"
                                        }}
                                        rowRef={createRef()}
                                    />
                                </div>
                                <CueListToolbar
                                    editingTrack={testingTrack}
                                    onViewTrackHistory={jest.fn()}
                                    onComplete={jest.fn()}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewTrackHistory={(): void => undefined}
                    onSave={(): void => undefined}
                    onComplete={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(
            readSubtitleSpecification({ enabled: false } as SubtitleSpecification) as {} as AnyAction
        );
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);

        // THEN
        const actual = removeDraftJsDynamicValues(removeVideoPlayerDynamicValue(
            actualNode.container.outerHTML));
        const expected = removeDraftJsDynamicValues(removeVideoPlayerDynamicValue(
            expectedNode.container.outerHTML));
        expect(actual).toEqual(expected);
    });

    it("renders with no cues and add cue button for CAPTION track", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div
                    className="sbte-subtitle-edit"
                    style={{
                        display: "flex",
                        flexFlow: "column",
                        padding: "10px",
                        height: "100%",
                        overflow: "hidden"
                    }}
                >
                    <div>CueErrorAlert</div>
                    <div style={{ display: "flex", alignItems: "flex-start", height: "100%" }}>
                        <div style={{ flex: "1 1 40%", display: "flex", flexFlow: "column", paddingRight: "10px" }}>
                            <div className="video-player-wrapper">
                                <VideoPlayer
                                    mp4="dummyMp4"
                                    poster="dummyPoster"
                                    tracks={[testingTrack]}
                                    languageCuesArray={[]}
                                    lastCueChange={null}
                                />
                            </div>
                            <Toolbox
                                handleImportFile={jest.fn()}
                                handleExportSourceFile={jest.fn()}
                                handleExportFile={jest.fn()}
                            />
                        </div>
                        <div
                            style={{
                                flex: "1 1 60%",
                                height: "100%",
                                paddingLeft: "10px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between"
                            }}
                        >
                            <div
                                style={{
                                    flex: "1 1 60%",
                                    height: "90%",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between"
                                }}
                            >
                                <AddCueLineButton
                                    text="Start Captioning"
                                    cueIndex={-1}
                                    sourceCueIndexes={[]}
                                />
                                <div style={{ overflow: "auto" }} className="sbte-cue-list" />
                                <CueListToolbar
                                    editingTrack={testingTrack}
                                    onViewTrackHistory={jest.fn()}
                                    onComplete={jest.fn()}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewTrackHistory={(): void => undefined}
                    onSave={(): void => undefined}
                    onComplete={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack({ ...testingTrack, progress: 0 }) as {} as AnyAction);
        testingStore.dispatch(
            readSubtitleSpecification({ enabled: false } as SubtitleSpecification) as {} as AnyAction
        );
        testingStore.dispatch(updateCues([]) as {} as AnyAction);

        // THEN
        const actual = removeDraftJsDynamicValues(removeVideoPlayerDynamicValue(
            actualNode.html()));
        const expected = removeDraftJsDynamicValues(removeVideoPlayerDynamicValue(
            expectedNode.html()));
        expect(actual).toEqual(expected);
    });

    it("renders loading data when data is pending load for CAPTION", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div
                    className="sbte-subtitle-edit"
                    style={{
                        display: "flex",
                        flexFlow: "column",
                        padding: "10px",
                        height: "100%",
                        overflow: "hidden"
                    }}
                >
                    <div>CueErrorAlert</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                        <div className="text-center space-y-4">
                            <div className="sbte-spinner-icon" />
                            <p className="font-medium text-blue-light m-0">
                                Hang in there, we&apos;re loading the track...
                            </p>
                        </div>
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewTrackHistory={(): void => undefined}
                    onSave={(): void => undefined}
                    onComplete={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);

        testingStore.dispatch(
            readSubtitleSpecification({ enabled: false } as SubtitleSpecification) as {} as AnyAction
        );

        // THEN
        const actual = removeDraftJsDynamicValues(removeVideoPlayerDynamicValue(
            actualNode.html()));
        const expected = removeDraftJsDynamicValues(removeVideoPlayerDynamicValue(
            expectedNode.html()));
        expect(actual).toEqual(expected);
    });

    it("renders loading data when data is pending load for TRANSLATION source cues", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div
                    className="sbte-subtitle-edit"
                    style={{
                        display: "flex",
                        flexFlow: "column",
                        padding: "10px",
                        height: "100%",
                        overflow: "hidden"
                    }}
                >
                    <div>CueErrorAlert</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                        <div className="text-center space-y-4">
                            <div className="sbte-spinner-icon" />
                            <p className="font-medium text-blue-light m-0">
                                Hang in there, we&apos;re loading the track...
                            </p>
                        </div>
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewTrackHistory={(): void => undefined}
                    onSave={(): void => undefined}
                    onComplete={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTranslationTrack) as {} as AnyAction);
        testingStore.dispatch(
            readSubtitleSpecification({ enabled: false } as SubtitleSpecification) as {} as AnyAction
        );
        testingStore.dispatch(updateCues([]) as {} as AnyAction);

        // THEN
        const actual = removeDraftJsDynamicValues(removeVideoPlayerDynamicValue(
            actualNode.html()));
        const expected = removeDraftJsDynamicValues(removeVideoPlayerDynamicValue(
            expectedNode.html()));
        expect(actual).toEqual(expected);
    });

    it("renders with search and replace pane", () => {
        // GIVEN
        const expectedNode = render(
            <Provider store={testingStore}>
                <div
                    className="sbte-subtitle-edit"
                    style={{
                        display: "flex",
                        flexFlow: "column",
                        padding: "10px",
                        height: "100%",
                        overflow: "hidden"
                    }}
                >
                    <div>CueErrorAlert</div>
                    <div style={{ display: "flex", alignItems: "flex-start", height: "100%" }}>
                        <div style={{ flex: "1 1 40%", display: "flex", flexFlow: "column", paddingRight: "10px" }}>
                            <div className="video-player-wrapper">
                                <VideoPlayer
                                    mp4="dummyMp4"
                                    poster="dummyPoster"
                                    tracks={[testingTrack]}
                                    languageCuesArray={[]}
                                    lastCueChange={null}
                                />
                            </div>
                            <Toolbox
                                handleImportFile={jest.fn()}
                                handleExportSourceFile={jest.fn()}
                                handleExportFile={jest.fn()}
                            />
                        </div>
                        <div
                            style={{
                                flex: "1 1 60%",
                                height: "100%",
                                paddingLeft: "10px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between"
                            }}
                        >
                            <SearchReplaceEditor />
                            <div
                                style={{
                                    flex: "1 1 60%",
                                    height: "90%",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between"
                                }}
                            >
                                <div style={{ overflow: "auto" }} className="sbte-cue-list">
                                    <CueLine
                                        data={{ targetCues: [cuesWithIndexes[0]]}}
                                        rowIndex={0}
                                        rowProps={{
                                            targetCuesLength: 2,
                                            withoutSourceCues: true,
                                            matchedCues,
                                            commentAuthor: "Linguist"
                                        }}
                                        rowRef={createRef()}
                                    />
                                    <CueLine
                                        data={{ targetCues: [cuesWithIndexes[1]]}}
                                        rowIndex={1}
                                        rowProps={{
                                            targetCuesLength: 2,
                                            withoutSourceCues: true,
                                            matchedCues,
                                            commentAuthor: "Linguist"
                                        }}
                                        rowRef={createRef()}
                                    />
                                </div>
                                <CueListToolbar
                                    editingTrack={testingTrack}
                                    onViewTrackHistory={jest.fn()}
                                    onComplete={jest.fn()}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewTrackHistory={(): void => undefined}
                    onSave={(): void => undefined}
                    onComplete={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);

        testingStore.dispatch(
            readSubtitleSpecification({ enabled: false } as SubtitleSpecification) as {} as AnyAction
        );
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);

        // THEN
        const actual = removeDraftJsDynamicValues(removeVideoPlayerDynamicValue(
            actualNode.container.outerHTML));
        const expected = removeDraftJsDynamicValues(removeVideoPlayerDynamicValue(
            expectedNode.container.outerHTML));
        expect(actual).toEqual(expected);
    });

    it("renders with merge pane", () => {
        // GIVEN
        const expectedNode = render(
            <Provider store={testingStore}>
                <div
                    className="sbte-subtitle-edit"
                    style={{
                        display: "flex",
                        flexFlow: "column",
                        padding: "10px",
                        height: "100%",
                        overflow: "hidden"
                    }}
                >
                    <div>CueErrorAlert</div>
                    <div style={{ display: "flex", alignItems: "flex-start", height: "100%" }}>
                        <div style={{ flex: "1 1 40%", display: "flex", flexFlow: "column", paddingRight: "10px" }}>
                            <div className="video-player-wrapper">
                                <VideoPlayer
                                    mp4="dummyMp4"
                                    poster="dummyPoster"
                                    tracks={[testingTrack]}
                                    languageCuesArray={[]}
                                    lastCueChange={null}
                                />
                            </div>
                            <Toolbox
                                handleImportFile={jest.fn()}
                                handleExportSourceFile={jest.fn()}
                                handleExportFile={jest.fn()}
                            />
                        </div>
                        <div
                            style={{
                                flex: "1 1 60%",
                                height: "100%",
                                paddingLeft: "10px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between"
                            }}
                        >
                            <MergeEditor />
                            <div
                                style={{
                                    flex: "1 1 60%",
                                    height: "90%",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between"
                                }}
                            >
                                <div style={{ overflow: "auto" }} className="sbte-cue-list">
                                    <CueLine
                                        data={{ targetCues: [cuesWithIndexes[0]]}}
                                        rowIndex={0}
                                        rowProps={{
                                            targetCuesLength: 2,
                                            withoutSourceCues: true,
                                            matchedCues,
                                            commentAuthor: "Linguist"
                                        }}
                                        rowRef={createRef()}
                                    />
                                    <CueLine
                                        data={{ targetCues: [cuesWithIndexes[1]]}}
                                        rowIndex={1}
                                        rowProps={{
                                            targetCuesLength: 2,
                                            withoutSourceCues: true,
                                            matchedCues,
                                            commentAuthor: "Linguist"
                                        }}
                                        rowRef={createRef()}
                                    />
                                </div>
                                <CueListToolbar
                                    editingTrack={testingTrack}
                                    onViewTrackHistory={jest.fn()}
                                    onComplete={jest.fn()}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewTrackHistory={(): void => undefined}
                    onSave={(): void => undefined}
                    onComplete={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);

        testingStore.dispatch(
            readSubtitleSpecification({ enabled: false } as SubtitleSpecification) as {} as AnyAction
        );
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        testingStore.dispatch(showMerge(true) as {} as AnyAction);

        // THEN
        const actual = removeDraftJsDynamicValues(removeVideoPlayerDynamicValue(
            actualNode.container.outerHTML));
        const expected = removeDraftJsDynamicValues(removeVideoPlayerDynamicValue(
            expectedNode.container.outerHTML));
        expect(actual).toEqual(expected);
    });

    it("renders for task with edit disabled", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div
                    className="sbte-subtitle-edit"
                    style={{
                        display: "flex",
                        flexFlow: "column",
                        padding: "10px",
                        height: "100%",
                        overflow: "hidden"
                    }}
                >
                    <div>CueErrorAlert</div>
                    <div style={{ display: "flex", alignItems: "flex-start", height: "100%" }}>
                        <div style={{ flex: "1 1 40%", display: "flex", flexFlow: "column", paddingRight: "10px" }}>
                            <div className="video-player-wrapper">
                                <VideoPlayer
                                    mp4="dummyMp4"
                                    poster="dummyPoster"
                                    tracks={[testingTrack]}
                                    languageCuesArray={[]}
                                    lastCueChange={null}
                                />
                            </div>
                            <Toolbox
                                editDisabled
                                handleImportFile={jest.fn()}
                                handleExportSourceFile={jest.fn()}
                                handleExportFile={jest.fn()}
                            />
                        </div>
                        <div
                            style={{
                                flex: "1 1 60%",
                                height: "100%",
                                paddingLeft: "10px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between"
                            }}
                        >
                            <div
                                style={{
                                    flex: "1 1 60%",
                                    height: "90%",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between"
                                }}
                            >
                                <div style={{ overflow: "auto" }} className="sbte-cue-list">
                                    <CueLine
                                        data={{ targetCues: [cuesWithIndexes[0]]}}
                                        rowIndex={0}
                                        rowProps={{
                                            targetCuesLength: 2,
                                            withoutSourceCues: true,
                                            matchedCues,
                                            commentAuthor: "Linguist"
                                        }}
                                        editDisabled
                                        rowRef={createRef()}
                                    />
                                    <CueLine
                                        data={{ targetCues: [cuesWithIndexes[1]]}}
                                        rowIndex={1}
                                        rowProps={{
                                            targetCuesLength: 2,
                                            withoutSourceCues: true,
                                            matchedCues,
                                            commentAuthor: "Linguist"
                                        }}
                                        editDisabled
                                        rowRef={createRef()}
                                    />
                                </div>
                                <CueListToolbar
                                    editingTrack={testingTrack}
                                    onViewTrackHistory={jest.fn()}
                                    onComplete={jest.fn()}
                                    editDisabled
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewTrackHistory={(): void => undefined}
                    onSave={(): void => undefined}
                    onComplete={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                    editDisabled
                />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(
            readSubtitleSpecification({ enabled: false } as SubtitleSpecification) as {} as AnyAction
        );
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);

        // THEN
        const actual = removeDraftJsDynamicValues(removeVideoPlayerDynamicValue(
            actualNode.html()));
        const expected = removeDraftJsDynamicValues(removeVideoPlayerDynamicValue(
            expectedNode.html()));
        expect(actual).toEqual(expected);
    });

    it("renders with waveform", async () => {
        // GIVEN
        // @ts-ignore we are just mocking
        jest.spyOn(global, "fetch").mockResolvedValue({
            json: jest.fn().mockResolvedValue({
                data: [0,-1,0,-1,4,-6,4,-3,4,-1,3,-3,3,-5,4,-1,6,-8,1,0,5,-3,0,-2,1,0,4]
            })
        });
        const expectedNode = render(
            <Provider store={testingStore}>
                <div
                    className="sbte-subtitle-edit"
                    style={{
                        display: "flex",
                        flexFlow: "column",
                        padding: "10px",
                        height: "100%",
                        overflow: "hidden"
                    }}
                >
                    <div>CueErrorAlert</div>
                    <div style={{ display: "flex", alignItems: "flex-start", height: "100%" }}>
                        <div style={{ flex: "1 1 40%", display: "flex", flexFlow: "column", paddingRight: "10px" }}>
                            <div className="video-player-wrapper">
                                <VideoPlayer
                                    mp4="dummyMp4"
                                    poster="dummyPoster"
                                    waveform="dummyWaveform"
                                    mediaLength={4000}
                                    waveformVisible
                                    timecodesUnlocked
                                    cues={cues}
                                    tracks={[testingTrack]}
                                    languageCuesArray={[]}
                                    lastCueChange={null}
                                    playSection={{ startTime: 0 }}
                                />
                            </div>
                            <Toolbox
                                handleImportFile={jest.fn()}
                                handleExportSourceFile={jest.fn()}
                                handleExportFile={jest.fn()}
                            />
                        </div>
                        <div
                            style={{
                                flex: "1 1 60%",
                                height: "100%",
                                paddingLeft: "10px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between"
                            }}
                        >
                            <div
                                style={{
                                    flex: "1 1 60%",
                                    height: "90%",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between"
                                }}
                            >
                                <div style={{ overflow: "auto" }} className="sbte-cue-list">
                                    <CueLine
                                        data={{ targetCues: [cuesWithIndexes[0]]}}
                                        rowIndex={0}
                                        rowProps={{
                                            targetCuesLength: 2,
                                            withoutSourceCues: true,
                                            matchedCues,
                                            commentAuthor: "Linguist"
                                        }}
                                        rowRef={createRef()}
                                    />
                                    <CueLine
                                        data={{ targetCues: [cuesWithIndexes[1]]}}
                                        rowIndex={1}
                                        rowProps={{
                                            targetCuesLength: 2,
                                            withoutSourceCues: true,
                                            matchedCues,
                                            commentAuthor: "Linguist"
                                        }}
                                        rowRef={createRef()}
                                    />
                                </div>
                                <CueListToolbar
                                    editingTrack={testingTrack}
                                    onViewTrackHistory={jest.fn()}
                                    onComplete={jest.fn()}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    waveform="dummyWaveform"
                    onViewTrackHistory={(): void => undefined}
                    onSave={(): void => undefined}
                    onComplete={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);

        testingStore.dispatch(
            readSubtitleSpecification({ enabled: false } as SubtitleSpecification) as {} as AnyAction
        );
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);

        await act(async () => new Promise(resolve => setTimeout(resolve, 200)));

        // THEN
        const actual = removeDraftJsDynamicValues(removeVideoPlayerDynamicValue(
            removeBackgroundColorStyle(actualNode.container.outerHTML)));
        const expected = removeDraftJsDynamicValues(removeVideoPlayerDynamicValue(
            removeBackgroundColorStyle(fixVideoPlayerInvalidTime(expectedNode.container.outerHTML))));
        expect(actual).toEqual(expected);
    });

    it("calls onViewAllTrack callback when button is clicked", () => {
        // GIVEN
        const mockonViewTrackHistory = jest.fn();
        const actualNode = mount(
            <Provider store={testingStore}>
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewTrackHistory={mockonViewTrackHistory}
                    onSave={(): void => undefined}
                    onComplete={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);

        testingStore.dispatch(
            readSubtitleSpecification({ enabled: false } as SubtitleSpecification) as {} as AnyAction
        );
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        actualNode.update();

        // WHEN
        actualNode.find("button.sbte-view-all-tracks-sbte-btn").simulate("click");

        // THEN
        expect(mockonViewTrackHistory.mock.calls.length).toBe(1);
    });

    it("calls onComplete callback when button is clicked", () => {
        // GIVEN
        const mockOnComplete = jest.fn();
        const actualNode = mount(
            <Provider store={testingStore}>
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewTrackHistory={(): void => undefined}
                    onSave={(): void => undefined}
                    onComplete={mockOnComplete}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);

        testingStore.dispatch(
            readSubtitleSpecification({ enabled: false } as SubtitleSpecification) as {} as AnyAction
        );
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        actualNode.update();

        // WHEN
        actualNode.find("button.sbte-complete-subtitle-sbte-btn").simulate("click");

        // THEN
        expect(mockOnComplete).toHaveBeenCalledWith(
            { editingTrack: testingStore.getState().editingTrack, cues: testingStore.getState().cues });
    });

    it("calls onExportFile callback when button is clicked", () => {
        // GIVEN
        const mockOnExportFile = jest.fn();
        const actualNode = mount(
            <Provider store={testingStore}>
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewTrackHistory={(): void => undefined}
                    onSave={(): void => undefined}
                    onComplete={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={mockOnExportFile}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);

        testingStore.dispatch(
            readSubtitleSpecification({ enabled: false } as SubtitleSpecification) as {} as AnyAction
        );
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        actualNode.update();

        // WHE
        actualNode.find(".sbte-export-button").simulate("click");

        // THEN
        expect(mockOnExportFile).toHaveBeenCalled();
    });

    it("calls onExportSourceFile callback when button is clicked", () => {
        // GIVEN
        const mockOnExportSourceFile = jest.fn();
        const actualNode = render(
            <Provider store={testingStore}>
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewTrackHistory={(): void => undefined}
                    onSave={(): void => undefined}
                    onComplete={(): void => undefined}
                    onExportSourceFile={mockOnExportSourceFile}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTranslationTrack) as {} as AnyAction);

        testingStore.dispatch(
            readSubtitleSpecification({ enabled: false } as SubtitleSpecification) as {} as AnyAction
        );
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues(cues) as {} as AnyAction);

        // WHEN
        fireEvent.click(actualNode.container.querySelector(".sbte-export-source-button") as Element);

        // THEN
        expect(mockOnExportSourceFile).toHaveBeenCalled();
    });

    it("calls onImportFile callback when button is clicked", () => {
        // GIVEN
        const mockOnImportFile = jest.fn();
        const actualNode = mount(
            <Provider store={testingStore}>
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewTrackHistory={(): void => undefined}
                    onSave={(): void => undefined}
                    onComplete={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={mockOnImportFile}
                />
            </Provider>
        );
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);

        testingStore.dispatch(
            readSubtitleSpecification({ enabled: false } as SubtitleSpecification) as {} as AnyAction
        );
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        actualNode.update();

        // WHEN
        actualNode.find(".sbte-import-button").simulate("click");

        // THEN
        expect(mockOnImportFile).toHaveBeenCalled();
    });

    it("jump to last cue in captioning mode", () => {
        // GIVEN
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        // changeScrollPosition.mockImplementation(() => {});
        const cues = [
            { vttCue: new VTTCue(0, 1, "Editing Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Editing Line 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onComplete={(): void => undefined}
                    onSave={(): void => undefined}
                    onViewTrackHistory={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );
        const changeScrollPositionSpy = jest.spyOn(cuesListScrollSlice, "changeScrollPosition");
        changeScrollPositionSpy.mockClear();

        // WHEN
        actualNode.find(".sbte-jump-to-last-button").simulate("click");

        // THEN
        expect(changeScrollPositionSpy).toBeCalledTimes(1);
        expect(changeScrollPositionSpy).toBeCalledWith(ScrollPosition.LAST);
    });

    it("jump to last cue in translation mode", () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 1, "Editing Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Editing Line 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];

        const sourceCues = [
            { vttCue: new VTTCue(0, 1, "Source Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Source Line 2"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(2, 3, "Source Line 3"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        testingStore.dispatch(updateEditingTrack(testingTranslationTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onComplete={(): void => undefined}
                    onSave={(): void => undefined}
                    onViewTrackHistory={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );
        const changeScrollPositionSpy = jest.spyOn(cuesListScrollSlice, "changeScrollPosition");
        changeScrollPositionSpy.mockClear();

        // WHEN
        actualNode.find(".sbte-jump-to-last-button").simulate("click");

        // THEN
        expect(changeScrollPositionSpy).toBeCalledTimes(1);
        expect(changeScrollPositionSpy).toBeCalledWith(ScrollPosition.LAST);
    });

    it("jumps to first cue when button is clicked", () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 1, "Editing Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Editing Line 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onComplete={(): void => undefined}
                    onSave={(): void => undefined}
                    onViewTrackHistory={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );
        actualNode.find(".sbte-jump-to-last-button").simulate("click");
        const changeScrollPositionSpy = jest.spyOn(cuesListScrollSlice, "changeScrollPosition");
        changeScrollPositionSpy.mockClear();

        // WHEN
        actualNode.find(".sbte-jump-to-first-button").simulate("click");

        // THEN
        expect(changeScrollPositionSpy).toBeCalledTimes(1);
        expect(changeScrollPositionSpy).toBeCalledWith(ScrollPosition.FIRST);
    });

    it("jumps to first cue on first render", () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 1, "Editing Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Editing Line 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const changeScrollPositionSpy = jest.spyOn(cuesListScrollSlice, "changeScrollPosition");
        changeScrollPositionSpy.mockClear();

        // WHEN
        mount(
            <Provider store={testingStore}>
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onComplete={(): void => undefined}
                    onSave={(): void => undefined}
                    onViewTrackHistory={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );

        // THEN
        expect(changeScrollPositionSpy).toBeCalledTimes(1);
        expect(changeScrollPositionSpy).toBeCalledWith(ScrollPosition.FIRST);
    });

    it("jumps to current edit cue when button is clicked", () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 1, "Editing Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Editing Line 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const actualNode = render(
            <Provider store={testingStore}>
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onComplete={(): void => undefined}
                    onSave={(): void => undefined}
                    onViewTrackHistory={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );
        fireEvent.click(actualNode.container.querySelector(".sbte-jump-to-last-button") as HTMLElement);
        const changeScrollPositionSpy = jest.spyOn(cuesListScrollSlice, "changeScrollPosition");
        changeScrollPositionSpy.mockClear();

        // WHEN
        fireEvent.click(actualNode.getByTestId("sbte-jump-to-edit-cue-button"));

        // THEN
        expect(changeScrollPositionSpy).toBeCalledTimes(1);
        expect(changeScrollPositionSpy).toBeCalledWith(ScrollPosition.CURRENT);
    });

    it("jumps to playback cue when button is clicked", () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 1, "Editing Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Editing Line 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const actualNode = render(
            <Provider store={testingStore}>
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onComplete={(): void => undefined}
                    onSave={(): void => undefined}
                    onViewTrackHistory={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );
        fireEvent.click(actualNode.container.querySelector(".sbte-jump-to-last-button") as HTMLElement);
        const changeScrollPositionSpy = jest.spyOn(cuesListScrollSlice, "changeScrollPosition");
        changeScrollPositionSpy.mockClear();

        fireEvent.click(actualNode.getByTestId("sbte-jump-to-playback-cue-button"));

        // THEN
        expect(changeScrollPositionSpy).toBeCalledTimes(1);
        expect(changeScrollPositionSpy).toBeCalledWith(ScrollPosition.PLAYBACK);
    });

    it("jump to last translated subtitle button clicked", async () => {
        // GIVEN
        const cues = [] as CueDto[];
        const cueSize = 50;
        for (let idx = 0; idx < cueSize; idx++) {
            cues.push({ vttCue: new VTTCue(idx, idx + 1, `Editing Line ${idx + 1}`), cueCategory: "DIALOGUE" });
        }
        testingStore.dispatch(updateEditingTrack(testingTranslationTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues(cues) as {} as AnyAction);
        const actualNode = render(
            <Provider store={testingStore}>
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onComplete={(): void => undefined}
                    onSave={(): void => undefined}
                    onViewTrackHistory={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );
        const changeScrollPositionSpy = jest.spyOn(cuesListScrollSlice, "changeScrollPosition");
        changeScrollPositionSpy.mockClear();

        //WHEN
        await act(async () => {
            fireEvent.click(actualNode.getByTestId("sbte-jump-to-last-translated-cue-button"));
        });

        expect(actualNode.container.outerHTML).toContain(`Editing Line ${cueSize}`);
        expect(changeScrollPositionSpy).toBeCalledWith(ScrollPosition.LAST_TRANSLATED);
    });

    it("jump to last unlocked translated chunk subtitle button clicked", async () => {
        // GIVEN
        const cues = [] as CueDto[];
        const mediaChunkStart = 14;
        const mediaChunkEnd = 20;
        for (let timestamp = 0; timestamp < 50; timestamp++) {
            cues.push({
                vttCue: new VTTCue(timestamp, timestamp + 1, `Editing Line ${timestamp + 1}`),
                cueCategory: "DIALOGUE",
                editDisabled: !(timestamp >= mediaChunkStart  && ++timestamp <= mediaChunkEnd)
            });
        }
        testingStore.dispatch(updateEditingTrack(testingTranslationTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues(cues) as {} as AnyAction);
        const actualNode = render(
            <Provider store={testingStore}>
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onComplete={(): void => undefined}
                    onSave={(): void => undefined}
                    onViewTrackHistory={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );
        const changeScrollPositionSpy = jest.spyOn(cuesListScrollSlice, "changeScrollPosition");
        changeScrollPositionSpy.mockClear();

        //WHEN
        await act(async () => {
            fireEvent.click(actualNode.getByTestId("sbte-jump-to-last-translated-cue-button"));
        });

        expect(actualNode.container.outerHTML).toContain("Editing Line 15");
        expect(changeScrollPositionSpy).toBeCalledWith(ScrollPosition.LAST_TRANSLATED);
    });

    it("jumps to error cue when button is clicked", async () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 1, "Editing Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Editing Line 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const actualNode = render(
            <Provider store={testingStore}>
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onComplete={(): void => undefined}
                    onSave={(): void => undefined}
                    onViewTrackHistory={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );
        const changeScrollPositionSpy = jest.spyOn(cuesListScrollSlice, "changeScrollPosition");
        changeScrollPositionSpy.mockClear();

        //WHEN
        await act(async () => {
            fireEvent.click(actualNode.getByTestId("sbte-jump-error-cue-button"));
        });

        // THEN
        expect(changeScrollPositionSpy).toBeCalledTimes(1);
        expect(changeScrollPositionSpy).toBeCalledWith(ScrollPosition.ERROR);
    });

    it("cycles through error cues when button is clicked", async () => {
        // GIVEN
        const cueError = [
            CueError.TIME_GAP_LIMIT_EXCEEDED,
            CueError.TIME_GAP_OVERLAP
        ];

        const cues = [
            { vttCue: new VTTCue(0, 1, "Editing Line 1"), cueCategory: "DIALOGUE", errors: cueError },
            { vttCue: new VTTCue(1, 2, "Editing Line 2"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(2, 3, "Editing Line 3"), cueCategory: "DIALOGUE", errors: cueError },
            { vttCue: new VTTCue(3, 4, "Editing Line 4"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(4, 5, "Editing Line 5"), cueCategory: "DIALOGUE", errors: cueError },
            { vttCue: new VTTCue(5, 6, "Editing Line 4"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(6, 7, "Editing Line 4"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(7, 8, "Editing Line 4"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(8, 10, "Editing Line 4"), cueCategory: "DIALOGUE", errors: cueError },
        ] as CueDto[];

        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);

        const actualNode = render(
            <Provider store={testingStore}>
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onComplete={(): void => undefined}
                    onSave={(): void => undefined}
                    onViewTrackHistory={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );

        // WHEN
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        await act(async () => {
            fireEvent.click(actualNode.getByTestId("sbte-jump-error-cue-button"));
        });

        // THEN
        expect(testingStore.getState().currentCueErrorIndex).toEqual(0);

        // WHEN
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        await act(async () => {
            fireEvent.click(actualNode.getByTestId("sbte-jump-error-cue-button"));
        });

        // THEN
        expect(testingStore.getState().currentCueErrorIndex).toEqual(2);

        // WHEN
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        await act(async () => {
            fireEvent.click(actualNode.getByTestId("sbte-jump-error-cue-button"));
        });

        // THEN
        expect(testingStore.getState().currentCueErrorIndex).toEqual(4);

        // WHEN
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        await act(async () => {
            fireEvent.click(actualNode.getByTestId("sbte-jump-error-cue-button"));
        });

        // THEN
        expect(testingStore.getState().currentCueErrorIndex).toEqual(8);

        // WHEN
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        await act(async () => {
            fireEvent.click(actualNode.getByTestId("sbte-jump-error-cue-button"));
        });

        // THEN
        expect(testingStore.getState().currentCueErrorIndex).toEqual(0);
    });

    it("calls onSave callback on auto save", () => {
        // GIVEN
        const saveTrack = jest.fn();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        testingStore.dispatch(updateEditingTrack({} as Track) as {} as AnyAction);

        mount(
            <Provider store={testingStore}>
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewTrackHistory={(): void => undefined}
                    onSave={saveTrack}
                    onComplete={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );

        // WHEN
        callSaveTrack(testingStore.dispatch, testingStore.getState);

        // THEN
        expect(saveTrack).toHaveBeenCalledTimes(1);
    });

    it("resets all editing track data when unmounted", async () => {
        // GIVEN
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        testingStore.dispatch(updateSourceCues(cues) as {} as AnyAction);
        testingStore.dispatch(lastCueChangeSlice.actions.recordCueChange(
            { changeType: "EDIT", index: 0, vttCue: new VTTCue(0, 3, "blabla") }
        ));

        const { container } = render(
            <Provider store={testingStore}>
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewTrackHistory={(): void => undefined}
                    onSave={(): void => undefined}
                    onComplete={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );

        // WHEN
        ReactDOM.unmountComponentAtNode(container);

        // THEN
        await waitFor(() => {
            expect(testingStore.getState().loadingIndicator.cuesLoaded).toBeFalsy();
            expect(testingStore.getState().loadingIndicator.sourceCuesLoaded).toBeFalsy();
            expect(testingStore.getState().editingTrack).toBeNull();
            expect(testingStore.getState().cues).toEqual([]);
            expect(testingStore.getState().sourceCues).toEqual([]);
            expect(testingStore.getState().saveTrack).toBeNull();
            expect(testingStore.getState().autoSaveSuccess).toBeFalsy();
            expect(testingStore.getState().saveAction.saveState).toEqual(SaveState.NONE);
            expect(testingStore.getState().saveAction.multiCuesEdit).toBeFalsy();
            expect(testingStore.getState().pendingSave).toBeFalsy();
            expect(testingStore.getState().lastCueChange).toEqual(null);
        });
    });

    it("sets saveTrack when mounted", () => {
        // WHEN
        mount(
            <Provider store={testingStore}>
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewTrackHistory={(): void => undefined}
                    onSave={jest.fn()}
                    onComplete={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                />
            </Provider>
        );

        // THEN
        expect(testingStore.getState().saveTrack).toBeDefined();
    });

    it("sets spell checker domain when mounted", () => {
        // WHEN
        mount(
            <Provider store={testingStore}>
                <SubtitleEdit
                    mp4="dummyMp4"
                    poster="dummyPoster"
                    onViewTrackHistory={(): void => undefined}
                    onSave={jest.fn()}
                    onComplete={(): void => undefined}
                    onExportSourceFile={(): void => undefined}
                    onExportFile={(): void => undefined}
                    onImportFile={(): void => undefined}
                    spellCheckerDomain="testing-domain"
                />
            </Provider>
        );

        // THEN
        expect(testingStore.getState().spellCheckerSettings.domain).toEqual("testing-domain");
    });
});

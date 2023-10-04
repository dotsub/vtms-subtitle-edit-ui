import "../../../testUtils/initBrowserEnvironment";
import { createRef, ReactElement } from "react";
import { Provider } from "react-redux";
import { AnyAction } from "@reduxjs/toolkit";
import Mousetrap from "mousetrap";
// @ts-ignore - Doesn't have types definitions file
import * as simulant from "simulant";
import { render } from "@testing-library/react";

import { CueDto, Language, ScrollPosition, Track } from "../../model";
import { updateEditingTrack } from "../../trackSlices";
import CueLine, { CueLineProps } from "../cueLine/CueLine";
import { updateCues } from "./cuesListActions";
import CuesList from "./CuesList";
import { createTestingStore } from "../../../testUtils/testingStore";
import { act } from "react-dom/test-utils";
import { changeScrollPosition } from "./cuesListScrollSlice";
import { Character, KeyCombination } from "../../utils/shortcutConstants";
import { updateSourceCues } from "../view/sourceCueSlices";
import CueListToolbar from "../../CueListToolbar";

jest.mock(
    "../cueLine/CueLine",
    // eslint-disable-next-line react/display-name
    () => (props: CueLineProps): ReactElement => <div>CueLine: {JSON.stringify(props)}</div>
);

let testingStore = createTestingStore();

const testingCaptionTrack = {
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

const testingDirectTranslationTrack = {
    type: "TRANSLATION",
    language: { id: "fr-FR", name: "French (France)" } as Language,
    default: true,
    mediaTitle: "This is the video title",
    mediaLength: 4000,
} as Track;

describe("CuesList", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
    });

    describe("captioning", () => {
        it("renders captions only", () => {
            // GIVEN
            const cues = [
                { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Caption Line 3"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            testingStore.dispatch(updateCues(cues) as {} as AnyAction);
            const cuesInRedux = testingStore.getState().cues;
            const cuesWithIndexes = [
                { index: 0, cue: cuesInRedux[0] },
                { index: 1, cue: cuesInRedux[1] },
                { index: 2, cue: cuesInRedux[2] }
            ];
            const matchedCues = [
                { targetCues: [cuesWithIndexes[0]], sourceCues: []},
                { targetCues: [cuesWithIndexes[1]], sourceCues: []},
                { targetCues: [cuesWithIndexes[2]], sourceCues: []},
            ];

            const expectedNode = render(
                <Provider store={testingStore}>
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
                                data={{ targetCues: [cuesWithIndexes[0]], sourceCues: []}}
                                rowIndex={0}
                                rowProps={{ targetCuesLength: 3, withoutSourceCues:true, matchedCues }}
                                rowRef={createRef()}
                            />
                            <CueLine
                                data={{ targetCues: [cuesWithIndexes[1]], sourceCues: []}}
                                rowIndex={1}
                                rowProps={{ targetCuesLength: 3, withoutSourceCues:true, matchedCues }}
                                rowRef={createRef()}
                            />
                            <CueLine
                                data={{ targetCues: [cuesWithIndexes[2]], sourceCues: []}}
                                rowIndex={2}
                                rowProps={{ targetCuesLength: 3, withoutSourceCues:true, matchedCues }}
                                rowRef={createRef()}
                            />
                        </div >
                        <CueListToolbar
                            editingTrack={testingCaptionTrack}
                            onViewTrackHistory={jest.fn()}
                            onComplete={jest.fn()}
                            saveState="NONE"
                        />
                    </div>
                </Provider >
            );

            // WHEN
            testingStore.dispatch(changeScrollPosition(ScrollPosition.FIRST) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList
                        editingTrack={testingCaptionTrack}
                        onComplete={jest.fn()}
                        onViewTrackHistory={jest.fn()}
                        saveState="NONE"
                    />
                </Provider >
            );

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });
    });

    describe("direct translation", () => {
        it("renders", () => {
            // GIVEN
            const cues = [
                { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Caption Line 3"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            testingStore.dispatch(updateCues(cues) as {} as AnyAction);
            const cuesInRedux = testingStore.getState().cues;
            const cuesWithIndexes = [
                { index: 0, cue: cuesInRedux[0] },
                { index: 1, cue: cuesInRedux[1] },
                { index: 2, cue: cuesInRedux[2] }
            ];
            const matchedCues = [
                { targetCues: [cuesWithIndexes[0]], sourceCues: []},
                { targetCues: [cuesWithIndexes[1]], sourceCues: []},
                { targetCues: [cuesWithIndexes[2]], sourceCues: []},
            ];

            const expectedNode = render(
                <Provider store={testingStore}>
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
                                data={{ targetCues: [cuesWithIndexes[0]], sourceCues: []}}
                                rowIndex={0}
                                rowProps={{ targetCuesLength: 3, withoutSourceCues:true, matchedCues }}
                                rowRef={createRef()}
                            />
                            <CueLine
                                data={{ targetCues: [cuesWithIndexes[1]], sourceCues: []}}
                                rowIndex={1}
                                rowProps={{ targetCuesLength: 3, withoutSourceCues:true, matchedCues }}
                                rowRef={createRef()}
                            />
                            <CueLine
                                data={{ targetCues: [cuesWithIndexes[2]], sourceCues: []}}
                                rowIndex={2}
                                rowProps={{ targetCuesLength: 3, withoutSourceCues:true, matchedCues }}
                                rowRef={createRef()}
                            />
                        </div >
                        <CueListToolbar
                            editingTrack={testingDirectTranslationTrack}
                            onViewTrackHistory={jest.fn()}
                            onComplete={jest.fn()}
                            saveState="NONE"
                        />
                    </div>
                </Provider >
            );

            // WHEN
            testingStore.dispatch(changeScrollPosition(ScrollPosition.FIRST) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList
                        editingTrack={testingDirectTranslationTrack}
                        onComplete={jest.fn()}
                        onViewTrackHistory={jest.fn()}
                        saveState="NONE"
                    />
                </Provider >
            );

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });
    });

    describe("time matching for translation mode", () => {
        it("exact time match of translation cues", () => {
            // GIVEN
            const targetCues = [
                { vttCue: new VTTCue(0, 1, "Target Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1, 2, "Target Line 2"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Target Line 3"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            const sourceCues = [
                { vttCue: new VTTCue(0, 1, "Source Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1, 2, "Source Line 2"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Source Line 3"), cueCategory: "DIALOGUE" },
            ] as CueDto[];

            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);

            const targetCuesInRedux = testingStore.getState().cues;
            const targetCuesWithIndexes = [
                { index: 0, cue: targetCuesInRedux[0] },
                { index: 1, cue: targetCuesInRedux[1] },
                { index: 2, cue: targetCuesInRedux[2] }
            ];

            const sourceCuesInRedux = testingStore.getState().sourceCues;
            const sourceCuesWithIndexes = [
                { index: 0, cue: sourceCuesInRedux[0] },
                { index: 1, cue: sourceCuesInRedux[1] },
                { index: 2, cue: sourceCuesInRedux[2] }
            ];
            const matchedCues = [
                { targetCues: [targetCuesWithIndexes[0]], sourceCues: [sourceCuesWithIndexes[0]]},
                { targetCues: [targetCuesWithIndexes[1]], sourceCues: [sourceCuesWithIndexes[1]]},
                { targetCues: [targetCuesWithIndexes[2]], sourceCues: [sourceCuesWithIndexes[2]]},
            ];

            const expectedNode = render(
                <Provider store={testingStore}>
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
                                data={{ targetCues: [targetCuesWithIndexes[0]], sourceCues: [sourceCuesWithIndexes[0]]}}
                                rowIndex={0}
                                rowProps={{ targetCuesLength: 3, withoutSourceCues: false, matchedCues }}
                                rowRef={createRef()}
                            />
                            <CueLine
                                data={{ targetCues: [targetCuesWithIndexes[1]], sourceCues: [sourceCuesWithIndexes[1]]}}
                                rowIndex={1}
                                rowProps={{ targetCuesLength: 3, withoutSourceCues: false, matchedCues }}
                                rowRef={createRef()}
                            />
                            <CueLine
                                data={{ targetCues: [targetCuesWithIndexes[2]], sourceCues: [sourceCuesWithIndexes[2]]}}
                                rowIndex={2}
                                rowProps={{ targetCuesLength: 3, withoutSourceCues: false, matchedCues }}
                                rowRef={createRef()}
                            />
                        </div >
                        <CueListToolbar
                            editingTrack={testingTranslationTrack}
                            onViewTrackHistory={jest.fn()}
                            onComplete={jest.fn()}
                            saveState="NONE"
                        />
                    </div>
                </Provider >
            );

            // WHEN
            testingStore.dispatch(changeScrollPosition(ScrollPosition.FIRST) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList
                        editingTrack={testingTranslationTrack}
                        onComplete={jest.fn()}
                        onViewTrackHistory={jest.fn()}
                        saveState="NONE"
                    />
                </Provider >
            );

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });

        it("match when there are no translation cues created so far", () => {
            // GIVEN
            const sourceCues = [
                { vttCue: new VTTCue(0, 1, "Source Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1, 2, "Source Line 2"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Source Line 3"), cueCategory: "DIALOGUE" },
            ] as CueDto[];

            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);

            const sourceCuesInRedux = testingStore.getState().sourceCues;
            const sourceCuesWithIndexes = [
                { index: 0, cue: sourceCuesInRedux[0] },
                { index: 1, cue: sourceCuesInRedux[1] },
                { index: 2, cue: sourceCuesInRedux[2] }
            ];
            const matchedCues = [
                { targetCues: [], sourceCues: [sourceCuesWithIndexes[0]]},
                { targetCues: [], sourceCues: [sourceCuesWithIndexes[1]]},
                { targetCues: [], sourceCues: [sourceCuesWithIndexes[2]]},
            ];

            const expectedNode = render(
                <Provider store={testingStore}>
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
                                data={{ targetCues: [], sourceCues: [sourceCuesWithIndexes[0]]}}
                                rowIndex={0}
                                rowProps={{ targetCuesLength: 0, withoutSourceCues: false, matchedCues }}
                                rowRef={createRef()}
                            />
                            <CueLine
                                data={{ targetCues: [], sourceCues: [sourceCuesWithIndexes[1]]}}
                                rowIndex={1}
                                rowProps={{ targetCuesLength: 0, withoutSourceCues: false, matchedCues }}
                                rowRef={createRef()}
                            />
                            <CueLine
                                data={{ targetCues: [], sourceCues: [sourceCuesWithIndexes[2]]}}
                                rowIndex={2}
                                rowProps={{ targetCuesLength: 0, withoutSourceCues: false, matchedCues }}
                                rowRef={createRef()}
                            />
                        </div >
                        <CueListToolbar
                            editingTrack={testingTranslationTrack}
                            onViewTrackHistory={jest.fn()}
                            onComplete={jest.fn()}
                            saveState="NONE"
                        />
                    </div>
                </Provider >
            );

            // WHEN
            testingStore.dispatch(changeScrollPosition(ScrollPosition.FIRST) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList
                        editingTrack={testingTranslationTrack}
                        onComplete={jest.fn()}
                        onViewTrackHistory={jest.fn()}
                        saveState="NONE"
                    />
                </Provider >
            );

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });

        it("3 lines, 1 source cue, 3 target cues", () => {
            // GIVEN
            const targetCues = [
                { vttCue: new VTTCue(0, 1, "Target Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1, 2, "Target Line 2"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Target Line 3"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            const sourceCues = [
                { vttCue: new VTTCue(1, 2, "Source Line 2"), cueCategory: "DIALOGUE" },
            ] as CueDto[];

            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);

            const targetCuesInRedux = testingStore.getState().cues;
            const targetCuesWithIndexes = [
                { index: 0, cue: targetCuesInRedux[0] },
                { index: 1, cue: targetCuesInRedux[1] },
                { index: 2, cue: targetCuesInRedux[2] }
            ];

            const sourceCuesInRedux = testingStore.getState().sourceCues;
            const sourceCuesWithIndexes = [
                { index: 0, cue: sourceCuesInRedux[0] },
            ];
            const matchedCues = [
                { targetCues: [targetCuesWithIndexes[0]], sourceCues: []},
                { targetCues: [targetCuesWithIndexes[1]], sourceCues: [sourceCuesWithIndexes[0]]},
                { targetCues: [targetCuesWithIndexes[2]], sourceCues: []},
            ];

            const expectedNode = render(
                <Provider store={testingStore}>
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
                                data={{ targetCues: [targetCuesWithIndexes[0]], sourceCues: []}}
                                rowIndex={0}
                                rowProps={{ targetCuesLength: 3, withoutSourceCues: false, matchedCues }}
                                rowRef={createRef()}
                            />
                            <CueLine
                                data={{ targetCues: [targetCuesWithIndexes[1]], sourceCues: [sourceCuesWithIndexes[0]]}}
                                rowIndex={1}
                                rowProps={{ targetCuesLength: 3, withoutSourceCues: false, matchedCues }}
                                rowRef={createRef()}
                            />
                            <CueLine
                                data={{ targetCues: [targetCuesWithIndexes[2]], sourceCues: []}}
                                rowIndex={2}
                                rowProps={{ targetCuesLength: 3, withoutSourceCues: false, matchedCues }}
                                rowRef={createRef()}
                            />
                        </div >
                        <CueListToolbar
                            editingTrack={testingTranslationTrack}
                            onViewTrackHistory={jest.fn()}
                            onComplete={jest.fn()}
                            saveState="NONE"
                        />
                    </div>
                </Provider >
            );

            // WHEN
            testingStore.dispatch(changeScrollPosition(ScrollPosition.FIRST) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList
                        editingTrack={testingTranslationTrack}
                        onComplete={jest.fn()}
                        onViewTrackHistory={jest.fn()}
                        saveState="NONE"
                    />
                </Provider >
            );

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });

        it("4 lines, 1 source cue, 3 target cues", () => {
            // GIVEN
            const targetCues = [
                { vttCue: new VTTCue(0, 1, "Target Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Target Line 2"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(3, 4, "Target Line 3"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            const sourceCues = [
                { vttCue: new VTTCue(1, 2, "Source Line 2"), cueCategory: "DIALOGUE" },
            ] as CueDto[];

            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);

            const targetCuesInRedux = testingStore.getState().cues;
            const targetCuesWithIndexes = [
                { index: 0, cue: targetCuesInRedux[0] },
                { index: 1, cue: targetCuesInRedux[1] },
                { index: 2, cue: targetCuesInRedux[2] }
            ];

            const sourceCuesInRedux = testingStore.getState().sourceCues;
            const sourceCuesWithIndexes = [
                { index: 0, cue: sourceCuesInRedux[0] },
            ];
            const matchedCues = [
                { targetCues: [targetCuesWithIndexes[0]], sourceCues: []},
                { targetCues: [], sourceCues: [sourceCuesWithIndexes[0]]},
                { targetCues: [targetCuesWithIndexes[1]], sourceCues: []},
                { targetCues: [targetCuesWithIndexes[2]], sourceCues: []},
            ];

            const expectedNode = render(
                <Provider store={testingStore}>
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
                                data={{ targetCues: [targetCuesWithIndexes[0]], sourceCues: []}}
                                rowIndex={0}
                                rowProps={{ targetCuesLength: 3, withoutSourceCues: false, matchedCues }}
                                rowRef={createRef()}
                            />
                            <CueLine
                                data={{ targetCues: [], sourceCues: [sourceCuesWithIndexes[0]]}}
                                rowIndex={1}
                                rowProps={{ targetCuesLength: 3, withoutSourceCues: false, matchedCues }}
                                rowRef={createRef()}
                            />
                            <CueLine
                                data={{ targetCues: [targetCuesWithIndexes[1]], sourceCues: []}}
                                rowIndex={2}
                                rowProps={{ targetCuesLength: 3, withoutSourceCues: false, matchedCues }}
                                rowRef={createRef()}
                            />
                            <CueLine
                                data={{ targetCues: [targetCuesWithIndexes[2]], sourceCues: []}}
                                rowIndex={3}
                                rowProps={{ targetCuesLength: 3, withoutSourceCues: false, matchedCues }}
                                rowRef={createRef()}
                            />
                        </div >
                        <CueListToolbar
                            editingTrack={testingTranslationTrack}
                            onViewTrackHistory={jest.fn()}
                            onComplete={jest.fn()}
                            saveState="NONE"
                        />
                    </div>
                </Provider >
            );

            // WHEN
            testingStore.dispatch(changeScrollPosition(ScrollPosition.FIRST) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList
                        editingTrack={testingTranslationTrack}
                        onComplete={jest.fn()}
                        onViewTrackHistory={jest.fn()}
                        saveState="NONE"
                    />
                </Provider >
            );

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });

        it("3 lines, 3 source cues, 1 target cue", () => {
            // GIVEN
            const targetCues = [
                { vttCue: new VTTCue(1, 2, "Target Line 2"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            const sourceCues = [
                { vttCue: new VTTCue(0, 1, "Source Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1, 2, "Source Line 2"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Source Line 3"), cueCategory: "DIALOGUE" },
            ] as CueDto[];

            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);

            const targetCuesInRedux = testingStore.getState().cues;
            const targetCuesWithIndexes = [
                { index: 0, cue: targetCuesInRedux[0] },
            ];

            const sourceCuesInRedux = testingStore.getState().sourceCues;
            const sourceCuesWithIndexes = [
                { index: 0, cue: sourceCuesInRedux[0] },
                { index: 1, cue: sourceCuesInRedux[1] },
                { index: 2, cue: sourceCuesInRedux[2] }
            ];
            const matchedCues = [
                { targetCues: [], sourceCues: [sourceCuesWithIndexes[0]]},
                { targetCues: [targetCuesWithIndexes[0]], sourceCues: [sourceCuesWithIndexes[1]]},
                { targetCues: [], sourceCues: [sourceCuesWithIndexes[2]]},
            ];

            const expectedNode = render(
                <Provider store={testingStore}>
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
                                data={{ targetCues: [], sourceCues: [sourceCuesWithIndexes[0]]}}
                                rowIndex={0}
                                rowProps={{ targetCuesLength: 1, withoutSourceCues: false, matchedCues }}
                                rowRef={createRef()}
                            />
                            <CueLine
                                data={{ targetCues: [targetCuesWithIndexes[0]], sourceCues: [sourceCuesWithIndexes[1]]}}
                                rowIndex={1}
                                rowProps={{ targetCuesLength: 1, withoutSourceCues: false, matchedCues }}
                                rowRef={createRef()}
                            />
                            <CueLine
                                data={{ targetCues: [], sourceCues: [sourceCuesWithIndexes[2]]}}
                                rowIndex={2}
                                rowProps={{ targetCuesLength: 1, withoutSourceCues: false, matchedCues }}
                                rowRef={createRef()}
                            />
                        </div >
                        <CueListToolbar
                            editingTrack={testingTranslationTrack}
                            onViewTrackHistory={jest.fn()}
                            onComplete={jest.fn()}
                            saveState="NONE"
                        />
                    </div>
                </Provider >
            );

            // WHEN
            testingStore.dispatch(changeScrollPosition(ScrollPosition.FIRST) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList
                        editingTrack={testingTranslationTrack}
                        onComplete={jest.fn()}
                        onViewTrackHistory={jest.fn()}
                        saveState="NONE"
                    />
                </Provider >
            );

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });

        it("4 lines, 3 source cues, 1 target cue", () => {
            // GIVEN
            const targetCues = [
                { vttCue: new VTTCue(1, 2, "Target Line 2"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            const sourceCues = [
                { vttCue: new VTTCue(0, 1, "Source Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Source Line 2"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(3, 4, "Source Line 3"), cueCategory: "DIALOGUE" },
            ] as CueDto[];

            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);

            const targetCuesInRedux = testingStore.getState().cues;
            const targetCuesWithIndexes = [
                { index: 0, cue: targetCuesInRedux[0] },
            ];

            const sourceCuesInRedux = testingStore.getState().sourceCues;
            const sourceCuesWithIndexes = [
                { index: 0, cue: sourceCuesInRedux[0] },
                { index: 1, cue: sourceCuesInRedux[1] },
                { index: 2, cue: sourceCuesInRedux[2] }
            ];
            const matchedCues = [
                { targetCues: [], sourceCues: [sourceCuesWithIndexes[0]]},
                { targetCues: [targetCuesWithIndexes[0]], sourceCues: []},
                { targetCues: [], sourceCues: [sourceCuesWithIndexes[1]]},
                { targetCues: [], sourceCues: [sourceCuesWithIndexes[2]]},
            ];

            const expectedNode = render(
                <Provider store={testingStore}>
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
                                data={{ targetCues: [], sourceCues: [sourceCuesWithIndexes[0]]}}
                                rowIndex={0}
                                rowProps={{ targetCuesLength: 1, withoutSourceCues: false, matchedCues }}
                                rowRef={createRef()}
                            />
                            <CueLine
                                data={{ targetCues: [targetCuesWithIndexes[0]], sourceCues: []}}
                                rowIndex={1}
                                rowProps={{ targetCuesLength: 1, withoutSourceCues: false, matchedCues }}
                                rowRef={createRef()}
                            />
                            <CueLine
                                data={{ targetCues: [], sourceCues: [sourceCuesWithIndexes[1]]}}
                                rowIndex={2}
                                rowProps={{ targetCuesLength: 1, withoutSourceCues: false, matchedCues }}
                                rowRef={createRef()}
                            />
                            <CueLine
                                data={{ targetCues: [], sourceCues: [sourceCuesWithIndexes[2]]}}
                                rowIndex={3}
                                rowProps={{ targetCuesLength: 1, withoutSourceCues: false, matchedCues }}
                                rowRef={createRef()}
                            />
                        </div >
                        <CueListToolbar
                            editingTrack={testingTranslationTrack}
                            onViewTrackHistory={jest.fn()}
                            onComplete={jest.fn()}
                            saveState="NONE"
                        />
                    </div>
                </Provider >
            );

            // WHEN
            testingStore.dispatch(changeScrollPosition(ScrollPosition.FIRST) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList
                        editingTrack={testingTranslationTrack}
                        onComplete={jest.fn()}
                        onViewTrackHistory={jest.fn()}
                        saveState="NONE"
                    />
                </Provider >
            );

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });

        it("1 line, 1 source cue, 3 target cues", () => {
            // GIVEN
            const sourceCues = [
                { vttCue: new VTTCue(0, 3, "Source Line 1"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            const targetCues = [
                { vttCue: new VTTCue(0, 1, "Target Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1, 2, "Target Line 2"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Target Line 3"), cueCategory: "DIALOGUE" },
            ] as CueDto[];

            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);

            const targetCuesInRedux = testingStore.getState().cues;
            const targetCuesWithIndexes = [
                { index: 0, cue: targetCuesInRedux[0] },
                { index: 1, cue: targetCuesInRedux[1] },
                { index: 2, cue: targetCuesInRedux[2] }
            ];

            const sourceCuesInRedux = testingStore.getState().sourceCues;
            const sourceCuesWithIndexes = [{ index: 0, cue: sourceCuesInRedux[0] }];
            const matchedCues = [{ targetCues: targetCuesWithIndexes, sourceCues: sourceCuesWithIndexes }];

            const expectedNode = render(
                <Provider store={testingStore}>
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
                                data={{ targetCues: targetCuesWithIndexes, sourceCues: sourceCuesWithIndexes }}
                                rowIndex={0}
                                rowProps={{ targetCuesLength: 3, withoutSourceCues: false, matchedCues }}
                                rowRef={createRef()}
                            />
                        </div >
                        <CueListToolbar
                            editingTrack={testingTranslationTrack}
                            onViewTrackHistory={jest.fn()}
                            onComplete={jest.fn()}
                            saveState="NONE"
                        />
                    </div>
                </Provider >
            );

            // WHEN
            testingStore.dispatch(changeScrollPosition(ScrollPosition.FIRST) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList
                        editingTrack={testingTranslationTrack}
                        onComplete={jest.fn()}
                        onViewTrackHistory={jest.fn()}
                        saveState="NONE"
                    />
                </Provider >
            );

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });

        it("1 line, 3 source cues, 1 target cues", () => {
            // GIVEN
            const sourceCues = [
                { vttCue: new VTTCue(0, 1, "Source Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1, 2, "Source Line 2"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Source Line 3"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            const targetCues = [
                { vttCue: new VTTCue(0, 3, "Target Line 2"), cueCategory: "DIALOGUE" },
            ] as CueDto[];

            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);

            const targetCuesInRedux = testingStore.getState().cues;
            const targetCuesWithIndexes = [
                { index: 0, cue: targetCuesInRedux[0] },
            ];

            const sourceCuesInRedux = testingStore.getState().sourceCues;
            const sourceCuesWithIndexes = [
                { index: 0, cue: sourceCuesInRedux[0] },
                { index: 1, cue: sourceCuesInRedux[1] },
                { index: 2, cue: sourceCuesInRedux[2] }
            ];
            const matchedCues = [{ targetCues: targetCuesWithIndexes, sourceCues: sourceCuesWithIndexes }];

            const expectedNode = render(
                <Provider store={testingStore}>
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
                                data={{ targetCues: targetCuesWithIndexes, sourceCues: sourceCuesWithIndexes }}
                                rowIndex={0}
                                rowProps={{ targetCuesLength: 1, withoutSourceCues: false, matchedCues }}
                                rowRef={createRef()}
                            />
                        </div >
                        <CueListToolbar
                            editingTrack={testingTranslationTrack}
                            onViewTrackHistory={jest.fn()}
                            onComplete={jest.fn()}
                            saveState="NONE"
                        />
                    </div>
                </Provider >
            );

            // WHEN
            testingStore.dispatch(changeScrollPosition(ScrollPosition.FIRST) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList
                        editingTrack={testingTranslationTrack}
                        onComplete={jest.fn()}
                        onViewTrackHistory={jest.fn()}
                        saveState="NONE"
                    />
                </Provider >
            );

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });

        it("same middle time, source cue longer", () => {
            // GIVEN
            const targetCues = [
                { vttCue: new VTTCue(1, 2, "Target Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Target Line 2"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(3, 4, "Target Line 3"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            const sourceCues = [
                { vttCue: new VTTCue(1, 1.5, "Source Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1.5, 3.5, "Source Line 2"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(3.5, 4, "Source Line 3"), cueCategory: "DIALOGUE" },
            ] as CueDto[];

            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);

            const targetCuesInRedux = testingStore.getState().cues;
            const targetCuesWithIndexes = [
                { index: 0, cue: targetCuesInRedux[0] },
                { index: 1, cue: targetCuesInRedux[1] },
                { index: 2, cue: targetCuesInRedux[2] }
            ];

            const sourceCuesInRedux = testingStore.getState().sourceCues;
            const sourceCuesWithIndexes = [
                { index: 0, cue: sourceCuesInRedux[0] },
                { index: 1, cue: sourceCuesInRedux[1] },
                { index: 2, cue: sourceCuesInRedux[2] }
            ];
            const matchedCues = [
                { targetCues: [targetCuesWithIndexes[0]], sourceCues: [sourceCuesWithIndexes[0]]},
                { targetCues: [targetCuesWithIndexes[1]], sourceCues: [sourceCuesWithIndexes[1]]},
                { targetCues: [targetCuesWithIndexes[2]], sourceCues: [sourceCuesWithIndexes[2]]},
            ];

            const expectedNode = render(
                <Provider store={testingStore}>
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
                                data={{ targetCues: [targetCuesWithIndexes[0]], sourceCues: [sourceCuesWithIndexes[0]]}}
                                rowIndex={0}
                                rowProps={{ targetCuesLength: 3, withoutSourceCues: false, matchedCues }}
                                rowRef={createRef()}
                            />
                            <CueLine
                                data={{ targetCues: [targetCuesWithIndexes[1]], sourceCues: [sourceCuesWithIndexes[1]]}}
                                rowIndex={1}
                                rowProps={{ targetCuesLength: 3, withoutSourceCues: false, matchedCues }}
                                rowRef={createRef()}
                            />
                            <CueLine
                                data={{ targetCues: [targetCuesWithIndexes[2]], sourceCues: [sourceCuesWithIndexes[2]]}}
                                rowIndex={2}
                                rowProps={{ targetCuesLength: 3, withoutSourceCues: false, matchedCues }}
                                rowRef={createRef()}
                            />
                        </div >
                        <CueListToolbar
                            editingTrack={testingTranslationTrack}
                            onViewTrackHistory={jest.fn()}
                            onComplete={jest.fn()}
                            saveState="NONE"
                        />
                    </div>
                </Provider >
            );

            // WHEN
            testingStore.dispatch(changeScrollPosition(ScrollPosition.FIRST) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList
                        editingTrack={testingTranslationTrack}
                        onComplete={jest.fn()}
                        onViewTrackHistory={jest.fn()}
                        saveState="NONE"
                    />
                </Provider >
            );

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });

        it("same middle time, target cue longer", () => {
            // GIVEN
            const targetCues = [
                { vttCue: new VTTCue(1, 1.5, "Target Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(1.5, 3.5, "Target Line 2"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(3.5, 4, "Target Line 3"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            const sourceCues = [
                { vttCue: new VTTCue(1, 2, "Source Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(2, 3, "Source Line 2"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(3, 4, "Source Line 3"), cueCategory: "DIALOGUE" },
            ] as CueDto[];

            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);

            const targetCuesInRedux = testingStore.getState().cues;
            const targetCuesWithIndexes = [
                { index: 0, cue: targetCuesInRedux[0] },
                { index: 1, cue: targetCuesInRedux[1] },
                { index: 2, cue: targetCuesInRedux[2] }
            ];

            const sourceCuesInRedux = testingStore.getState().sourceCues;
            const sourceCuesWithIndexes = [
                { index: 0, cue: sourceCuesInRedux[0] },
                { index: 1, cue: sourceCuesInRedux[1] },
                { index: 2, cue: sourceCuesInRedux[2] }
            ];
            const matchedCues = [
                { targetCues: [targetCuesWithIndexes[0]], sourceCues: [sourceCuesWithIndexes[0]]},
                { targetCues: [targetCuesWithIndexes[1]], sourceCues: [sourceCuesWithIndexes[1]]},
                { targetCues: [targetCuesWithIndexes[2]], sourceCues: [sourceCuesWithIndexes[2]]},
            ];

            const expectedNode = render(
                <Provider store={testingStore}>
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
                                data={{ targetCues: [targetCuesWithIndexes[0]], sourceCues: [sourceCuesWithIndexes[0]]}}
                                rowIndex={0}
                                rowProps={{ targetCuesLength: 3, withoutSourceCues: false, matchedCues }}
                                rowRef={createRef()}
                            />
                            <CueLine
                                data={{ targetCues: [targetCuesWithIndexes[1]], sourceCues: [sourceCuesWithIndexes[1]]}}
                                rowIndex={1}
                                rowProps={{ targetCuesLength: 3, withoutSourceCues: false, matchedCues }}
                                rowRef={createRef()}
                            />
                            <CueLine
                                data={{ targetCues: [targetCuesWithIndexes[2]], sourceCues: [sourceCuesWithIndexes[2]]}}
                                rowIndex={2}
                                rowProps={{ targetCuesLength: 3, withoutSourceCues: false, matchedCues }}
                                rowRef={createRef()}
                            />
                        </div >
                        <CueListToolbar
                            editingTrack={testingTranslationTrack}
                            onViewTrackHistory={jest.fn()}
                            onComplete={jest.fn()}
                            saveState="NONE"
                        />
                    </div>
                </Provider >
            );

            // WHEN
            testingStore.dispatch(changeScrollPosition(ScrollPosition.FIRST) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList
                        editingTrack={testingTranslationTrack}
                        onComplete={jest.fn()}
                        onViewTrackHistory={jest.fn()}
                        saveState="NONE"
                    />
                </Provider >
            );

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });

        it("uses 65% overlap mechanism", () => {
            // GIVEN
            const targetCues = [
                { vttCue: new VTTCue(21.979, 22.055, "Target Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(22.414, 25.209, "Target Line 2"), cueCategory: "DIALOGUE" },
            ] as CueDto[];
            const sourceCues = [
                { vttCue: new VTTCue(21.674, 23.656, "Source Line 1"), cueCategory: "DIALOGUE" },
                { vttCue: new VTTCue(24.024, 24.504, "Source Line 2"), cueCategory: "DIALOGUE" },
            ] as CueDto[];

            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);

            const targetCuesInRedux = testingStore.getState().cues;
            const targetCuesWithIndexes = [
                { index: 0, cue: targetCuesInRedux[0] },
                { index: 1, cue: targetCuesInRedux[1] },
            ];

            const sourceCuesInRedux = testingStore.getState().sourceCues;
            const sourceCuesWithIndexes = [
                { index: 0, cue: sourceCuesInRedux[0] },
                { index: 1, cue: sourceCuesInRedux[1] },
            ];
            const matchedCues = [
                { targetCues: [targetCuesWithIndexes[0]], sourceCues: [sourceCuesWithIndexes[0]]},
                { targetCues: [targetCuesWithIndexes[1]], sourceCues: [sourceCuesWithIndexes[1]]},
            ];

            const expectedNode = render(
                <Provider store={testingStore}>
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
                                data={{ targetCues: [targetCuesWithIndexes[0]], sourceCues: [sourceCuesWithIndexes[0]]}}
                                rowIndex={0}
                                rowProps={{ targetCuesLength: 2, withoutSourceCues: false, matchedCues }}
                                rowRef={createRef()}
                            />
                            <CueLine
                                data={{ targetCues: [targetCuesWithIndexes[1]], sourceCues: [sourceCuesWithIndexes[1]]}}
                                rowIndex={1}
                                rowProps={{ targetCuesLength: 2, withoutSourceCues: false, matchedCues }}
                                rowRef={createRef()}
                            />
                        </div >
                        <CueListToolbar
                            editingTrack={testingTranslationTrack}
                            onViewTrackHistory={jest.fn()}
                            onComplete={jest.fn()}
                            saveState="NONE"
                        />
                    </div>
                </Provider >
            );

            // WHEN
            testingStore.dispatch(changeScrollPosition(ScrollPosition.FIRST) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CuesList
                        editingTrack={testingTranslationTrack}
                        onComplete={jest.fn()}
                        onViewTrackHistory={jest.fn()}
                        saveState="NONE"
                    />
                </Provider >
            );

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });
    });

    it("shows starts captioning button for empty direct translation track", async () => {
        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CuesList
                    editingTrack={testingDirectTranslationTrack}
                    onComplete={jest.fn()}
                    onViewTrackHistory={jest.fn()}
                    saveState="NONE"
                />
            </Provider >
        );
        await act(async () => {
            testingStore.dispatch(updateCues([]) as {} as AnyAction);
        });

        // THEN
        expect(actualNode.container.outerHTML).toContain("Start Captioning");
        expect(actualNode.container.outerHTML).not.toContain("CueLine");
    });

    it("adds first cue when ENTER is pressed", () => {
        // GIVEN
        const testingTrack = {
            type: "TRANSLATION",
            sourceLanguage: { id: "en-US", name: "English", direction: "LTR" } as Language,
            language: { id: "ar-SA", name: "Arabic", direction: "RTL" } as Language,
            default: true,
            mediaTitle: "Sample Polish",
            mediaLength: 4000,
            progress: 50
        } as Track;
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        render(
            <Provider store={testingStore}>
                <CuesList
                    editingTrack={testingDirectTranslationTrack}
                    onComplete={jest.fn()}
                    onViewTrackHistory={jest.fn()}
                    saveState="NONE"
                />
            </Provider >
        );
        testingStore.dispatch(updateCues([]) as {} as AnyAction);

        // WHEN
        simulant.fire(
            document.documentElement, "keydown", { keyCode: Character.ENTER });

        // THEN
        expect(testingStore.getState().cues.length).toEqual(1);
        expect(testingStore.getState().editingCueIndex).toEqual(0);
    });

    it("doesn't rebind enter key binding when cues are added", () => {
        // GIVEN
        const testingTrack = {
            type: "CAPTION",
            language: { id: "ar-SA", name: "Arabic", direction: "RTL" } as Language,
            default: true,
            mediaTitle: "Sample Polish",
            mediaLength: 4000,
            progress: 50
        } as Track;
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        render(
            <Provider store={testingStore}>
                <CuesList
                    editingTrack={testingDirectTranslationTrack}
                    onComplete={jest.fn()}
                    onViewTrackHistory={jest.fn()}
                    saveState="NONE"
                />
            </Provider >
        );
        testingStore.dispatch(updateCues([]) as {} as AnyAction);

        // WHEN
        simulant.fire(
            document.documentElement, "keydown", { keyCode: Character.ENTER });

        // THEN
        expect(testingStore.getState().cues.length).toEqual(1);
        expect(testingStore.getState().editingCueIndex).toEqual(0);

        // WHEN
        const testEnterBinding = jest.fn();
        Mousetrap.bind([KeyCombination.ENTER], testEnterBinding);
        const cues = [
            { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(2, 3, "Caption Line 3"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        simulant.fire(
            document.documentElement, "keydown", { keyCode: Character.ENTER });

        // THEN
        expect(testEnterBinding).toHaveBeenCalled();
        expect(testingStore.getState().cues.length).toEqual(3);
        expect(testingStore.getState().editingCueIndex).toEqual(0);
    });
});

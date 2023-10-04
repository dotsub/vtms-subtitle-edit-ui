import "../../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import { ReactElement } from "react";
import * as React from "react";
import { AnyAction } from "@reduxjs/toolkit";
import { fireEvent, render } from "@testing-library/react";
import { Provider } from "react-redux";

import { CueDto, CueError, CueLineState, Language, Track } from "../../model";
import CueEdit, { CueEditProps } from "../edit/CueEdit";
import CueLine, { CueLineRowProps } from "./CueLine";
import CueView, { CueViewProps } from "../view/CueView";
import { createTestingStore } from "../../../testUtils/testingStore";
import CueLineFlap from "./CueLineFlap";
import { updateEditingCueIndex } from "../edit/cueEditorSlices";
import { updateEditingTrack } from "../../trackSlices";
import "../edit/CueTextEditor";
import { updateSourceCues } from "../view/sourceCueSlices";
import { updateCues } from "../cuesList/cuesListActions";
import CueComments from "../comments/CueComments";
import { commentsVisibleSlice } from "../comments/commentsSlices";

// eslint-disable-next-line react/display-name
jest.mock("../edit/CueEdit", () => (props: CueEditProps): ReactElement => <div>CueEdit: {JSON.stringify(props)}</div>);
// eslint-disable-next-line react/display-name
jest.mock("../view/CueView", () => (props: CueViewProps): ReactElement => <div>CueView: {JSON.stringify(props)}</div>);

let testingStore = createTestingStore();

const targetCues = [
    { vttCue: new VTTCue(0, 1, "Editing Line 1"), cueCategory: "DIALOGUE" } as CueDto,
    { vttCue: new VTTCue(1, 2, "Editing Line 2"), cueCategory: "DIALOGUE" } as CueDto,
    { vttCue: new VTTCue(2, 3, "Editing Line 3"), cueCategory: "DIALOGUE" } as CueDto
];

const cueComments = [
    { author: "username", comment: "this is the first comment", date: "2021-01-01T11:00:00.000Z" },
    { author: "username", comment: "this is the second comment", date: "2021-01-01T11:00:00.000Z" },
    { author: "username", comment: "this is the third comment", date: "2021-01-01T11:00:00.000Z" }
];

const targetCuesWithComments = [
    { ...targetCues[0], comments: [cueComments[0]]} as CueDto,
    { ...targetCues[1], comments: [cueComments[0], cueComments[1]]} as CueDto,
    { ...targetCues[2], comments: [cueComments[0], cueComments[1], cueComments[2]]} as CueDto
];

const targetCuesWithIndexes = [
    { index: 0, cue: targetCues[0] },
    { index: 1, cue: targetCues[1] },
    { index: 2, cue: targetCues[2] }
];

const targetCuesWithCommentsWithIndexes = [
    { index: 0, cue: targetCuesWithComments[0] },
    { index: 1, cue: targetCuesWithComments[1] },
    { index: 2, cue: targetCuesWithComments[2] }
];

const sourceCues = [
    { vttCue: new VTTCue(0, 1, "Source Line 1"), cueCategory: "DIALOGUE" } as CueDto,
    { vttCue: new VTTCue(1, 2, "Source Line 2"), cueCategory: "DIALOGUE" } as CueDto,
    { vttCue: new VTTCue(2, 3, "Source Line 3"), cueCategory: "DIALOGUE" } as CueDto,
];

const sourceCuesWithIndexes = [
    { index: 0, cue: sourceCues[0] },
    { index: 1, cue: sourceCues[1] },
    { index: 2, cue: sourceCues[2] }
];

const matchedCuesTranslation = [
    { targetCues: [targetCuesWithIndexes[0]], sourceCues: [sourceCuesWithIndexes[0]]},
    { targetCues: [targetCuesWithIndexes[1]], sourceCues: [sourceCuesWithIndexes[1]]},
    { targetCues: [targetCuesWithIndexes[2]], sourceCues: [sourceCuesWithIndexes[2]]},
];

const matchedCuesCaptioning = [
    { targetCues: [targetCuesWithIndexes[0]], sourceCues: []},
    { targetCues: [targetCuesWithIndexes[1]], sourceCues: []},
    { targetCues: [targetCuesWithIndexes[2]], sourceCues: []},
];

describe("CueLine", () => {
    beforeEach(() => { testingStore = createTestingStore(); });
    describe("captioning mode", () => {
        it("renders edit line in captioning mode", () => {
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

            const expectedNode = render(
                <Provider store={testingStore}>
                    <div
                        className="sbte-cue-line"
                        style={{ display: "flex", paddingBottom: "5px", width: "100%" }}
                    >
                        <CueLineFlap
                            rowIndex={0}
                            cueLineState={CueLineState.GOOD}
                            cues={[{ index: 0, cue: targetCues[0] }]}
                        />
                        <div
                            className="border-t border-r border-blue-light-mostly-transparent rounded-r"
                            style={{ display: "grid", width: "100%" }}
                        >
                            <CueEdit
                                index={0}
                                cue={targetCues[0]}
                                nextCueLine={matchedCuesCaptioning[1]}
                                setGlossaryTerm={jest.fn()}
                                matchedCuesIndex={0}
                            />
                        </div>
                    </div>
                </Provider>
            );
            const cueLineRowProps = {
                playerTime: 0,
                withoutSourceCues: true,
                targetCuesLength: 3,
                matchedCues: matchedCuesCaptioning,
                commentAuthor: "Linguist"
            } as CueLineRowProps;

            // WHEN
            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CueLine
                        rowIndex={0}
                        data={matchedCuesCaptioning[0]}
                        rowProps={cueLineRowProps}
                        rowRef={React.createRef()}
                    />
                </Provider>
            );

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });

        it("spell checker error line is not rendered", () => {
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

            const corruptedCue = {
                ...targetCues[0],
                errors: [CueError.SPELLCHECK_ERROR]
            } as CueDto;

            const expectedNode = render(
                <Provider store={testingStore}>
                    <div
                        className="sbte-cue-line"
                        style={{ display: "flex", paddingBottom: "5px", width: "100%" }}
                    >
                        <CueLineFlap
                            rowIndex={0}
                            cueLineState={CueLineState.GOOD}
                            cues={[{ index: 0, cue: corruptedCue }]}
                            cuesErrors={[CueError.SPELLCHECK_ERROR]}
                            showErrors
                        />
                        <div
                            className="border-t border-r border-blue-light-mostly-transparent rounded-r"
                            style={{ display: "grid", width: "100%" }}
                        >
                            <CueEdit
                                index={0}
                                cue={corruptedCue}
                                nextCueLine={matchedCuesCaptioning[1]}
                                setGlossaryTerm={jest.fn()}
                                matchedCuesIndex={0}
                            />
                        </div>
                    </div>
                </Provider>
            );
            const cueLineRowProps = {
                playerTime: 0,
                withoutSourceCues: true,
                targetCuesLength: 3,
                matchedCues: matchedCuesCaptioning
            } as CueLineRowProps;

            // WHEN
            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CueLine
                        rowIndex={0}
                        data={{ targetCues: [{ index: 0, cue: corruptedCue }], sourceCues: []}}
                        rowProps={cueLineRowProps}
                        rowRef={React.createRef()}
                    />
                </Provider>
            );

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });
        it("renders edit line with single error in captioning mode", () => {
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

            const corruptedCue = {
                ...targetCues[0],
                errors: [CueError.LINE_CHAR_LIMIT_EXCEEDED]
            } as CueDto;

            const expectedNode = render(
                <Provider store={testingStore}>
                    <div
                        className="sbte-cue-line"
                        style={{ display: "flex", paddingBottom: "5px", width: "100%" }}
                    >
                        <CueLineFlap
                            rowIndex={0}
                            cueLineState={CueLineState.GOOD}
                            cues={[{ index: 0, cue: corruptedCue }]}
                            cuesErrors={[CueError.SPELLCHECK_ERROR]}
                            showErrors
                        />
                        <div
                            className="border-t border-r border-blue-light-mostly-transparent rounded-r"
                            style={{ display: "grid", width: "100%" }}
                        >
                            <CueEdit
                                index={0}
                                cue={corruptedCue}
                                nextCueLine={matchedCuesCaptioning[1]}
                                setGlossaryTerm={jest.fn()}
                                matchedCuesIndex={0}
                            />
                            <div className="sbte-cues-errors">• Max Characters Per Line Exceeded<br /></div>
                        </div>
                    </div>
                </Provider>
            );
            const cueLineRowProps = {
                playerTime: 0,
                withoutSourceCues: true,
                targetCuesLength: 3,
                matchedCues: matchedCuesCaptioning
            } as CueLineRowProps;

            // WHEN
            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CueLine
                        rowIndex={0}
                        data={{ targetCues: [{ index: 0, cue: corruptedCue }], sourceCues: []}}
                        rowProps={cueLineRowProps}
                        rowRef={React.createRef()}
                    />
                </Provider>
            );

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });

        it("renders edit line with multiple errors in captioning mode", () => {
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

            const corruptedCue = {
                ...targetCues[0],
                errors: [CueError.INVALID_RANGE_END, CueError.LINE_COUNT_EXCEEDED, CueError.TIME_GAP_OVERLAP]
            } as CueDto;

            const expectedNode = render(
                <Provider store={testingStore}>
                    <div className="sbte-cue-line" style={{ display: "flex", paddingBottom: "5px", width: "100%" }}>
                        <CueLineFlap
                            rowIndex={0}
                            cueLineState={CueLineState.GOOD}
                            cues={[{ index: 0, cue: corruptedCue }]}
                            cuesErrors={[CueError.LINE_CHAR_LIMIT_EXCEEDED]}
                            showErrors
                        />
                        <div
                            className="border-t border-r border-blue-light-mostly-transparent rounded-r"
                            style={{ display: "grid", width: "100%" }}
                        >
                            <CueEdit
                                index={0}
                                cue={corruptedCue}
                                nextCueLine={matchedCuesCaptioning[1]}
                                setGlossaryTerm={jest.fn()}
                                matchedCuesIndex={0}
                            />
                            <div className="sbte-cues-errors">
                                {/*eslint-disable-next-line react/jsx-child-element-spacing */}
                                • Invalid End Time<br />
                                {/*eslint-disable-next-line react/jsx-child-element-spacing */}
                                • Max Lines Per Caption Exceeded<br />
                                • Cue Overlap<br />
                            </div>
                        </div>
                    </div>
                </Provider>
            );
            const cueLineRowProps = {
                playerTime: 0,
                withoutSourceCues: true,
                targetCuesLength: 3,
                matchedCues: matchedCuesCaptioning,
                commentAuthor: "Linguist"
            } as CueLineRowProps;

            // WHEN
            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CueLine
                        rowIndex={0}
                        data={{ targetCues: [{ index: 0, cue: corruptedCue }], sourceCues: []}}
                        rowProps={cueLineRowProps}
                        rowRef={React.createRef()}
                    />
                </Provider>
            );

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });

        it("renders view line in captioning mode", () => {
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
            const expectedNode = render(
                <Provider store={testingStore}>
                    <div
                        className="sbte-cue-line"
                        style={{ display: "flex", paddingBottom: "5px", width: "100%" }}
                    >
                        <CueLineFlap
                            rowIndex={0}
                            cueLineState={CueLineState.GOOD}
                            cues={[{ index: 0, cue: targetCues[0] }]}
                        />
                        <div
                            className="border-t border-r border-blue-light-mostly-transparent rounded-r"
                            style={{ display: "grid", width: "100%" }}
                        >
                            <CueView
                                rowIndex={0}
                                isTargetCue
                                matchedNestedIndex={0}
                                targetCueIndex={0}
                                cue={targetCuesWithIndexes[0].cue}
                                targetCuesLength={3}
                                className="bg-gray-0 sbte-target-cue"
                                showGlossaryTerms={false}
                                languageDirection="RTL"
                                sourceCuesIndexes={[]}
                                nextTargetCueIndex={0}
                                editDisabled={false}
                            />
                        </div>
                    </div>
                </Provider>
            );
            const cueLineRowProps = {
                playerTime: 0,
                withoutSourceCues: true,
                targetCuesLength: 3,
                matchedCues: matchedCuesCaptioning,
                commentAuthor: "Linguist"
            } as CueLineRowProps;

            // WHEN
            testingStore.dispatch(updateEditingCueIndex(-1) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CueLine
                        rowIndex={0}
                        data={matchedCuesCaptioning[0]}
                        rowProps={cueLineRowProps}
                        rowRef={React.createRef()}
                    />
                </Provider>
            );

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });

        it("renders view line in captioning mode with edit disable class", () => {
            // GIVEN
            const testingTrack = {
                type: "CAPTION",
                language: { id: "ar-SA", name: "Arabic", direction: "RTL" } as Language,
                default: true,
                mediaTitle: "Sample Polish",
                mediaLength: 4000,
                mediaChunkStart: 2000,
                mediaChunkEnd: 4000,
                progress: 50
            } as Track;
            testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
            const matchedCuesCaptioningEditDisabled = [ ...matchedCuesCaptioning ];
            const disabledCue = { ...targetCues[0], editDisabled: true };
            matchedCuesCaptioningEditDisabled[0].targetCues[0] = { index: 0, cue: disabledCue };
            const expectedNode = render(
                <Provider store={testingStore}>
                    <div
                        className="sbte-cue-line"
                        style={{ display: "flex", paddingBottom: "5px", width: "100%" }}
                    >
                        <CueLineFlap
                            rowIndex={0}
                            cueLineState={CueLineState.GOOD}
                            cues={[{ index: 0, cue: matchedCuesCaptioningEditDisabled[0].targetCues[0].cue }]}
                            editDisabled
                        />
                        <div
                            className="border-t border-r border-blue-light-mostly-transparent rounded-r
                                sbte-edit-disabled"
                            style={{ display: "grid", width: "100%" }}
                        >
                            <CueView
                                rowIndex={0}
                                isTargetCue
                                matchedNestedIndex={0}
                                targetCueIndex={0}
                                cue={matchedCuesCaptioningEditDisabled[0].targetCues[0].cue}
                                targetCuesLength={3}
                                className="bg-gray-0 sbte-target-cue"
                                showGlossaryTerms={false}
                                languageDirection="RTL"
                                sourceCuesIndexes={[]}
                                nextTargetCueIndex={0}
                                editDisabled
                            />
                        </div>
                    </div>
                </Provider>
            );
            const cueLineRowProps = {
                playerTime: 0,
                withoutSourceCues: true,
                targetCuesLength: 3,
                matchedCues: matchedCuesCaptioningEditDisabled,
                commentAuthor: "Linguist"
            } as CueLineRowProps;

            // WHEN
            testingStore.dispatch(updateEditingCueIndex(-1) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CueLine
                        rowIndex={0}
                        data={matchedCuesCaptioningEditDisabled[0]}
                        rowProps={cueLineRowProps}
                        rowRef={React.createRef()}
                    />
                </Provider>
            );

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });
    });

    describe("translation mode", () => {
        it("renders middle edit line in translation mode", () => {
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
            const expectedNode = render(
                <Provider store={testingStore}>
                    <div
                        className="sbte-cue-line"
                        style={{ display: "flex", paddingBottom: "5px", width: "100%" }}
                    >
                        <CueLineFlap
                            rowIndex={1}
                            cueLineState={CueLineState.GOOD}
                            cues={[{ index: 0, cue: targetCues[1] }]}
                        />
                        <div
                            className="border-t border-r border-blue-light-mostly-transparent rounded-r"
                            style={{ display: "grid", width: "100%" }}
                        >
                            <CueView
                                rowIndex={1}
                                isTargetCue={false}
                                matchedNestedIndex={0}
                                targetCueIndex={1}
                                cue={sourceCues[1]}
                                targetCuesLength={3}
                                className="bg-gray-0 sbte-source-cue"
                                showGlossaryTerms
                                languageDirection="LTR"
                                sourceCuesIndexes={[1]}
                                nextTargetCueIndex={1}
                                editDisabled={false}
                            />
                            <CueEdit
                                index={1}
                                cue={targetCues[1]}
                                nextCueLine={matchedCuesTranslation[2]}
                                setGlossaryTerm={jest.fn()}
                                matchedCuesIndex={1}
                            />
                        </div>
                    </div>
                </Provider>
            );
            const cueLineRowProps = {
                playerTime: 0,
                withoutSourceCues: false,
                targetCuesLength: 3,
                matchedCues: matchedCuesTranslation,
                commentAuthor: "Linguist"
            } as CueLineRowProps;

            // WHEN
            testingStore.dispatch(updateEditingCueIndex(1) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CueLine
                        rowIndex={1}
                        data={matchedCuesTranslation[1]}
                        rowProps={cueLineRowProps}
                        rowRef={React.createRef()}
                    />
                </Provider>
            );

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });

        it("renders last edit line in translation mode", () => {
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
            const cueLine = { targetCues: [targetCuesWithIndexes[2]], sourceCues: [sourceCuesWithIndexes[2]]};
            const expectedNode = render(
                <Provider store={testingStore}>
                    <div
                        className="sbte-cue-line"
                        style={{ display: "flex", paddingBottom: "5px", width: "100%" }}
                    >
                        <CueLineFlap
                            rowIndex={2}
                            cueLineState={CueLineState.GOOD}
                            cues={[{ index: 0, cue: targetCues[2] }]}
                        />
                        <div
                            className="border-t border-r border-blue-light-mostly-transparent rounded-r"
                            style={{ display: "grid", width: "100%" }}
                        >
                            <CueView
                                rowIndex={2}
                                isTargetCue={false}
                                matchedNestedIndex={0}
                                targetCueIndex={2}
                                cue={sourceCues[2]}
                                targetCuesLength={3}
                                className="bg-gray-0 sbte-source-cue"
                                showGlossaryTerms
                                languageDirection="LTR"
                                sourceCuesIndexes={[2]}
                                nextTargetCueIndex={2}
                                editDisabled={false}
                            />
                            <CueEdit index={2} cue={targetCues[2]} setGlossaryTerm={jest.fn()} matchedCuesIndex={2} />
                        </div>
                    </div>
                </Provider>
            );
            const cueLineRowProps = {
                playerTime: 0,
                withoutSourceCues: false,
                targetCuesLength: 3,
                matchedCues: matchedCuesTranslation
            } as CueLineRowProps;

            // WHEN
            testingStore.dispatch(updateEditingCueIndex(2) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CueLine
                        rowIndex={2}
                        data={cueLine}
                        rowProps={cueLineRowProps}
                        rowRef={React.createRef()}
                    />
                </Provider>
            );

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });

        it("renders view line in translation mode with edit disabled class", () => {
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
            const matchedCuesTranslationEditDisabled = [ ...matchedCuesTranslation ];
            const disabledTargetCue = { ...targetCues[0], editDisabled: true };
            matchedCuesTranslationEditDisabled[0].targetCues[0] = { index: 0, cue: disabledTargetCue };
            const cueLine = { targetCues: matchedCuesTranslationEditDisabled[0].targetCues,
                sourceCues: [sourceCuesWithIndexes[0]]};
            const expectedNode = render(
                <Provider store={testingStore}>
                    <div
                        className="sbte-cue-line"
                        style={{ display: "flex", paddingBottom: "5px", width: "100%" }}
                    >
                        <CueLineFlap
                            rowIndex={0}
                            cueLineState={CueLineState.GOOD}
                            cues={[{ index: 0, cue: disabledTargetCue }]}
                            editDisabled
                        />
                        <div
                            className="border-t border-r border-blue-light-mostly-transparent rounded-r
                                sbte-edit-disabled"
                            style={{ display: "grid", width: "100%" }}
                        >
                            <CueView
                                rowIndex={0}
                                isTargetCue={false}
                                matchedNestedIndex={0}
                                targetCueIndex={0}
                                cue={sourceCues[0]}
                                targetCuesLength={1}
                                className="bg-gray-0 sbte-source-cue"
                                showGlossaryTerms={false}
                                languageDirection="LTR"
                                sourceCuesIndexes={[0]}
                                nextTargetCueIndex={0}
                                editDisabled
                            />
                            <CueView
                                rowIndex={0}
                                isTargetCue
                                matchedNestedIndex={0}
                                targetCueIndex={0}
                                cue={disabledTargetCue}
                                targetCuesLength={1}
                                className="bg-gray-0 sbte-target-cue"
                                showGlossaryTerms={false}
                                languageDirection="RTL"
                                sourceCuesIndexes={[0]}
                                nextTargetCueIndex={0}
                                editDisabled
                            />
                        </div>
                    </div>
                </Provider>
            );
            const cueLineRowProps = {
                playerTime: 0,
                withoutSourceCues: false,
                targetCuesLength: 1,
                matchedCues: matchedCuesTranslationEditDisabled,
                commentAuthor: "Linguist"
            } as CueLineRowProps;

            // WHEN
            testingStore.dispatch(updateEditingCueIndex(-1) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CueLine
                        rowIndex={0}
                        data={cueLine}
                        rowProps={cueLineRowProps}
                        rowRef={React.createRef()}
                    />
                </Provider>
            );

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });

        it("renders view line that doesn't have target", () => {
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
            const expectedNode = render(
                <Provider store={testingStore}>
                    <div
                        className="sbte-cue-line"
                        style={{ display: "flex", paddingBottom: "5px", width: "100%" }}
                    >
                        <CueLineFlap
                            rowIndex={0}
                            cueLineState={CueLineState.NONE}
                            cues={[{ index: 0, cue: sourceCues[0] }]}
                        />
                        <div
                            className="border-t border-r border-blue-light-mostly-transparent rounded-r"
                            style={{ display: "grid", width: "100%" }}
                        >
                            <CueView
                                rowIndex={0}
                                isTargetCue={false}
                                matchedNestedIndex={0}
                                cue={sourceCues[0]}
                                targetCuesLength={3}
                                className="bg-gray-0 sbte-source-cue"
                                showGlossaryTerms={false}
                                languageDirection="LTR"
                                sourceCuesIndexes={[0]}
                                nextTargetCueIndex={1}
                                editDisabled={false}
                            />
                            <div
                                style={{ display: "flex" }}
                                className="bg-gray-0 border-b border-blue-light-mostly-transparent
                                    sbte-click-cue-wrapper"
                            >
                                <div
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        minHeight: "78px"
                                    }}
                                >
                                    <button
                                        style={{ maxHeight: "38px", margin: "5px", width: "300px" }}
                                        className="sbte-btn sbte-btn-primary sbte-add-cue-button"
                                    >
                                        Insert cue
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Provider>
            );
            const matchedCues = [
                { targetCues: [], sourceCues: [sourceCuesWithIndexes[0]]},
                { targetCues: [], sourceCues: [sourceCuesWithIndexes[1]]},
                { targetCues: [targetCuesWithIndexes[1]], sourceCues: []},
                { targetCues: [targetCuesWithIndexes[2]], sourceCues: [sourceCuesWithIndexes[2]]},
            ];
            const cueLineRowProps = {
                playerTime: 0,
                withoutSourceCues: false,
                targetCuesLength: 3,
                matchedCues: matchedCues,
                commentAuthor: "Linguist"
            } as CueLineRowProps;

            // WHEN
            const actualNode = render(
                <Provider store={testingStore}>
                    <CueLine
                        rowIndex={0}
                        data={matchedCues[0]}
                        rowProps={cueLineRowProps}
                        rowRef={React.createRef()}
                    />
                </Provider>
            );

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });

        it("renders view line where following lines doesn't have any target anymore", () => {
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
            const expectedNode = render(
                <Provider store={testingStore}>
                    <div
                        className="sbte-cue-line"
                        style={{ display: "flex", paddingBottom: "5px", width: "100%" }}
                    >
                        <CueLineFlap
                            rowIndex={0}
                            cueLineState={CueLineState.NONE}
                            cues={[{ index: 0, cue: sourceCues[0] }]}
                        />
                        <div
                            className="border-t border-r border-blue-light-mostly-transparent rounded-r"
                            style={{ display: "grid", width: "100%" }}
                        >
                            <CueView
                                rowIndex={0}
                                isTargetCue={false}
                                matchedNestedIndex={0}
                                cue={sourceCues[0]}
                                targetCuesLength={3}
                                className="bg-gray-0 sbte-source-cue"
                                showGlossaryTerms={false}
                                languageDirection="LTR"
                                sourceCuesIndexes={[0]}
                                nextTargetCueIndex={-1}
                                editDisabled={false}
                            />
                            <div
                                style={{ display: "flex" }}
                                className="bg-gray-0 border-b border-blue-light-mostly-transparent
                                    sbte-click-cue-wrapper"
                            >
                                <div
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        minHeight: "78px"
                                    }}
                                >
                                    <button
                                        style={{ maxHeight: "38px", margin: "5px", width: "300px" }}
                                        className="sbte-btn sbte-btn-primary sbte-add-cue-button"
                                    >
                                        Insert cue
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Provider>
            );
            const matchedCues = [
                { targetCues: [], sourceCues: [sourceCuesWithIndexes[0]]},
                { targetCues: [], sourceCues: [sourceCuesWithIndexes[1]]},
                { targetCues: [], sourceCues: [sourceCuesWithIndexes[2]]},
            ];
            const cueLineRowProps = {
                playerTime: 0,
                withoutSourceCues: false,
                targetCuesLength: 3,
                matchedCues: matchedCues,
                commentAuthor: "Linguist"
            } as CueLineRowProps;

            // WHEN
            const actualNode = render(
                <Provider store={testingStore}>
                    <CueLine
                        rowIndex={0}
                        data={matchedCues[0]}
                        rowProps={cueLineRowProps}
                        rowRef={React.createRef()}
                    />
                </Provider>
            );

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });

        it("renders view + translation without target", () => {
            // GIVEN
            const expectedNode = render(
                <Provider store={testingStore}>
                    <div
                        className="sbte-cue-line"
                        style={{ display: "flex", paddingBottom: "5px", width: "100%" }}
                    >
                        <CueLineFlap
                            rowIndex={0}
                            cueLineState={CueLineState.NONE}
                            cues={[{ index: 0, cue: sourceCues[0] }]}
                        />
                        <div
                            className="border-t border-r border-blue-light-mostly-transparent rounded-r"
                            style={{ display: "grid", width: "100%" }}
                        >
                            <CueView
                                rowIndex={0}
                                isTargetCue={false}
                                matchedNestedIndex={0}
                                cue={sourceCues[0]}
                                targetCuesLength={0}
                                className="bg-gray-0 sbte-source-cue"
                                showGlossaryTerms={false}
                                sourceCuesIndexes={[0]}
                                nextTargetCueIndex={-1}
                                editDisabled={false}
                            />
                            <div
                                style={{ display: "flex" }}
                                className="bg-gray-0 border-b border-blue-light-mostly-transparent
                                    sbte-click-cue-wrapper"
                            >
                                <div
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        minHeight: "78px"
                                    }}
                                >
                                    <button
                                        style={{ maxHeight: "38px", margin: "5px", width: "300px" }}
                                        className="sbte-btn sbte-btn-primary sbte-add-cue-button"
                                    >
                                        Insert cue
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Provider>
            );
            const cueWithSource = { sourceCues: [sourceCuesWithIndexes[0]]};
            const cueLineRowProps = {
                playerTime: 0,
                withoutSourceCues: false,
                targetCuesLength: 0,
                matchedCues: [cueWithSource],
                commentAuthor: "Linguist"
            } as CueLineRowProps;

            // WHEN
            const actualNode = render(
                <Provider store={testingStore}>
                    <CueLine
                        rowIndex={0}
                        data={cueWithSource}
                        rowProps={cueLineRowProps}
                        rowRef={React.createRef()}
                    />
                </Provider>
            );

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });

        it("renders view + translation without source", () => {
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
            const cueLine = { targetCues: [targetCuesWithIndexes[0]], sourceCues: []};
            const expectedNode = render(
                <Provider store={testingStore}>
                    <div
                        className="sbte-cue-line"
                        style={{ display: "flex", paddingBottom: "5px", width: "100%" }}
                    >
                        <CueLineFlap
                            rowIndex={0}
                            cueLineState={CueLineState.GOOD}
                            cues={[{ index: 0, cue: targetCues[0] }]}
                        />
                        <div
                            className="border-t border-r border-blue-light-mostly-transparent rounded-r"
                            style={{ display: "grid", width: "100%" }}
                        >
                            <div
                                style={{ display: "flex" }}
                                className="bg-gray-0 border-b border-blue-light-mostly-transparent
                                    sbte-click-cue-wrapper"
                            >
                                <div style={{ width: "100%", minHeight: "78px" }} />
                            </div>
                            <CueView
                                rowIndex={0}
                                isTargetCue
                                matchedNestedIndex={0}
                                targetCueIndex={0}
                                cue={targetCues[0]}
                                targetCuesLength={1}
                                className="bg-gray-0 sbte-target-cue"
                                showGlossaryTerms={false}
                                languageDirection="RTL"
                                sourceCuesIndexes={[]}
                                nextTargetCueIndex={0}
                                editDisabled={false}
                            />
                        </div>
                    </div>
                </Provider>
            );
            const cueLineRowProps = {
                playerTime: 0,
                withoutSourceCues: false,
                targetCuesLength: 1,
                matchedCues: [cueLine],
                commentAuthor: "Linguist"
            } as CueLineRowProps;

            // WHEN
            testingStore.dispatch(updateEditingCueIndex(-1) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CueLine
                        rowIndex={0}
                        data={cueLine}
                        rowProps={cueLineRowProps}
                        rowRef={React.createRef()}
                    />
                </Provider>
            );

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });

        it("renders translation view line with 3 source cues", () => {
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
            const cueLine = { targetCues: [targetCuesWithIndexes[0]], sourceCues: sourceCuesWithIndexes };
            const expectedNode = render(
                <Provider store={testingStore}>
                    <div
                        className="sbte-cue-line"
                        style={{ display: "flex", paddingBottom: "5px", width: "100%" }}
                    >
                        <CueLineFlap
                            rowIndex={0}
                            cueLineState={CueLineState.GOOD}
                            cues={[{ index: 0, cue: targetCues[0] }]}
                        />
                        <div
                            className="border-t border-r border-blue-light-mostly-transparent rounded-r"
                            style={{ display: "grid", width: "100%" }}
                        >
                            <CueView
                                rowIndex={0}
                                isTargetCue={false}
                                matchedNestedIndex={0}
                                targetCueIndex={0}
                                cue={sourceCues[0]}
                                targetCuesLength={1}
                                className="bg-gray-0 sbte-source-cue"
                                showGlossaryTerms={false}
                                languageDirection="LTR"
                                sourceCuesIndexes={[0, 1, 2]}
                                nextTargetCueIndex={0}
                                editDisabled={false}
                            />
                            <CueView
                                rowIndex={0}
                                isTargetCue={false}
                                matchedNestedIndex={1}
                                targetCueIndex={0}
                                cue={sourceCues[1]}
                                targetCuesLength={1}
                                className="bg-gray-0 sbte-source-cue"
                                showGlossaryTerms={false}
                                languageDirection="LTR"
                                sourceCuesIndexes={[0, 1, 2]}
                                nextTargetCueIndex={0}
                                editDisabled={false}
                            />
                            <CueView
                                rowIndex={0}
                                isTargetCue={false}
                                matchedNestedIndex={2}
                                targetCueIndex={0}
                                cue={sourceCues[2]}
                                targetCuesLength={1}
                                className="bg-gray-0 sbte-source-cue"
                                showGlossaryTerms={false}
                                languageDirection="LTR"
                                sourceCuesIndexes={[0, 1, 2]}
                                nextTargetCueIndex={0}
                                editDisabled={false}
                            />
                            <div className="sbte-cue-divider-good" />
                            <CueView
                                rowIndex={0}
                                isTargetCue
                                matchedNestedIndex={0}
                                targetCueIndex={0}
                                cue={targetCues[0]}
                                targetCuesLength={1}
                                className="bg-gray-0 sbte-target-cue"
                                showGlossaryTerms={false}
                                languageDirection="RTL"
                                sourceCuesIndexes={[0, 1, 2]}
                                nextTargetCueIndex={0}
                                editDisabled={false}
                            />
                        </div>
                    </div>
                </Provider>
            );
            const cueLineRowProps = {
                playerTime: 0,
                withoutSourceCues: false,
                targetCuesLength: 1,
                matchedCues: [cueLine],
                commentAuthor: "Linguist"
            } as CueLineRowProps;

            // WHEN
            testingStore.dispatch(updateEditingCueIndex(-1) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CueLine
                        rowIndex={0}
                        data={cueLine}
                        rowProps={cueLineRowProps}
                        rowRef={React.createRef()}
                    />
                </Provider>
            );

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });

        it("renders translation view line with 3 target cues", () => {
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
            const cueLine = { targetCues: targetCuesWithIndexes, sourceCues: [sourceCuesWithIndexes[0]]};
            const expectedNode = render(
                <Provider store={testingStore}>
                    <div
                        className="sbte-cue-line"
                        style={{ display: "flex", paddingBottom: "5px", width: "100%" }}
                    >
                        <CueLineFlap
                            rowIndex={0}
                            cueLineState={CueLineState.GOOD}
                            cues={[
                                { index: 0, cue: targetCues[0] },
                                { index: 1, cue: targetCues[1] },
                                { index: 2, cue: targetCues[2] }
                            ]}
                        />
                        <div
                            className="border-t border-r border-blue-light-mostly-transparent rounded-r"
                            style={{ display: "grid", width: "100%" }}
                        >
                            <CueView
                                rowIndex={0}
                                isTargetCue={false}
                                matchedNestedIndex={0}
                                targetCueIndex={0}
                                cue={sourceCues[0]}
                                targetCuesLength={3}
                                className="bg-gray-0 sbte-source-cue"
                                showGlossaryTerms={false}
                                languageDirection="LTR"
                                sourceCuesIndexes={[0]}
                                nextTargetCueIndex={0}
                                editDisabled={false}
                            />
                            <div className="sbte-cue-divider-good" />
                            <CueView
                                rowIndex={0}
                                isTargetCue
                                matchedNestedIndex={0}
                                targetCueIndex={0}
                                cue={targetCues[0]}
                                targetCuesLength={3}
                                className="bg-gray-0 sbte-target-cue"
                                showGlossaryTerms={false}
                                languageDirection="RTL"
                                sourceCuesIndexes={[0]}
                                nextTargetCueIndex={0}
                                editDisabled={false}
                            />
                            <CueView
                                rowIndex={0}
                                isTargetCue
                                matchedNestedIndex={1}
                                targetCueIndex={1}
                                cue={targetCues[1]}
                                targetCuesLength={3}
                                className="bg-gray-0 sbte-target-cue"
                                showGlossaryTerms={false}
                                languageDirection="RTL"
                                sourceCuesIndexes={[0]}
                                nextTargetCueIndex={0}
                                editDisabled={false}
                            />
                            <CueView
                                rowIndex={0}
                                isTargetCue
                                matchedNestedIndex={2}
                                targetCueIndex={2}
                                cue={targetCues[2]}
                                targetCuesLength={3}
                                className="bg-gray-0 sbte-target-cue"
                                showGlossaryTerms={false}
                                languageDirection="RTL"
                                sourceCuesIndexes={[0]}
                                nextTargetCueIndex={0}
                                editDisabled={false}
                            />
                        </div>
                    </div>
                </Provider>
            );
            const cueLineRowProps = {
                playerTime: 0,
                withoutSourceCues: false,
                targetCuesLength: 3,
                matchedCues: [cueLine],
                commentAuthor: "Linguist"
            } as CueLineRowProps;

            // WHEN
            testingStore.dispatch(updateEditingCueIndex(-1) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CueLine
                        rowIndex={0}
                        data={cueLine}
                        rowProps={cueLineRowProps}
                        rowRef={React.createRef()}
                    />
                </Provider>
            );

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });

        it("renders translation edit line with 3 source cues", () => {
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
            const cueLine = { targetCues: [targetCuesWithIndexes[0]], sourceCues: sourceCuesWithIndexes };
            const expectedNode = render(
                <Provider store={testingStore}>
                    <div
                        className="sbte-cue-line"
                        style={{ display: "flex", paddingBottom: "5px", width: "100%" }}
                    >
                        <CueLineFlap
                            rowIndex={0}
                            cueLineState={CueLineState.GOOD}
                            cues={[{ index: 0, cue: targetCues[0] }]}
                        />
                        <div
                            className="border-t border-r border-blue-light-mostly-transparent rounded-r"
                            style={{ display: "grid", width: "100%" }}
                        >
                            <CueView
                                rowIndex={0}
                                isTargetCue={false}
                                matchedNestedIndex={0}
                                targetCueIndex={0}
                                cue={sourceCues[0]}
                                targetCuesLength={1}
                                className="bg-gray-0 sbte-source-cue"
                                showGlossaryTerms
                                languageDirection="LTR"
                                sourceCuesIndexes={[0, 1, 2]}
                                nextTargetCueIndex={0}
                                editDisabled={false}
                            />
                            <CueView
                                rowIndex={0}
                                isTargetCue={false}
                                matchedNestedIndex={1}
                                targetCueIndex={0}
                                cue={sourceCues[1]}
                                targetCuesLength={1}
                                className="bg-gray-0 sbte-source-cue"
                                showGlossaryTerms
                                languageDirection="LTR"
                                sourceCuesIndexes={[0, 1, 2]}
                                nextTargetCueIndex={0}
                                editDisabled={false}
                            />
                            <CueView
                                rowIndex={0}
                                isTargetCue={false}
                                matchedNestedIndex={2}
                                targetCueIndex={0}
                                cue={sourceCues[2]}
                                targetCuesLength={1}
                                className="bg-gray-0 sbte-source-cue"
                                showGlossaryTerms
                                languageDirection="LTR"
                                sourceCuesIndexes={[0, 1, 2]}
                                nextTargetCueIndex={0}
                                editDisabled={false}
                            />
                            <div className="sbte-cue-divider-good" />
                            <CueEdit index={0} cue={targetCues[0]} setGlossaryTerm={jest.fn()} matchedCuesIndex={0} />
                        </div>
                    </div>
                </Provider>
            );
            const cueLineRowProps = {
                playerTime: 0,
                withoutSourceCues: false,
                targetCuesLength: 1,
                matchedCues: [cueLine],
                commentAuthor: "Linguist"
            } as CueLineRowProps;

            // WHEN
            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CueLine
                        rowIndex={0}
                        data={cueLine}
                        rowProps={cueLineRowProps}
                        rowRef={React.createRef()}
                    />
                </Provider>
            );

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });

        it("renders translation edit line with 3 target cues", () => {
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
            const cueLine = { targetCues: targetCuesWithIndexes, sourceCues: [sourceCuesWithIndexes[0]]};
            const expectedNode = render(
                <Provider store={testingStore}>
                    <div
                        className="sbte-cue-line"
                        style={{ display: "flex", paddingBottom: "5px", width: "100%" }}
                    >
                        <CueLineFlap
                            rowIndex={0}
                            cueLineState={CueLineState.GOOD}
                            cues={[
                                { index: 0, cue: targetCues[0] },
                                { index: 1, cue: targetCues[1] },
                                { index: 2, cue: targetCues[2] }
                            ]}
                        />
                        <div
                            className="border-t border-r border-blue-light-mostly-transparent rounded-r"
                            style={{ display: "grid", width: "100%" }}
                        >
                            <CueView
                                rowIndex={0}
                                isTargetCue={false}
                                matchedNestedIndex={0}
                                targetCueIndex={0}
                                cue={sourceCues[0]}
                                targetCuesLength={3}
                                className="bg-gray-0 sbte-source-cue"
                                showGlossaryTerms
                                languageDirection="LTR"
                                sourceCuesIndexes={[0]}
                                nextTargetCueIndex={0}
                                editDisabled={false}
                            />
                            <div className="sbte-cue-divider-good" />
                            <CueView
                                rowIndex={0}
                                isTargetCue
                                matchedNestedIndex={0}
                                targetCueIndex={0}
                                cue={targetCues[0]}
                                targetCuesLength={3}
                                className="bg-gray-0 sbte-target-cue"
                                showGlossaryTerms={false}
                                languageDirection="RTL"
                                sourceCuesIndexes={[0]}
                                nextTargetCueIndex={0}
                                editDisabled={false}
                            />
                            <CueEdit index={1} cue={targetCues[1]} setGlossaryTerm={jest.fn()} matchedCuesIndex={0} />
                            <CueView
                                rowIndex={0}
                                isTargetCue
                                matchedNestedIndex={2}
                                targetCueIndex={2}
                                cue={targetCues[2]}
                                targetCuesLength={3}
                                className="bg-gray-0 sbte-target-cue"
                                showGlossaryTerms={false}
                                languageDirection="RTL"
                                sourceCuesIndexes={[0]}
                                nextTargetCueIndex={0}
                                editDisabled={false}
                            />
                        </div>
                    </div>
                </Provider>
            );
            const cueLineRowProps = {
                playerTime: 0,
                withoutSourceCues: false,
                targetCuesLength: 3,
                matchedCues: [cueLine],
                commentAuthor: "Linguist"
            } as CueLineRowProps;

            // WHEN
            testingStore.dispatch(updateEditingCueIndex(1) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CueLine
                        rowIndex={0}
                        data={cueLine}
                        rowProps={cueLineRowProps}
                        rowRef={React.createRef()}
                    />
                </Provider>
            );

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });

        it("renders multi-match view line with corrupted target cue", () => {
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

            const corruptedTargetCueWithIndex = {
                index: 2,
                cue: {
                    vttCue: new VTTCue(2, 3, "Editing Line 3"),
                    cueCategory: "DIALOGUE",
                    errors: [CueError.LINE_CHAR_LIMIT_EXCEEDED]
                } as CueDto
            };

            testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
            const cueLine = {
                targetCues: [targetCuesWithIndexes[0], targetCuesWithIndexes[1], corruptedTargetCueWithIndex],
                sourceCues: [sourceCuesWithIndexes[0]]};
            const expectedNode = render(
                <Provider store={testingStore}>
                    <div
                        className="sbte-cue-line"
                        style={{ display: "flex", paddingBottom: "5px", width: "100%" }}
                    >
                        <CueLineFlap
                            rowIndex={0}
                            cueLineState={CueLineState.ERROR}
                            cues={[
                                { index: 0, cue: targetCues[0] },
                                { index: 1, cue: targetCues[1] },
                                { index: 2, cue: corruptedTargetCueWithIndex.cue }
                            ]}
                            cuesErrors={[CueError.LINE_CHAR_LIMIT_EXCEEDED]}
                            showErrors
                        />
                        <div
                            className="border-t border-r border-blue-light-mostly-transparent rounded-r"
                            style={{ display: "grid", width: "100%" }}
                        >
                            <CueView
                                rowIndex={0}
                                isTargetCue={false}
                                matchedNestedIndex={0}
                                targetCueIndex={0}
                                cue={sourceCues[0]}
                                targetCuesLength={3}
                                className="bg-gray-0 sbte-source-cue"
                                showGlossaryTerms={false}
                                languageDirection="LTR"
                                sourceCuesIndexes={[0]}
                                nextTargetCueIndex={0}
                                editDisabled={false}
                            />
                            <div className="sbte-cue-divider-error" />
                            <CueView
                                rowIndex={0}
                                isTargetCue
                                matchedNestedIndex={0}
                                targetCueIndex={0}
                                cue={targetCues[0]}
                                targetCuesLength={3}
                                className="bg-gray-0 sbte-target-cue"
                                showGlossaryTerms={false}
                                languageDirection="RTL"
                                sourceCuesIndexes={[0]}
                                nextTargetCueIndex={0}
                                editDisabled={false}
                            />
                            <CueView
                                rowIndex={0}
                                isTargetCue
                                matchedNestedIndex={1}
                                targetCueIndex={1}
                                cue={targetCues[1]}
                                targetCuesLength={3}
                                className="bg-gray-0 sbte-target-cue"
                                showGlossaryTerms={false}
                                languageDirection="RTL"
                                sourceCuesIndexes={[0]}
                                nextTargetCueIndex={0}
                                editDisabled={false}
                            />
                            <CueView
                                rowIndex={0}
                                isTargetCue
                                matchedNestedIndex={2}
                                targetCueIndex={2}
                                cue={corruptedTargetCueWithIndex.cue}
                                targetCuesLength={3}
                                className="bg-gray-0 sbte-target-cue"
                                showGlossaryTerms={false}
                                languageDirection="RTL"
                                sourceCuesIndexes={[0]}
                                nextTargetCueIndex={0}
                                editDisabled={false}
                            />
                        </div>
                    </div>
                </Provider>
            );
            const cueLineRowProps = {
                playerTime: 0,
                withoutSourceCues: false,
                targetCuesLength: 3,
                matchedCues: [cueLine],
                commentAuthor: "Linguist"
            } as CueLineRowProps;

            // WHEN
            testingStore.dispatch(updateEditingCueIndex(-1) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CueLine
                        rowIndex={0}
                        data={cueLine}
                        rowProps={cueLineRowProps}
                        rowRef={React.createRef()}
                    />
                </Provider>
            );

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });

        it("renders multi-match view line with corrupted target cue in edit mode", () => {
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

            const corruptedTargetCueWithIndex = {
                index: 2,
                cue: {
                    vttCue: new VTTCue(2, 3, "Editing Liine 3"),
                    cueCategory: "DIALOGUE",
                    errors: [CueError.LINE_CHAR_LIMIT_EXCEEDED]
                } as CueDto
            };

            testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
            const cueLine = {
                targetCues: [targetCuesWithIndexes[0], targetCuesWithIndexes[1], corruptedTargetCueWithIndex],
                sourceCues: [sourceCuesWithIndexes[0]]};
            const expectedNode = render(
                <Provider store={testingStore}>
                    <div
                        className="sbte-cue-line"
                        style={{ display: "flex", paddingBottom: "5px", width: "100%" }}
                    >
                        <CueLineFlap
                            rowIndex={0}
                            cueLineState={CueLineState.ERROR}
                            cues={[
                                { index: 0, cue: targetCues[0] },
                                { index: 1, cue: targetCues[1] },
                                { index: 2, cue: corruptedTargetCueWithIndex.cue }
                            ]}
                            cuesErrors={[CueError.LINE_CHAR_LIMIT_EXCEEDED]}
                            showErrors
                        />
                        <div
                            className="border-t border-r border-blue-light-mostly-transparent rounded-r"
                            style={{ display: "grid", width: "100%" }}
                        >
                            <CueView
                                rowIndex={0}
                                isTargetCue={false}
                                matchedNestedIndex={0}
                                targetCueIndex={0}
                                cue={sourceCues[0]}
                                targetCuesLength={3}
                                className="bg-gray-0 sbte-source-cue"
                                showGlossaryTerms
                                languageDirection="LTR"
                                sourceCuesIndexes={[0]}
                                nextTargetCueIndex={0}
                                editDisabled={false}
                            />
                            <div className="sbte-cue-divider-error" />
                            <CueView
                                rowIndex={0}
                                isTargetCue
                                matchedNestedIndex={0}
                                targetCueIndex={0}
                                cue={targetCues[0]}
                                targetCuesLength={3}
                                className="bg-gray-0 sbte-target-cue"
                                showGlossaryTerms={false}
                                languageDirection="RTL"
                                sourceCuesIndexes={[0]}
                                nextTargetCueIndex={0}
                                editDisabled={false}
                            />
                            <CueView
                                rowIndex={0}
                                isTargetCue
                                matchedNestedIndex={1}
                                targetCueIndex={1}
                                cue={targetCues[1]}
                                targetCuesLength={3}
                                className="bg-gray-0 sbte-target-cue"
                                showGlossaryTerms={false}
                                languageDirection="RTL"
                                sourceCuesIndexes={[0]}
                                nextTargetCueIndex={0}
                                editDisabled={false}
                            />
                            <CueEdit
                                index={2}
                                cue={corruptedTargetCueWithIndex.cue}
                                setGlossaryTerm={jest.fn()}
                                matchedCuesIndex={0}
                            />
                            <div className="sbte-cues-errors">• Max Characters Per Line Exceeded<br /></div>
                        </div>
                    </div>
                </Provider>
            );
            const cueLineRowProps = {
                playerTime: 0,
                withoutSourceCues: false,
                targetCuesLength: 3,
                matchedCues: [cueLine],
                commentAuthor: "Linguist"
            } as CueLineRowProps;

            // WHEN
            testingStore.dispatch(updateEditingCueIndex(2) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CueLine
                        rowIndex={0}
                        data={cueLine}
                        rowProps={cueLineRowProps}
                        rowRef={React.createRef()}
                    />
                </Provider>
            );

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });

        it("does not open editor when editDisabled cue is clicked", () => {
            // GIVEN
            const matchedCuesTranslationEditDisabled = [ ...matchedCuesTranslation ];
            const disabledTargetCue = { ...targetCues[0], editDisabled: true };
            matchedCuesTranslationEditDisabled[0].targetCues[0] = { index: 0, cue: disabledTargetCue };
            const cueLine = { targetCues: matchedCuesTranslationEditDisabled[0].targetCues,
                sourceCues: [sourceCuesWithIndexes[0]]};
            const cueLineRowProps = {
                playerTime: 0,
                withoutSourceCues: false,
                targetCuesLength: 1,
                matchedCues: matchedCuesTranslation,
                commentAuthor: "Linguist"
            } as CueLineRowProps;
            const actualNode = render(
                <Provider store={testingStore}>
                    <CueLine
                        rowIndex={0}
                        data={cueLine}
                        rowProps={cueLineRowProps}
                        rowRef={React.createRef()}
                    />
                </Provider>
            );

            // WHEN
            fireEvent.click(actualNode.container.querySelector(".sbte-edit-disabled") as Element);

            // THEN
            expect(testingStore.getState().editingCueIndex).toEqual(-1);
        });

        it("does not show insert cue button when editDisabled and there's no target cue", () => {
            // GIVEN
            const sourceCuesDisabled = [
                {
                    vttCue: new VTTCue(0, 1, "Source Line 1"),
                    cueCategory: "DIALOGUE",
                    editDisabled: true
                } as CueDto,
            ];
            const sourceCuesDisabledWithIndexes = [
                { index: 0, cue: sourceCuesDisabled[0] },
            ];
            const cueLine = { targetCues: [], sourceCues: sourceCuesDisabledWithIndexes };
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
            const cueLineRowProps = {
                playerTime: 0,
                withoutSourceCues: false,
                targetCuesLength: 0,
                matchedCues: [cueLine],
                commentAuthor: "Linguist"
            } as CueLineRowProps;

            // WHEN
            const actualNode = render(
                <Provider store={testingStore}>
                    <CueLine
                        rowIndex={0}
                        data={cueLine}
                        rowProps={cueLineRowProps}
                        rowRef={React.createRef()}
                    />
                </Provider>
            );

            // THEN
            const insertCueButton = actualNode.container.querySelector(".sbte-add-cue-button") as Element;
            expect(insertCueButton).toBeNull();
        });

        it("fires write cue action when empty target cue is clicked", () => {
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
            const cueWithSource = { sourceCues: [sourceCuesWithIndexes[1]]};
            const cueLineRowProps = {
                playerTime: 0,
                withoutSourceCues: false,
                targetCuesLength: 0,
                matchedCues: matchedCuesTranslation,
                commentAuthor: "Linguist"
            } as CueLineRowProps;
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CueLine
                        rowIndex={1}
                        data={cueWithSource}
                        rowProps={cueLineRowProps}
                        rowRef={React.createRef()}
                    />
                </Provider>
            );

            // WHEN
            fireEvent.click(actualNode.container.querySelector(".sbte-click-cue-wrapper") as Element);

            // THEN
            expect(testingStore.getState().editingCueIndex).toEqual(1);
        });

        it("fires write cue action when insert cue button is clicked", () => {
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
            const cueWithSource = { sourceCues: [sourceCuesWithIndexes[1]]};
            const cueLineRowProps = {
                playerTime: 0,
                withoutSourceCues: false,
                targetCuesLength: 0,
                matchedCues: matchedCuesTranslation,
                commentAuthor: "Linguist"
            } as CueLineRowProps;
            testingStore.dispatch(updateSourceCues(sourceCues) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CueLine
                        rowIndex={1}
                        data={cueWithSource}
                        rowProps={cueLineRowProps}
                        rowRef={React.createRef()}
                    />
                </Provider>
            );

            // WHEN
            fireEvent.click(actualNode.container.querySelector(".sbte-add-cue-button") as Element);

            // THEN
            expect(testingStore.getState().editingCueIndex).toEqual(1);
        });

        it("fires write cue action when empty source cue is clicked", () => {
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
            const cueLine = { targetCues: [targetCuesWithIndexes[1]], sourceCues: []};
            const cueLineRowProps = {
                playerTime: 0,
                withoutSourceCues: false,
                targetCuesLength: 3,
                matchedCues: matchedCuesCaptioning,
                commentAuthor: "Linguist"
            } as CueLineRowProps;
            testingStore.dispatch(updateCues(targetCues) as {} as AnyAction);

            testingStore.dispatch(updateEditingCueIndex(-1) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CueLine
                        rowIndex={1}
                        data={cueLine}
                        rowProps={cueLineRowProps}
                        rowRef={React.createRef()}
                    />
                </Provider>
            );

            // WHEN
            fireEvent.click(actualNode.container.querySelector(".sbte-click-cue-wrapper") as Element);

            // THEN
            expect(testingStore.getState().editingCueIndex).toEqual(1);
        });
    });

    it("configures rowReference to root container HTML element", () => {
        // GIVEN
        const cueWithSource = { targetCues: [targetCuesWithIndexes[1]]};
        const matchedCues = [
            { targetCues: [targetCuesWithIndexes[1]], sourceCues: []},
        ];
        const cueLineRowProps = {
            playerTime: 0,
            withoutSourceCues: true,
            targetCuesLength: 1,
            matchedCues,
            commentAuthor: "Linguist"
        } as CueLineRowProps;
        const rowRef = React.createRef() as React.RefObject<HTMLDivElement>;

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueLine
                    rowIndex={0}
                    data={cueWithSource}
                    rowProps={cueLineRowProps}
                    rowRef={rowRef}
                />
            </Provider>
        );

        // THEN
        const refNode = rowRef.current as HTMLDivElement;
        expect(refNode.outerHTML).toEqual(actualNode.container.innerHTML);
    });

    describe("cue comments", () => {
        it("renders caption edit with comments", () => {
            // GIVEN
            testingStore.dispatch(commentsVisibleSlice.actions.setCommentsVisible(true));
            const matchedCuesWithCommentsCaptioning = [
                { targetCues: [targetCuesWithCommentsWithIndexes[0]], sourceCues: []},
                { targetCues: [targetCuesWithCommentsWithIndexes[1]], sourceCues: []}
            ];
            const testingTrack = {
                type: "CAPTION",
                language: { id: "ar-SA", name: "Arabic", direction: "RTL" } as Language,
                default: true,
                mediaTitle: "Sample Polish",
                mediaLength: 4000,
                progress: 50
            } as Track;
            testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);

            const expectedNode = render(
                <Provider store={testingStore}>
                    <div
                        className="sbte-cue-line"
                        style={{ display: "flex", paddingBottom: "5px", width: "100%" }}
                    >
                        <CueLineFlap
                            rowIndex={0}
                            cueLineState={CueLineState.GOOD}
                            cues={[{ index: 0, cue: targetCues[0] }]}
                            cueCommentsCount={3}
                        />
                        <div
                            className="border-t border-r border-blue-light-mostly-transparent rounded-r"
                            style={{ display: "grid", width: "100%" }}
                        >
                            <CueEdit
                                index={0}
                                cue={targetCuesWithComments[0]}
                                nextCueLine={matchedCuesWithCommentsCaptioning[1]}
                                setGlossaryTerm={jest.fn()}
                                matchedCuesIndex={0}
                            />
                            <CueComments index={0} cue={targetCuesWithComments[0]} commentAuthor="Linguist" />
                        </div>
                    </div>
                </Provider>
            );
            const cueLineRowProps = {
                playerTime: 0,
                withoutSourceCues: true,
                targetCuesLength: 2,
                matchedCues: matchedCuesWithCommentsCaptioning,
                commentAuthor: "Linguist"
            } as CueLineRowProps;

            // WHEN
            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CueLine
                        rowIndex={0}
                        data={matchedCuesWithCommentsCaptioning[0]}
                        rowProps={cueLineRowProps}
                        rowRef={React.createRef()}
                    />
                </Provider>
            );

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });

        it("renders translation view line with 3 target cues wit comments", () => {
            // GIVEN
            testingStore.dispatch(commentsVisibleSlice.actions.setCommentsVisible(true));
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
            const cueLine = { targetCues: targetCuesWithCommentsWithIndexes, sourceCues: [sourceCuesWithIndexes[0]]};
            const expectedNode = render(
                <Provider store={testingStore}>
                    <div
                        className="sbte-cue-line"
                        style={{ display: "flex", paddingBottom: "5px", width: "100%" }}
                    >
                        <CueLineFlap
                            rowIndex={0}
                            cueLineState={CueLineState.GOOD}
                            cues={[{ index: 0, cue: targetCues[0] }]}
                            cueCommentsCount={6}
                        />
                        <div
                            className="border-t border-r border-blue-light-mostly-transparent rounded-r"
                            style={{ display: "grid", width: "100%" }}
                        >
                            <CueView
                                rowIndex={0}
                                isTargetCue={false}
                                matchedNestedIndex={0}
                                targetCueIndex={0}
                                cue={sourceCues[0]}
                                targetCuesLength={3}
                                className="bg-gray-0 sbte-source-cue"
                                showGlossaryTerms={false}
                                languageDirection="LTR"
                                sourceCuesIndexes={[0]}
                                nextTargetCueIndex={0}
                                editDisabled={false}
                            />
                            <div className="sbte-cue-divider-good" />
                            <CueView
                                rowIndex={0}
                                isTargetCue
                                matchedNestedIndex={0}
                                targetCueIndex={0}
                                cue={targetCuesWithComments[0]}
                                targetCuesLength={3}
                                className="bg-gray-0 sbte-target-cue"
                                showGlossaryTerms={false}
                                languageDirection="RTL"
                                sourceCuesIndexes={[0]}
                                nextTargetCueIndex={0}
                                editDisabled={false}
                            />
                            <CueComments index={0} cue={targetCuesWithComments[0]} commentAuthor="Linguist" />
                            <CueView
                                rowIndex={0}
                                isTargetCue
                                matchedNestedIndex={1}
                                targetCueIndex={1}
                                cue={targetCuesWithComments[1]}
                                targetCuesLength={3}
                                className="bg-gray-0 sbte-target-cue"
                                showGlossaryTerms={false}
                                languageDirection="RTL"
                                sourceCuesIndexes={[0]}
                                nextTargetCueIndex={0}
                                editDisabled={false}
                            />
                            <CueComments index={1} cue={targetCuesWithComments[1]} commentAuthor="Linguist" />
                            <CueView
                                rowIndex={0}
                                isTargetCue
                                matchedNestedIndex={2}
                                targetCueIndex={2}
                                cue={targetCuesWithComments[2]}
                                targetCuesLength={3}
                                className="bg-gray-0 sbte-target-cue"
                                showGlossaryTerms={false}
                                languageDirection="RTL"
                                sourceCuesIndexes={[0]}
                                nextTargetCueIndex={0}
                                editDisabled={false}
                            />
                            <CueComments index={2} cue={targetCuesWithComments[2]} commentAuthor="Linguist" />
                        </div>
                    </div>
                </Provider>
            );
            const cueLineRowProps = {
                playerTime: 0,
                withoutSourceCues: false,
                targetCuesLength: 3,
                matchedCues: [cueLine],
                commentAuthor: "Linguist"
            } as CueLineRowProps;

            // WHEN
            testingStore.dispatch(updateEditingCueIndex(-1) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CueLine
                        rowIndex={0}
                        data={cueLine}
                        rowProps={cueLineRowProps}
                        rowRef={React.createRef()}
                    />
                </Provider>
            );

            // THEN
            expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        });
    });
});

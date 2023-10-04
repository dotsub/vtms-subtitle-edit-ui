import { createTestingStore } from "../../../testUtils/testingStore";
import { CueDto, Language, Track } from "../../model";
import { updateEditingTrack } from "../../trackSlices";
import { AnyAction } from "@reduxjs/toolkit";
import CueLine, { CueLineRowProps } from "./CueLine";
import { updateEditingCueIndex } from "../edit/cueEditorSlices";
import { fireEvent, render } from "@testing-library/react";
import { Provider } from "react-redux";
import * as React from "react";
import { EditorState, SelectionState } from "draft-js";
import { editorStateFOR_TESTING, setEditorStateFOR_TESTING } from "../edit/CueTextEditor";
import { searchReplaceSlice, showSearchReplace } from "../searchReplace/searchReplaceSlices";
import { removeDraftJsDynamicValues } from "../../../testUtils/testUtils";


let testingStore = createTestingStore();

describe("CueLine", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
    });

    // NOTE: This test cases covers high level glossary term injection concerns of child components.
    // It is far better to test it in integration rather than state and state setters are passed to child components.
    describe("glossary term insertion", () => {
        it("inserts first glossary term into editor when clicked", () => {
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
            const sourceCue = {
                vttCue: new VTTCue(1, 2, "<i>Source <b>Line</b></i> \nWrapped text"),
                cueCategory: "DIALOGUE",
                glossaryMatches: [
                    { source: "text", replacements: ["text replacement1", "text replacement2", "repl3"]},
                    { source: "Line", replacements: ["lineReplacement1"]}
                ]
            } as CueDto;
            const targetCue = { vttCue: new VTTCue(0, 1, "Editing Line 1"), cueCategory: "DIALOGUE" } as CueDto;

            const matchedCue = {
                targetCues: [{ index: 0, cue: targetCue }],
                sourceCues: [{ index: 0, cue: sourceCue }]
            };

            const cueLineRowProps = {
                playerTime: 0,
                withoutSourceCues: true,
                targetCuesLength: 3,
                matchedCues: [matchedCue],
                commentAuthor: "Linguist"
            } as CueLineRowProps;

            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CueLine
                        rowIndex={0}
                        data={matchedCue}
                        rowProps={cueLineRowProps}
                        rowRef={React.createRef()}
                    />
                </Provider>
            );

            // WHEN
            fireEvent.click(actualNode.container.querySelectorAll(".sbte-glossary-match")[0]);

            // THEN
            expect(actualNode.container.outerHTML).toContain("Editing Line 1lineReplacement1");
        });

        it("inserts second glossary term into editor when clicked", () => {
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
            const sourceCue = {
                vttCue: new VTTCue(1, 2, "<i>Source <b>Line</b></i> \nWrapped text"),
                cueCategory: "DIALOGUE",
                glossaryMatches: [
                    { source: "Line", replacements: ["lineReplacement1"]},
                    { source: "text", replacements: ["text replacement1", "text replacement2", "repl3"]}
                ]
            } as CueDto;
            const targetCue = { vttCue: new VTTCue(0, 1, "Editing Line 1"), cueCategory: "DIALOGUE" } as CueDto;

            const matchedCue = {
                targetCues: [{ index: 0, cue: targetCue }],
                sourceCues: [{ index: 0, cue: sourceCue }]
            };

            const cueLineRowProps = {
                playerTime: 0,
                withoutSourceCues: true,
                targetCuesLength: 3,
                matchedCues: [matchedCue],
                commentAuthor: "Linguist"
            } as CueLineRowProps;

            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CueLine
                        rowIndex={0}
                        data={matchedCue}
                        rowProps={cueLineRowProps}
                        rowRef={React.createRef()}
                    />
                </Provider>
            );

            // WHEN
            fireEvent.click(actualNode.container.querySelectorAll(".sbte-glossary-match")[1]);

            // THEN
            expect(actualNode.container.outerHTML).toContain("Editing Line 1text replacement1/text replacement2/repl3");
        });

        it("inserts glossary term into middle of test in editor when clicked", async () => {
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
            const sourceCue = {
                vttCue: new VTTCue(1, 2, "<i>Source <b>Line</b></i> \nWrapped text"),
                cueCategory: "DIALOGUE",
                glossaryMatches: [
                    { source: "text", replacements: ["text replacement1", "text replacement2", "repl3"]},
                    { source: "Line", replacements: ["#lineReplacement1#"]}
                ]
            } as CueDto;
            const targetCue = { vttCue: new VTTCue(0, 1, "Editing Line 1"), cueCategory: "DIALOGUE" } as CueDto;

            const matchedCue = {
                targetCues: [{ index: 0, cue: targetCue }],
                sourceCues: [{ index: 0, cue: sourceCue }]
            };

            const cueLineRowProps = {
                playerTime: 0,
                withoutSourceCues: true,
                targetCuesLength: 3,
                matchedCues: [matchedCue],
                commentAuthor: "Linguist"
            } as CueLineRowProps;

            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
            const actualNode = render(
                <Provider store={testingStore}>
                    <CueLine
                        rowIndex={0}
                        data={matchedCue}
                        rowProps={cueLineRowProps}
                        rowRef={React.createRef()}
                    />
                </Provider>
            );

            // WHEN
            // Change position of cursor in draft-js editor
            const selectionState = editorStateFOR_TESTING.getSelection();
            const newSelectionState = selectionState.set("anchorOffset", 5).set("focusOffset", 5) as SelectionState;
            setEditorStateFOR_TESTING(EditorState.forceSelection(editorStateFOR_TESTING, newSelectionState));

            fireEvent.click(actualNode.container.querySelectorAll(".sbte-glossary-match")[0]);

            // THEN
            expect(actualNode.container.outerHTML).toContain("Editi#lineReplacement1#ng Line 1");
        });
    });

    describe("search term", () => {
        it("highlights search term in first source cue", () => {
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
            const sourceCue = {
                vttCue: new VTTCue(1, 2, "<i>Source <b>Line</b></i> \nWrapped text"),
                cueCategory: "DIALOGUE",
                glossaryMatches: []
            } as CueDto;
            const targetCue = { vttCue: new VTTCue(0, 1, "Editing Line 1"), cueCategory: "DIALOGUE" } as CueDto;

            const matchedCue = {
                sourceCues: [{ index: 0, cue: sourceCue }],
                targetCues: [{ index: 0, cue: targetCue }]
            };
            const dummyCue = { sourceCues: [], targetCues: []};
            const currentIndices = {
                matchedCueIndex: 3,
                sourceCueIndex: 0,
                targetCueIndex: -1,
                matchLength: 4,
                offset: 7,
                offsetIndex: 0
            };

            testingStore.dispatch(searchReplaceSlice.actions.setIndices(currentIndices));

            const cueLineRowProps = {
                playerTime: 0,
                withoutSourceCues: true,
                targetCuesLength: 3,
                matchedCues: [dummyCue, dummyCue, dummyCue, matchedCue],
                commentAuthor: "Linguist"
            } as CueLineRowProps;

            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
            testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);

            // WHEN
            const actualNode = render(
                <Provider store={testingStore}>
                    <CueLine
                        rowIndex={3}
                        data={matchedCue}
                        rowProps={cueLineRowProps}
                        rowRef={React.createRef()}
                    />
                </Provider>
            );

            // THEN
            expect(actualNode.container.outerHTML).toContain(
                "<i>Source <b>" +
                "<span style=\"background-color:#D9E9FF\" data-reactroot=\"\">Line</span>" +
                "</b></i> <br>Wrapped text"
            );
        });

        it("doesn't highlight search term for different matched cue", () => {
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
            const sourceCue = {
                vttCue: new VTTCue(1, 2, "<i>Source <b>Line</b></i> \nWrapped text"),
                cueCategory: "DIALOGUE",
                glossaryMatches: []
            } as CueDto;
            const targetCue = { vttCue: new VTTCue(0, 1, "Editing Line 1"), cueCategory: "DIALOGUE" } as CueDto;

            const matchedCue = {
                sourceCues: [{ index: 0, cue: sourceCue }],
                targetCues: [{ index: 0, cue: targetCue }]
            };
            const dummyCue = { sourceCues: [], targetCues: []};
            const currentIndices = {
                matchedCueIndex: 2,
                sourceCueIndex: 0,
                targetCueIndex: -1,
                matchLength: 4,
                offset: 7,
                offsetIndex: 0
            };

            testingStore.dispatch(searchReplaceSlice.actions.setIndices(currentIndices));

            const cueLineRowProps = {
                playerTime: 0,
                withoutSourceCues: true,
                targetCuesLength: 3,
                matchedCues: [dummyCue, dummyCue, dummyCue, matchedCue],
                commentAuthor: "Linguist"
            } as CueLineRowProps;

            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
            testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);

            // WHEN
            const actualNode = render(
                <Provider store={testingStore}>
                    <CueLine
                        rowIndex={3}
                        data={matchedCue}
                        rowProps={cueLineRowProps}
                        rowRef={React.createRef()}
                    />
                </Provider>
            );

            // THEN
            expect(actualNode.container.outerHTML).toContain("<i>Source <b>Line</b></i> <br>Wrapped text");
        });

        it("highlights search term in third source cue", () => {
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
            const sourceCue = {
                vttCue: new VTTCue(1, 2, "<i>Source <b>Line</b></i> \nWrapped text"),
                cueCategory: "DIALOGUE",
                glossaryMatches: []
            } as CueDto;
            const sourceCueNotMatched = {
                vttCue: new VTTCue(1, 2, "Source Wrapped text"), cueCategory: "DIALOGUE", glossaryMatches: []
            } as CueDto;
            const targetCue = { vttCue: new VTTCue(0, 1, "Editing Line 1"), cueCategory: "DIALOGUE" } as CueDto;

            const matchedCue = {
                sourceCues: [
                    { index: 0, cue: sourceCueNotMatched },
                    { index: 1, cue: sourceCueNotMatched },
                    { index: 2, cue: sourceCue },
                ],
                targetCues: [{ index: 0, cue: targetCue }]
            };
            const dummyCue = { sourceCues: [], targetCues: []};
            const currentIndices = {
                matchedCueIndex: 3,
                sourceCueIndex: 2,
                targetCueIndex: -1,
                matchLength: 4,
                offset: 7,
                offsetIndex: 0
            };

            testingStore.dispatch(searchReplaceSlice.actions.setIndices(currentIndices));

            const cueLineRowProps = {
                playerTime: 0,
                withoutSourceCues: true,
                targetCuesLength: 3,
                matchedCues: [dummyCue, dummyCue, dummyCue, matchedCue],
                commentAuthor: "Linguist"
            } as CueLineRowProps;

            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
            testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);

            // WHEN
            const actualNode = render(
                <Provider store={testingStore}>
                    <CueLine
                        rowIndex={3}
                        data={matchedCue}
                        rowProps={cueLineRowProps}
                        rowRef={React.createRef()}
                    />
                </Provider>
            );

            // THEN
            expect(actualNode.container.outerHTML).toContain(
                "<i>Source <b>" +
                "<span style=\"background-color:#D9E9FF\" data-reactroot=\"\">Line</span>" +
                "</b></i> <br>Wrapped text"
            );
        });

        it("highlights search term in first disabled target cue", () => {
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
            const sourceCue = {
                vttCue: new VTTCue(1, 2, "<i>Source <b>Line</b></i> \nWrapped text"),
                cueCategory: "DIALOGUE",
                glossaryMatches: []
            } as CueDto;
            const targetCue = { vttCue: new VTTCue(0, 1, "Editing Line 1"), cueCategory: "DIALOGUE" } as CueDto;

            const matchedCue = {
                sourceCues: [{ index: 0, cue: sourceCue }],
                targetCues: [{ index: 0, cue: targetCue }]
            };
            const dummyCue = { sourceCues: [], targetCues: []};
            const currentIndices = {
                matchedCueIndex: 3,
                sourceCueIndex: -1,
                targetCueIndex: 0,
                matchLength: 4,
                offset: 8,
                offsetIndex: 0
            };

            testingStore.dispatch(searchReplaceSlice.actions.setIndices(currentIndices));

            const cueLineRowProps = {
                playerTime: 0,
                withoutSourceCues: true,
                targetCuesLength: 3,
                matchedCues: [dummyCue, dummyCue, dummyCue, matchedCue],
                commentAuthor: "Linguist"
            } as CueLineRowProps;

            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
            testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);

            // WHEN
            const actualNode = render(
                <Provider store={testingStore}>
                    <CueLine
                        rowIndex={3}
                        data={matchedCue}
                        rowProps={cueLineRowProps}
                        rowRef={React.createRef()}
                        editDisabled
                    />
                </Provider>
            );

            // THEN
            expect(actualNode.container.outerHTML).toContain(
                "Editing <span style=\"background-color:#D9E9FF\" data-reactroot=\"\">Line</span> 1"
            );
        });

        it("highlights search term in third disabled target cue", () => {
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
            const sourceCue = {
                vttCue: new VTTCue(1, 2, "<i>Source <b>Line</b></i> \nWrapped text"),
                cueCategory: "DIALOGUE",
                glossaryMatches: []
            } as CueDto;
            const targetCue = { vttCue: new VTTCue(0, 1, "Editing Line 3"), cueCategory: "DIALOGUE" } as CueDto;
            const targetCueNotMatched = { vttCue: new VTTCue(0, 1, "Editing 1"), cueCategory: "DIALOGUE" } as CueDto;

            const matchedCue = {
                sourceCues: [{ index: 0, cue: sourceCue }],
                targetCues: [
                    { index: 0, cue: targetCueNotMatched },
                    { index: 1, cue: targetCueNotMatched },
                    { index: 2, cue: targetCue }
                ]
            };
            const dummyCue = { sourceCues: [], targetCues: []};
            const currentIndices = {
                matchedCueIndex: 3,
                sourceCueIndex: -1,
                targetCueIndex: 2,
                matchLength: 4,
                offset: 8,
                offsetIndex: 0
            };

            testingStore.dispatch(searchReplaceSlice.actions.setIndices(currentIndices));

            const cueLineRowProps = {
                playerTime: 0,
                withoutSourceCues: true,
                targetCuesLength: 3,
                matchedCues: [dummyCue, dummyCue, dummyCue, matchedCue],
                commentAuthor: "Linguist"
            } as CueLineRowProps;

            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
            testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);

            // WHEN
            const actualNode = render(
                <Provider store={testingStore}>
                    <CueLine
                        rowIndex={3}
                        data={matchedCue}
                        rowProps={cueLineRowProps}
                        rowRef={React.createRef()}
                        editDisabled
                    />
                </Provider>
            );

            // THEN
            expect(actualNode.container.outerHTML).toContain(
                "Editing <span style=\"background-color:#D9E9FF\" data-reactroot=\"\">Line</span> 3"
            );
        });

        it("highlights search term in first target cue editor", () => {
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
            const sourceCue = {
                vttCue: new VTTCue(1, 2, "<i>Source <b>Line</b></i> \nWrapped text"),
                cueCategory: "DIALOGUE",
                glossaryMatches: []
            } as CueDto;
            const targetCue = { vttCue: new VTTCue(0, 1, "Editing Line 1"), cueCategory: "DIALOGUE" } as CueDto;

            const matchedCue = {
                sourceCues: [{ index: 0, cue: sourceCue }],
                targetCues: [{ index: 0, cue: targetCue }]
            };
            const currentIndices = {
                matchedCueIndex: 0,
                sourceCueIndex: -1,
                targetCueIndex: 0,
                matchLength: 4,
                offset: 8,
                offsetIndex: 0
            };

            testingStore.dispatch(searchReplaceSlice.actions.setIndices(currentIndices));

            const cueLineRowProps = {
                playerTime: 0,
                withoutSourceCues: true,
                targetCuesLength: 3,
                matchedCues: [matchedCue],
                commentAuthor: "Linguist"
            } as CueLineRowProps;

            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
            testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);

            const expectedNode = render(
                <div
                    data-offset-key=""
                    className="public-DraftStyleDefault-block public-DraftStyleDefault-ltr"
                >
                    <span data-offset-key=""><span data-text="true">Editing </span></span>
                    <span style={{ backgroundColor: "rgb(217, 233, 255)" }}>
                        <span data-offset-key=""><span data-text="true">Line</span></span>
                    </span>
                    <span data-offset-key=""><span data-text="true"> 1</span></span>
                </div>
            );

            // WHEN
            const actualNode = render(
                <Provider store={testingStore}>
                    <CueLine
                        rowIndex={0}
                        data={matchedCue}
                        rowProps={cueLineRowProps}
                        rowRef={React.createRef()}
                    />
                </Provider>
            );

            // THEN
            expect(removeDraftJsDynamicValues(actualNode.container.outerHTML))
                .toContain(expectedNode.container.innerHTML);
        });

        it("highlights search term in third target cue editor", () => {
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
            const sourceCue = {
                vttCue: new VTTCue(1, 2, "<i>Source <b>Line</b></i> \nWrapped text"),
                cueCategory: "DIALOGUE",
                glossaryMatches: []
            } as CueDto;
            const targetCue = { vttCue: new VTTCue(0, 1, "Editing Line 3"), cueCategory: "DIALOGUE" } as CueDto;
            const targetCueNotMatched = { vttCue: new VTTCue(0, 1, "Editing 1"), cueCategory: "DIALOGUE" } as CueDto;

            const matchedCue = {
                sourceCues: [{ index: 0, cue: sourceCue }],
                targetCues: [
                    { index: 0, cue: targetCueNotMatched },
                    { index: 1, cue: targetCueNotMatched },
                    { index: 2, cue: targetCue }
                ]
            };
            const currentIndices = {
                matchedCueIndex: 0,
                sourceCueIndex: -1,
                targetCueIndex: 2,
                matchLength: 4,
                offset: 8,
                offsetIndex: 0
            };

            testingStore.dispatch(searchReplaceSlice.actions.setIndices(currentIndices));

            const cueLineRowProps = {
                playerTime: 0,
                withoutSourceCues: true,
                targetCuesLength: 3,
                matchedCues: [matchedCue],
                commentAuthor: "Linguist"
            } as CueLineRowProps;

            testingStore.dispatch(updateEditingCueIndex(2) as {} as AnyAction);
            testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);

            const expectedNode = render(
                <div
                    data-offset-key=""
                    className="public-DraftStyleDefault-block public-DraftStyleDefault-ltr"
                >
                    <span data-offset-key=""><span data-text="true">Editing </span></span>
                    <span style={{ backgroundColor: "rgb(217, 233, 255)" }}>
                        <span data-offset-key=""><span data-text="true">Line</span></span>
                    </span>
                    <span data-offset-key=""><span data-text="true"> 3</span></span>
                </div>
            );

            // WHEN
            const actualNode = render(
                <Provider store={testingStore}>
                    <CueLine
                        rowIndex={0}
                        data={matchedCue}
                        rowProps={cueLineRowProps}
                        rowRef={React.createRef()}
                    />
                </Provider>
            );

            // THEN
            expect(removeDraftJsDynamicValues(actualNode.container.outerHTML))
                .toContain(expectedNode.container.innerHTML);
        });
    });
});

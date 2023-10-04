import "../../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import { ReactElement } from "react";
import { AnyAction, Store } from "@reduxjs/toolkit";
import { Provider } from "react-redux";

import { mount, ReactWrapper } from "enzyme";

import { createTestingStore } from "../../../testUtils/testingStore";
import { CueDto, CueError, Language, Track } from "../../model";
import { updateCues, updateMatchedCues } from "../cuesList/cuesListActions";
import CueTextEditor, { CueTextEditorProps } from "./CueTextEditor";
import { setSaveTrack } from "../saveSlices";
import { updateEditingTrack } from "../../trackSlices";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { replaceCurrentMatch, searchReplaceSlice } from "../searchReplace/searchReplaceSlices";
import { act } from "react-dom/test-utils";
import { setSpellCheckDomain } from "../../spellcheckerSettingsSlice";
import { updateEditingCueIndex } from "./cueEditorSlices";
import { matchedCuesSlice } from "../cuesList/cuesListSlices";
import { Replacement, SpellCheck } from "../spellCheck/model";
import { saveCueUpdateSlice } from "../saveCueUpdateSlices";

let testingStore = createTestingStore();

const cues = [
    { id: "cue-1", vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE", editUuid: "1" } as CueDto,
    { id: "cue-2", vttCue: new VTTCue(3, 7, "Caption Line 2"), cueCategory: "DIALOGUE", editUuid: "2" } as CueDto
];
const bindCueViewModeKeyboardShortcutSpy = jest.fn() as () => void;
const unbindCueViewModeKeyboardShortcutSpy = jest.fn() as () => void;
const ruleId = "MORFOLOGIK_RULE_EN_US";

const createEditorNode = (text = "someText", index?: number): ReactWrapper => {
    const idx = index != null ? index : 0;
    testingStore.dispatch(updateEditingCueIndex(idx) as {} as AnyAction);
    const vttCue = new VTTCue(0, 1, text);
    const cue = testingStore.getState().cues[idx];
    vttCue.text = text;
    const editUuid = cue.editUuid;
    const actualNode = mount(
        <Provider store={testingStore}>
            <CueTextEditor
                bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
                index={idx}
                vttCue={vttCue}
                editUuid={editUuid}
                setGlossaryTerm={jest.fn()}
                autoFocus
            />
        </Provider>
    );
    return actualNode.find(".public-DraftEditor-content");
};

const testTrack = { mediaTitle: "testingTrack", language: { id: "en-US", name: "English", direction: "LTR" }};

jest.setTimeout(8000);

interface ReduxTestWrapperProps {
    store: Store;
    props: CueTextEditorProps;
}
const ReduxTestWrapper = (props: ReduxTestWrapperProps): ReactElement => (
    <Provider store={props.store}>
        <CueTextEditor
            bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
            unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
            index={props.props.index}
            vttCue={props.props.vttCue}
            editUuid={props.props.editUuid}
            setGlossaryTerm={jest.fn()}
            autoFocus
        />
    </Provider>
);

const updateCueMock = jest.fn();

describe("CueTextEditor", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
        testingStore.dispatch(matchedCuesSlice.actions.matchCuesByTime({ cues, sourceCues: [], editingCueIndex: 0 }));
        testingStore.dispatch(updateEditingCueIndex(-1) as {} as AnyAction);
        testingStore.dispatch(updateEditingTrack(testTrack as Track) as {} as AnyAction);
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        testingStore.dispatch(saveCueUpdateSlice.actions.setUpdateCueCallback(updateCueMock));
        jest.resetAllMocks();
    });

    it("updates cue in redux store with debounce", async () => {
        // GIVEN
        const editor = createEditorNode();

        // WHEN
        editor.simulate("paste", {
            clipboardData: {
                types: ["text/plain"],
                getData: (): string => " Paste text to end",
            }
        });

        // THEN
        await waitFor(
            () => {
                expect(testingStore.getState().cues[0].vttCue.text).toEqual("someText Paste text to end");
            },
            { timeout: 250 }
        );
    });

    it("doesn't update cue in redux immediately after change", () => {
        // GIVEN
        const editor = createEditorNode();

        // WHEN
        editor.simulate("paste", {
            clipboardData: {
                types: ["text/plain"],
                getData: (): string => " Paste text to end",
            }
        });

        // THEN
        expect(testingStore.getState().cues[0].vttCue.text).toEqual("Caption Line 1");
    });

    it("update cue in redux when unmounted, before debounce timeout", () => {
        // GIVEN
        testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
        const vttCue = new VTTCue(0, 1, "someText");
        const editUuid = testingStore.getState().cues[0].editUuid;
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueTextEditor
                    bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                    unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
                    index={0}
                    vttCue={vttCue}
                    editUuid={editUuid}
                    setGlossaryTerm={jest.fn()}
                    autoFocus
                />
            </Provider>
        );
        const editor = actualNode.find(".public-DraftEditor-content");
        editor.simulate("paste", {
            clipboardData: {
                types: ["text/plain"],
                getData: (): string => " Paste text to end",
            }
        });
        testingStore.dispatch(matchedCuesSlice.actions
            .matchCuesByTime({ cues, sourceCues: [], editingCueIndex: 0 })
        );

        // WHEN
        actualNode.unmount();

        // THEN
        expect(testingStore.getState().cues[0].vttCue.text).toEqual("someText Paste text to end");
        expect(testingStore.getState().matchedCues.matchedCues[0].targetCues[0].cue.vttCue.text)
            .toEqual("someText Paste text to end");
        expect(testingStore.getState().matchedCues.matchedCues).toHaveLength(2);
    });

    it("update cue in redux when unmounted after cue update and editUuid changes, before debounce timeout",
        async () => {
        // GIVEN
            testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
            const vttCue = new VTTCue(0, 1, "someText");
            const editUuid = testingStore.getState().cues[0].editUuid;
            const actualNode = mount(
                <ReduxTestWrapper
                    store={testingStore}
                    props={
                        {
                            index: 0,
                            vttCue,
                            editUuid,
                            bindCueViewModeKeyboardShortcut: bindCueViewModeKeyboardShortcutSpy,
                            unbindCueViewModeKeyboardShortcut: unbindCueViewModeKeyboardShortcutSpy,
                            setGlossaryTerm: jest.fn(),
                            autoFocus: true
                        }
                    }
                />);
            const editor = actualNode.find(".public-DraftEditor-content");
            editor.simulate("paste", {
                clipboardData: {
                    types: ["text/plain"],
                    getData: (): string => " Paste text to end",
                }
            });
            await act(async () => new Promise(resolve => setTimeout(resolve, 500)));
            // Update of vtt cue generates new editUuid in slice which would be passed from CueEdit parent.
            // These calls be simulate the prop update from parent.
            const updatedVttCue = testingStore.getState().cues[0].vttCue;
            const updatedEditUuid = testingStore.getState().cues[0].editUuid;
            actualNode.setProps({ props: { index: 0, vttCue: updatedVttCue, editUuid: updatedEditUuid }});

            editor.simulate("paste", {
                clipboardData: {
                    types: ["text/plain"],
                    getData: (): string => " Paste text to end",
                }
            });
            testingStore.dispatch(matchedCuesSlice.actions
                .matchCuesByTime({ cues, sourceCues: [], editingCueIndex: 0 })
            );

            // WHEN
            actualNode.unmount();

            // THEN
            expect(testingStore.getState().cues[0].vttCue.text)
                .toEqual("someText Paste text to end Paste text to end");
            expect(testingStore.getState().matchedCues.matchedCues[0].targetCues[0].cue.vttCue.text)
                .toEqual("someText Paste text to end Paste text to end");
            expect(testingStore.getState().cues[0].editUuid).not.toEqual("1");
            expect(testingStore.getState().matchedCues.matchedCues).toHaveLength(2);
    });

    it("updates cue in redux for single match/replace when unmounted for next match - single", async () => {
        // GIVEN
        testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
        const saveTrack = jest.fn();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        const searchReplaceMatches = {
            matchedCueIndex: 0,
            sourceCueIndex: 9007199254740991,
            targetCueIndex: 0,
            offset: 10,
            offsetIndex: 0,
            matchLength: 4
        };
        testingStore.dispatch(searchReplaceSlice.actions.setIndices(searchReplaceMatches));
        const vttCue = new VTTCue(0, 1, "some <i>HTML</i> <b>Text</b> sample");
        const editUuid = testingStore.getState().cues[0].editUuid;
        const actualNode = render(
            <Provider store={testingStore}>
                <CueTextEditor
                    index={0}
                    vttCue={vttCue}
                    editUuid={editUuid}
                    bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                    unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
                    setGlossaryTerm={jest.fn()}
                    autoFocus
                />
            </Provider>
        );
        act(() => {
            testingStore.dispatch(replaceCurrentMatch("abcd efg") as {} as AnyAction);
        });
        testingStore.dispatch(matchedCuesSlice.actions
            .matchCuesByTime({ cues, sourceCues: [], editingCueIndex: 0 })
        );

        // WHEN
        actualNode.unmount();

        // THEN
        await waitFor(
            () => {
                expect(updateCueMock).toHaveBeenCalledTimes(1);
                expect(saveTrack).not.toBeCalled();
                expect(testingStore.getState().cues[0].vttCue.text)
                    .toEqual("some <i>HTML</i> <b>abcd efg</b> sample");
                expect(testingStore.getState().matchedCues.matchedCues[0].targetCues[0].cue.vttCue.text)
                    .toEqual("some <i>HTML</i> <b>abcd efg</b> sample");
                expect(testingStore.getState().matchedCues.matchedCues).toHaveLength(2);
            },
            { timeout: 3000 }
        );
    });

    it("doesn't update cue in redux when unmounted if no change to text", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "someText");
        const editUuid = testingStore.getState().cues[0].editUuid;
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueTextEditor
                    index={0}
                    vttCue={vttCue}
                    editUuid={editUuid}
                    bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                    unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
                    setGlossaryTerm={jest.fn()}
                    autoFocus
                />
            </Provider>
        );

        // WHEN
        actualNode.unmount();

        // THEN
        expect(testingStore.getState().cues[0].vttCue.text).toEqual("Caption Line 1");
    });

    it("triggers autosave only once immediately after text change", async () => {
        // GIVEN
        const saveTrack = jest.fn();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        const editor = createEditorNode();

        // WHEN
        editor.simulate("paste", {
            clipboardData: {
                types: ["text/plain"],
                getData: (): string => " Paste text to end",
            }
        });

        // THEN
        await waitFor(
            () => {
                expect(updateCueMock).toBeCalledTimes(1);
                expect(saveTrack).not.toBeCalled();
            },
            { timeout: 6000 }
        );
    });

    it("triggers spellcheck only once immediately after text change", async () => {
        // GIVEN
        const testingResponse = {
            matches: [
                {
                    message: "This sentence does not start with an uppercase letter",
                    replacements: [{ "value": "Txt" }],
                    "offset": 0,
                    "length": 3,
                    context: { text: "txxt", length: 3, offset: 0 },
                    rule: { id: ruleId }
                },
                {
                    "message": "Possible spelling mistake found.",
                    "replacements": [
                        { value: "check" },
                        { value: "Chuck" },
                        { value: "chick" },
                        { value: "chuck" },
                        { value: "chock" },
                        { value: "CCK" },
                        { value: "CHC" },
                        { value: "CHK" },
                        { value: "cock" },
                        { value: "ch ck" }
                    ],
                    "offset": 7,
                    "length": 4,
                    context: { text: "txxt", length: 4, offset: 7 },
                    rule: { id: ruleId }
                }
            ]
        };

        testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);
        testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);

        // @ts-ignore modern browsers does have it
        global.fetch = jest.fn()
            .mockImplementation(() =>
                new Promise((resolve) => resolve({ json: () => testingResponse, ok: true })));

        const editor = createEditorNode();

        // WHEN
        editor.simulate("paste", {
            clipboardData: {
                types: ["text/plain"],
                getData: (): string => " Paste text to end",
            }
        });

        // THEN
        await waitFor(
            () => {
                // @ts-ignore modern browsers does have it
                expect(global.fetch).toBeCalledWith(
                    "https://testing-domain/v2/check",
                    {
                        method: "POST",
                        body: "language=en-US&text=someText Paste text to end" +
                            "&disabledRules=UPPERCASE_SENTENCE_START,PUNCTUATION_PARAGRAPH_END"
                    }
                );
                // @ts-ignore modern browsers does have it
                expect(global.fetch).toBeCalledTimes(2);
            },
            { timeout: 6000 }
        );
    });

    it("triggers spellcheck only once immediately after clear text change", async () => {
        // GIVEN
        const testingResponse = {
            matches: [
                {
                    message: "This sentence does not start with an uppercase letter",
                    replacements: [{ "value": "Txt" }],
                    "offset": 0,
                    "length": 3,
                    context: { text: "txxt", length: 3, offset: 0 },
                    rule: { id: ruleId }
                },
                {
                    "message": "Possible spelling mistake found.",
                    "replacements": [
                        { value: "check" },
                        { value: "Chuck" },
                        { value: "chick" },
                        { value: "chuck" },
                        { value: "chock" },
                        { value: "CCK" },
                        { value: "CHC" },
                        { value: "CHK" },
                        { value: "cock" },
                        { value: "ch ck" }
                    ],
                    "offset": 7,
                    "length": 4,
                    context: { text: "txxt", length: 4, offset: 7 },
                    rule: { id: ruleId }
                }
            ]
        };
        testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);
        testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);

        // @ts-ignore modern browsers does have it
        global.fetch = jest.fn()
            .mockImplementation(() =>
                new Promise((resolve) => resolve({ json: () => testingResponse, ok: true })));

        const vttCue = new VTTCue(0, 1, "test to clear");
        const editUuid = testingStore.getState().cues[0].editUuid;
        const { container } = render(
            <Provider store={testingStore}>
                <CueTextEditor
                    index={0}
                    vttCue={vttCue}
                    editUuid={editUuid}
                    bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                    unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
                    setGlossaryTerm={jest.fn()}
                    autoFocus
                />
            </Provider>
        );
        const editor = container.querySelector(".public-DraftEditor-content") as Element;

        // WHEN
        fireEvent.keyDown(editor, { keyCode: 8 });

        // THEN
        await waitFor(
            () => {
                // @ts-ignore modern browsers does have it
                expect(global.fetch).toBeCalledWith(
                    "https://testing-domain/v2/check",
                    {
                      method: "POST",
                      body: "language=en-US&text=test to clea" +
                          "&disabledRules=UPPERCASE_SENTENCE_START,PUNCTUATION_PARAGRAPH_END"
                    }
                );
                // @ts-ignore modern browsers does have it
                expect(global.fetch).toBeCalledTimes(2);
                expect(updateCueMock).toHaveBeenCalled();
            },
            { timeout: 6000 }
        );
    });

    it("doesn't trigger autosave when cue editor is rendered", async() => {
        // GIVEN
        const saveTrack = jest.fn();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);

        // WHEN
        createEditorNode();

        // THEN
        await waitFor(
            () => {
                expect(updateCueMock).not.toBeCalled();
                expect(saveTrack).not.toBeCalled();
            },
            { timeout: 6000 }
        );
    });

    it("updates matched cues during ignores all action", async () => {
        // GIVEN
        const trackId = "0fd7af04-6c87-4793-8d66-fdb19b5fd04d";
        const saveTrack = jest.fn();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        const testingTrack = {
            type: "CAPTION",
            language: { id: "en-US", name: "English (US)" } as Language,
            default: true,
            mediaTitle: "This is the video title",
            mediaLength: 4000,
            progress: 50,
            id: trackId
        } as Track;
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        const spellCheck = {
            matches: [
                { offset: 8, length: 5, replacements: [{ "value": "Line" }] as Replacement[],
                    context: { text: "Caption Linex 1", offset: 8, length: 5 },
                    rule: { id: ruleId }
                }
            ]
        } as SpellCheck;

        const cues = [
            { id: "cue-1", vttCue: new VTTCue(0, 2, "Caption Linex 1"),
                cueCategory: "DIALOGUE", spellCheck: spellCheck,
                errors: [CueError.SPELLCHECK_ERROR]},
            { id: "cue-2", vttCue: new VTTCue(2, 4, "Caption Linex 2"),
                cueCategory: "DIALOGUE", spellCheck: spellCheck,
                errors: [CueError.SPELLCHECK_ERROR]},
            { id: "cue-3", vttCue: new VTTCue(4, 6, "Caption Linex 2"),
                cueCategory: "DIALOGUE", errors: [CueError.SPELLCHECK_ERROR]}
        ] as CueDto[];
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);
        testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
        testingStore.dispatch(updateMatchedCues() as {} as AnyAction);

        // @ts-ignore modern browsers does have it
        global.fetch = jest.fn()
            .mockImplementationOnce(() => new Promise((resolve) =>
                resolve({ json: () => spellCheck })));
        const editUuid = testingStore.getState().cues[0].editUuid;
        const { container } = render(
            <Provider store={testingStore}>
                <CueTextEditor
                    bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                    unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
                    index={0}
                    vttCue={testingStore.getState().cues[0].vttCue}
                    editUuid={editUuid}
                    spellCheck={spellCheck}
                    setGlossaryTerm={jest.fn()}
                    autoFocus
                />
            </Provider>
        );
        const errorSpan = container.querySelectorAll(".sbte-text-with-error")[0] as Element;
        fireEvent.click(errorSpan);

        //WHEN
        const ignoreOption = document.querySelectorAll(".spellcheck__option")[0] as Element;
        fireEvent.click(ignoreOption);

        // THEN
        //@ts-ignore value should not be null
        const ignores = JSON.parse(localStorage.getItem("SpellcheckerIgnores"));
        expect(ignores[trackId]).not.toBeNull();
        expect(testingStore.getState().cues[0].errors).toEqual([]);
        expect(testingStore.getState().cues[1].errors).toEqual([]);
        expect(testingStore.getState().cues[2].errors).toEqual([]);
        expect(testingStore.getState().matchedCues.matchedCues[0].targetCues[0].cue.errors).toEqual([]);
        expect(testingStore.getState().matchedCues.matchedCues[1].targetCues[0].cue.errors).toEqual([]);
        expect(testingStore.getState().matchedCues.matchedCues[2].targetCues[0].cue.errors).toEqual([]);

        await waitFor(
            () => {
                expect(updateCueMock).toBeCalled();
                expect(saveTrack).not.toBeCalled();
            },
            { timeout: 6000 }
        );
    });
});

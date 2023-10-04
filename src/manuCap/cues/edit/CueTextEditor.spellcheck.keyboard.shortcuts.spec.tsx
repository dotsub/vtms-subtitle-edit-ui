import "../../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import * as React from "react";
import { AnyAction } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { createTestingStore } from "../../../testUtils/testingStore";
import { CueDto, Track } from "../../model";
import CueTextEditor from "./CueTextEditor";
import { updateEditingTrack } from "../../trackSlices";
import { updateCues } from "../cuesList/cuesListActions";
import { SpellCheck } from "../spellCheck/model";
import { Character } from "../../utils/shortcutConstants";
import { fireEvent, render } from "@testing-library/react";
import { setSaveTrack } from "../saveSlices";
//@ts-ignore
import { LodashDebounce } from "lodash/ts3.1/fp";
import { setSpellCheckDomain } from "../../spellcheckerSettingsSlice";
import { saveCueUpdateSlice } from "../saveCueUpdateSlices";

jest.mock("lodash", () => ({
    debounce: (fn: LodashDebounce): Function => {
        fn.cancel = jest.fn();
        return fn;
    },
    get: (): [] => ([]),
    sortBy: jest.requireActual("lodash/sortBy"),
    findIndex: jest.requireActual("lodash/findIndex")
}));
const ruleId = "MORFOLOGIK_RULE_EN_US";
const spellCheckFakeMatches = {
    "matches": [
        {
            message: "Possible spelling mistake found.",
            replacements: [
                { value: "Context" },
                { value: "Somewhat" },
                { value: "Sometime" },
                { value: "Competent" },
            ],
            offset: 0,
            length: 8,
            context: { text: "TestThis", length: 3, offset: 0 },
            rule: { id: ruleId }
        }
    ]
} as SpellCheck;

const testingTrack = {
    type: "CAPTION",
    language: { id: "en-US" },
    default: true,
    id: "0fd7af04-6c87-4793-8d66-fdb19b5fd04d"
} as Track;

const testingCues = [
    { id: "cue-1", vttCue: new VTTCue(0, 1.225, "Caption Line 1"), cueCategory: "DIALOGUE" },
    { id: "cue-2", vttCue: new VTTCue(1.225, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
] as CueDto[];

let testingStore = createTestingStore();
let bindCueViewModeKeyboardShortcutSpy = jest.fn();
let unbindCueViewModeKeyboardShortcutSpy = jest.fn();

describe("CueTextEditor.SpellChecker keyboard shortcut", () => {
    beforeEach(() => {
        document.getElementsByTagName("html")[0].innerHTML = "";
        bindCueViewModeKeyboardShortcutSpy = jest.fn();
        unbindCueViewModeKeyboardShortcutSpy = jest.fn();
        testingStore = createTestingStore();
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
        testingStore.dispatch(setSpellCheckDomain("testing-domain") as {} as AnyAction);
    });

    const createEditorNode = (text = "someText", spellCheckFakeMatches: SpellCheck): React.ReactElement => {
        const vttCue = new VTTCue(0, 1, text);
        const editUuid = testingStore.getState().cues[0].editUuid;
        return (
            <Provider store={testingStore}>
                <CueTextEditor
                    spellCheck={spellCheckFakeMatches}
                    bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                    unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
                    index={0}
                    vttCue={vttCue}
                    editUuid={editUuid}
                    setGlossaryTerm={jest.fn()}
                    autoFocus
                />
            </Provider>);
    };

    it("shows popover when popover show keyboard shortcut is entered", () => {
        //GIVEN
        const { container } = render(createEditorNode("SomeText", spellCheckFakeMatches), { container: document.body });
        const editor = container.querySelector(".public-DraftEditor-content") as Element;

        //WHEN
        fireEvent.keyDown(editor, { keyCode: Character.SPACE, shiftKey: true, ctrlKey: true, metaKey: true });

        // THEN
        expect(document.querySelector(".p-menu.p-connected-overlay-enter-active")).not.toBeNull();
    });

    it("hides popover when enter popover show shortcut again while popover is shown already", () => {
        //GIVEN
        const { container } = render(createEditorNode("SomeText", spellCheckFakeMatches), { container: document.body });
        const editor = container.querySelector(".public-DraftEditor-content") as Element;
        fireEvent.keyDown(editor, { keyCode: Character.SPACE, shiftKey: true, ctrlKey: true, metaKey: true });

        //WHEN
        fireEvent.keyDown(editor, { keyCode: Character.SPACE, shiftKey: true, ctrlKey: true, metaKey: true });

        // THEN
        expect(document.querySelector(".p-menu.p-connected-overlay-exit-active")).not.toBeNull();
    });

    it("hides popover when enter popover close shortcut", async () => {
        //GIVEN
        const { container } = render(createEditorNode("SomeText", spellCheckFakeMatches), { container: document.body });
        const editor = container.querySelector(".public-DraftEditor-content") as Element;
        fireEvent.keyDown(editor, { keyCode: Character.SPACE, shiftKey: true, ctrlKey: true, metaKey: true });

        //WHEN
        fireEvent.keyDown(document.querySelector(".spellcheck__menu") as Element,
            { keyCode: Character.ESCAPE });

        // THEN
        expect(document.querySelector(".p-menu.p-connected-overlay-exit-active")).not.toBeNull();
    });

    it("moves between options using the arrow up/down shortcut", () => {
        //GIVEN
        const { container } = render(createEditorNode("SomeText", spellCheckFakeMatches), { container: document.body });
        const editor = container.querySelector(".public-DraftEditor-content") as Element;
        fireEvent.keyDown(editor, { keyCode: Character.SPACE, shiftKey: true, ctrlKey: true, metaKey: true });

        //WHEN
        for (let i = 0; i < 5; i++) {
            fireEvent.keyDown(document.querySelector(".spellcheck__menu") as Element, {
                keyCode: 40,
                key: "ArrowDown",
            });
        }
        for (let i = 0; i < 2; i++) {
            fireEvent.keyDown(document.querySelector(".spellcheck__menu") as Element, {
                keyCode: 38,
                key: "ArrowUp",
            });
        }

        //THEN
        expect(document.querySelector(".spellcheck__option--is-focused")?.innerHTML)
            .toEqual("Somewhat");
    });

    it("select an option using enter shortcut", () => {
        //GIVEN
        const saveTrack = jest.fn();
        const updateCueCallback = jest.fn();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        testingStore.dispatch(saveCueUpdateSlice.actions.setUpdateCueCallback(updateCueCallback));

        const { container, unmount } = render(createEditorNode("SomeText", spellCheckFakeMatches),
            { container: document.body });
        const editor = container.querySelector(".public-DraftEditor-content") as Element;
        fireEvent.keyDown(editor, {
            keyCode: Character.SPACE, shiftKey: true, ctrlKey: true, metaKey: true
        });

        //WHEN
        for (let i = 0; i < 2; i++) {
            fireEvent.keyDown(document.querySelector(".spellcheck__menu") as Element, {
                keyCode: Character.ARROW_DOWN,
                key: "ArrowDown",
            });
        }
        fireEvent.keyDown(document.querySelector(".spellcheck__option--is-focused") as Element, {
            keyCode: Character.ENTER
        });
        unmount();

        //THEN
        expect(updateCueCallback).toBeCalled();
        expect(saveTrack).not.toBeCalled();
        expect(bindCueViewModeKeyboardShortcutSpy).toBeCalled();
    });

    it("calls bindEnterAndEscKeys when closing the popover", () => {
        //GIVEN
        const { container, unmount } = render(createEditorNode("SomeText", spellCheckFakeMatches),
            { container: document.body });
        const editor = container.querySelector(".public-DraftEditor-content") as Element;
        fireEvent.keyDown(editor, { keyCode: Character.SPACE, shiftKey: true, ctrlKey: true, metaKey: true });


        //WHEN
        fireEvent.keyDown(document.querySelector(".spellcheck__menu") as Element,
            { keyCode: Character.ESCAPE });
        unmount();

        //THEN
        expect(bindCueViewModeKeyboardShortcutSpy).toBeCalled();
    });


    it("do nothing when type enter and escape on editor while popover is shown", () => {
        //GIVEN
        const saveTrack = jest.fn();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        const { container } = render(createEditorNode("SomeText", spellCheckFakeMatches), { container: document.body });
        const editor = container.querySelector(".public-DraftEditor-content") as Element;
        fireEvent.keyDown(editor, {
            keyCode: Character.SPACE, shiftKey: true, ctrlKey: true, metaKey: true
        });
        saveTrack.mockReset();

        //WHEN
        fireEvent.keyDown(editor, {
            keyCode: Character.ENTER
        });

        //THEN
        expect(saveTrack).not.toBeCalled();
        expect(document.querySelector(".p-menu.p-connected-overlay-enter-active")).not.toBeNull();
    });

    it("do nothing when type tab and escape on editor while popover is shown", () => {
        //GIVEN
        const saveTrack = jest.fn();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        const { container } = render(createEditorNode("SomeText", spellCheckFakeMatches), { container: document.body });
        const editor = container.querySelector(".public-DraftEditor-content") as Element;
        fireEvent.keyDown(editor, {
            keyCode: Character.SPACE, shiftKey: true, ctrlKey: true, metaKey: true
        });
        saveTrack.mockReset();

        //WHEN
        fireEvent.keyDown(editor, {
            keyCode: Character.TAB
        });

        //THEN
        expect(saveTrack).not.toBeCalled();
        expect(document.querySelector(".p-menu.p-connected-overlay-enter-active")).not.toBeNull();
    });

    it("does not select an option if clicked ctrl space on the dropdown", () => {
        //GIVEN
        const saveTrack = jest.fn();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        const { container } = render(createEditorNode("SomeText", spellCheckFakeMatches), { container: document.body });
        const editor = container.querySelector(".public-DraftEditor-content") as Element;
        fireEvent.keyDown(editor, {
            keyCode: Character.SPACE, shiftKey: true, ctrlKey: true, metaKey: true
        });
        fireEvent.keyDown(document.querySelector(".spellcheck__menu") as Element, {
            keyCode: Character.ARROW_DOWN,
            key: "ArrowDown",
        });
        saveTrack.mockReset();

        //WHEN
        fireEvent.keyDown(document.querySelector(".spellcheck__option--is-focused") as Element, {
            keyCode: Character.SPACE, shiftKey: true, ctrlKey: true, metaKey: true
        });

        //THEN
        expect(saveTrack).not.toBeCalled();
        expect(document.querySelector(".p-menu.p-connected-overlay-exit-active")).not.toBeNull();
    });

    it("handle popover keyboard shortcut if it was passed to editor", () => {
        //GIVEN
        const { container } = render(createEditorNode("SomeText", spellCheckFakeMatches), { container: document.body });
        const editor = container.querySelector(".public-DraftEditor-content") as Element;
        fireEvent.keyDown(editor, { keyCode: Character.SPACE, shiftKey: true, ctrlKey: true, metaKey: true });

        //WHEN
        fireEvent.keyDown(editor as Element, { keyCode: Character.ESCAPE });

        // THEN
        expect(document.querySelector(".p-menu.p-connected-overlay-enter-active")).not.toBeNull();
    });

    it("calls unbindCueViewModeKeyboardShortcut when entering the popover", () => {
        //GIVEN
        const { container } = render(createEditorNode("SomeText", spellCheckFakeMatches), { container: document.body });
        const editor = container.querySelector(".public-DraftEditor-content") as Element;

        //WHEN
        fireEvent.keyDown(editor, { keyCode: Character.SPACE, shiftKey: true, ctrlKey: true, metaKey: true });

        // THEN
        expect(unbindCueViewModeKeyboardShortcutSpy).toBeCalled();
    });
});

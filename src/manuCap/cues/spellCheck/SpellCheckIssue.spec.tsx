import "../../../testUtils/initBrowserEnvironment";
import { CSSProperties, RefObject } from "react";
import { mount } from "enzyme";
import { SpellCheckIssue } from "./SpellCheckIssue";
import { SpellCheck } from "./model";
import { spellCheckOptionPredicate } from "../../../testUtils/testUtils";
import Select from "react-select";
import { StylesConfig } from "react-select/dist/declarations/src/styles";

jest.mock("react-redux");

const removeSelectCssClass = (htmlString: string): string =>
    htmlString.replace(/react-select-\d{1,4}-+/g, "")
        .replace(/css-[a-zA-Z0-9]+-[a-zA-Z0-9]+/g, "")
        .replace(" spellcheck__option--is-focused", "")
        .replace(/z-index: ?\d*; ?/g, "");

describe("SpellCheckerIssue", () => {

    const emptyEditorRef = {} as RefObject<HTMLInputElement>;
    const bindCueViewModeKeyboardShortcutSpy = jest.fn();
    const unbindCueViewModeKeyboardShortcutSpy = jest.fn();
    const trackId = "0fd7af04-6c87-4793-8d66-fdb19b5fd04d";
    const ruleId = "MORFOLOGIK_RULE_EN_US";
    const spellCheck = {
        matches: [
            {
                message: "There is error",
                replacements: [{ value: "error" }],
                offset: 15,
                length: 3,
                context: { text: "some <i>HTML</i> <b>Text</b> sample", length: 3, offset: 15 },
                rule: { id: ruleId }
            }
        ]
    } as SpellCheck;
    const customStyles = {
        control: () => ({ visibility: "hidden", height: "0px" }),
        container: (provided: CSSProperties) => ({ ...provided, height: "100%" }),
        menu: (provided: CSSProperties) => ({ ...provided, position: "static", height: "100%", margin: 0 }),
        menuList: (provided: CSSProperties) => ({ ...provided, height: "200px" })
    } as StylesConfig;

    it("renders without popup", () => {
        // GIVEN
        const expectedNode = mount(
            <span
                className="sbte-text-with-error"
                aria-controls="spellcheckIssue-0fd7af04-6c87-4793-8d66-fdb19b5fd04d-15-18"
                aria-haspopup="true"
            >
                <div className="text" />
            </span>
        );

        // WHEN
        const actualNode = mount(
            <SpellCheckIssue
                trackId={trackId}
                spellCheck={spellCheck}
                start={15}
                end={18}
                correctSpelling={jest.fn()}
                setSpellCheckerMatchingOffset={jest.fn()}
                spellCheckerMatchingOffset={null}
                editorRef={emptyEditorRef}
                bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
            >
                <div className="text" />
            </SpellCheckIssue>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("does not render issue if start doesn't match", () => {
        // GIVEN
        const expectedNode = mount(<div className="text" />);

        // WHEN
        const actualNode = mount(
            <SpellCheckIssue
                trackId={trackId}
                spellCheck={spellCheck}
                start={13}
                end={18}
                correctSpelling={jest.fn()}
                setSpellCheckerMatchingOffset={jest.fn()}
                spellCheckerMatchingOffset={null}
                editorRef={emptyEditorRef}
                bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
            >
                <div className="text" />
            </SpellCheckIssue>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("does not render issue if end doesn't match", () => {
        // GIVEN
        const expectedNode = mount(<div className="text" />);

        // WHEN
        const actualNode = mount(
            <SpellCheckIssue
                trackId={trackId}
                spellCheck={spellCheck}
                start={15}
                end={17}
                correctSpelling={jest.fn()}
                setSpellCheckerMatchingOffset={jest.fn()}
                spellCheckerMatchingOffset={null}
                editorRef={emptyEditorRef}
                bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
            >
                <div className="text" />
            </SpellCheckIssue>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders popup with options when clicked", () => {
        // GIVEN
        const expectedNode = mount(
            <div
                id="spellcheckIssue-0fd7af04-6c87-4793-8d66-fdb19b5fd04d-15-18"
                className="p-menu p-component p-menu-overlay spellcheck-menu sbte-big-menu
                     p-0 shadow-md p-connected-overlay-exit p-connected-overlay-exit-active"
            >
                <ul className="p-menu-list p-reset" role="menu">
                    <li className="p-menuitem" role="none">
                        <div className="border-b border-b-gray-300 bg-gray-0 text-700 p-2">
                            There is error
                        </div>
                        <div>
                            <Select
                                menuIsOpen
                                autoFocus
                                styles={customStyles}
                                options={[
                                    { value: "", label: "Ignore all in this track" },
                                    { value: "repl1", label: "repl1" },
                                    { value: "repl2", label: "repl2" },
                                    { value: "repl3", label: "repl3" }
                                ]}
                                classNamePrefix="spellcheck"
                            />
                        </div>
                    </li>
                </ul>
            </div>
        );

        const spellCheck = {
            matches: [
                {
                    message: "There is error",
                    replacements: [{ value: "repl1" }, { value: "repl2" }, { value: "repl3" }],
                    offset: 15,
                    length: 3,
                    context: { text: "asd", length: 3, offset: 15 },
                    rule: { id: ruleId }
                }
            ]
        } as SpellCheck;

        const actualNode = mount(
            <SpellCheckIssue
                trackId={trackId}
                spellCheck={spellCheck}
                start={15}
                end={18}
                correctSpelling={jest.fn()}
                setSpellCheckerMatchingOffset={jest.fn()}
                spellCheckerMatchingOffset={15}
                editorRef={emptyEditorRef}
                bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
            >
                <div className="text" />
            </SpellCheckIssue>
        );

        // WHEN
        actualNode.find(".sbte-text-with-error").simulate("click");

        // THEN
        const actual = removeSelectCssClass(actualNode.find( ".spellcheck-menu").at(0).html());
        const expected = removeSelectCssClass(expectedNode.html());
        expect(actual).toEqual(expected);
    });

    it("renders popup without options when clicked", () => {
        // GIVEN
        const expectedNode = mount(
            <div
                id="spellcheckIssue-0fd7af04-6c87-4793-8d66-fdb19b5fd04d-15-18"
                className="p-menu p-component p-menu-overlay spellcheck-menu sbte-big-menu
                     p-0 shadow-md p-connected-overlay-exit p-connected-overlay-exit-active"
            >
                <ul className="p-menu-list p-reset" role="menu">
                    <li className="p-menuitem" role="none">
                        <div className="border-b border-b-gray-300 bg-gray-0 text-700 p-2">
                            There is error
                        </div>
                        <div>
                            <Select
                                menuIsOpen
                                autoFocus
                                styles={customStyles}
                                options={[
                                    { value: "", label: "Ignore all in this track" },
                                    { value: "error", label: "error" }
                                ]}
                                classNamePrefix="spellcheck"
                            />
                        </div>
                    </li>
                </ul>
            </div>
        );
        const actualNode = mount(
            <SpellCheckIssue
                trackId={trackId}
                spellCheck={spellCheck}
                start={15}
                end={18}
                correctSpelling={jest.fn()}
                setSpellCheckerMatchingOffset={jest.fn()}
                spellCheckerMatchingOffset={15}
                editorRef={emptyEditorRef}
                bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
            >
                <div className="text" />
            </SpellCheckIssue>
        );

        // WHEN
        actualNode.find(".sbte-text-with-error").simulate("click");

        // THEN
        const actual = removeSelectCssClass(actualNode.find( ".spellcheck-menu").at(0).html());
        const expected = removeSelectCssClass(expectedNode.html());
        expect(actual).toEqual(expected);
    });

    it("calls callback with selection when clicked", () => {
        // GIVEN
        const handler = jest.fn();

        const spellCheck = {
            matches: [
                {
                    message: "There is error",
                    replacements: [{ value: "repl1" }, { value: "repl2" }, { value: "repl3" }],
                    offset: 15,
                    length: 3,
                    context: { text: "asd", length: 3, offset: 15 },
                    rule: { id: ruleId }
                }
            ]
        } as SpellCheck;

        const actualNode = mount(
            <SpellCheckIssue
                trackId={trackId}
                spellCheck={spellCheck}
                start={15}
                end={18}
                correctSpelling={handler}
                setSpellCheckerMatchingOffset={jest.fn()}
                spellCheckerMatchingOffset={15}
                editorRef={emptyEditorRef}
                bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcutSpy}
                unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcutSpy}
            >
                <div className="text" />
            </SpellCheckIssue>
        );

        // WHEN
        actualNode.find(".sbte-text-with-error").simulate("click");
        actualNode.findWhere(spellCheckOptionPredicate(2)).simulate("click");

        // THEN
        expect(handler).toBeCalledWith("repl2", 15, 18);
    });
});

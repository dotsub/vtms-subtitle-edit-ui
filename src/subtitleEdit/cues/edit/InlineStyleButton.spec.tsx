import "../../../testUtils/initBrowserEnvironment";
import { ContentState, convertFromHTML, EditorState } from "draft-js";
import InlineStyleButton from "./InlineStyleButton";
import { createEvent, fireEvent, render } from "@testing-library/react";
import { act } from "react-dom/test-utils";

jest.mock("lodash", () => ({
    debounce: (callback: Function): Function => callback
}));

/**
 * On click actions are covered by CueTextEditor tests
 */

describe("InlineStyleButton", () => {
    it("renders for empty editor state", () => {
        // GIVEN
        const expectedNode = render(
            <button
                id="inlineStyle-BOLD0"
                className="sbte-inline-style-btn sbte-btn sbte-btn-primary"
                data-pr-tooltip="BOLD"
                data-pr-position="top"
                data-pr-at="center top"
            >
                <b>B</b>
            </button>
        );

        const processedHTML = convertFromHTML("");
        const contentState = ContentState.createFromBlockArray(processedHTML.contentBlocks);
        const editorState = EditorState.createWithContent(contentState);

        // WHEN
        const actualNode = render(
            <InlineStyleButton
                editorIndex={0}
                inlineStyle={"BOLD"}
                label={<b>B</b>}
                setEditorState={jest.fn()}
                editorState={editorState}
            />
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("toggle Bold button if editor's cursor is on bold text", () => {
        // GIVEN
        const expectedNode = render(
            <button
                id="inlineStyle-BOLD0"
                className="sbte-inline-style-btn sbte-btn sbte-btn-primary active"
                data-pr-tooltip="BOLD"
                data-pr-position="top"
                data-pr-at="center top"
            >
                <b>B</b>
            </button>
        );
        const processedHTML = convertFromHTML("<b>lala</b>");
        const contentState = ContentState.createFromBlockArray(processedHTML.contentBlocks);
        const editorState = EditorState.createWithContent(contentState);

        // WHEN
        const actualNode = render(
            <InlineStyleButton
                editorIndex={0}
                inlineStyle={"BOLD"}
                label={<b>B</b>}
                setEditorState={jest.fn()}
                editorState={editorState}
            />
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("toggle Italic button if editor's cursor is on italic text", () => {
        // GIVEN
        const expectedNode = render(
            <button
                id="inlineStyle-ITALIC0"
                className="sbte-inline-style-btn sbte-btn sbte-btn-primary active"
                data-pr-tooltip="ITALIC"
                data-pr-position="top"
                data-pr-at="center top"
            >
                <i>I</i>
            </button>
        );
        const processedHTML = convertFromHTML("<i>lala</i>");
        const contentState = ContentState.createFromBlockArray(processedHTML.contentBlocks);
        const editorState = EditorState.createWithContent(contentState);

        // WHEN
        const actualNode = render(
            <InlineStyleButton
                editorIndex={0}
                inlineStyle={"ITALIC"}
                label={<i>I</i>}
                setEditorState={jest.fn()}
                editorState={editorState}
            />
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("toggle Underline button if editor's cursor is on underlined text", () => {
        // GIVEN
        const expectedNode = render(
            <button
                id="inlineStyle-UNDERLINE0"
                className="sbte-inline-style-btn sbte-btn sbte-btn-primary active"
                data-pr-tooltip="UNDERLINE"
                data-pr-position="top"
                data-pr-at="center top"
            >
                <u>U</u>
            </button>
        );
        const processedHTML = convertFromHTML("<u>lala</u>");
        const contentState = ContentState.createFromBlockArray(processedHTML.contentBlocks);
        const editorState = EditorState.createWithContent(contentState);

        // WHEN
        const actualNode = render(
            <InlineStyleButton
                editorIndex={0}
                inlineStyle={"UNDERLINE"}
                label={<u>U</u>}
                setEditorState={jest.fn()}
                editorState={editorState}
            />
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("it doesn't grab focus from text editor when clicked, so we can change inline style text written next", () => {
        // GIVEN
        const processedHTML = convertFromHTML("");
        const contentState = ContentState.createFromBlockArray(processedHTML.contentBlocks);
        const editorState = EditorState.createWithContent(contentState);

        const actualNode = render(
            <InlineStyleButton
                editorIndex={0}
                inlineStyle={"BOLD"}
                label={<b>B</b>}
                setEditorState={jest.fn()}
                editorState={editorState}
            />
        );

        const button = actualNode.container.querySelector("button") as Element;
        const event = createEvent.mouseDown(button);
        const preventDefaultSpy = jest.spyOn(event, "preventDefault");

        // WHEN
        fireEvent(button, event);

        // THEN
        expect(preventDefaultSpy).toBeCalled();
    });

    it("renders overlay with text provided to InlineStyleButton", async () => {
        //GIVEN
        const expectedText = "BOLD";
        const processedHTML = convertFromHTML("");
        const contentState = ContentState.createFromBlockArray(processedHTML.contentBlocks);
        const editorState = EditorState.createWithContent(contentState);
        const actualNode = render(
            <InlineStyleButton
                editorIndex={0}
                inlineStyle={expectedText}
                label={<b>B</b>}
                setEditorState={jest.fn()}
                editorState={editorState}
            />
        , { container: document.body });
        const button = actualNode.container.querySelector(".sbte-btn-primary") as Element;

        //WHEN
        fireEvent.mouseEnter(button);

        //THEN
        expect(await actualNode.findByText(expectedText)).toBeInTheDocument();
    });

    it("updates editor state when inline style button is clicked", async () => {
        // GIVEN
        const processedHTML = convertFromHTML("lala");
        const contentState = ContentState.createFromBlockArray(processedHTML.contentBlocks);
        const editorState = EditorState.createWithContent(contentState);
        const setEditorState = jest.fn();

        const actualNode = render(
            <InlineStyleButton
                editorIndex={0}
                inlineStyle={"UNDERLINE"}
                label={<u>U</u>}
                setEditorState={setEditorState}
                editorState={editorState}
            />
        );
        const button = actualNode.container.querySelector("button") as Element;

        // WHEN
        await act(async () => {
            fireEvent.click(button);
        });

        // THEN
        expect(setEditorState.mock.calls.length).toEqual(1);
        const actualEditorState = setEditorState.mock.calls[0][0];
        const inlineStyle = actualEditorState.getCurrentInlineStyle();
        expect(inlineStyle.size).toEqual(1);
        expect(inlineStyle.get("UNDERLINE")).toEqual("UNDERLINE");
    });
});

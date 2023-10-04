import { ContentState, convertFromHTML, EditorState, Modifier, SelectionState } from "draft-js";
import { convertVttToHtml, getVttText } from "./cueTextConverter";
import { copyNonConstructorProperties } from "../cueUtils";

export const replaceContent = (
    editorState: EditorState,
    replacement: string,
    start: number,
    end: number): EditorState => {
    let contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();
    const replaceSelectionState = selectionState.set("anchorOffset", start).set("focusOffset", end) as SelectionState;
    const startKey = replaceSelectionState.getStartKey();
    const replaceBlock = contentState.getBlockForKey(startKey);
    const inlineStyle = replaceBlock.getInlineStyleAt(start);
    contentState = Modifier.replaceText(contentState, replaceSelectionState, replacement, inlineStyle);
    return EditorState.push(editorState, contentState, "change-block-data");
};

export const replaceVttCueContent = (
    vttCue: VTTCue,
    replacement: string,
    start: number,
    end: number): VTTCue => {
    const processedHTML = convertFromHTML(convertVttToHtml(vttCue.text));
    const initialContentState = ContentState.createFromBlockArray(processedHTML.contentBlocks);
    const editorState = EditorState.createWithContent(initialContentState);
    const replacedEditorState = replaceContent(editorState, replacement, start, end);
    const vttText = getVttText(replacedEditorState.getCurrentContent());
    const newVttCue = new VTTCue(vttCue.startTime, vttCue.endTime, vttText);
    copyNonConstructorProperties(newVttCue, vttCue);
    return newVttCue;
};

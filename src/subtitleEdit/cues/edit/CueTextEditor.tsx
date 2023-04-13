import { Dispatch, KeyboardEventHandler, MutableRefObject, ReactElement, useEffect, useRef, useState } from "react";
import * as React from "react";
import {
    CompositeDecorator,
    ContentBlock,
    ContentState,
    convertFromHTML,
    DraftHandleValue,
    Editor,
    EditorState,
    getDefaultKeyBinding,
    Modifier,
    RichUtils,
    SelectionState
} from "draft-js";
import { useDispatch, useSelector } from "react-redux";
import Mousetrap from "mousetrap";
import _ from "lodash";

import { AppThunk, SubtitleEditState } from "../../subtitleEditReducers";
import { Character, getActionByKeyboardEvent, mousetrapBindings } from "../../utils/shortcutConstants";
import { constructCueValuesArray, copyNonConstructorProperties } from "../cueUtils";
import { convertVttToHtml, getVttText } from "./cueTextConverter";
import CueLineCounts from "../cueLine/CueLineCounts";
import InlineStyleButton from "./InlineStyleButton";
import { applySpellcheckerOnCue, checkErrors, updateVttCue } from "../cuesList/cuesListActions";
import { SpellCheck } from "../spellCheck/model";
import { SpellCheckIssue } from "../spellCheck/SpellCheckIssue";

import { SearchReplaceMatch } from "../searchReplace/SearchReplaceMatch";
import { replaceContent } from "./editUtils";
import { searchNextCues, setReplacement } from "../searchReplace/searchReplaceSlices";
import { CueExtraCharacters } from "./CueExtraCharacters";
import { hasIgnoredKeyword } from "../spellCheck/spellCheckerUtils";
import { SubtitleSpecification } from "../../toolbox/model";
import { Track } from "../../model";
import { SearchReplaceIndices } from "../searchReplace/model";

const findSpellCheckIssues = (props: CueTextEditorProps, editingTrack: Track | null, spellcheckerEnabled: boolean) =>
    (_contentBlock: ContentBlock, callback: Function): void => {
        if (props.spellCheck && props.spellCheck.matches  && spellcheckerEnabled) {
            props.spellCheck.matches.forEach(match => {
                if (!hasIgnoredKeyword(match, editingTrack?.id)) {
                    callback(match.offset, match.offset + match.length);
                }
            });
        }
    };

const findSearchReplaceMatch = (searchReplaceIndices: SearchReplaceIndices | undefined) =>
    (_contentBlock: ContentBlock, callback: Function): void => {
        if (searchReplaceIndices) {
            const offset = searchReplaceIndices.offset;
            callback(offset, offset + searchReplaceIndices.matchLength);
        }
    };

const findExtraCharacters = (subtitleSpecifications: SubtitleSpecification | null) =>
    (contentBlock: ContentBlock, callback: Function): void => {
        if (subtitleSpecifications && subtitleSpecifications.enabled && subtitleSpecifications.maxCharactersPerLine) {
            const maxCharactersPerLine = subtitleSpecifications.maxCharactersPerLine;
            const text = contentBlock.getText();
            const lines = text.split("\n");
            return lines.forEach(line => {
                const lineStartOffset = text.indexOf(line);
                const lineEndOffset = lineStartOffset + line.length;
                if (line.length > maxCharactersPerLine) {
                    callback(lineStartOffset + maxCharactersPerLine, lineEndOffset);
                }
            });
        }
    };

const findExtraLines = (subtitleSpecifications: SubtitleSpecification | null) =>
    (contentBlock: ContentBlock, callback: Function): void => {
        if (subtitleSpecifications && subtitleSpecifications.enabled && subtitleSpecifications.maxLinesPerCaption) {
            const maxLinesPerCaption = subtitleSpecifications.maxLinesPerCaption;
            const text = contentBlock.getText();
            const lines = text.split("\n");
            let charCount = 0;
            return lines.forEach((line: string, index: number) => {
                const lineStartOffset = charCount + index;
                const lineEndOffset = lineStartOffset + line.length;
                if (index + 1 > maxLinesPerCaption) {
                    callback(lineStartOffset, lineEndOffset);
                }
                charCount += line.length;
            });
        }
    };

const handleKeyShortcut = (
    editorState: EditorState,
    props: CueTextEditorProps,
    spellCheckerMatchingOffset: number | null,
    setSpellCheckerMatchingOffset: Function,
    languageDirection: string | undefined,
    setEditorState: Function
) => (shortcut: string): DraftHandleValue => {
    const keyCombination = mousetrapBindings.get(shortcut);
    if (shortcut === "openSpellChecker") {
        const selection = editorState.getSelection();
        const startOffset = selection.getStartOffset();
        const match = props.spellCheck?.matches.find(match => match.offset <= startOffset &&
            startOffset <= (match.offset + match.length));
        if (match != null) {
            setSpellCheckerMatchingOffset(spellCheckerMatchingOffset != null ? null : match.offset);
        }
        return "handled";
    }
    if (keyCombination) {
        Mousetrap.trigger(keyCombination);
        return "handled";
    }
    if (shortcut === "newLine") {
        const newEditorState = RichUtils.insertSoftNewline(editorState);
        setEditorState(newEditorState);
        return "handled";
    }
    if (shortcut === "insertBidiCode") {
        const content = editorState.getCurrentContent();
        const bidiChar = languageDirection === "RTL" ? "\u200F" : "\u200E";
        const contentWithBidiCode = Modifier.insertText(content, editorState.getSelection(), bidiChar);
        const newState = EditorState.push(editorState, contentWithBidiCode, "change-block-data");
        setEditorState(newState);
        return "handled";
    }
    return "not-handled";
};

const changeVttCueInRedux = (
    currentContent: ContentState,
    props: CueTextEditorProps,
    dispatch: Dispatch<AppThunk>,
    replacement: string
): void => {
    const vttText = getVttText(currentContent);
    const vttCue = new VTTCue(props.vttCue.startTime, props.vttCue.endTime, vttText);
    copyNonConstructorProperties(vttCue, props.vttCue);
    dispatch(updateVttCue(props.index, vttCue, props.editUuid, true));
    if (replacement !== "") {
        dispatch(searchNextCues());
    }
};

const changeVttCueInReduxDebounced = _.debounce(changeVttCueInRedux, 200);

const getCharacterCountPerLine = (text: string): number[] => {
    const lines = text.match(/[^\r\n]+/g) || [text];
    return lines.map((line: string): number => line.length);
};

const getWordCountPerLine = (text: string): number[] => {
    const lines = text.match(/[^\r\n]+/g) || [text];
    return lines.map((line: string): number => line.match(/\S+/g)?.length || 0);
};


const keyShortcutBindings = (spellCheckerMatchingOffset: number | null) =>
    (e: React.KeyboardEvent<KeyboardEventHandler>): string | null => {
    const action = getActionByKeyboardEvent(e);
    if (action) {
        return action;
    }
    if(spellCheckerMatchingOffset != null && (e.keyCode === Character.ENTER || e.keyCode === Character.ESCAPE)) {
        return "popoverHandled";
    } else if (!e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
        if (e.keyCode === Character.ESCAPE) {
            return "closeEditor";
        } else if (e.keyCode === Character.ENTER) {
            return "editNext";
        }
    } else if (e.keyCode === Character.ENTER) {
        return "newLine";
    } else if ((e.ctrlKey || e.metaKey ) && e.shiftKey && e.keyCode === Character.SPACE) {
        return "openSpellChecker";
    } else if ((e.ctrlKey || e.metaKey ) && e.shiftKey && e.keyCode === Character.B_CHAR) {
        return "insertBidiCode";
    }
    return getDefaultKeyBinding(e);
};

export interface CueTextEditorProps {
    index: number;
    vttCue: VTTCue;
    autoFocus: boolean;
    editUuid?: string;
    spellCheck?: SpellCheck;
    bindCueViewModeKeyboardShortcut: () => void;
    unbindCueViewModeKeyboardShortcut: () => void;
    glossaryTerm?: string;
    setGlossaryTerm: (glossaryTerm?: string) => void;
}

const insertGlossaryTermIfNeeded = (editorState: EditorState, glossaryTerm?: string): EditorState => {
    if (glossaryTerm) {
        const content = editorState.getCurrentContent();
        const contentWithGlossaryTerm = Modifier.insertText(content, editorState.getSelection(), glossaryTerm);
        editorState = EditorState.push(editorState, contentWithGlossaryTerm, "change-block-data");
        editorState = EditorState.forceSelection(editorState, editorState.getSelection());
    }
    return editorState;
};

const replaceIfNeeded = (
    editorState: EditorState,
    searchReplaceIndices: SearchReplaceIndices | undefined,
    replacement: string
): EditorState => {
    if (replacement
        && replacement !== ""
        && searchReplaceIndices
    ) {
        const content = editorState.getCurrentContent();
        const offset = searchReplaceIndices.offset;
        const selectionState = editorState.getSelection();
        const endOffset = offset + searchReplaceIndices.matchLength;
        const searchSelection =
            selectionState.set("anchorOffset", offset).set("focusOffset", endOffset) as SelectionState;
        editorState = EditorState.forceSelection(editorState, searchSelection);

        const inlineStyle = editorState.getCurrentInlineStyle();
        const contentWithReplacement = Modifier.replaceText(content, searchSelection, replacement, inlineStyle);
        editorState = EditorState.push(editorState, contentWithReplacement, "change-block-data");
    }
    return editorState;
};

const revertEntityState = (
    prevVttText: string,
    editorPreviousTextRef: MutableRefObject<string | null>,
    autoFocus: boolean
): EditorState => {
    const processedHTML = convertFromHTML(convertVttToHtml(prevVttText));
    const initialContentState = ContentState.createFromBlockArray(processedHTML.contentBlocks);
    let newUpdatedState = EditorState.createWithContent(initialContentState);
    if (autoFocus) {
        newUpdatedState = EditorState.moveFocusToEnd(newUpdatedState);
    }
    editorPreviousTextRef.current = prevVttText;
    return newUpdatedState;
};

const handleApplyEntityIfNeeded = (
    newEditorState: EditorState,
    editorPreviousTextRef: MutableRefObject<string | null>,
    autoFocus: boolean
): EditorState => {
    // This code reverts an undesired change in editor that causes text to be lost on Firefox
    const newVttText = getVttText(newEditorState.getCurrentContent());
    if (newEditorState.getLastChangeType() === "apply-entity") {
        const prevVttText = editorPreviousTextRef.current || "";
        if (prevVttText !== newVttText) {
            return revertEntityState(prevVttText, editorPreviousTextRef, autoFocus);
        }
    }
    editorPreviousTextRef.current = newVttText;
    return newEditorState;
};

export let editorStateFOR_TESTING: EditorState;
export let setEditorStateFOR_TESTING: (editorState: EditorState) => void;

const CueTextEditor = (props: CueTextEditorProps): ReactElement => {
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const spellcheckerEnabled = useSelector((state: SubtitleEditState) => state.spellCheckerSettings.enabled);
    const subtitleSpecifications = useSelector((state: SubtitleEditState) => state.subtitleSpecifications);
    const replacement = useSelector((state: SubtitleEditState) => state.searchReplace.replacement);
    const searchReplace = useSelector((state: SubtitleEditState) => state.searchReplace);

    const [spellCheckerMatchingOffset, setSpellCheckerMatchingOffset] = useState(null);
    const editorRef = useRef(null);
    const dispatch = useDispatch();
    const processedHTML = convertFromHTML(convertVttToHtml(props.vttCue.text));
    const unmountContentRef = useRef<ContentState | null>(null);
    const imeCompositionRef = useRef<string | null>(null);
    const editorPreviousTextRef = useRef<string | null>(null);
    const previousEditorStateRef = useRef<EditorState | null>(null);

    const [editorState, setEditorState] = React.useState(
        () => {
            const initialContentState = ContentState.createFromBlockArray(processedHTML.contentBlocks);
            let initEditorState = EditorState.createWithContent(initialContentState);
            if (props.autoFocus) {
                initEditorState = EditorState.moveFocusToEnd(initEditorState);
            }

            return initEditorState;
        }
    );
    editorStateFOR_TESTING = editorState;
    setEditorStateFOR_TESTING = setEditorState;

    let decoratedEditorState = insertGlossaryTermIfNeeded(editorState, props.glossaryTerm);
    decoratedEditorState = replaceIfNeeded(decoratedEditorState, searchReplace.indices, replacement);

    // If in composition mode (i.e. for IME input or diacritics), the decorator re-renders cannot
    // happen because it will cause an error in the draft-js composition handler.
    if (!imeCompositionRef.current) {
        const newCompositeDecorator = new CompositeDecorator([
            {
                strategy: findSearchReplaceMatch(searchReplace.indices),
                component: SearchReplaceMatch,
            },
            {
                strategy: findExtraCharacters(subtitleSpecifications),
                component: CueExtraCharacters,
                props: {}
            },
            {
                strategy: findExtraLines(subtitleSpecifications),
                component: CueExtraCharacters,
                props: {}
            },
            {
                strategy: findSpellCheckIssues(props, editingTrack, spellcheckerEnabled),
                component: SpellCheckIssue,
                props: {
                    spellCheck: props.spellCheck,
                    correctSpelling: (replacement: string, start: number, end: number): void =>
                        setEditorState(replaceContent(decoratedEditorState, replacement, start, end)),
                    editorRef,
                    spellCheckerMatchingOffset,
                    setSpellCheckerMatchingOffset,
                    bindCueViewModeKeyboardShortcut: props.bindCueViewModeKeyboardShortcut,
                    unbindCueViewModeKeyboardShortcut: props.unbindCueViewModeKeyboardShortcut,
                    cueId: props.editUuid,
                    cueIdx: props.index,
                    trackId: editingTrack?.id
                }
            }
        ]);
        decoratedEditorState = EditorState.set(decoratedEditorState, { decorator: newCompositeDecorator });
    }

    const currentContent = decoratedEditorState.getCurrentContent();
    const currentInlineStyle = decoratedEditorState.getCurrentInlineStyle();
    const charCountPerLine = getCharacterCountPerLine(currentContent.getPlainText());
    const wordCountPerLine = getWordCountPerLine(currentContent.getPlainText());

    useEffect(
        () => {
            if (!props.spellCheck) {
                dispatch(applySpellcheckerOnCue(props.index));
                dispatch(checkErrors({ index: props.index, shouldSpellCheck: false }));
            }
        },
        // needed to call the effect only once
        // eslint-disable-next-line
        []
    );

    useEffect(
        () => {
            props.setGlossaryTerm(undefined);
            if (replacement !== "") {
                dispatch(setReplacement(""));
            }
            previousEditorStateRef.current = decoratedEditorState;
            setEditorState(decoratedEditorState);
        },
        // It is enough to detect changes on pieces of editor state that indicate content change.
        // E.g. editorState.getSelection() is not changing content, thus we don't need to store editor state
        // into redux when changed.
        // (Also some tests would fail if you include editorState object itself, but behavior is still OK)
        // eslint-disable-next-line
        [ currentContent, currentInlineStyle, dispatch, props.index ]
    );

    useEffect(
        () => {
            // Only need to update vttCue if ContentState is changing
            const shouldUpdateVttCue = unmountContentRef.current !== null
                && unmountContentRef.current !== currentContent;
            unmountContentRef.current = currentContent;
            if (shouldUpdateVttCue) {
                changeVttCueInReduxDebounced(currentContent, props, dispatch, replacement);
            }
        },
        // Two bullet points in this suppression:
        //  - props.vttCue is not included, because it causes endless FLUX loop.
        //  - spread operator for cue values is used so that all the VTTCue properties code can be in single file.
        // eslint-disable-next-line
        [ currentContent, currentInlineStyle, dispatch, props.index, ...constructCueValuesArray(props.vttCue) ]
    );

    useEffect(
        () => {
            editorPreviousTextRef.current = getVttText(currentContent);
        },
        // Leaving currentContent out of deps because we only want to initialize the editorPreviousTextRef
        // when the cue index changes
        // eslint-disable-next-line
        [ props.index ]
    );

    // Fire update VTTCue action when component is unmounted.
    // So content is not lost when unmounted before next debounce.
    useEffect(
        () => (): void => {
            changeVttCueInReduxDebounced.cancel();
            if (unmountContentRef.current !== null && unmountContentRef.current !== currentContent) {
                changeVttCueInRedux(unmountContentRef.current, props, dispatch, replacement);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [props]
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", flex: "1 1 auto" }}>
            <div
                className="border-b border-blue-light-mostly-transparent"
                style={{
                    flexBasis: "25%",
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "5px 10px 5px 10px"
                }}
            >
                <CueLineCounts cueIndex={props.index} vttCue={props.vttCue} editorState={decoratedEditorState} />
            </div>
            <div
                className="sbte-sbte-form-control border-b border-blue-light-mostly-transparent"
                style={{
                    display: "flex",
                    flexDirection: "row",
                    flexBasis: "50%",
                    paddingLeft: "10px",
                    paddingTop: "5px",
                    paddingBottom: "5px",
                    minHeight: "54px"
                }}
            >
                <div
                    style={{ flex: 1 }}
                    className="pr-2"
                    onCompositionStart={(): void => { imeCompositionRef.current = "start"; }}
                    onCompositionEnd={(): void => { imeCompositionRef.current = "end"; }}
                >
                    <Editor
                        editorState={decoratedEditorState}
                        onChange={(newEditorState: EditorState): void => {
                            if (imeCompositionRef.current === "end") {
                                imeCompositionRef.current = null;
                            }
                            const newUpdatedState =
                                handleApplyEntityIfNeeded(newEditorState, editorPreviousTextRef, props.autoFocus);
                            setEditorState(newUpdatedState);
                        }}
                        ref={editorRef}
                        spellCheck={false}
                        keyBindingFn={keyShortcutBindings(spellCheckerMatchingOffset)}
                        stripPastedStyles
                        handleKeyCommand={
                            handleKeyShortcut(
                                decoratedEditorState,
                                props,
                                spellCheckerMatchingOffset,
                                setSpellCheckerMatchingOffset,
                                editingTrack?.language.direction,
                                setEditorState
                            )
                        }
                    />
                </div>
                <div style={{ flex: 0 }}>
                    { charCountPerLine.map((count: number, index: number) => (
                        <div key={index}><span className="sbte-count-tag">{count} ch</span><br /></div>
                    )) }
                </div>
                <div style={{ flex: 0, paddingRight: "5px" }}>
                    { wordCountPerLine.map((count: number, index: number) => (
                        <div key={index}><span className="sbte-count-tag">{count} w</span><br /></div>
                    )) }
                </div>
            </div>
            <div
                className="space-x-2"
                style={{ flexBasis: "25%", padding: "5px 10px 5px 10px" }}
            >
                <InlineStyleButton
                    editorIndex={props.index}
                    inlineStyle="BOLD"
                    label={<b>B</b>}
                    editorState={decoratedEditorState}
                    setEditorState={setEditorState}
                />
                <InlineStyleButton
                    editorIndex={props.index}
                    inlineStyle="ITALIC"
                    label={<i>I</i>}
                    editorState={decoratedEditorState}
                    setEditorState={setEditorState}
                />
                <InlineStyleButton
                    editorIndex={props.index}
                    inlineStyle="UNDERLINE"
                    label={<u>U</u>}
                    editorState={decoratedEditorState}
                    setEditorState={setEditorState}
                />
            </div>
        </div>
    );
};

export default CueTextEditor;

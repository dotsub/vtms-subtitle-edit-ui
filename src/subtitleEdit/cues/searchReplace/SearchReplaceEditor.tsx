import { Dispatch, ReactElement, useState } from "react";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    replaceCurrentMatch,
    searchCueText,
    searchNextCues,
    searchPreviousCues,
    setFind,
    setMatchCase,
    setReplacement,
    showSearchReplace
} from "./searchReplaceSlices";
import { AppThunk, SubtitleEditState } from "../../subtitleEditReducers";
import { updateVttCue } from "../cuesList/cuesListActions";
import { CueDto, SubtitleEditAction } from "../../model";
import { replaceVttCueContent } from "../edit/editUtils";
import ToggleButton from "../../toolbox/ToggleButton";
import { SearchReplace } from "./model";
import { editingCueIndexSlice } from "../edit/cueEditorSlices";

const replaceAllInVttCue = (
    vttCue: VTTCue,
    find: string,
    replacement: string,
    matchCase: boolean,
    matches: Array<number>
): VTTCue => {
    let newVTTCue = vttCue;
    if (replacement === "") {
        while (matches.length > 0) {
            const start = matches[0];
            newVTTCue = replaceVttCueContent(newVTTCue, replacement, start, start + find.length);
            const vttText = newVTTCue.text.trim();
            matches = searchCueText(vttText, find, matchCase);
        }
    } else {
        const replaceOffset = replacement.length - find.length;
        matches.forEach((matchIndex, index) => {
            const start = matchIndex + (replaceOffset * index);
            newVTTCue = replaceVttCueContent(newVTTCue, replacement, start, start + find.length);
        });
    }
    return newVTTCue;
};

const searchReplaceAll = (
    dispatch: Dispatch<SubtitleEditAction>,
    cues: Array<CueDto>,
    searchReplace: SearchReplace,
    replacement: string
): void => {
    const find = searchReplace.find;
    if (find === "") {
        return;
    }
    dispatch(setReplacement(replacement));
    const newCues = cues.slice(0);
    for (const cue of newCues) {
        if (cue.editDisabled) {
            continue;
        }
        const cueIndex: number = newCues.indexOf(cue);
        const vttText = cue.vttCue.text.trim();
        const matches = searchCueText(vttText, find, searchReplace.matchCase);
        if (matches.length > 0) {
            const  newVTTCue = replaceAllInVttCue(cue.vttCue, find, replacement, searchReplace.matchCase, matches);
            dispatch(updateVttCue(cueIndex, newVTTCue, cue.editUuid, true, true));
        }
    }
    dispatch(editingCueIndexSlice.actions.updateEditingCueIndex({ idx: -1 }));
    dispatch(setReplacement(""));
};

const SearchReplaceEditor = (): ReactElement | null => {
    const dispatch = useDispatch();
    const searchReplace = useSelector((state: SubtitleEditState) => state.searchReplace);
    const searchReplaceVisible = useSelector((state: SubtitleEditState) => state.searchReplaceVisible);
    const cues = useSelector((state: SubtitleEditState) => state.cues);
    const editingCueIndex = useSelector((state: SubtitleEditState) => state.editingCueIndex);
    const [replacement, setReplacement] = useState("");

    return searchReplaceVisible ? (
        <div style={{ display: "flex", flexFlow: "row", marginBottom: "5px" }}>
            <div style={{ display: "flex", flexFlow: "row", width: "50%" }}>
                <input
                    type="text"
                    value={searchReplace?.find}
                    placeholder="Find"
                    className="sbte-form-control !h-full"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>): AppThunk => dispatch(setFind(e.target.value))}
                />
                <input
                    type="text"
                    value={replacement}
                    placeholder="Replace"
                    className="sbte-form-control !h-full"
                    style={{ marginLeft: "5px" }}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setReplacement(e.target.value)}
                />
            </div>
            <button
                className="sbte-btn sbte-btn-light sbte-btn-sm sbte-search-next"
                type="button"
                style={{ marginLeft: "5px" }}
                data-testid="sbte-search-next"
                onClick={(): void => {
                    dispatch(searchNextCues());
                }}
            >
                <i className="fa-duotone fa-arrow-down" />
            </button>
            <button
                className="sbte-btn sbte-btn-light sbte-btn-sm sbte-search-prev"
                type="button"
                style={{ marginLeft: "5px" }}
                data-testid="sbte-search-prev"
                onClick={(): void => {
                    dispatch(searchPreviousCues());
                }}
            >
                <i className="fa-duotone fa-arrow-up" />
            </button>
            <button
                className="sbte-btn sbte-btn-light sbte-btn-sm !text-blue-light"
                type="button"
                disabled={editingCueIndex === -1}
                style={{ marginLeft: "5px" }}
                onClick={(): void => {
                    dispatch(replaceCurrentMatch(replacement));
                }}
            >
                Replace
            </button>
            <button
                className="sbte-btn sbte-btn-light sbte-btn-sm !text-blue-light"
                type="button"
                style={{ marginLeft: "5px", marginRight: "5px" }}
                onClick={(): void => searchReplaceAll(dispatch, cues, searchReplace, replacement)}
            >
                Replace All
            </button>
            <ToggleButton
                className="sbte-btn sbte-btn-light !text-blue-light"
                toggled={searchReplace.matchCase}
                onClick={(): void => {
                    dispatch(setMatchCase(!searchReplace.matchCase));
                }}
                render={(): ReactElement => (<span>Aa</span>)}
                title={searchReplace.matchCase ? "Case sensitive" : "Case insensitive"}
            />
            <span style={{ flex: 1 }} />
            <button
                className="sbte-btn sbte-btn-danger sbte-btn-sm"
                type="button"
                style={{ marginLeft: "5px" }}
                data-testid="sbte-close-search-replace-sbte-btn"
                onClick={(): void => {
                    dispatch(showSearchReplace(false));
                }}
            >
                <i className="fa-duotone fa-times-circle" />
            </button>
        </div>
    ) : null;
};

export default SearchReplaceEditor;

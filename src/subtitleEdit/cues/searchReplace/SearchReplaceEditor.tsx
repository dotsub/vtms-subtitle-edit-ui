import React, { Dispatch, ReactElement } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    replaceCurrentMatch, searchCueText,
    searchNextCues, searchPreviousCues,
    setFind, setMatchCase, setReplacement,
    showSearchReplace
} from "./searchReplaceSlices";
import { AppThunk, SubtitleEditState } from "../../subtitleEditReducers";
import { updateVttCue } from "../cueSlices";
import { CueDto } from "../../model";
import { replaceVttCueContent } from "../edit/editUtils";
import { reset } from "../edit/editorStatesSlice";
import { callSaveTrack } from "../saveSlices";
import ToggleButton from "../../../common/ToggleButton";
import { SearchReplace } from "./model";

export const searchReplaceAll = (
    dispatch: Dispatch<AppThunk>,
    cues: Array<CueDto>,
    searchReplace: SearchReplace
): void => {
    const find = searchReplace.find;
    if (find === "") {
        return;
    }
    const newCues = cues.slice(0);
    dispatch(reset());
    const replacement = searchReplace.replacement;
    newCues.forEach((cue, cueIndex: number) => {
        const matches = searchCueText(cue.vttCue.text, find, searchReplace.matchCase);
        if (matches.length > 0) {
            const replaceOffset = replacement.length - find.length;
            let newVTTCue = cue.vttCue;
            matches.forEach((matchIndex, index) => {
                const start = matchIndex + (replaceOffset * index);
                newVTTCue = replaceVttCueContent(newVTTCue, replacement, start, start + find.length);
            });
            dispatch(updateVttCue(cueIndex, newVTTCue, cue.editUuid, true));
        }
    });
};

const SearchReplaceEditor = (): ReactElement | null => {
    const dispatch = useDispatch();
    const searchReplace = useSelector((state: SubtitleEditState) => state.searchReplace);
    const searchReplaceVisible = useSelector((state: SubtitleEditState) => state.searchReplaceVisible);
    const cues = useSelector((state: SubtitleEditState) => state.cues);

    return searchReplaceVisible ? (
        <div style={{ display: "flex", flexFlow: "row", marginBottom: "5px" }}>
            <div style={{ display: "flex", flexFlow: "row", width: "50%" }}>
                <input
                    type="text"
                    value={searchReplace?.find}
                    placeholder="Find"
                    className="form-control"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>): AppThunk => dispatch(setFind(e.target.value))}
                />
                <input
                    type="text"
                    value={searchReplace?.replacement}
                    placeholder="Replace"
                    className="form-control"
                    style={{ marginLeft: "5px" }}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>): AppThunk =>
                        dispatch(setReplacement(e.target.value))}
                />
            </div>
            <button
                className="btn btn-secondary btn-sm"
                type="button"
                style={{ marginLeft: "5px" }}
                data-testid="sbte-search-next"
                onClick={(): void => {
                    dispatch(searchNextCues());
                }}
            >
                <i className="fa fa-arrow-down" />
            </button>
            <button
                className="btn btn-secondary btn-sm"
                type="button"
                style={{ marginLeft: "5px" }}
                data-testid="sbte-search-prev"
                onClick={(): void => {
                    dispatch(searchPreviousCues());
                }}
            >
                <i className="fa fa-arrow-up" />
            </button>
            <button
                className="btn btn-secondary btn-sm"
                type="button"
                style={{ marginLeft: "5px" }}
                onClick={(): void => {
                    dispatch(replaceCurrentMatch());
                }}
            >
                Replace
            </button>
            <button
                className="btn btn-secondary btn-sm"
                type="button"
                style={{ marginLeft: "5px", marginRight: "5px" }}
                onClick={(): void => {
                    searchReplaceAll(dispatch, cues, searchReplace);
                    dispatch(callSaveTrack());
                }}
            >
                Replace All
            </button>
            <ToggleButton
                className="btn btn-secondary"
                toggled={searchReplace.matchCase}
                onClick={(): void => {
                    dispatch(setMatchCase(!searchReplace.matchCase));
                    dispatch(reset());
                }}
                render={(): ReactElement => (<span>Aa</span>)}
                title={searchReplace.matchCase ? "Case sensitive" : "Case insensitive"}
            />
            <span style={{ flex: 1 }} />
            <button
                className="btn btn-secondary btn-sm"
                type="button"
                style={{ marginLeft: "5px" }}
                data-testid="sbte-close-search-replace-btn"
                onClick={(): void => {
                    dispatch(showSearchReplace(false));
                    dispatch(reset());
                }}
            >
                <i className="far fa-times-circle" />
            </button>
        </div>
    ) : null;
};

export default SearchReplaceEditor;
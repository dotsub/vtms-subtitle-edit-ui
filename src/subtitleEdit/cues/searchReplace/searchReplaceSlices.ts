import { Dispatch } from "react";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CueDto, CueLineDto, SubtitleEditAction } from "../../model";
import { AppThunk } from "../../subtitleEditReducers";
import { editingTrackSlice } from "../../trackSlices";
import { SearchDirection, SearchReplace, SearchReplaceIndices, SearchReplaceMatches } from "./model";
import { mergeVisibleSlice } from "../merge/mergeSlices";
import { updateMatchedCues } from "../cuesList/cuesListActions";
import sanitizeHtml from "sanitize-html";
import _ from "lodash";
import { updateEditingCueIndexNoThunk } from "../edit/cueEditorSlices";

const getCurrentCueAndUpdateIndices = (
    dispatch: Dispatch<PayloadAction<SubtitleEditAction>>,
    matchedCues: CueLineDto[],
    indices: SearchReplaceIndices): CueDto | undefined => {
    let matchedCueIndex = indices.matchedCueIndex;
    let sourceCueIndex = indices.sourceCueIndex;
    let targetCueIndex = indices.targetCueIndex;
    let currentCue = undefined;
    if (matchedCueIndex === -1) {
        matchedCueIndex++;
    }
    const matchedCue = matchedCues[matchedCueIndex];
    do {
        if (matchedCue.sourceCues && matchedCue.sourceCues.length > 0) {
            sourceCueIndex++;
            if (matchedCue.sourceCues[sourceCueIndex]) {
                currentCue = matchedCue.sourceCues[sourceCueIndex].cue;
                break;
            } else {
                sourceCueIndex = -1;
            }
        }
        if (matchedCue.targetCues && matchedCue.targetCues.length > 0) {
            targetCueIndex++;
            if (matchedCue.targetCues[targetCueIndex]) {
                currentCue = matchedCue.targetCues[targetCueIndex].cue;
                break;
            } else {
                targetCueIndex = -1;
            }
        }
    } while (!currentCue && sourceCueIndex !== -1 && targetCueIndex !== -1);
    dispatch(searchReplaceSlice.actions.setIndices({ matchedCueIndex, sourceCueIndex, targetCueIndex }));
    return currentCue;
};

const updateCueMatchesIfNeeded = (
    _dispatch: Dispatch<PayloadAction<SubtitleEditAction>>,
    _find: string,
    _matchCase: boolean,
    getState: Function): void => {
    const cueIndex = getState().editingCueIndex;
    if (cueIndex !== -1) {
        // const currentCue = getState().cues[cueIndex];
        // const offsets = searchCueText(currentCue.vttCue.text, find, matchCase);
        // dispatch(cuesSlice.actions.addSearchMatches(
        //     { idx: cueIndex, searchMatches: { offsets, matchLength: find.length, offsetIndex: 0 }}
        //     )
        // );
    }
};

export const searchReplaceVisibleSlice = createSlice({
    name: "searchReplaceVisible",
    initialState: false,
    reducers: {
        setSearchReplaceVisible: (_state, action: PayloadAction<boolean>): boolean => action.payload
    },
    extraReducers: {
        [editingTrackSlice.actions.resetEditingTrack.type]: (): boolean => false
    }
});

const initialSearchReplace = {
    find: "",
    replacement: "",
    matchCase: false,
    direction: "NEXT",
    indices: {
        matchedCueIndex: -1,
        sourceCueIndex: -1,
        targetCueIndex: -1
    }
} as SearchReplace;

export const searchReplaceSlice = createSlice({
    name: "searchReplace",
    initialState: initialSearchReplace,
    reducers: {
        setFind: (_state, action: PayloadAction<string>): void => {
            _state.find = action.payload;
        },
        setReplacement: (_state, action: PayloadAction<string>): void => {
            _state.replacement = action.payload;
        },
        setMatchCase: (_state, action: PayloadAction<boolean>): void => {
            _state.matchCase = action.payload;
        },
        setDirection: (_state, action: PayloadAction<SearchDirection>): void => {
            _state.direction = action.payload;
        },
        replaceMatchSignal: (state, action: PayloadAction<string>): void => {
            state.replacement = action.payload;
        },
        setIndices: (state, action: PayloadAction<SearchReplaceIndices>): void => {
            state.indices = action.payload;
        },
        setMatches: (state, action: PayloadAction<SearchReplaceMatches>): void => {
            state.matches = action.payload;
        },
    },
    extraReducers: {
        [editingTrackSlice.actions.resetEditingTrack.type]: (): SearchReplace => initialSearchReplace,
        [mergeVisibleSlice.actions.setMergeVisible.type]: (): SearchReplace => initialSearchReplace,
        [searchReplaceVisibleSlice.actions.setSearchReplaceVisible.type]:
            (_state, action: PayloadAction<boolean>): SearchReplace =>
                action.payload ? _state : initialSearchReplace
    }
});

export const setFind = (find: string): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction>>, getState): void => {
        dispatch(searchReplaceSlice.actions.setFind(find));
        const matchCase = getState().searchReplace.matchCase;
        updateCueMatchesIfNeeded(dispatch, find, matchCase, getState);
    };

export const setReplacement = (replacement: string): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction>>): void => {
        dispatch(searchReplaceSlice.actions.setReplacement(replacement));
    };

export const setMatchCase = (matchCase: boolean): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction>>, getState): void => {
        dispatch(searchReplaceSlice.actions.setMatchCase(matchCase));
        const find = getState().searchReplace.find;
        updateCueMatchesIfNeeded(dispatch, find, matchCase, getState);
    };

export const showSearchReplace = (visible: boolean): AppThunk =>
    (dispatch: Dispatch<PayloadAction<boolean | SubtitleEditAction>>, getState): void => {
        dispatch(searchReplaceVisibleSlice.actions.setSearchReplaceVisible(visible));
        const find = getState().searchReplace.find;
        const matchCase = getState().searchReplace.matchCase;
        updateCueMatchesIfNeeded(dispatch, find, matchCase, getState);
    };

// Sourced from SO https://stackoverflow.com/a/3561711 See post for eslint disable about escaping /
/* eslint-disable no-useless-escape */
const escapeRegex = (value: string): string =>
    value.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
/* eslint-enable */

export const searchCueText = (text: string, find: string, matchCase: boolean): Array<number> => {
    if (find === "") {
        return [];
    }
    const plainText = sanitizeHtml(text, { allowedTags: []});
    if (plainText === "") {
        return [];
    }
    const regExpFlag = matchCase ? "g" : "gi";
    const re = new RegExp(escapeRegex(find), regExpFlag);
    const results = [];
    const plainTextUnescaped = _.unescape(plainText);
    while (re.exec(plainTextUnescaped)){
        results.push(re.lastIndex - find.length);
    }
    return results;
};

const finNextOffsetIndexForSearch = (
    offsets: Array<number>,
    searchReplace: SearchReplace
): number => {
    const lastIndex = offsets.length - 1;
    if (searchReplace.matches && searchReplace.matches.offsetIndex >= 0) {
        return searchReplace.matches.offsetIndex < lastIndex ?
            searchReplace.matches.offsetIndex : lastIndex;
    }
    return searchReplace.direction === "NEXT" ? 0 : lastIndex;
};

export const updateSearchMatches = (
    dispatch: Dispatch<PayloadAction<SubtitleEditAction | void>>,
    getState: Function,
    cue: CueDto
): void => {
    const searchReplace = getState().searchReplace;
    if (cue) {
        const offsets = searchCueText(cue.vttCue.text, searchReplace.find, searchReplace.matchCase);
        const offsetIndex = finNextOffsetIndexForSearch(offsets, searchReplace);
        dispatch(searchReplaceSlice.actions.setMatches(
            { offsets, matchLength: searchReplace.find.length, offsetIndex }
        ));
    }
};

export const searchNextCues = (replacement: boolean): AppThunk =>
    (dispatch: Dispatch<SubtitleEditAction | void>, getState): void => {
        const searchReplaceVisible = getState().searchReplaceVisible;
        if (!searchReplaceVisible) {
            return;
        }
        const find = getState().searchReplace.find;
        if (find === "") {
            return;
        }
        // TODO: check if editingCueIndex is needed
        const editingCueIndex = getState().editingCueIndex;
        const indices = getState().searchReplace.indices;
        const matchedCues = getState().matchedCues.matchedCues;
        if (matchedCues.length === 0) {
            return;
        }
        dispatch(searchReplaceSlice.actions.setDirection("NEXT"));
        const currentMatches = getState().searchReplace.matches;
        if (currentMatches && editingCueIndex !== -1) {
            if (currentMatches.offsetIndex < currentMatches.offsets.length - 1) {
                const offsetShift = replacement ? 0 : 1;
                dispatch(searchReplaceSlice.actions.setMatches(
                    { ...currentMatches, offsetIndex: currentMatches.offsetIndex + offsetShift }
                ));
                // TODO: check if this is needed
                dispatch(updateMatchedCues());
                return;
            }
        }
        const currentCue = getCurrentCueAndUpdateIndices(dispatch, matchedCues, indices);
        if (currentCue) {
            updateSearchMatches(dispatch, getState, currentCue);
            updateEditingCueIndexNoThunk(dispatch, indices.matchedCueIndex);
        }
    };

export const searchPreviousCues = (): AppThunk =>
    (dispatch: Dispatch<SubtitleEditAction | void>, getState): void => {
        const find = getState().searchReplace.find;
        if (find === "") {
            return;
        }
        const cues = getState().cues;
        if (cues.length === 0) {
            return;
        }
        dispatch(searchReplaceSlice.actions.setDirection("PREVIOUS"));
        // const editingCueIndex = getState().editingCueIndex;
        // let fromIndex = editingCueIndex >= 0 ? editingCueIndex : cues.length - 1;
        // const currentCue = cues[fromIndex];
        // const cueMatches = currentCue.searchReplaceMatches;
        // if (cueMatches && editingCueIndex !== -1) {
        //     if (cueMatches.offsetIndex > 0) {
        //         dispatch(cuesSlice.actions.addSearchMatches(
        //             { idx: fromIndex, searchMatches: { ...cueMatches, offsetIndex: cueMatches.offsetIndex - 1 }}
        //         ));
        //         dispatch(updateMatchedCues());
        //         return;
        //     } else {
        //         fromIndex -= 1;
        //     }
        // }
        // const matchCase = getState().searchReplace.matchCase;
        // const matchedIndex = _.findLastIndex(cues,
        //         cue => searchCueText(cue.vttCue.text, find, matchCase).length > 0, fromIndex);
        // if (matchedIndex !== -1) {
        //     updateEditingCueIndexNoThunk(dispatch, getState, matchedIndex);
        // } else if (fromIndex >= 0) {
        //     let wrappedIndex = _.findLastIndex(cues,
        //             cue => searchCueText(cue.vttCue.text, find, matchCase).length > 0);
        //     wrappedIndex = wrappedIndex === (fromIndex + 1) ? -1 : wrappedIndex;
        //     updateEditingCueIndexNoThunk(dispatch, getState, wrappedIndex);
        // }
    };

export const replaceCurrentMatch = (replacement: string): AppThunk =>
    (dispatch: Dispatch<PayloadAction<string>>): void => {
        dispatch(searchReplaceSlice.actions.replaceMatchSignal(replacement));
    };

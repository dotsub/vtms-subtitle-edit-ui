import { Dispatch } from "react";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ScrollPosition, ManuCapAction } from "../../model";
import { AppThunk } from "../../manuCapReducers";
import { editingTrackSlice } from "../../trackSlices";
import { SearchDirection, SearchReplace, SearchReplaceIndices } from "./model";
import { mergeVisibleSlice } from "../merge/mergeSlices";
import sanitizeHtml from "sanitize-html";
import _ from "lodash";
import { updateEditingCueIndexNoThunk } from "../edit/cueEditorSlices";
import { changeScrollPosition } from "../cuesList/cuesListScrollSlice";
import { matchedCuesSlice } from "../cuesList/cuesListSlices";

const MAX = Number.MAX_SAFE_INTEGER;

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
        targetCueIndex: -1,
        matchLength: 0,
        offset: -1,
        offsetIndex: 0
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
    (dispatch: Dispatch<PayloadAction<ManuCapAction>>): void => {
        dispatch(searchReplaceSlice.actions.setFind(find));
    };

export const setReplacement = (replacement: string): AppThunk =>
    (dispatch: Dispatch<PayloadAction<ManuCapAction>>): void => {
        dispatch(searchReplaceSlice.actions.setReplacement(replacement));
    };

export const setMatchCase = (matchCase: boolean): AppThunk =>
    (dispatch: Dispatch<PayloadAction<ManuCapAction>>): void => {
        dispatch(searchReplaceSlice.actions.setMatchCase(matchCase));
    };

export const showSearchReplace = (visible: boolean): AppThunk =>
    (dispatch: Dispatch<PayloadAction<boolean | ManuCapAction>>): void => {
        dispatch(searchReplaceVisibleSlice.actions.setSearchReplaceVisible(visible));
    };

const getNextCue = (
    dispatch: Dispatch<ManuCapAction>,
    getState: Function,
    startingMatchedCueIndex?: number
): number => {
    const matchedCues = getState().matchedCues.matchedCues;
    const searchReplace = getState().searchReplace;
    const indices = _.clone(searchReplace.indices);
    indices.sourceCueIndex = indices.sourceCueIndex == -1 ? MAX : indices.sourceCueIndex;
    indices.targetCueIndex = indices.targetCueIndex == -1 ? MAX : indices.targetCueIndex;

    let matchedCueIndex = startingMatchedCueIndex ? startingMatchedCueIndex : indices.matchedCueIndex;
    let sourceCueIndex = indices.sourceCueIndex;
    let targetCueIndex = indices.targetCueIndex;
    let offsetIndex = indices.offsetIndex;

    for (
        ;
        matchedCueIndex <= matchedCues.length - 1;
        matchedCueIndex++, sourceCueIndex = -1, targetCueIndex = -1, offsetIndex = 0
    ) {
        const matchedCue = matchedCues[matchedCueIndex];
        if (matchedCue) {
            for (
                ;
                sourceCueIndex < matchedCue.sourceCues?.length;
                sourceCueIndex++, targetCueIndex = -1, offsetIndex = 0
            ) {
                const sourceCue =  matchedCue.sourceCues[sourceCueIndex];
                if (sourceCue) {
                    const offsets = searchCueText(
                        sourceCue.cue.vttCue.text,
                        searchReplace.find,
                        searchReplace.matchCase
                    );
                    for (; offsetIndex < offsets.length; offsetIndex++) {
                        const currentIndices = {
                            matchedCueIndex,
                            sourceCueIndex,
                            targetCueIndex: MAX,
                            matchLength: searchReplace.find.length,
                            offset: offsets[offsetIndex],
                            offsetIndex
                        };
                        if (!_.isEqual(indices, currentIndices)) {
                            dispatch(searchReplaceSlice.actions.setIndices(currentIndices));
                            updateEditingCueIndexNoThunk(dispatch, -1);
                            return matchedCueIndex;
                        }
                    }
                }
            }
            for (; targetCueIndex < matchedCue.targetCues?.length; targetCueIndex++, offsetIndex = 0) {
                const targetCue = matchedCue.targetCues[targetCueIndex];
                if (targetCue) {
                    const offsets = searchCueText(
                        targetCue.cue.vttCue.text,
                        searchReplace.find,
                        searchReplace.matchCase
                    );
                    for (; offsetIndex < offsets.length; offsetIndex++) {
                        const currentIndices = {
                            matchedCueIndex,
                            sourceCueIndex: MAX,
                            targetCueIndex,
                            matchLength: searchReplace.find.length,
                            offset: offsets[offsetIndex],
                            offsetIndex
                        };
                        if (!_.isEqual(indices, currentIndices)) {
                            dispatch(searchReplaceSlice.actions.setIndices(currentIndices));
                            updateEditingCueIndexNoThunk(dispatch, targetCue.index);
                            return matchedCueIndex;
                        }
                    }
                }
            }
        }
    }
    const currentIndices = {
        matchedCueIndex: -1,
        sourceCueIndex: -1,
        targetCueIndex: -1,
        matchLength: 0,
        offset: -1,
        offsetIndex: 0
    };

    dispatch(searchReplaceSlice.actions.setIndices(currentIndices));
    updateEditingCueIndexNoThunk(dispatch, -1);
    return -1;
};

const getPreviousCue = (
    dispatch: Dispatch<ManuCapAction>,
    getState: Function,
    startingMatchedCueIndex?: number
): number => {
    const matchedCues = getState().matchedCues.matchedCues;
    const searchReplace = getState().searchReplace;
    const indices = _.clone(searchReplace.indices);
    indices.sourceCueIndex = indices.sourceCueIndex == MAX ? -1 : indices.sourceCueIndex;
    indices.targetCueIndex = indices.targetCueIndex == MAX ? -1 : indices.targetCueIndex;

    let matchedCueIndex = startingMatchedCueIndex || startingMatchedCueIndex === MAX
        ? matchedCues.length
        : indices.matchedCueIndex;
    let sourceCueIndex = indices.sourceCueIndex;
    let targetCueIndex = indices.targetCueIndex;
    let offsetIndex = indices.offsetIndex;

    for (
        ;
        matchedCueIndex >= 0;
        matchedCueIndex--, sourceCueIndex = MAX, targetCueIndex = MAX, offsetIndex = MAX
    ) {
        const matchedCue = matchedCues[matchedCueIndex];
        if (matchedCue) {
            for (
                ;
                targetCueIndex > -1;
                targetCueIndex--, sourceCueIndex = MAX, offsetIndex = MAX
            ) {
                const targetCue = matchedCue.targetCues[targetCueIndex];
                if (targetCue) {
                    const offsets = searchCueText(
                        targetCue.cue.vttCue.text,
                        searchReplace.find,
                        searchReplace.matchCase
                    );
                    if (offsetIndex === MAX) {
                        offsetIndex = offsets.length - 1;
                    }
                    for (; offsetIndex > -1; offsetIndex--) {
                        const currentIndices = {
                            matchedCueIndex,
                            sourceCueIndex: -1,
                            targetCueIndex,
                            matchLength: searchReplace.find.length,
                            offset: offsets[offsetIndex],
                            offsetIndex
                        };
                        if (!_.isEqual(indices, currentIndices)) {
                            dispatch(searchReplaceSlice.actions.setIndices(currentIndices));
                            updateEditingCueIndexNoThunk(dispatch, targetCue.index);
                            return matchedCueIndex;
                        }
                    }
                } else {
                    targetCueIndex = matchedCue.targetCues.length;
                }
            }
            for (
                ;
                sourceCueIndex > -1;
                sourceCueIndex--, offsetIndex = MAX
            ) {
                const sourceCue =  matchedCue.sourceCues[sourceCueIndex];
                if (sourceCue) {
                    const offsets = searchCueText(
                        sourceCue.cue.vttCue.text,
                        searchReplace.find,
                        searchReplace.matchCase
                    );
                    if (offsetIndex === MAX) {
                        offsetIndex = offsets.length - 1;
                    }
                    for (; offsetIndex > -1; offsetIndex--) {
                        const currentIndices = {
                            matchedCueIndex,
                            sourceCueIndex,
                            targetCueIndex: -1,
                            matchLength: searchReplace.find.length,
                            offset: offsets[offsetIndex],
                            offsetIndex
                        };
                        if (!_.isEqual(indices, currentIndices)) {
                            dispatch(searchReplaceSlice.actions.setIndices(currentIndices));
                            updateEditingCueIndexNoThunk(dispatch, -1);
                            return matchedCueIndex;
                        }
                    }
                } else {
                    sourceCueIndex = matchedCue.sourceCues.length;
                }
            }
        }
    }
    return -1;
};

const findCueAndUpdateIndices = (
    dispatch: Dispatch<ManuCapAction>,
    getState: Function,
    direction: SearchDirection
): void => {
    const find = getState().searchReplace.find;
    if (find === "") {
        return;
    }
    dispatch(searchReplaceSlice.actions.setDirection(direction));
    const matchedCues = getState().matchedCues.matchedCues;
    if (matchedCues.length === 0) {
        return;
    }
    let matchedCueIndex = direction === "NEXT"
        ? getNextCue(dispatch, getState)
        : getPreviousCue(dispatch, getState);
    if (matchedCueIndex === -1) {
        matchedCueIndex = direction === "NEXT"
            ? getNextCue(dispatch, getState, 0)
            : getPreviousCue(dispatch, getState, MAX);
    }
    if (matchedCueIndex > -1) {
        dispatch(matchedCuesSlice.actions.updateMatchedCuesFocusIndex(matchedCueIndex));
        dispatch(changeScrollPosition(ScrollPosition.CURRENT));
    }
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

export const searchNextCues = (): AppThunk =>
    (dispatch: Dispatch<ManuCapAction | void>, getState): void => {
        findCueAndUpdateIndices(dispatch, getState, "NEXT");
    };

export const searchPreviousCues = (): AppThunk =>
    (dispatch: Dispatch<ManuCapAction | void>, getState): void => {
        findCueAndUpdateIndices(dispatch, getState, "PREVIOUS");
    };

export const replaceCurrentMatch = (replacement: string): AppThunk =>
    (dispatch: Dispatch<PayloadAction<string>>): void => {
        dispatch(searchReplaceSlice.actions.replaceMatchSignal(replacement));
    };

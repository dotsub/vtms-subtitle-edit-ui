import { Dispatch } from "react";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CueChange, CueError, ScrollPosition, ManuCapAction } from "../../model";
import { AppThunk } from "../../manuCapReducers";
import { changeScrollPosition } from "../cuesList/cuesListScrollSlice";
import { cuesSlice } from "../cuesList/cuesListSlices";
import { editingTrackSlice } from "../../trackSlices";
import { mergeVisibleSlice } from "../merge/mergeSlices";
import { updateMatchedCues } from "../cuesList/cuesListActions";
import { searchCueText, searchReplaceSlice } from "../searchReplace/searchReplaceSlices";

export interface CueIndexAction extends ManuCapAction {
    idx: number;
}

export const editingCueIndexSlice = createSlice({
    name: "editingCueIndex",
    initialState: -1,
    reducers: {
        updateEditingCueIndex: (_state, action: PayloadAction<CueIndexAction>): number => action.payload.idx,
    },
    extraReducers: {
        [cuesSlice.actions.addCue.type]:
            (_state, action: PayloadAction<CueIndexAction>): number => action.payload.idx,
        [cuesSlice.actions.deleteCue.type]: (): number => -1,
        [mergeVisibleSlice.actions.setMergeVisible.type]: (): number => -1,
        [editingTrackSlice.actions.resetEditingTrack.type]: (): number => -1
    }
});

type FocusedInputType = "EDITOR" | "START_TIME";

export const focusedInputSlice = createSlice({
    name: "focusedInput",
    initialState: "EDITOR" as FocusedInputType,
    reducers: {
        updateFocusedInput: (_state, action: PayloadAction<FocusedInputType>): FocusedInputType => action.payload
    }
});

export const updateEditingCueIndexNoThunk = (dispatch: Dispatch<ManuCapAction>, idx: number): void => {
    dispatch(focusedInputSlice.actions.updateFocusedInput("EDITOR"));
    dispatch(editingCueIndexSlice.actions.updateEditingCueIndex({ idx }));
    if (idx >= 0) {
        dispatch(updateMatchedCues());
        dispatch(changeScrollPosition(ScrollPosition.CURRENT));
    }
};

const adjustSearchReplaceIndices = (
    dispatch: Dispatch<ManuCapAction>,
    getState: Function,
    idx: number,
    matchedCueIndex?: number
): void =>  {
    if (getState().searchReplaceVisible && matchedCueIndex !== undefined && matchedCueIndex > -1) {
        const targetCues = getState().matchedCues.matchedCues[matchedCueIndex].targetCues;
        const searchReplace = getState().searchReplace;
        if (targetCues) {
            let matchedTargetCueIndex = 0;
            for (; matchedTargetCueIndex < targetCues.length; matchedTargetCueIndex++) {
                if (targetCues[matchedTargetCueIndex].index === idx) {
                    break;
                }
            }
            const targetCue = targetCues[0];
            const offsets = searchCueText(targetCue.cue.vttCue.text, searchReplace.find, searchReplace.matchCase);
            const currentIndices = offsets.length > 0
                ? {
                    matchedCueIndex,
                    sourceCueIndex: -1,
                    targetCueIndex: matchedTargetCueIndex,
                    matchLength: searchReplace.find.length,
                    offset: offsets[0],
                    offsetIndex: 0
                }
                : {
                    matchedCueIndex,
                    sourceCueIndex: -1,
                    targetCueIndex: -1,
                    matchLength: 0,
                    offset: -1,
                    offsetIndex: 0
                };

            dispatch(searchReplaceSlice.actions.setIndices(currentIndices));
        }
    }
};

export const updateEditingCueIndex = (idx: number, matchedCueIndex?: number): AppThunk =>
    (dispatch: Dispatch<ManuCapAction | void>, getState): void => {
        updateEditingCueIndexNoThunk(dispatch, idx);
        adjustSearchReplaceIndices(dispatch, getState, idx, matchedCueIndex);
    };

export const validationErrorSlice = createSlice({
    name: "validationError",
    initialState: [] as CueError[],
    reducers: {
        setValidationErrors: (_state, action: PayloadAction<CueError[]>): CueError[] => action.payload
    },
    extraReducers: {
        [editingCueIndexSlice.actions.updateEditingCueIndex.type]: (): CueError[] => []
    }
});

export const setValidationErrors = (errors: CueError[]): AppThunk =>
    (dispatch: Dispatch<PayloadAction<CueError[]>>): void => {
        dispatch(validationErrorSlice.actions.setValidationErrors(errors));
    };

export const lastCueChangeSlice = createSlice({
    name: "lastCueChange",
    initialState: null as CueChange | null,
    reducers: {
        recordCueChange: (_state, action: PayloadAction<CueChange | null>): CueChange | null =>
            action.payload
    },
    extraReducers: {
        [editingTrackSlice.actions.resetEditingTrack.type]: (): CueChange | null => null
    }
});

export const clearLastCueChange = (): AppThunk =>
    (dispatch: Dispatch<PayloadAction<CueChange | null>>): void => {
        dispatch(lastCueChangeSlice.actions.recordCueChange(null));
    };






import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Dispatch } from "react";
import { CueDto, ManuCapAction, SaveTrackCue } from "../model";
import { AppThunk } from "../manuCapReducers";
import { cuesSlice } from "./cuesList/cuesListSlices";

export interface SaveCueUpdateCallback {
    updateCue: ((trackCue: SaveTrackCue) => void) | null;
}

const initSaveCueCallbacks = {
    updateCue: null
} as SaveCueUpdateCallback;

export const saveCueUpdateSlice = createSlice({
    name: "saveCueUpdate",
    initialState: initSaveCueCallbacks,
    reducers: {
        setUpdateCueCallback: (state, action: PayloadAction<(trackCue: SaveTrackCue) => void>): void => {
            state.updateCue = action.payload;
        }
    }
});

const updateAddedCueIdIfNeeded = (
    dispatch: Dispatch<PayloadAction<ManuCapAction | AppThunk | undefined>>,
    getState: Function,
    cueAddId: string | undefined,
    cue: CueDto
): void => {
    if (cueAddId) {
        const foundCueIndex = getState().cues.findIndex((aCue: CueDto) => aCue.addId === cueAddId);
        if (foundCueIndex !== -1) {
            dispatch(cuesSlice.actions.updateAddedCue({ idx: foundCueIndex, cue }));
        }
    }
};

const executeCueUpdateCallback = (
    dispatch: Dispatch<PayloadAction<ManuCapAction | undefined>>,
    getState: Function,
    cueToUpdate: CueDto
): void => {
    const updateCueCallback = getState().saveCueUpdate.updateCue;
    const editingTrack = getState().editingTrack;
    const onAddCueSaveSuccess = (responseCueDto: CueDto) => {
        updateAddedCueIdIfNeeded(dispatch, getState, cueToUpdate.addId, responseCueDto);
    };
    updateCueCallback({ editingTrack, cue: cueToUpdate, onAddCueSaveSuccess });
};

export const callSaveCueUpdate = (cueIndex: number): AppThunk =>
    (dispatch: Dispatch<PayloadAction<ManuCapAction | undefined> | void>, getState): void => {
    const cue = getState().cues[cueIndex];
    if (cue) {
        executeCueUpdateCallback(dispatch, getState, cue);
    }
};

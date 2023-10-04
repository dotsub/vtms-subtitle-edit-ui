import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "../manuCapReducers";
import { Dispatch } from "react";
import { CueDto, ManuCapAction, Track } from "../model";
import { editingTrackSlice } from "../trackSlices";

interface SaveActionWithPayload extends ManuCapAction {
    cues: CueDto[];
    editingTrack: Track | null;
    shouldCreateNewVersion: boolean;
}

export const saveTrackSlice = createSlice({
    name: "callSaveTrack",
    initialState: null as Function | null,
    reducers: {
        set: (_state, action: PayloadAction<Function>): Function => action.payload,
        call: (state, action: PayloadAction<SaveActionWithPayload>): Function | null => {
            if (state) {
                state(action.payload);
            }
            return state;
        }
    },
    extraReducers: {
        [editingTrackSlice.actions.resetEditingTrack.type]: (): null => null
    }
});

export const setSaveTrack = (saveTrack: Function): AppThunk =>
    (dispatch: Dispatch<PayloadAction<Function>>): void => {
        dispatch(saveTrackSlice.actions.set(saveTrack));
    };

export const callSaveTrack = (
    dispatch: Dispatch<PayloadAction<ManuCapAction>>,
    getState: Function
): void => {
    const cues = getState().cues;
    const editingTrack = getState().editingTrack;
    if (cues && editingTrack) {
        dispatch(saveTrackSlice.actions.call(
            { cues, editingTrack, shouldCreateNewVersion: true }
        ));
    }
};

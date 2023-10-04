import { Dispatch, PayloadAction, createSlice } from "@reduxjs/toolkit";
import { AppThunk } from "../manuCapReducers";
import { ManuCapAction } from "../model";

export interface PlayVideoAction extends ManuCapAction {
    startTime: number;
    endTime?: number;
}

export const playVideoSectionSlice = createSlice({
    name: "playVideoSection",
    initialState: {} as PlayVideoAction,
    reducers: {
        playVideoSectionSlice: (_state, action: PayloadAction<PlayVideoAction>): PlayVideoAction => action.payload
    }
});

export const playVideoSection = (startTime: number, endTime?: number): AppThunk =>
    (dispatch: Dispatch<PayloadAction<ManuCapAction>>): void => {
        dispatch(playVideoSectionSlice.actions.playVideoSectionSlice({ startTime, endTime }));
    };

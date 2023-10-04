import { Dispatch } from "react";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { CueDto, ManuCapAction } from "../../model";
import { AppThunk } from "../../manuCapReducers";
import { editingTrackSlice } from "../../trackSlices";
import { updateMatchedCues } from "../cuesList/cuesListActions";

interface CuesAction extends ManuCapAction {
    cues: CueDto[];
}

export const sourceCuesSlice = createSlice({
    name: "sourceCues",
    initialState: [] as CueDto[],
    reducers: {
        updateSourceCues: (_state, action: PayloadAction<CuesAction>): CueDto[] => action.payload.cues
    },
    extraReducers: {
        [editingTrackSlice.actions.resetEditingTrack.type]: (): CueDto[] => []
    }
});

export const updateSourceCues = (cues: CueDto[]): AppThunk =>
    (dispatch: Dispatch<ManuCapAction>): void => {
        dispatch(sourceCuesSlice.actions.updateSourceCues({ cues }));
        dispatch(updateMatchedCues());
    };

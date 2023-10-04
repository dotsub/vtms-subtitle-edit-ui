import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CueDto, SaveTrackCue } from "../model";

export interface SaveCueDelete {
    deleteCue: ((trackCue: SaveTrackCue) => void) | null;
}

const initSaveCueDelete = {
    deleteCue: null
} as SaveCueDelete;

export const saveCueDeleteSlice = createSlice({
    name: "saveCueDelete",
    initialState: initSaveCueDelete,
    reducers: {
        setDeleteCueCallback: (state, action: PayloadAction<(trackCue: SaveTrackCue) => void>): void => {
            state.deleteCue = action.payload;
        }
    }
});

const executeCueDeleteCallback = (
    getState: Function,
    cueToDelete: CueDto
): void => {
    const deleteCueCallback = getState().saveCueDelete.deleteCue;
    const editingTrack = getState().editingTrack;
    deleteCueCallback({ editingTrack, cue: cueToDelete });
};

export const callSaveCueDelete = (
    getState: Function,
    cueToDelete: CueDto
): void => {
    executeCueDeleteCallback(getState, cueToDelete);
};

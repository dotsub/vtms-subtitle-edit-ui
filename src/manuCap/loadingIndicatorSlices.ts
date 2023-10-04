import { LoadingIndicator } from "./model";
import { cuesSlice } from "./cues/cuesList/cuesListSlices";
import { createSlice } from "@reduxjs/toolkit";
import { editingTrackSlice } from "./trackSlices";
import { sourceCuesSlice } from "./cues/view/sourceCueSlices";

export const loadingIndicatorSlices = createSlice({
    name: "loadingIndicator",
    initialState: { cuesLoaded: false, sourceCuesLoaded: false } as LoadingIndicator,
    reducers: {
    },
    extraReducers: {
        [cuesSlice.actions.updateCues.type]: (state): LoadingIndicator => {
            state.cuesLoaded = true;
            return state;
        },
        [sourceCuesSlice.actions.updateSourceCues.type]: (state): LoadingIndicator => {
            state.sourceCuesLoaded = true;
            return state;
        },
        [editingTrackSlice.actions.resetEditingTrack.type]: (state): LoadingIndicator => {
            state.cuesLoaded = false;
            state.sourceCuesLoaded = false;
            return state;
        }
    }
});

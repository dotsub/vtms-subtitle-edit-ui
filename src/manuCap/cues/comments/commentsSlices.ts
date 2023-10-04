import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { editingTrackSlice } from "../../trackSlices";

export const commentsVisibleSlice = createSlice({
    name: "commentsVisible",
    initialState: false,
    reducers: {
        setCommentsVisible: (_state, action: PayloadAction<boolean>): boolean => action.payload
    },
    extraReducers: {
        [editingTrackSlice.actions.resetEditingTrack.type]: (): boolean => false
    }
});

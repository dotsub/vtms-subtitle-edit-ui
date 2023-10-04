import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { editingTrackSlice } from "../../trackSlices";
import { AppThunk } from "../../manuCapReducers";
import { Dispatch } from "react";
import { CuesWithRowIndex, ManuCapAction } from "../../model";
import _ from "lodash";
import { cuesSlice } from "../cuesList/cuesListSlices";

export const mergeVisibleSlice = createSlice({
    name: "mergeVisible",
    initialState: false,
    reducers: {
        setMergeVisible: (_state, action: PayloadAction<boolean>): boolean => action.payload
    },
    extraReducers: {
        [editingTrackSlice.actions.resetEditingTrack.type]: (): boolean => false
    }
});

export const showMerge = (visible: boolean): AppThunk =>
    (dispatch: Dispatch<PayloadAction<boolean | ManuCapAction>>): void => {
        dispatch(mergeVisibleSlice.actions.setMergeVisible(visible));
    };

export const rowsToMergeSlice = createSlice({
    name: "rowsToMerge",
    initialState: [] as CuesWithRowIndex[],
    reducers: {
        addRowCues: (state, action: PayloadAction<CuesWithRowIndex>): void => {
            state.push(action.payload);
        },
        removeRowCues: (state, action: PayloadAction<CuesWithRowIndex>): void => {
            _.remove(state, (row) => row.index === action.payload.index);
        }
    },
    extraReducers: {
        [editingTrackSlice.actions.resetEditingTrack.type]: (): CuesWithRowIndex[] => [],
        [cuesSlice.actions.mergeCues.type]: (): CuesWithRowIndex[] => [],
        [mergeVisibleSlice.actions.setMergeVisible.type]:
            (_state, action: PayloadAction<CuesWithRowIndex>): CuesWithRowIndex[] => action.payload ? _state : []
    }
});

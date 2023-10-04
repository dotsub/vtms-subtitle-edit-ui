import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { ManuCapAction, User } from "./model";
import { AppThunk } from "./manuCapReducers";
import { Dispatch } from "react";

export interface UserAction extends ManuCapAction {
    subtitleUser: User;
}

export const userSlice = createSlice({
    name: "subtitleUser",
    initialState: null as User | null,
    reducers: {
        updateSubtitleUser: (_state, action: PayloadAction<UserAction>): User =>
            action.payload.subtitleUser
    }
});

export const  updateSubtitleUser = (user: User): AppThunk =>
    (dispatch: Dispatch<PayloadAction<UserAction>>): void => {
        dispatch(userSlice.actions.updateSubtitleUser({ subtitleUser: user }));
    };

import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import { SpellcheckerSettings } from "./model";
import { AppThunk } from "./manuCapReducers";
import { Dispatch } from "react";
import { applySpellcheckerOnCue } from "./cues/cuesList/cuesListActions";

export const spellcheckerSettingsSlice: Slice = createSlice({
    name: "spellcheckerSettings",
    initialState: { enabled: false, domain: null  } as SpellcheckerSettings,
    reducers: {
        setSpellCheckDomain: (state, action: PayloadAction<string | null | undefined>): SpellcheckerSettings => {
            state.domain = action.payload;
            state.enabled = action.payload != null;
            return state;
        }
    }, extraReducers: {
        // @ts-ignore: This is standard redux-toolkit construct
        [applySpellcheckerOnCue.rejected]:
            (state: SpellcheckerSettings, action: PayloadAction<void, string, never, { message: string }>): void => {
                if (action.error && action.error.message.includes("is not a language code known to LanguageTool")) {
                    state.enabled = false;
                }
            }
    }
});

export const setSpellCheckDomain = (spellCheckDomain: string | null | undefined): AppThunk =>
    (dispatch: Dispatch<PayloadAction<string | null | undefined>>): void => {
        dispatch(spellcheckerSettingsSlice.actions.setSpellCheckDomain(spellCheckDomain));
    };


import { Action, combineReducers } from "@reduxjs/toolkit";
import { cuesSlice, matchedCuesSlice } from "./cues/cuesList/cuesListSlices";
import { editingTrackSlice } from "./trackSlices";
import { userSlice } from "./userSlices";
import { ThunkAction } from "redux-thunk";
import { playVideoSectionSlice } from "./player/playbackSlices";
import { subtitleSpecificationSlice } from "./toolbox/subtitleSpecifications/subtitleSpecificationSlice";
import { loadingIndicatorSlices } from "./loadingIndicatorSlices";
import { saveActionSlice, saveTrackSlice } from "./cues/saveSlices";
import {
    currentPlayerTimeSlice,
    scrollPositionSlice,
    currentCueErrorIndexSlice
} from "./cues/cuesList/cuesListScrollSlice";
import { searchReplaceSlice, searchReplaceVisibleSlice } from "./cues/searchReplace/searchReplaceSlices";
import { mergeVisibleSlice, rowsToMergeSlice } from "./cues/merge/mergeSlices";
import { spellcheckerSettingsSlice } from "./spellcheckerSettingsSlice";
import { sourceCuesSlice } from "./cues/view/sourceCueSlices";
import {
    editingCueIndexSlice,
    focusedInputSlice,
    lastCueChangeSlice,
    validationErrorSlice
} from "./cues/edit/cueEditorSlices";
import { commentsVisibleSlice } from "./cues/comments/commentsSlices";
import { waveformVisibleSlice } from "./player/waveformSlices";

export const Reducers = {
    cues: cuesSlice.reducer,
    editingTrack: editingTrackSlice.reducer,
    subtitleSpecifications: subtitleSpecificationSlice.reducer,
    sourceCues: sourceCuesSlice.reducer,
    videoSectionToPlay: playVideoSectionSlice.reducer,
    loadingIndicator: loadingIndicatorSlices.reducer,
    saveTrack: saveTrackSlice.reducer,
    saveAction: saveActionSlice.reducer,
    spellCheckerSettings: spellcheckerSettingsSlice.reducer,
    searchReplace: searchReplaceSlice.reducer,
    searchReplaceVisible: searchReplaceVisibleSlice.reducer,
    mergeVisible: mergeVisibleSlice.reducer,
    rowsToMerge: rowsToMergeSlice.reducer,
    subtitleUser: userSlice.reducer,
    editingCueIndex: editingCueIndexSlice.reducer,
    lastCueChange: lastCueChangeSlice.reducer,
    validationErrors: validationErrorSlice.reducer,
    focusedCueIndex: scrollPositionSlice.reducer,
    matchedCues: matchedCuesSlice.reducer,
    currentPlayerTime: currentPlayerTimeSlice.reducer,
    commentsVisible: commentsVisibleSlice.reducer,
    waveformVisible: waveformVisibleSlice.reducer,
    currentCueErrorIndex: currentCueErrorIndexSlice.reducer,
    focusedInput: focusedInputSlice.reducer
};

const subtitleEditReducers = combineReducers(Reducers);

export default subtitleEditReducers;

export type SubtitleEditState = ReturnType<typeof subtitleEditReducers>;

/**
 * We are forced to use `as {} as AnyAction` casting then we are executing actions with `testingStore.dispatch`.
 * This seems to be related problem: https://github.com/reduxjs/redux-toolkit/issues/321.
 * But no suggestions from that issue work nor mentioned fix didn't work. I couldn't figure out any other fix than
 * applying ugly cast workaround.
 */
export type AppThunk = ThunkAction<void, SubtitleEditState, unknown, Action<string>>;

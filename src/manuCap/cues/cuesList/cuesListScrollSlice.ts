import { createSlice, Dispatch, PayloadAction } from "@reduxjs/toolkit";
import { CueDto, ScrollPosition } from "../../model";
import { AppThunk } from "../../manuCapReducers";
import _ from "lodash";

export const DEFAULT_PAGE_SIZE = 100;

export const currentPlayerTimeSlice = createSlice({
    name: "currentPlayerTime",
    initialState: 0,
    reducers: {
        setCurrentPlayerTime: (_state, action: PayloadAction<number>): number => action.payload
    }
});

export const setCurrentPlayerTime = (currentPlayerTime: number): AppThunk =>
    (dispatch: Dispatch<PayloadAction<number>>): void => {
        dispatch(currentPlayerTimeSlice.actions.setCurrentPlayerTime(currentPlayerTime));
    };

export const scrollPositionSlice = createSlice({
    name: "scrollPositionSlice",
    initialState: null as number | null,
    reducers: {
        changeFocusedCueIndex: (_state, action: PayloadAction<number | null>): number | null =>
            action.payload
    }
});

export const currentCueErrorIndexSlice = createSlice({
    name: "currentCueErrorIndex",
    initialState: -1,
    reducers: {
        changeCurrentCueErrorPosition: (_state, action: PayloadAction<number>): number =>
            action.payload
    }
});

const getScrollCueIndex = (
    matchedCuesSize: number,
    editingFocusInMap: number,
    currentPlayerCueIndex: number,
    lastTranslatedIndex: number,
    previousFocusedCueIndex: number | null,
    errorCueIndex: number,
    scrollPosition?: ScrollPosition
): number | null => {
    if (scrollPosition === ScrollPosition.FIRST) {
        return 0;
    }
    if (scrollPosition === ScrollPosition.LAST) {
        return matchedCuesSize - 1;
    }
    if (scrollPosition === ScrollPosition.CURRENT) {
        return editingFocusInMap;
    }
    if (scrollPosition === ScrollPosition.PLAYBACK) {
        return currentPlayerCueIndex;
    }
    if (scrollPosition === ScrollPosition.LAST_TRANSLATED) {
        return lastTranslatedIndex;
    }
    if(scrollPosition === ScrollPosition.ERROR && errorCueIndex !== -1) {
        return errorCueIndex;
    }
    const previousFocusedCueIndexNullSafe = previousFocusedCueIndex === null ? 0 : previousFocusedCueIndex;
    const currentPageIndex = Math.floor(previousFocusedCueIndexNullSafe / DEFAULT_PAGE_SIZE);
    if (scrollPosition === ScrollPosition.NEXT_PAGE) {
        return currentPageIndex * DEFAULT_PAGE_SIZE + DEFAULT_PAGE_SIZE;
    }
    if (scrollPosition === ScrollPosition.PREVIOUS_PAGE) {
        return currentPageIndex * DEFAULT_PAGE_SIZE - 1;
    }
    return null; // out of range value, because need to trigger change of CueList.startAt
};

const getErrorCueIndex = (cues: CueDto[], currentIndex: number): number => {
    const errorIndex = cues.findIndex((cue, index) =>
        (cue.errors && cue.errors?.length > 0) && index > currentIndex);
    return errorIndex === -1 ? cues.findIndex((cue, index) =>
        (cue.errors && cue.errors?.length > 0) && index < currentIndex) : errorIndex;
};

export const matchCueTimeIndex = (cues: CueDto[], trackTime: number): number => {
    const cueIndex = cues.findIndex(cue => cue.vttCue.startTime >= trackTime);
    return cueIndex <= 0 ? 0 : cueIndex - 1;
};

export const changeScrollPosition = (scrollPosition: ScrollPosition, previousFocusedCueIndex?: number): AppThunk =>
    (dispatch: Dispatch<PayloadAction<ScrollPosition | null>>, getState): void => {
        const state = getState();
        if (scrollPosition === ScrollPosition.NONE && getState().focusedCueIndex === null) {
            return;
        }
        const previousFocusedCueIndexInitiated = previousFocusedCueIndex
            ? previousFocusedCueIndex
            : getState().focusedCueIndex;
        const currentPlayerTime = getState().currentPlayerTime;
        const currentPlayerCueIndex = matchCueTimeIndex(state.cues, currentPlayerTime);
        const errorCueIndex = getErrorCueIndex(state.cues, state.currentCueErrorIndex);
        const lastTranslatedIndex = _.findLastIndex(state.cues, cue => !cue.editDisabled);
        const focusedCueIndex = getScrollCueIndex(
            state.matchedCues.matchedCues.length,
            state.matchedCues.matchedCuesFocusIndex,
            currentPlayerCueIndex,
            lastTranslatedIndex,
            previousFocusedCueIndexInitiated,
            errorCueIndex,
            scrollPosition
        );
        dispatch(scrollPositionSlice.actions.changeFocusedCueIndex(focusedCueIndex));
        dispatch(currentCueErrorIndexSlice.actions.changeCurrentCueErrorPosition(errorCueIndex));
    };

export const scrollToFirstUnlockChunk = (): AppThunk =>
    (dispatch: Dispatch<PayloadAction<ScrollPosition | null>>, getState): void => {
        const state = getState();
        const mediaChunkStartIndex = state.cues.findIndex(cue => !cue.editDisabled);
        if (mediaChunkStartIndex > -1) {
            dispatch(scrollPositionSlice.actions.changeFocusedCueIndex(mediaChunkStartIndex));
        }
};

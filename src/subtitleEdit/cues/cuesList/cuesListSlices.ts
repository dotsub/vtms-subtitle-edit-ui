import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { CueCategory, CueComment, CueDto, CueError, CueLineDto, SubtitleEditAction } from "../../model";
import { copyNonConstructorProperties } from "../cueUtils";
import { editingTrackSlice } from "../../trackSlices";
import { Match, SpellCheck } from "../spellCheck/model";
import { hasIgnoredKeyword } from "../spellCheck/spellCheckerUtils";
import { matchCuesByTime, MatchedCuesWithEditingFocus } from "./cuesListTimeMatching";

export interface CueIndexAction extends SubtitleEditAction {
    idx: number;
}

export interface VttCueAction extends CueIndexAction {
    vttCue: VTTCue;
    editUuid?: string;
}

export interface CueCategoryAction extends CueIndexAction {
    cueCategory: CueCategory;
}

export interface CueCommentAction extends CueIndexAction {
    cueCommentIndex?: number;
    cueComment?: CueComment;
}

export interface CueAction extends CueIndexAction {
    cue: CueDto;
}

interface CuesAction extends SubtitleEditAction {
    cues: CueDto[];
}

export interface CueErrorsPayload {
    errors: CueError[];
    index: number;
}

export interface SpellCheckAction extends CueIndexAction {
    spellCheck: SpellCheck;
}

export interface SpellCheckRemovalAction extends CueIndexAction {
    trackId: string;
}

export interface MergeAction {
    mergedCue: CueDto;
    startIndex: number;
    endIndex: number;
}

export interface ShiftAction {
    shiftTime: number
    cueIndex: number,
    shiftPosition: ShiftPosition
}

export enum ShiftPosition {
    ALL, BEFORE, AFTER
}
export const cuesSlice = createSlice({
    name: "cues",
    initialState: [] as CueDto[],
    reducers: {
        updateVttCue: (state, action: PayloadAction<VttCueAction>): void => {
            state[action.payload.idx].vttCue = action.payload.vttCue;
            state[action.payload.idx].editUuid = action.payload.editUuid;
        },
        updateCueCategory: (state, action: PayloadAction<CueCategoryAction>): void => {
            if (state[action.payload.idx]) {
                state[action.payload.idx].cueCategory = action.payload.cueCategory;
            }
        },
        addCueComment: (state, action: PayloadAction<CueCommentAction>): void => {
            if (state[action.payload.idx] && action.payload.cueComment) {
                state[action.payload.idx].comments = [
                    ...state[action.payload.idx].comments || [],
                    action.payload.cueComment
                ];
            }
        },
        deleteCueComment: (state, action: PayloadAction<CueCommentAction>): void => {
            if (state[action.payload.idx] && action.payload.cueCommentIndex !== undefined) {
                state[action.payload.idx].comments?.splice(action.payload.cueCommentIndex, 1);
            }
        },
        addSpellCheck: (state, action: PayloadAction<SpellCheckAction>): void => {
            state[action.payload.idx].spellCheck = action.payload.spellCheck;
        },
        removeIgnoredSpellcheckedMatchesFromAllCues: (state,
                                                      action: PayloadAction<SpellCheckRemovalAction>): void => {
            const trackId = action.payload.trackId;
            state.filter((cue: CueDto) => cue.spellCheck != null && cue.spellCheck.matches != null)
                .forEach(cue => {
                    //@ts-ignore false positive spellcheck is never null here
                    cue.spellCheck.matches = cue.spellCheck.matches.filter((match: Match) =>
                        !hasIgnoredKeyword(match, trackId));
                });
        },
        addCue: (state, action: PayloadAction<CueAction>): void => {
            state.splice(action.payload.idx, 0, action.payload.cue);
        },
        deleteCue: (state, action: PayloadAction<CueIndexAction>): void => {
            if (state.length > 1) {
                state.splice(action.payload.idx, 1);
            } else {
                // default empty cue
                const newVttCue = new VTTCue(0, 3, "");
                // this is a hack just to avoid uninitialized properties
                copyNonConstructorProperties(newVttCue, newVttCue);
                state[0] = {
                    vttCue: newVttCue,
                    cueCategory: "DIALOGUE"
                };
            }
        },
        updateCues: (_state, action: PayloadAction<CuesAction>): CueDto[] => action.payload.cues,
        applyShiftTimeByPosition: (state, action: PayloadAction<ShiftAction>): CueDto[] => {
            const shiftAction = action.payload;
            return state.map((cue: CueDto, index: number) => {
                if (shiftAction.shiftPosition == ShiftPosition.AFTER &&
                    (index <= shiftAction.cueIndex || cue.editDisabled)) {
                    return cue;
                }
                if (shiftAction.shiftPosition == ShiftPosition.BEFORE &&
                    (index >= shiftAction.cueIndex || cue.editDisabled)) {
                    return cue;
                }
                if (shiftAction.shiftPosition == ShiftPosition.ALL && cue.editDisabled) {
                    return cue;
                }
                const vttCue = cue.vttCue;
                const startTime = vttCue.startTime + shiftAction.shiftTime;
                const endTime = vttCue.endTime + shiftAction.shiftTime;
                const newCue = new VTTCue(startTime, endTime, vttCue.text);
                copyNonConstructorProperties(newCue, vttCue);
                return ({ ...cue, vttCue: newCue } as CueDto);
            });
        },
        setErrors: (state, action: PayloadAction<CueErrorsPayload>): void => {
            state[action.payload.index].errors = action.payload.errors;
        },
        syncCues: (state, action: PayloadAction<CuesAction>): CueDto[] => {
            const sourceCues = action.payload.cues;
            return state.map((cue: CueDto, index: number) => {
                if (cue.editDisabled) {
                    return cue;
                }
                const vttCue = cue.vttCue;
                const startTime = sourceCues[index].vttCue.startTime;
                const endTime = sourceCues[index].vttCue.endTime;
                const newCue = new VTTCue(startTime, endTime, vttCue.text);
                copyNonConstructorProperties(newCue, vttCue);
                return ({ ...cue, vttCue: newCue } as CueDto);
            });
        },
        mergeCues: (state, action: PayloadAction<MergeAction>): CueDto[] => {
            state[action.payload.startIndex] = action.payload.mergedCue;
            state.splice(action.payload.startIndex + 1, action.payload.endIndex - action.payload.startIndex);
            return state;
        }
    },
    extraReducers: {
        [editingTrackSlice.actions.resetEditingTrack.type]: (): CueDto[] => [],
    }
});

interface MatchCuesAction {
    cues: CueDto[];
    sourceCues: CueDto[];
    editingCueIndex: number;
}

interface MatchedCueAction {
    cue: CueDto;
    editingIndexMatchedCues: number;
    targetCuesIndex: number;
}

export const matchedCuesSlice = createSlice({
    name: "matchedCues",
    initialState: { matchedCues: [], matchedCuesFocusIndex: 0 } as MatchedCuesWithEditingFocus,
    reducers: {
        matchCuesByTime: (_state, action: PayloadAction<MatchCuesAction>): MatchedCuesWithEditingFocus => {
            return matchCuesByTime(action.payload.cues, action.payload.sourceCues, action.payload.editingCueIndex);
        },
        updateMatchedCue: (state, action: PayloadAction<MatchedCueAction>): MatchedCuesWithEditingFocus => {
            if (action.payload.editingIndexMatchedCues >= 0) {
                const targetCues = state.matchedCues[action.payload.editingIndexMatchedCues].targetCues;
                if (targetCues && targetCues[action.payload.targetCuesIndex]) {
                    targetCues[action.payload.targetCuesIndex].cue = action.payload.cue;
                }
                state.matchedCues[action.payload.editingIndexMatchedCues].targetCues = targetCues;
            }
            return state;
        },
        updateMatchedCuesFocusIndex: (state, action: PayloadAction<number>): MatchedCuesWithEditingFocus => {
            return { matchedCues: state.matchedCues, matchedCuesFocusIndex: action.payload };
        },
        // DO NOT USE THIS IN PRODUCTION!!!
        setMatchCuesForTesting: (state, action: PayloadAction<CueLineDto[]>): MatchedCuesWithEditingFocus => {
            return { matchedCues: action.payload, matchedCuesFocusIndex: state.matchedCuesFocusIndex };
        },
    },
});

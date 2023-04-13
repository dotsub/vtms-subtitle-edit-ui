import { SpellCheck } from "./cues/spellCheck/model";

export type TrackType = "CAPTION" | "TRANSLATION";
export type LanguageDirection = "RTL" | "LTR";

export interface Language {
    readonly id: string;
    readonly name: string;
    readonly direction?: LanguageDirection;
    countryCode?: string;
    alpha1Code?: string;
    alpha2TCode?: string;
    alpha2BCode?: string;
    code?: string | null;
    localizedName?: string;
}

export type CueCategory = "DIALOGUE" | "ONSCREEN_TEXT" | "AUDIO_DESCRIPTION" | "LYRICS";

export interface GlossaryMatchDto {
    source: string;
    replacements: string[];
}

export enum CueLineState {
    NONE,
    GOOD,
    ERROR
}

export const CUE_LINE_STATE_CLASSES = new Map ([
    [CueLineState.NONE, { dividerClass: "sbte-cue-divider", flapClass: "sbte-cue-line-flap" }],
    [CueLineState.GOOD, { dividerClass: "sbte-cue-divider-good", flapClass: "sbte-cue-line-flap-good" }],
    [CueLineState.ERROR, { dividerClass: "sbte-cue-divider-error", flapClass: "sbte-cue-line-flap-error" }],
]);

export interface CueDto {
    readonly vttCue: VTTCue;
    readonly cueCategory: CueCategory;
    editUuid?: string;
    editDisabled?: boolean;
    spellCheck?: SpellCheck;
    glossaryMatches?: GlossaryMatchDto[];
    errors?: CueError[] | null;
    comments?: CueComment[];
}

export interface CueDtoWithIndex {
    index: number;
    cue: CueDto;
}

export interface CueLineDto {
    sourceCues?: CueDtoWithIndex[];
    targetCues?: CueDtoWithIndex[];
}

export interface CuesWithRowIndex {
    index: number;
    cues?: CueDtoWithIndex[];
}

export interface LanguageCues {
    readonly languageId: string;
    readonly cues: CueDto[];
}

export interface TrackVersionDto extends Track {
    trackVersionId: string;
    completion: number;
}

export interface Track {
    readonly type: TrackType;
    readonly language: Language;
    readonly default: boolean;
    readonly mediaTitle: string;
    readonly mediaLength: number;
    readonly mediaChunkStart?: number;
    readonly mediaChunkEnd?: number;
    readonly sourceLanguage?: Language;
    trackSource?: boolean;
    readonly progress: number;
    overlapEnabled?: boolean;
    timecodesUnlocked?: boolean;
    id?: string;
    createdBy: User;
    currentVersion: TrackVersionDto;
    createdAt: string;
    title: string;
    trackId: string;
    name: string;
}

export interface SpellcheckerSettings {
    enabled: boolean;
    domain: string | null | undefined;
}

export interface User {
    userId: string;
    firstname: string;
    lastname: string;
    email: string;
    systemAdmin: string;
    displayName: string;
}

/**
 * This is marker interface for all the actions that can be dispatched
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SubtitleEditAction {
}

export interface TimeGapLimit {
    minGap: number;
    maxGap: number;
}

export interface LoadingIndicator {
    cuesLoaded: boolean;
    sourceCuesLoaded: boolean;
}

export interface CueChange {
    changeType: "ADD" | "EDIT" | "REMOVE" | "SPLIT" | "MERGE" | "UPDATE_ALL";
    index: number;
    vttCue?: VTTCue;
}


/**
 * Declare video cue scroll position
 * @author Mario Dennis
 * @param FIRST - scrolls to first cue item
 * @param LAST - scrolls to last cue item
 * @param CURRENT - scroll to cue item currently being edited
 * @param PLAYBACK - scroll to currently playing media track cue item
 * @param LAST_TRANSLATED - scroll to last translated cue
 */
export enum ScrollPosition {
    NONE,
    FIRST,
    LAST,
    CURRENT,
    PLAYBACK,
    LAST_TRANSLATED,
    NEXT_PAGE,
    PREVIOUS_PAGE,
    ERROR
}

export enum CueError {
    LINE_CHAR_LIMIT_EXCEEDED = "Max Characters Per Line Exceeded",
    LINE_COUNT_EXCEEDED = "Max Lines Per Caption Exceeded",
    TIME_GAP_LIMIT_EXCEEDED = "Min/Max Caption Duration In Seconds Exceeded",
    TIME_GAP_OVERLAP = "Cue Overlap",
    SPELLCHECK_ERROR = "Spelling Error(s)",
    INVALID_RANGE_START = "Invalid Start Time",
    INVALID_RANGE_END = "Invalid End Time",
    OUT_OF_CHUNK_RAGE = "Out of Chunk Range",
    MERGE_ERROR = "Merged subtitle is too long/Not enough subtitles selected",
    SPLIT_ERROR = "Subtitle is too short to split",
    CHARS_PER_SECOND_EXCEEDED = "Max Characters Per Second Exceeded"
}

export interface CueComment {
    id?: string;
    userId?: string;
    userName?: string;
    author?: string;
    comment: string;
    date: string;
}

export interface WaveformRegion {
    id: number;
    start: number;
    end: number;
}

export interface TrackCues {
    editingTrack: Track | null;
    cues: CueDto[];
}

export interface SaveActionParameters {
    cues: CueDto[];
    editingTrack: Track;
    shouldCreateNewVersion: boolean;
}

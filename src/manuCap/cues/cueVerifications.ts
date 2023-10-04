import sanitizeHtml from "sanitize-html";

import { CueDto, CueError, TimeGapLimit, Track } from "../model";
import { SubtitleSpecification } from "../toolbox/model";

const removeHtmlTags = (html: string): string => sanitizeHtml(html, { allowedTags: []});

const removeLineBreaks = (text: string): string => text.replace(/(\r\n|\n|\r)/gm, "");

export const checkLineLimitation = (
    text: string,
    subtitleSpecification: SubtitleSpecification | null
): boolean => {
    if (subtitleSpecification && subtitleSpecification.enabled) {
        const lines = text.split("\n");
        return !subtitleSpecification.maxLinesPerCaption
            || lines.length <= subtitleSpecification.maxLinesPerCaption;
    }
    return true;
};

export const checkCharacterLimitation = (
    text: string,
    subtitleSpecification: SubtitleSpecification | null
): boolean => {
    if (subtitleSpecification && subtitleSpecification.enabled) {
        const lines = text.split("\n");
        return lines
            .map(
                line => !subtitleSpecification.maxCharactersPerLine
                    || removeHtmlTags(line).length <= subtitleSpecification.maxCharactersPerLine
            )
            .reduce((accumulator, lineOk) => accumulator && lineOk);
    }
    return true;
};

const checkCharacterAndLineLimitation = (
    cueErrors: CueError[],
    text: string,
    subtitleSpecification: SubtitleSpecification | null
): void => {
    const charactersPerLineLimitOk = checkCharacterLimitation(text, subtitleSpecification);
    const linesCountLimitOk = checkLineLimitation(text, subtitleSpecification);
    if (!charactersPerLineLimitOk) {
        cueErrors.push(CueError.LINE_CHAR_LIMIT_EXCEEDED);
    }
    if (!linesCountLimitOk) {
        cueErrors.push(CueError.LINE_COUNT_EXCEEDED);
    }
};

export const getTimeGapLimits = (subtitleSpecs: SubtitleSpecification | null): TimeGapLimit => {
    const DEFAULT_MIN_GAP = 0.001;
    const DEFAULT_MAX_GAP = Number.MAX_SAFE_INTEGER;
    let minGap: number = DEFAULT_MIN_GAP;
    let maxGap: number = DEFAULT_MAX_GAP;

    if (subtitleSpecs?.enabled) {
        if (subtitleSpecs.minCaptionDurationInMillis)
            minGap = subtitleSpecs.minCaptionDurationInMillis / 1000;
        if (subtitleSpecs.maxCaptionDurationInMillis)
            maxGap = subtitleSpecs.maxCaptionDurationInMillis / 1000;
    }

    return { minGap, maxGap };
};

const minRangeOk = (vttCue: VTTCue, timeGapLimit: TimeGapLimit): boolean =>
    (vttCue.endTime - vttCue.startTime) >= timeGapLimit.minGap;

const maxRangeOk = (vttCue: VTTCue, timeGapLimit: TimeGapLimit): boolean =>
    (vttCue.endTime - vttCue.startTime) <= timeGapLimit.maxGap;

const checkRange =
    (cueErrors: CueError[], vttCue: VTTCue, subtitleSpecification: SubtitleSpecification | null): void => {
    const timeGapLimit = getTimeGapLimits(subtitleSpecification);
    if(!minRangeOk(vttCue, timeGapLimit) || !maxRangeOk(vttCue, timeGapLimit)) {
        cueErrors.push(CueError.TIME_GAP_LIMIT_EXCEEDED);
    }
};

const startOverlapOk = (vttCue: VTTCue, previousCue?: CueDto): boolean =>
    !previousCue || vttCue.startTime >= previousCue.vttCue.endTime;

const endOverlapOk = (vttCue: VTTCue, followingCue?: CueDto): boolean =>
    !followingCue || vttCue.endTime <= followingCue.vttCue.startTime;

const checkOverlap = (cueErrors: CueError[], vttCue: VTTCue, previousCue?: CueDto, followingCue?: CueDto): void => {
    if (!startOverlapOk(vttCue, previousCue) || !endOverlapOk(vttCue, followingCue)) {
        cueErrors.push(CueError.TIME_GAP_OVERLAP);
    }
};

const checkSpelling = (cueErrors: CueError[], cue: CueDto): void => {
    if (cue.spellCheck?.matches !== undefined
        && cue.spellCheck.matches.length > 0
        && !cueErrors.includes(CueError.SPELLCHECK_ERROR)) {
        cueErrors.push(CueError.SPELLCHECK_ERROR);
    } else if ((!cue.spellCheck?.matches || cue.spellCheck.matches.length === 0)
        && cueErrors.includes(CueError.SPELLCHECK_ERROR)) {
        cueErrors.splice(cueErrors.indexOf(CueError.SPELLCHECK_ERROR), 1);
    }
};

const checkCharsPerSecond =
    (cueErrors: CueError[], vttCue: VTTCue, subtitleSpecification: SubtitleSpecification | null): void => {
    if (subtitleSpecification?.enabled && subtitleSpecification.maxCharactersPerSecondPerCaption) {
        const cleanText = removeHtmlTags(removeLineBreaks(vttCue.text));
        const cueTextCharsPerSecond = cleanText.length / (vttCue.endTime - vttCue.startTime);
        if (cueTextCharsPerSecond > subtitleSpecification.maxCharactersPerSecondPerCaption) {
            cueErrors.push(CueError.CHARS_PER_SECOND_EXCEEDED);
        }
    }
};

export const conformToRules = (
    cue: CueDto,
    subtitleSpecification: SubtitleSpecification | null,
    previousCue?: CueDto,
    followingCue?: CueDto,
    overlapCaptions?: boolean
): CueError[] => {
    const cueErrors = [] as CueError[];
    checkCharacterAndLineLimitation(cueErrors, cue.vttCue.text, subtitleSpecification);
    checkRange(cueErrors, cue.vttCue, subtitleSpecification);
    if (!overlapCaptions) {
        checkOverlap(cueErrors, cue.vttCue, previousCue, followingCue);
    }
    checkCharsPerSecond(cueErrors, cue.vttCue, subtitleSpecification);
    return cueErrors;
};

export const conformToSpelling = (cue: CueDto): CueError[] => {
    const currentErrors = cue.errors ? cue.errors : [];
    const cueErrors = [...currentErrors];
    checkSpelling(cueErrors, cue);
    return cueErrors;
};

export const applyInvalidRangePreventionStart = (
    vttCue: VTTCue,
    subtitleSpecification: SubtitleSpecification | null
): boolean => {
    let applied = false;
    const timeGapLimit = getTimeGapLimits(subtitleSpecification);

    if (!minRangeOk(vttCue, timeGapLimit)) {
        vttCue.startTime = Number((vttCue.endTime - timeGapLimit.minGap).toFixed(3));
        applied = true;
    }
    if (!maxRangeOk(vttCue, timeGapLimit)) {
        vttCue.startTime = Number((vttCue.endTime - timeGapLimit.maxGap).toFixed(3));
        applied = true;
    }
    return applied;
};

export const applyInvalidRangePreventionEnd = (
    vttCue: VTTCue,
    subtitleSpecification: SubtitleSpecification | null
): boolean => {
    let applied = false;
    const timeGapLimit = getTimeGapLimits(subtitleSpecification);

    if (!minRangeOk(vttCue, timeGapLimit)) {
        vttCue.endTime = Number((vttCue.startTime + timeGapLimit.minGap).toFixed(3));
        applied = true;
    }
    if (!maxRangeOk(vttCue, timeGapLimit)) {
        vttCue.endTime = Number((vttCue.startTime + timeGapLimit.maxGap).toFixed(3));
        applied = true;
    }
    return applied;
};

export const applyOverlapPreventionStart = (vttCue: VTTCue, previousCue: CueDto): boolean => {
    if (!startOverlapOk(vttCue, previousCue)) {
        vttCue.startTime = previousCue.vttCue.endTime;
        return true;
    }
    return false;
};

export const applyOverlapPreventionEnd = (vttCue: VTTCue, followingCue: CueDto): boolean => {
    if (!endOverlapOk(vttCue, followingCue)) {
        vttCue.endTime = followingCue.vttCue.startTime;
        return true;
    }
    return false;
};

const withinChunkRange = (time: number, chunkStart: number, chunkEnd: number): boolean =>
    time >= (chunkStart / 1000) && time <= (chunkEnd / 1000);

export const applyInvalidChunkRangePreventionStart = (
    vttCue: VTTCue,
    originalVttCueStart: number,
    editingTrack: Track
): boolean => {
    let applied = false;
    if ((editingTrack.mediaChunkStart || editingTrack.mediaChunkStart === 0) && editingTrack.mediaChunkEnd
        && !withinChunkRange(vttCue.startTime, editingTrack.mediaChunkStart, editingTrack.mediaChunkEnd)) {
        vttCue.startTime = originalVttCueStart;
        applied = true;
    }
    return applied;
};

export const applyInvalidChunkRangePreventionEnd = (
    vttCue: VTTCue,
    originalVttCueEnd: number,
    editingTrack: Track
): boolean => {
    let applied = false;
    if ((editingTrack.mediaChunkStart || editingTrack.mediaChunkStart === 0) && editingTrack.mediaChunkEnd
        && !withinChunkRange(vttCue.endTime, editingTrack.mediaChunkStart, editingTrack.mediaChunkEnd)) {
        vttCue.endTime = originalVttCueEnd;
        applied = true;
    }
    return applied;
};

const verifyCueChunkRange = (vttCue: VTTCue, editingTrack: Track): boolean => {
    return !((editingTrack.mediaChunkStart || editingTrack.mediaChunkStart === 0) && editingTrack.mediaChunkEnd)
        || (withinChunkRange(vttCue.startTime, editingTrack.mediaChunkStart, editingTrack.mediaChunkEnd)
            && withinChunkRange(vttCue.endTime, editingTrack.mediaChunkStart, editingTrack.mediaChunkEnd));
};

export const verifyCueDuration = (vttCue: VTTCue, editingTrack: Track, timeGapLimit: TimeGapLimit): boolean => {
    const cueDuration = Number((vttCue.endTime - vttCue.startTime).toFixed(3));
    return cueDuration >= timeGapLimit.minGap && verifyCueChunkRange(vttCue, editingTrack);
};

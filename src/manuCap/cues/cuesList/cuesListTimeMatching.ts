import { CueDto, CueLineDto } from "../../model";

const OVERLAP_RATIO = 0.65;

export interface MatchedCuesWithEditingFocus {
    matchedCues: CueLineDto[];
    matchedCuesFocusIndex: number;
}

interface Times {
    sourceEnd: number;
    targetStart: number;
    targetLength: number;
    targetEnd: number;
    sourceStart: number;
    sourceLength: number;
}

interface Indexes {
    cuesMap: number;
    editingFocus: number;
    source: number;
    target: number;
}

const isExactMatch = (times: Times): boolean =>
times.targetStart === times.sourceStart && times.targetEnd === times.sourceEnd;

const isTargetShorter = (times: Times): boolean =>
    times.targetEnd < times.sourceEnd
    || (times.targetEnd === times.sourceEnd && times.targetStart > times.sourceStart);

const isSourceShorter = (times: Times): boolean =>
    times.targetEnd > times.sourceEnd
    || (times.targetEnd === times.sourceEnd && times.targetStart < times.sourceStart);

const pushTargetWithoutMatchedIndex = (
    indexes: Indexes,
    cue: CueDto,
    editingCueIndex: number,
    cuesMapValue?: CueLineDto,
): void => {
    cuesMapValue?.targetCues?.push({ index: indexes.target, cue });
    if (indexes.target === editingCueIndex) {
        indexes.editingFocus = indexes.cuesMap;
    }
    indexes.target++;
};

const pushSourceWithoutMatchedIndex = (
    indexes: Indexes,
    sourceCue: CueDto,
    cuesMapValue?: CueLineDto
): void => {
    cuesMapValue?.sourceCues?.push({ index: indexes.source, cue: sourceCue });
    indexes.source++;
};

const pushTarget = (
    indexes: Indexes,
    times: Times,
    cue: CueDto,
    editingCueIndex: number,
    cuesMapValue?: CueLineDto,
): void => {
    pushTargetWithoutMatchedIndex(indexes, cue, editingCueIndex, cuesMapValue);
    if (times.targetEnd === undefined || times.sourceStart === undefined) {
        indexes.cuesMap++;
        return;
    }
    const overlapLength = times.targetEnd - times.sourceStart;
    if (overlapLength / times.targetLength <= OVERLAP_RATIO) {
        indexes.cuesMap++;
    }
};

const pushSource = (
    indexes: Indexes,
    times: Times,
    sourceCue: CueDto,
    cuesMapValue?: CueLineDto
): void => {
    pushSourceWithoutMatchedIndex(indexes, sourceCue, cuesMapValue);
    if (times.sourceEnd === undefined || times.targetStart === undefined) {
        indexes.cuesMap++;
        return;
    }
    const overlapLength = times.sourceEnd - times.targetStart;
    if (overlapLength / times.sourceLength <= OVERLAP_RATIO) {
        indexes.cuesMap++;
    }
};

const pushBoth = (
    indexes: Indexes,
    sourceCue: CueDto,
    cue: CueDto,
    editingCueIndex: number,
    cuesMapValue?: CueLineDto,
): void => {
    pushTargetWithoutMatchedIndex(indexes, cue, editingCueIndex, cuesMapValue);
    pushSourceWithoutMatchedIndex(indexes, sourceCue, cuesMapValue);
    indexes.cuesMap++;
};

export const matchCuesByTime = (
    targetCues: CueDto[],
    sourceCues: CueDto[],
    editingCueIndex: number
): MatchedCuesWithEditingFocus => {
    const cuesMap = new Map<number, CueLineDto>();
    const indexes = {
        cuesMap: 0,
        source: 0, // will not be used for captions only
        target: 0,
        editingFocus: 0,
    };
    while (indexes.target < targetCues.length || indexes.source < sourceCues.length) {
        if (!cuesMap.get(indexes.cuesMap)) {
            cuesMap.set(indexes.cuesMap, { targetCues: [], sourceCues: []});
        }
        const cuesMapValue = cuesMap.get(indexes.cuesMap);
        const cue = targetCues[indexes.target];
        const sourceCue = sourceCues[indexes.source];
        const times = {
            sourceStart: sourceCue?.vttCue.startTime,
            sourceEnd: sourceCue?.vttCue.endTime,
            sourceLength: sourceCue?.vttCue.endTime - sourceCue?.vttCue.startTime,
            targetStart: cue?.vttCue.startTime,
            targetEnd: cue?.vttCue.endTime,
            targetLength: cue?.vttCue.endTime - cue?.vttCue.startTime,
        };

        if (!sourceCue) {
            pushTarget(indexes, times, cue, editingCueIndex, cuesMapValue);
            continue;
        }
        if (!cue) {
            pushSource(indexes, times, sourceCue, cuesMapValue);
            continue;
        }
        if (isExactMatch(times)) {
            pushBoth(indexes, sourceCue, cue, editingCueIndex, cuesMapValue);
            continue;
        }
        if (isTargetShorter(times)) {
            pushTarget(indexes, times, cue, editingCueIndex, cuesMapValue);
        } else if (isSourceShorter(times)) {
            pushSource(indexes, times, sourceCue, cuesMapValue);
        }
    }
    const matchedCues = Array.from(cuesMap.values());
    return { matchedCues, matchedCuesFocusIndex: indexes.editingFocus };
};

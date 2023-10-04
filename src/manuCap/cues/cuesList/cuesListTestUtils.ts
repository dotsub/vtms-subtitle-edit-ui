import { CueDto, CueDtoWithIndex, CueLineDto } from "../../model";

const createLineText = (prefix: string, idx: number, matchedIdx: number) => (
    prefix + "Line" + idx + "-" + matchedIdx +
    prefix + "Line" + idx + "-" + matchedIdx +
    prefix + "Line" + idx + "-" + matchedIdx
);

const createCueWithIndex = (prefix: string, idx: number, matchedIdx: number) => (
    {
        index: idx,
        cue: {
            vttCue: new VTTCue(idx, idx + 1, createLineText(prefix, idx, matchedIdx)),
            cueCategory: "DIALOGUE"
        }
    } as CueDtoWithIndex
);

export const createTestingMatchedCues = (matchedCuesCount: number) => Array.from({ length: 220 }, (_element, idx) => {
    const cueLineDto = { sourceCues: [], targetCues: []} as CueLineDto;
    for (let matchedIdx = 0; matchedIdx < matchedCuesCount; matchedIdx++) {
        cueLineDto.sourceCues?.push(createCueWithIndex("Src", idx, matchedIdx));
        cueLineDto.targetCues?.push(createCueWithIndex("Trg", idx, matchedIdx));
    }
    return cueLineDto;
});

export const createTestingTargetCues = (testingMatchedCues: CueLineDto[]): CueDto[] =>
    testingMatchedCues
        .map(matchedCue => matchedCue.targetCues as CueDtoWithIndex[])
        .flat()
        .filter(cueWithIndex => cueWithIndex !== undefined)
        .map(cueWithIndex => cueWithIndex.cue);


export const createTestingSourceCues = (testingMatchedCues: CueLineDto[]) =>
    testingMatchedCues
        .map(matchedCue => matchedCue.sourceCues as CueDtoWithIndex[])
        .flat()
        .filter(cueWithIndex => cueWithIndex !== undefined)
        .map(cueWithIndex => cueWithIndex.cue);

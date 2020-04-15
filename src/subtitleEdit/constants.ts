import { CueDto } from "./model";

export class Constants {
    static readonly DEFAULT_MIN_GAP: number = 0.5;
    static readonly DEFAULT_MAX_GAP: number = Number.MAX_SAFE_INTEGER;
    static readonly NEW_ADDED_CUE_DEFAULT_STEP: number = 3;
    static readonly DEFAULT_CUE: CueDto = { vttCue: new VTTCue(0, 0, ""), cueCategory: "DIALOGUE" };
}


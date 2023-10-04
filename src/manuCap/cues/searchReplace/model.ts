
export type SearchDirection = "NEXT" | "PREVIOUS";

export interface SearchReplace {
    find: string;
    replacement: string;
    matchCase: boolean;
    direction: SearchDirection;
    indices: SearchReplaceIndices;
}

export interface SearchReplaceIndices {
    matchedCueIndex: number;
    sourceCueIndex: number;
    targetCueIndex: number;
    offset: number;
    offsetIndex: number;
    matchLength: number;
}

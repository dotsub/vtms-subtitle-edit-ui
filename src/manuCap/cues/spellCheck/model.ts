export interface Replacement {
    value: string;
}

export interface SpellCheckHash {
    keyword: string;
    ruleId: string;
}

export interface SpellcheckRule {
    id: string;
}
export interface SpellcheckContext {
    length: number;
    offset: number;
    text: string;
}

export interface Match {
    context: SpellcheckContext;
    message: string;
    replacements: Replacement[];
    offset: number;
    length: number;
    rule: SpellcheckRule;
}

export interface SpellCheck {
    matches: Match[];
}

export interface SpellCheckIgnore {
    hashes: Array<string>;
    creationDate: Date;
}

export interface SpellCheckIgnoreStorage {
    trackId: SpellCheckIgnore;
}

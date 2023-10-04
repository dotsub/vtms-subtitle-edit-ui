import Immutable from "immutable";

// https://github.com/mozilla/vtt.js/issues/364
// TODO: Name is confusing consider changing it or use different set of browsers if mistake
export const isSafari = (): boolean => {
    // TODO: This is very unsafe of browser type recognition. Can easily fail. Use some decent library
    const userAgent = navigator.userAgent.toLowerCase();
    return userAgent.indexOf("safari") !== -1 && userAgent.indexOf("chrome") === -1;
};

export const copyNonConstructorProperties = (newCue: VTTCue, oldCue: VTTCue): void => {
    newCue.position = oldCue.position;
    newCue.align = oldCue.align;

    // TODO: Remove conditional if browsers start to initialize VtTTCue.positionAlign/lineAlign correctly
    // It looks like these properties are not initialized correctly in VTTCue constructor (for certain browsers).
    // Therefore we need to initialize them when we are copying it,
    // otherwise the assignment will fail and some positions are misplaced
    // NOTE: It is not possible to test case where oldCue.positionAlign/lineAlign is undefined,
    // because VTTCue constructor from video.js work correctly,
    // thus it is not possible to simulate failure case in node, it happens in browsers.

    newCue.lineAlign = oldCue.lineAlign ? oldCue.lineAlign : "center";
    newCue.positionAlign = oldCue.positionAlign ? oldCue.positionAlign : "auto";

    if (isSafari() && oldCue.line === "auto") {
        newCue.line = -1;
    } else if (typeof oldCue.line === "string" && oldCue.line !== "auto") {
        // Due to some type mismatches between VideoJS impl of VTTCue and our API, we have to make a conversion
        // for when a string is return with a numeric value in it. We must convert this to a real number. Otherwise,
        // all cues won't show up.
        newCue.line = Number.parseInt(oldCue.line);
    } else {
        newCue.line = oldCue.line;
    }

    newCue.region = oldCue.region;
    newCue.snapToLines = oldCue.snapToLines === undefined ? true : oldCue.snapToLines;
    newCue.size = oldCue.size ? oldCue.size : 100;
    newCue.vertical = oldCue.vertical ? oldCue.vertical : "";
    newCue.id = oldCue.id ? oldCue.id : "";
    newCue.pauseOnExit = oldCue.pauseOnExit;
};

/**
 * Constructs array of cue values used for stopping FLUX loops
 *
 * NOTE: This function is tested as part of CueTextEditor tests
 * @param cue Cue object to construct values from
 */
// eslint-disable-next-line
export const constructCueValuesArray = (cue: VTTCue): any[] => [
    cue.startTime,
    cue.endTime,
    cue.text,
    cue.position,
    cue.align,
    cue.lineAlign,
    cue.positionAlign,
    cue.snapToLines,
    cue.size,
    cue.line,
    cue.vertical,
    cue.id,
    cue.pauseOnExit,
    // TODO add cue.region.... properties if used in future
];

export interface PositionStyle {
    line: LineAndPositionSetting;
    align: AlignSetting;
    positionAlign: PositionAlignSetting;
    position: LineAndPositionSetting;
}

export enum Position {
    Row1Column1,
    Row1Column2,
    Row1Column3,
    Row1Column4,
    Row1Column5,
    Row2Column1,
    Row2Column2,
    Row2Column3,
    Row2Column4,
    Row2Column5,
    Row3Column1,
    Row3Column2,
    Row3Column3,
    Row3Column4,
    Row3Column5,
    Row4Column1,
    Row4Column2,
    Row4Column3,
    Row4Column4,
    Row4Column5,
    Row5Column1,
    Row5Column2,
    Row5Column3,
    Row5Column4,
    Row5Column5,
}

export interface PositionIcon {
    position: Position;
    iconText: string;
    leftPadding: string;
}

const POSITION_STYLES_COUNT = 4;

// noinspection DuplicatedCode code is in test as well
const positionStylesArray = [
    [Position.Row1Column1, { line: 0, align: "start", positionAlign: "center", position: 51 }],
    [Position.Row1Column2, { line: 0, align: "start", positionAlign: "center", position: 65 }],
    [Position.Row1Column3, { line: 0, align: "center", positionAlign: "auto", position: "auto"  }],
    [Position.Row1Column4, { line: 0, align: "end", positionAlign: "center", position: 35 }],
    [Position.Row1Column5, { line: 0, align: "end", positionAlign: "center", position: 49 }],
    [Position.Row2Column1, { line: 4, align: "start", positionAlign: "center", position: 51 }],
    [Position.Row2Column2, { line: 4, align: "start", positionAlign: "center", position: 65 }],
    [Position.Row2Column3, { line: 4, align: "center", positionAlign: "auto", position: "auto" }],
    [Position.Row2Column4, { line: 4, align: "end", positionAlign: "center", position: 35 }],
    [Position.Row2Column5, { line: 4, align: "end", positionAlign: "center", position: 49 }],
    [Position.Row3Column1, { line: 8, align: "start", positionAlign: "center", position: 51 }],
    [Position.Row3Column2, { line: 8, align: "start", positionAlign: "center", position: 65 }],
    [Position.Row3Column3, { line: 8, align: "center", positionAlign: "auto", position: "auto" }],
    [Position.Row3Column4, { line: 8, align: "end", positionAlign: "center", position: 35 }],
    [Position.Row3Column5, { line: 8, align: "end", positionAlign: "center", position: 49 }],
    [Position.Row4Column1, { line: 12, align: "start", positionAlign: "center", position: 51 }],
    [Position.Row4Column2, { line: 12, align: "start", positionAlign: "center", position: 65 }],
    [Position.Row4Column3, { line: 12, align: "center", positionAlign: "auto", position: "auto" }],
    [Position.Row4Column4, { line: 12, align: "end", positionAlign: "center", position: 35 }],
    [Position.Row4Column5, { line: 12, align: "end", positionAlign: "center", position: 49 }],
    [Position.Row5Column1, { line: 15, align: "start", positionAlign: "center", position: 51 }],
    [Position.Row5Column2, { line: 15, align: "start", positionAlign: "center", position: 65 }],
    [Position.Row5Column3, { line: isSafari() ? "-1" : "auto", align: "center", positionAlign: "auto",
        position: "auto" }],
    [Position.Row5Column4, { line: 15, align: "end", positionAlign: "center", position: 35 }],
    [Position.Row5Column5, { line: 15, align: "end", positionAlign: "center", position: 49 }],
];
export const positionStyles = Immutable.Map<Position, PositionStyle>(positionStylesArray);

// noinspection DuplicatedCode code is in test as well
export const positionIcons = [
    { position: Position.Row1Column1, iconText: "↖↖", leftPadding: "6px" },
    { position: Position.Row1Column2, iconText: "↖↑", leftPadding: "9px" },
    { position: Position.Row1Column3, iconText: "↑↑", leftPadding: "13px" },
    { position: Position.Row1Column4, iconText: "↑↗", leftPadding: "11px" },
    { position: Position.Row1Column5, iconText: "↗↗", leftPadding: "6px" },
    { position: Position.Row2Column1, iconText: "↖←", leftPadding: "6px" },
    { position: Position.Row2Column2, iconText: "↖", leftPadding: "13px" },
    { position: Position.Row2Column3, iconText: "↑", leftPadding: "16px" },
    { position: Position.Row2Column4, iconText: "↗", leftPadding: "13px" },
    { position: Position.Row2Column5, iconText: "→↗", leftPadding: "6px" },
    { position: Position.Row3Column1, iconText: "←←", leftPadding: "5px" },
    { position: Position.Row3Column2, iconText: "←", leftPadding: "12px" },
    { position: Position.Row3Column3, iconText: "•", leftPadding: "16px" },
    { position: Position.Row3Column4, iconText: "→", leftPadding: "12px" },
    { position: Position.Row3Column5, iconText: "→→", leftPadding: "5px" },
    { position: Position.Row4Column1, iconText: "↙←", leftPadding: "6px" },
    { position: Position.Row4Column2, iconText: "↙", leftPadding: "13px" },
    { position: Position.Row4Column3, iconText: "↓", leftPadding: "16px" },
    { position: Position.Row4Column4, iconText: "↘", leftPadding: "13px" },
    { position: Position.Row4Column5, iconText: "→↘", leftPadding: "6px" },
    { position: Position.Row5Column1, iconText: "↙↙", leftPadding: "6px" },
    { position: Position.Row5Column2, iconText: "↙↓", leftPadding: "9px" },
    { position: Position.Row5Column3, iconText: "↓↓", leftPadding: "13px" },
    { position: Position.Row5Column4, iconText: "↓↘", leftPadding: "11px" },
    { position: Position.Row5Column5, iconText: "↘↘", leftPadding: "6px" },
];


const detectPosition = (vttCue: VTTCue): Position => {
    let detectedPosition = Position.Row5Column3;
    positionStyles.forEach((positionStyle?: PositionStyle, position?: Position): void => {
        let propertyHits = 0;
        for (const property in positionStyle) {
            // noinspection JSUnfilteredForInLoop
            if (vttCue[property] === positionStyle[property]){
                propertyHits++;
            }
        }
        if (propertyHits === POSITION_STYLES_COUNT && position !== undefined) {
            detectedPosition = position;
        }
    });
    return detectedPosition;
};

export const findPositionIcon = ((vttCue: VTTCue): PositionIcon => {
    const position = detectPosition(vttCue);
    return positionIcons.filter((positionIcon: PositionIcon) => positionIcon.position === position)[0];
});

export const cueCategoryToPrettyName = {
    DIALOGUE: "Dialogue",
    ONSCREEN_TEXT: "On Screen Text",
    AUDIO_DESCRIPTION: "Audio Descriptions",
    LYRICS: "Lyrics"
};

export const getWordCount = (text: string): number => {
    const matches = text ? text.match(/\S+/g) : [];
    return matches ? matches.length : 0;
};

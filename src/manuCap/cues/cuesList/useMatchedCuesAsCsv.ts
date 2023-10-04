import { useSelector } from "react-redux";
import { ManuCapState } from "../../manuCapReducers";
import { CueDtoWithIndex, CueLineDto } from "../../model";
import { getTimeString } from "../../utils/timeUtils";
import { isDirectTranslationTrack } from "../../utils/manuCapUtils";

const CSV_HEADER_SOURCE_ONLY = "Start,End,Text\r\n";
const CSV_HEADER_SOURCE_AND_TARGET = "Source Start,Source End,Source Text,Target Start,Target End,Target Text\r\n";

const encodeText = (value: string): string => `"${value.replace(/"/g, "\"\"")}"`;

const getCueCsvArray = (cues: Array<CueDtoWithIndex> | undefined) =>
    cues?.length ? cues.map(cueDto => [
        `${getTimeString(cueDto.cue.vttCue.startTime)}`,
        `${getTimeString(cueDto.cue.vttCue.endTime)}`,
        encodeText(cueDto.cue.vttCue.text)
    ]) : [["", "", ""]];

const cartesian = (sourceArray: Array<Array<string>>, targetArray: Array<Array<string>>) =>
    sourceArray.flatMap(source => targetArray.map(target => [source, target].flat()));

export const matchedCuesToCsv = (matchedCues: Array<CueLineDto>, isTranslationTrack: boolean): string => {
    const result = matchedCues.map(cueLineDto => {
            const targetArray = getCueCsvArray(cueLineDto.targetCues);
            let output = targetArray;
            if (isTranslationTrack) {
                const sourceArray = getCueCsvArray(cueLineDto.sourceCues);
                output = cartesian(sourceArray, targetArray);
            }
            return output.map(lineArray => lineArray.join(","));
        }
    );
    const trackMatchedCsvHeader = isTranslationTrack ? CSV_HEADER_SOURCE_AND_TARGET : CSV_HEADER_SOURCE_ONLY;
    return `${trackMatchedCsvHeader + result.flat().join("\r\n")}`;
};

const useMatchedCuesAsCsv = (): Function => {
    const matchedCues = useSelector((state: ManuCapState) => state.matchedCues.matchedCues);
    const track = useSelector((state: ManuCapState) => state.editingTrack);
    return () => {
        const isTranslationTrack = track?.type === "TRANSLATION" && !isDirectTranslationTrack(track);
        return matchedCuesToCsv(matchedCues, isTranslationTrack);
    };
};

export default useMatchedCuesAsCsv;

import { ReactElement } from "react";
import { EditorState } from "draft-js";
import { getWordCount } from "../cueUtils";

interface Props {
    cueIndex: number;
    vttCue: VTTCue;
    editorState: EditorState;
}

const getCharacterCount = (text: string): number =>
    text ? text.replace(/(\r\n|\n|\r)/gm, "").length : 0;

const NUM_DECIMAL = 3;

const getDuration = (vttCue: VTTCue): number => {
    const duration = (vttCue.endTime - vttCue.startTime);
    return +duration.toFixed(NUM_DECIMAL);
};

const CueLineCounts = (props: Props): ReactElement => {
    const currentContent = props.editorState && props.editorState.getCurrentContent();
    const text = !currentContent || !currentContent.hasText() ? "" : currentContent.getPlainText();
    const cps = (getCharacterCount(text)/getDuration(props.vttCue)).toFixed(1);

    return (
        <div className="text-sm" style={{ paddingLeft: "5px", paddingTop: "10px" }}>
            <span>DURATION: <span className="text-green-dark">{getDuration(props.vttCue)}s</span>, </span>
            <span>CHARACTERS: <span className="text-green-dark">{getCharacterCount(text)}</span>, </span>
            <span>WORDS: <span className="text-green-dark">{getWordCount(text)}</span>, </span>
            <span>CPS: <span className="text-green-dark">{cps}</span></span>
        </div>
    );
};

export default CueLineCounts;

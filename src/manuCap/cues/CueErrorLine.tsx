import { CueError } from "../model";
import { ReactElement } from "react";

interface Props {
    cueIndex: number;
    cueError: CueError;
}

const CueErrorLine = (props: Props): ReactElement =>
    <>&#8226; {props.cueError}<br /></>;

export default CueErrorLine;

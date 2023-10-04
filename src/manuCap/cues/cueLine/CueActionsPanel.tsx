import { ReactElement } from "react";
import * as React from "react";
import AddCueLineButton from "../edit/AddCueLineButton";
import { CueDto } from "../../model";
import DeleteCueLineButton from "../edit/DeleteCueLineButton";
import PlayCueButton from "./PlayCueButton";
import SplitCueLineButton from "../edit/SplitCueLineButton";

interface Props {
    index: number;
    cue: CueDto;
    sourceCueIndexes: number[];
    isEdit: boolean;
}

export const CueActionsPanel = (props: Props): ReactElement => {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                flexDirection: "column",
                flex: "0 0 50px"
        }}
            className={"sbte-actions-panel border-l border-blue-light-mostly-transparent" +
                (props.isEdit ? " bg-white": " bg-gray-0")}
            onClick={(event: React.MouseEvent<HTMLElement>): void => event.stopPropagation()}
        >
            {
                props.isEdit
                    ? <DeleteCueLineButton cueIndex={props.index} />
                    : <div />
            }
            <PlayCueButton cue={props.cue} cueIndex={props.index} />
            {
                props.isEdit
                    ? <SplitCueLineButton cueIndex={props.index} />
                    : <div />
            }
            {
                props.isEdit
                    ? <AddCueLineButton cueIndex={props.index} sourceCueIndexes={props.sourceCueIndexes} />
                    : <div />
            }
        </div>
    );
};

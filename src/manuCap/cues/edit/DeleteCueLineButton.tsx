import { ReactElement } from "react";
import { deleteCue } from "../cuesList/cuesListActions";
import { useDispatch } from "react-redux";
import { AppThunk } from "../../manuCapReducers";
import { Tooltip } from "primereact/tooltip";

interface Props {
    cueIndex: number;
}

const DeleteCueLineButton = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const buttonId = `deleteCueLineButton${props.cueIndex}`;
    return (
        <div className="p-1.5">
            <button
                id={buttonId}
                style={{ maxHeight: "38px" }}
                className="sbte-btn sbte-btn-primary sbte-btn-sm sbte-delete-cue-button w-full"
                onClick={(): AppThunk => dispatch(deleteCue(props.cueIndex))}
                data-pr-tooltip="Delete this subtitle"
                data-pr-position="left"
                data-pr-at="left center"
            >
                <i className="fa-duotone fa-trash" />
            </button>
            <Tooltip
                id={buttonId + "-Tooltip"}
                target={`#${buttonId}`}
            />
        </div>
    );
};

export default DeleteCueLineButton;

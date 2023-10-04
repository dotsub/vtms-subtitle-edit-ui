import { MouseEvent, ReactElement } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ManuCapState } from "../manuCapReducers";
import ToggleButton from "./ToggleButton";
import { updateEditingTrack } from "../trackSlices";
import { SaveState, Track } from "../model";
import { saveTrack, updateCues } from "../cues/cuesList/cuesListActions";

interface Props {
    onClick: (event: MouseEvent<HTMLElement>) => void
    saveState: SaveState;
}

export const CaptionOverlapToggle = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const editingTrack = useSelector((state: ManuCapState) => state.editingTrack);
    const cues = useSelector((state: ManuCapState) => state.cues);
    const overlapEnabled = editingTrack?.overlapEnabled;
    return (
        <ToggleButton
            className="flex items-center justify-between"
            disabled={props.saveState === "TRIGGERED"}
            toggled={overlapEnabled}
            onClick={(event): void => {
                const track = {
                    ...editingTrack,
                    overlapEnabled: !overlapEnabled
                } as Track;
                dispatch(updateEditingTrack(track));
                dispatch(updateCues(cues));
                dispatch(saveTrack());
                props.onClick(event);
            }}
            render={(toggle): ReactElement => (
                toggle
                    ? (
                        <>
                            <span>
                                <i className="w-7 fa-duotone fa-arrow-down-square-triangle text-blue-primary" />
                                <span>Overlapping</span>
                            </span>
                            <span className="sbte-badge font-medium sbte-badge-sm sbte-badge-success">ALLOWED</span>
                        </>
                    ) : (
                        <>
                            <span>
                                <i className="w-7 fa-duotone fa-arrow-down-square-triangle text-blue-primary" />
                                <span>Overlapping</span>
                            </span>
                            <span className="sbte-badge font-medium sbte-badge-sm sbte-badge-secondary">
                                NOT ALLOWED
                            </span>
                        </>
                    )
            )}
        />
    );
};

export default CaptionOverlapToggle;

import { MouseEvent, ReactElement } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ManuCapState } from "../manuCapReducers";
import ToggleButton from "./ToggleButton";
import { Track } from "../model";
import { updateEditingTrack } from "../trackSlices";

interface Props {
    onClick: (event: MouseEvent<HTMLElement>) => void
}

export const TimecodesLockToggle = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const editingTrack = useSelector((state: ManuCapState) => state.editingTrack);
    const timecodesUnlocked = editingTrack?.timecodesUnlocked;
    return (
        <ToggleButton
            className="flex items-center justify-between"
            toggled={timecodesUnlocked}
            onClick={(event): void => {
                const track = {
                    ...editingTrack,
                    timecodesUnlocked: !timecodesUnlocked
                } as Track;
                dispatch(updateEditingTrack(track));
                props.onClick(event);
            }}
            render={(toggle): ReactElement => (
                toggle
                    ? (
                        <>
                            <span>
                                <i className="w-7 fa-duotone fa-clock text-blue-primary" />
                                <span>Timecodes</span>
                            </span>
                            <span className="sbte-badge font-medium sbte-badge-sm sbte-badge-success">UNLOCKED</span>
                        </>
                    )
                    : (
                        <>
                            <span>
                                <i className="w-7 fa-duotone fa-clock text-blue-primary" />
                                <span>Timecodes</span>
                            </span>
                            <span className="sbte-badge font-medium sbte-badge-sm sbte-badge-secondary">LOCKED</span>
                        </>
                    )
            )}
        />
    );
};

export default TimecodesLockToggle;

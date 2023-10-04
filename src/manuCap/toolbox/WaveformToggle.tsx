import { MouseEvent, ReactElement } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ManuCapState } from "../manuCapReducers";
import ToggleButton from "./ToggleButton";
import { waveformVisibleSlice } from "../player/waveformSlices";

interface Props {
    onClick: (event: MouseEvent<HTMLElement>) => void
}

export const WaveformToggle = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const waveformVisible = useSelector((state: ManuCapState) => state.waveformVisible);
    return (
        <ToggleButton
            className="flex items-center justify-between"
            toggled={waveformVisible}
            onClick={(event): void => {
                dispatch(waveformVisibleSlice.actions.setWaveformVisible(!waveformVisible));
                props.onClick(event);
            }}
            render={(toggle): ReactElement => (
                toggle
                    ? (
                        <>
                            <span>
                                <i className="w-7 fa-duotone fa-waveform-lines text-blue-primary" />
                                <span>Waveform</span>
                            </span>
                            <span className="sbte-badge font-medium sbte-badge-sm sbte-badge-success">SHOWN</span>
                        </>
                    )
                    : (
                        <>
                            <span>
                                <i className="w-7 fa-duotone fa-waveform-lines text-blue-primary" />
                                <span>Waveform</span>
                            </span>
                            <span className="sbte-badge font-medium sbte-badge-sm sbte-badge-secondary">HIDDEN</span>
                        </>
                    )
            )}
        />
    );
};

export default WaveformToggle;

import { ReactElement } from "react";
import { useSelector } from "react-redux";
import { ManuCapState } from "../../manuCapReducers";
import { Track } from "../../model";
import { Tooltip } from "primereact/tooltip";

interface Props {
    handleExport: (editingTrack: Track | null) => void;
}

const ExportTrackCuesButton = (props: Props): ReactElement => {
    const editingTrack = useSelector((state: ManuCapState) => state.editingTrack);
    return (
        <>
            <button
                id="exportFileBtn"
                className="sbte-export-button sbte-btn sbte-btn-light"
                onClick={(): void => props.handleExport(editingTrack)}
                data-pr-tooltip="Export File"
                data-pr-position="top"
                data-pr-at="center+2 top-2"
            >
                <i className="fa-duotone fa-file-download fa-lg" />
            </button>
            <Tooltip
                id="exportFileBtnTooltip"
                target="#exportFileBtn"
            />
        </>
    );
};

export default ExportTrackCuesButton;

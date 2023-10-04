import { ReactElement } from "react";
import { Tooltip } from "primereact/tooltip";

interface Props {
    handleExport: () => void;
}

const ExportSourceTrackCuesButton = (props: Props): ReactElement => {
    return (
        <>
            <button
                id="exportSourceFileBtn"
                type="button"
                className="sbte-export-source-button sbte-btn sbte-btn-light"
                onClick={(): void => props.handleExport()}
                data-pr-tooltip="Export Source File"
                data-pr-position="top"
                data-pr-at="center+2 top-2"
            >
                <i className="fa-duotone fa-file-export fa-lg" />
            </button>
            <Tooltip
                id="exportSourceFileBtn"
                target="#exportSourceFileBtn"
            />
        </>
    );
};

export default ExportSourceTrackCuesButton;

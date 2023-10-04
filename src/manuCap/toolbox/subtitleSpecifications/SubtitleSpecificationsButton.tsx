import { ReactElement, useEffect, useState } from "react";
import SubtitleSpecificationsModal from "./SubtitleSpecificationsModal";
import { useSelector } from "react-redux";
import { ManuCapState } from "../../manuCapReducers";
import { Tooltip } from "primereact/tooltip";

const SubtitleSpecificationsButton = (): ReactElement => {
    const subtitleSpecifications = useSelector((state: ManuCapState) => state.subtitleSpecifications);
    const [show, setShow] = useState(false);
    useEffect(
        () => {
            setShow(subtitleSpecifications != null &&
                (subtitleSpecifications.enabled || !!subtitleSpecifications.mediaNotes));
        }, [subtitleSpecifications]
    );

    const handleClose = (): void => setShow(false);
    const handleShow  = (): void => setShow(true);
    return (
        <>
            <button
                id="subtitleSpecsBtn"
                className="dotsub-subtitle-specifications-button sbte-btn sbte-btn-light"
                onClick={handleShow}
                hidden={subtitleSpecifications == null}
                data-pr-tooltip="Subtitle Specifications"
                data-pr-position="top"
                data-pr-at="center+2 top-2"
            >
                <i className="fa-duotone fa-clipboard-list fa-lg" />
            </button>
            <Tooltip
                id="subtitleSpecsBtnTooltip"
                target="#subtitleSpecsBtn"
            />
            <SubtitleSpecificationsModal show={show} onClose={handleClose} />
        </>
    );
};

export default SubtitleSpecificationsButton;

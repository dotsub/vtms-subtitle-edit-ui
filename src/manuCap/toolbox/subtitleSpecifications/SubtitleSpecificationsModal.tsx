import { ReactElement } from "react";
import { Dialog } from "primereact/dialog";
import { ManuCapState } from "../../manuCapReducers";
import { SubtitleSpecification } from "../model";
import SubtitleSpecificationsForm from "./SubtitleSpecificationsForm";
import { useSelector } from "react-redux";

interface Props {
    show: boolean;
    onClose: () => void;
}

const SubtitleSpecificationsModal = (props: Props): ReactElement => {
    const stateSubtitleSpecifications = useSelector((state: ManuCapState) => state.subtitleSpecifications);
    const subtitleSpecifications = stateSubtitleSpecifications ? stateSubtitleSpecifications :
        {} as SubtitleSpecification;
    return (
        <Dialog
            className="max-w-3xl"
            visible={props.show}
            onHide={props.onClose}
            header="Subtitle Specifications"
            draggable={false}
            dismissableMask
            resizable={false}
            footer={() => (
                <button className="sbte-btn sbte-btn-primary" onClick={props.onClose}>
                    Close
                </button>
            )}
        >
            <SubtitleSpecificationsForm subTitleSpecifications={subtitleSpecifications} />
        </Dialog>
    );
};

export default SubtitleSpecificationsModal;

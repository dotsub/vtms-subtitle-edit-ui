import { MouseEvent, ReactElement } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ManuCapState } from "../manuCapReducers";
import ToggleButton from "./ToggleButton";
import { commentsVisibleSlice } from "../cues/comments/commentsSlices";

interface Props {
    onClick: (event: MouseEvent<HTMLElement>) => void
}

export const CueCommentsToggle = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const commentsVisible = useSelector((state: ManuCapState) => state.commentsVisible);
    return (
        <ToggleButton
            className="flex items-center justify-between"
            toggled={commentsVisible}
            onClick={(event): void => {
                dispatch(commentsVisibleSlice.actions.setCommentsVisible(!commentsVisible));
                props.onClick(event);
            }}
            render={(toggle): ReactElement => (
                toggle
                    ? (
                        <>
                            <span>
                                <i className="w-7 fa-duotone fa-comments text-blue-primary" />
                                <span>Comments</span>
                            </span>
                            <span className="sbte-badge font-medium sbte-badge-sm sbte-badge-success">SHOWN</span>
                        </>
                    )
                    : (
                        <>
                            <span>
                                <i className="w-7 fa-duotone fa-comments text-blue-primary" />
                                <span>Comments</span>
                            </span>
                            <span className="sbte-badge font-medium sbte-badge-sm sbte-badge-secondary">HIDDEN</span>
                        </>
                    )
            )}
        />
    );
};

export default CueCommentsToggle;

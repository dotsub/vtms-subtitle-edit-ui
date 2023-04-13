import { ReactElement } from "react";
import CompleteButton from "./CompleteButton";
import { Tooltip } from "primereact/tooltip";
import { useDispatch } from "react-redux";
import { changeScrollPosition } from "./cues/cuesList/cuesListScrollSlice";
import { TrackCues, ScrollPosition } from "./model";
import { Track } from "./model";

export interface Props {
    onViewTrackHistory: () => void;
    editingTrack: Track | null;
    onComplete: (completeAction: TrackCues) => void;
    editDisabled?: boolean;
}

const CueListToolbar = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    return (
        <div className="space-x-2 flex items-center mt-1.5">
            <button
                className="sbte-btn sbte-btn-primary sbte-view-all-tracks-sbte-btn"
                type="button"
                onClick={(): void => props.onViewTrackHistory()}
            >
                View Track History
            </button>
            <button
                id="jumpToFirstButton"
                className="sbte-btn sbte-btn-light sbte-jump-to-first-button"
                type="button"
                onClick={(): void => {
                dispatch(changeScrollPosition(ScrollPosition.FIRST));
            }}
                data-pr-tooltip="Scroll to top"
                data-pr-position="top"
                data-pr-at="center top-2"
            >
                <i className="fa-duotone fa-angle-double-up" />
            </button>
            <Tooltip
                id="jumpToFirstButtonTooltip"
                target="#jumpToFirstButton"
            />
            <button
                id="jumpToLastButton"
                className="sbte-btn sbte-btn-light sbte-jump-to-last-button"
                type="button"
                onClick={(): void => {
                dispatch(changeScrollPosition(ScrollPosition.LAST));
            }}
                data-pr-tooltip="Scroll to bottom"
                data-pr-position="top"
                data-pr-at="center top-2"
            >
                <i className="fa-duotone fa-angle-double-down" />
            </button>
            <Tooltip
                id="jumpToLastButtonTooltip"
                target="#jumpToLastButton"
            />
            <button
                id="editCueButton"
                data-testid="sbte-jump-to-edit-cue-button"
                className="sbte-btn sbte-btn-light"
                type="button"
                onClick={(): void => {
                dispatch(changeScrollPosition(ScrollPosition.CURRENT));
            }}
                data-pr-tooltip="Scroll to currently editing subtitle"
                data-pr-position="top"
                data-pr-at="center top-2"
            >
                <i className="fa-duotone fa-edit" />
            </button>
            <Tooltip
                id="editCueButtonTooltip"
                target="#editCueButton"
            />
            <button
                id="playbackCueButton"
                data-testid="sbte-jump-to-playback-cue-button"
                className="sbte-btn sbte-btn-light"
                type="button"
                onClick={(): void => {
                dispatch(changeScrollPosition(ScrollPosition.PLAYBACK));
            }}
                data-pr-tooltip="Scroll to subtitle in playback position"
                data-pr-position="top"
                data-pr-at="center top-2"
            >
                <i className="fa-duotone fa-video" />
            </button>
            <Tooltip
                id="playbackCueButtonTooltip"
                target="#playbackCueButton"
            />
            <button
                hidden={props.editingTrack?.type !== "TRANSLATION"}
                id="translatedCueButton"
                data-testid="sbte-jump-to-last-translated-cue-button"
                className="sbte-btn sbte-btn-light"
                type="button"
                onClick={(): void => {
                dispatch(changeScrollPosition(ScrollPosition.LAST_TRANSLATED));
            }}
                data-pr-tooltip="Scroll to last translated subtitle"
                data-pr-position="top"
                data-pr-at="center top-2"
            >
                <i className="fa-duotone fa-language" />
            </button>
            <Tooltip
                id="translatedCueButtonTooltip"
                target="#translatedCueButton"
            />
            <button
                id="cueErrorButton"
                data-testid="sbte-jump-error-cue-button"
                className="sbte-btn sbte-btn-light"
                type="button"
                onClick={(): void => {
                dispatch(changeScrollPosition(ScrollPosition.ERROR));
            }}
                data-pr-tooltip="Scroll to next subtitle error"
                data-pr-position="top"
                data-pr-at="center top-2"
            >
                <i className="fa-duotone fa-bug" />
            </button>
            <Tooltip
                id="cueErrorButtonTooltip"
                target="#cueErrorButton"
            />
            <span style={{ flexGrow: 2 }} />
            <CompleteButton
                onComplete={props.onComplete}
                disabled={props.editDisabled}
            />
        </div>
    );
};

export default CueListToolbar;

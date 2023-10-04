import { ReactElement } from "react";
import { useDispatch } from "react-redux";
import { showSearchReplace } from "../cues/searchReplace/searchReplaceSlices";
import { showMerge } from "../cues/merge/mergeSlices";
import { Tooltip } from "primereact/tooltip";

const SearchReplaceButton = (): ReactElement => {
    const dispatch = useDispatch();
    return (
        <>
            <button
                id="searchReplaceBtn"
                className="sbte-search-replace-button sbte-btn sbte-btn-light"
                onClick={(): void => {
                    dispatch(showMerge(false));
                    dispatch(showSearchReplace(true));
                }}
                data-pr-tooltip="Search / Replace"
                data-pr-position="top"
                data-pr-at="center+2 top-2"
            >
                <i className="fa-duotone fa-search-plus fa-lg" />
            </button>
            <Tooltip
                id="searchReplaceBtnTooltip"
                target="#searchReplaceBtn"
            />
        </>
    );
};

export default SearchReplaceButton;

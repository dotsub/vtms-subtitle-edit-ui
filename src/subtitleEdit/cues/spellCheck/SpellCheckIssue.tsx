import {
    CSSProperties,
    Dispatch,
    KeyboardEventHandler,
    MouseEvent,
    ReactElement,
    RefObject,
    useEffect,
    useRef
} from "react";

import * as React from "react";
import Select, { OnChangeValue } from "react-select";
import { Match, SpellCheck } from "./model";
import { Character } from "../../utils/shortcutConstants";
import { useDispatch, useSelector } from "react-redux";
import { addIgnoredKeyword, getMatchText } from "./spellCheckerUtils";
import {
    removeIgnoredSpellcheckedMatchesFromAllCues,
    updateMatchedCues,
    validateCorruptedCues
} from "../cuesList/cuesListActions";
import { AppThunk, SubtitleEditState } from "../../subtitleEditReducers";
import { StylesConfig } from "react-select/dist/declarations/src/styles";
import { Menu } from "primereact/menu";

interface Props {
    children: ReactElement;
    spellCheck: SpellCheck;
    start: number;
    end: number;
    correctSpelling: (replacement: string, start: number, end: number) => void;
    spellCheckerMatchingOffset: number | null;
    setSpellCheckerMatchingOffset: (id: number | null) => void;
    editorRef: RefObject<HTMLInputElement>;
    bindCueViewModeKeyboardShortcut: () => void;
    unbindCueViewModeKeyboardShortcut: () => void;
    trackId: string;
}

interface Option {
    value: string;
    label: string;
}

const onEnterPopover = (props: Props, selectRef: RefObject<Select>): void => {
    props.unbindCueViewModeKeyboardShortcut();
    // @ts-ignore since menuListRef uses React.Ref<any> type firstElementChild can be found as a property
    selectRef?.current?.menuListRef?.firstElementChild?.focus();
};

const onExitPopover = (props: Props): void => {
    props.editorRef?.current?.focus();
    props.bindCueViewModeKeyboardShortcut();
};

const ignoreKeyword = (props: Props, matchText: string, spellCheckMatch: Match, dispatch: Dispatch<AppThunk>): void => {
    addIgnoredKeyword(props.trackId, matchText, spellCheckMatch.rule.id);
    dispatch(removeIgnoredSpellcheckedMatchesFromAllCues());
    dispatch(validateCorruptedCues(matchText));
    dispatch(updateMatchedCues());
};

const onOptionSelected = (props: Props, spellCheckMatch: Match, matchText: string , dispatch: Dispatch<AppThunk>) =>
    (optionValueType: OnChangeValue<Option, false>): void => {
    const option = optionValueType as Option;
    if(option.value === matchText) {
        ignoreKeyword(props, matchText, spellCheckMatch, dispatch);
    }
    props.correctSpelling((option).value, props.start, props.end);
    props.setSpellCheckerMatchingOffset(null);
};

const onkeydown = (setSpellCheckerMatchingOffset: Function): KeyboardEventHandler =>
    (e: React.KeyboardEvent): void => {
    if (e.keyCode === Character.TAB || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.keyCode === Character.SPACE)) {
        e.preventDefault();
    }
    if(e.keyCode === Character.ESCAPE) {
        setSpellCheckerMatchingOffset(null);
    }
};

export const SpellCheckIssue = (props: Props): ReactElement | null => {
    const dispatch = useDispatch();
    const selectRef = useRef(null);
    const searchReplaceFind = useSelector((state: SubtitleEditState) => state.searchReplace.find);
    const menu = useRef(null);

    /**
     * Sometimes Overlay got unmounted before
     * onExit event got executed so this to ensure
     * onExit logic is done
     */
    useEffect(
        () => (): void => {
            if (searchReplaceFind === "") {
                props.editorRef?.current?.focus();
            }
            props.bindCueViewModeKeyboardShortcut();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [] // Run only once -> unmount
    );

    const spellCheckMatch = props.spellCheck.matches
        .filter(match => match.offset === props.start && match.offset + match.length === props.end)
        .pop();

    if (!spellCheckMatch) {
        return props.children;
    }

    const matchText = getMatchText(spellCheckMatch);
    const selectOptions = spellCheckMatch.replacements
        .filter((replacement) => replacement.value.trim() !== "")
        .map((replacement) => ({ value: replacement.value, label: replacement.value } as Option)
        );

    selectOptions.unshift({ value: matchText, label: "Ignore all in this track" });

    const customStyles = {
        control: () => ({ visibility: "hidden", height: "0px" }),
        container: (provided: CSSProperties) => ({ ...provided, height: "100%" }),
        menu: (provided: CSSProperties) => ({
            ...provided,
            position: "static",
            height: "100%",
            margin: 0,
            boxShadow: "none",
            borderRadius: 0,
            border: "none",
        }),
        menuList: (provided: CSSProperties) => ({ ...provided, height: "200px" })
    } as StylesConfig<Option, false>;

    // Menu Toolbox.

    const toggleMenu = (event: MouseEvent<HTMLElement>) => {
        if (menu.current) {
            (menu.current as any).toggle(event);
        }
    };

    const spellcheckId = `spellcheckIssue-${props.trackId}-${props.start}-${props.end}`;

    return (
        <>
            <span
                className="sbte-text-with-error"
                onClick={(event): void => {
                    props.setSpellCheckerMatchingOffset(
                        props.spellCheckerMatchingOffset === props.start ? null : props.start
                    );
                    toggleMenu(event);
                }}
                aria-controls={spellcheckId}
                aria-haspopup
            >
                {props.children}
            </span>
            <Menu
                ref={menu}
                popup
                id={spellcheckId}
                className="spellcheck-menu tw-w-[260px] tw-min-w-[260px] tw-p-0 tw-shadow-md"
                model={[
                    {
                        template: () => (
                            <>
                                <div className="tw-border-b tw-border-b-gray-300 tw-bg-grey-100 tw-p-2">
                                    {spellCheckMatch.message}
                                </div>
                                <div hidden={selectOptions.length === 0}>
                                    <Select
                                        onKeyDown={onkeydown(props.setSpellCheckerMatchingOffset)}
                                        ref={selectRef}
                                        menuIsOpen
                                        options={selectOptions}
                                        styles={customStyles}
                                        onChange={onOptionSelected(props, spellCheckMatch, matchText, dispatch)}
                                        classNamePrefix="spellcheck"
                                    />
                                </div>
                            </>
                        ),
                    },
                ]}
                onHide={(): void => onExitPopover(props)}
                onShow={(): void => onEnterPopover(props, selectRef)}
            />
        </>
    );
};

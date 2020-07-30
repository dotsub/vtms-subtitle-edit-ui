import React, { MutableRefObject, ReactElement, useRef, useState } from "react";
import { Overlay, Popover } from "react-bootstrap";
import Select, { Styles, ValueType } from "react-select";
import { v4 as uuidv4 } from "uuid";

import { SpellCheck } from "./model";

interface Props {
    children: ReactElement;
    spellCheck: SpellCheck;
    start: number;
    end: number;
    correctSpelling: (replacement: string, start: number, end: number) => void;
    openSpellCheckPopupId: string | null;
    setOpenSpellCheckPopupId: (id: string | null) => void;
}

const popupPlacement = (target: MutableRefObject<null>): boolean => {
    if (target !== null && target.current !== null) {
        // @ts-ignore false positive -> we do null check
        const position = target.current.getBoundingClientRect();
        return window.innerHeight - position.bottom > 320;
    }
    return true;
};

interface Option {
    value: string;
    label: string;
}

export const SpellCheckIssue = (props: Props): ReactElement | null => {
    const [spellCheckPopupId] = useState(uuidv4());
    const target = useRef(null);
    const showAtBottom = popupPlacement(target);

    const spellCheckMatch = props.spellCheck.matches
        .filter(match => match.offset === props.start && match.offset + match.length === props.end)
        .pop();
    if (!spellCheckMatch) {
        return props.children;
    }

    const selectOptions = spellCheckMatch.replacements
        .filter((replacement) => replacement.value.trim() !== "")
        .map((replacement) => ({ value: replacement.value, label: replacement.value } as Option)
    );

    const customStyles = {
        control: () => ({ visibility: "hidden", height: "0px" }),
        container: (provided) => ({ ...provided, height: "100%" }),
        menu: (provided) => ({ ...provided, position: "static", height: "100%", margin: 0 }),
        menuList: (provided) => ({ ...provided, height: "200px" })
    } as Styles;

    return (
        <span
            ref={target}
            className="sbte-text-with-error"
            onClick={
                (): void => props.setOpenSpellCheckPopupId(
                    props.openSpellCheckPopupId === spellCheckPopupId ? null : spellCheckPopupId
                )
            }
        >
            {props.children}
            <Overlay
                target={target.current}
                show={props.openSpellCheckPopupId === spellCheckPopupId}
                placement={showAtBottom ? "bottom" : "top"}
            >
                <Popover id="sbte-spell-check-popover">
                    <Popover.Title>{spellCheckMatch.message}</Popover.Title>
                    <Popover.Content hidden={selectOptions.length === 0} style={{ padding: 0 }}>
                        <Select
                            menuIsOpen
                            options={selectOptions}
                            styles={customStyles}
                            onChange={(option: ValueType<Option>): void =>
                                props.correctSpelling((option as Option).value, props.start, props.end)}
                        />
                    </Popover.Content>
                </Popover>
            </Overlay>
        </span>
    );
};
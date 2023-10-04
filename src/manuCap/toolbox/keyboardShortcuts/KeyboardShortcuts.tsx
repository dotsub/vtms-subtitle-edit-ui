import { ReactElement, useEffect, Dispatch, SetStateAction } from "react";
import { KeyCombination } from "../../utils/shortcutConstants";
import Mousetrap from "mousetrap";

interface Props {
    setShow: Dispatch<SetStateAction<boolean>>,
    show: boolean
}

const KeyboardShortcuts = ({ setShow, show }: Props): ReactElement => {
    useEffect(() => {
        const registerShortcuts = (): void => {
            Mousetrap.bind([KeyCombination.MOD_SHIFT_SLASH, KeyCombination.ALT_SHIFT_SLASH], () => {
                setShow(!show);
            });
        };
        registerShortcuts();
    }, [setShow, show]);

    return (
        <button
            onClick={() => setShow(true)}
            className="mc-keyboard-shortcuts-button flex items-center"
        >
            <i className="w-7 fa-duotone fa-keyboard text-blue-primary" />
            <span>Keyboard Shortcuts</span>
        </button>
    );
};

export default KeyboardShortcuts;

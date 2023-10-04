import KeyboardShortcutLabel from "./KeyboardShortcutLabel";
import { Dialog } from "primereact/dialog";

interface Props {
    onClose: () => void,
    show: boolean
}

const KeyboardShortcutsModal = ({ show, onClose }: Props) => (
    <Dialog
        visible={show}
        onHide={onClose}
        className="max-w-4xl"
        header="Keyboard Shortcuts"
        draggable={false}
        dismissableMask
        appendTo={document.body.querySelector("#prime-react-dialogs") as HTMLDivElement}
        resizable={false}
        footer={() => (
            <button className="sbte-btn sbte-btn-primary" onClick={onClose}>
                Close
            </button>
        )}
    >
        <div className="space-y-4">
            <KeyboardShortcutLabel character="o" name="Toggle Play / Pause" />
            <KeyboardShortcutLabel character="k" name="Toggle Play / Pause Current Cue" />
            <KeyboardShortcutLabel character="←" name="Seek Back 1 Second" />
            <KeyboardShortcutLabel character="→" name="Seek Ahead 1 Second" />
            <KeyboardShortcutLabel character="↑" name="Set Cue Start Time" />
            <KeyboardShortcutLabel character="↓" name="Set Cue End Time" />
            <KeyboardShortcutLabel character="Esc" name="Edit Previous Cue" />
            <KeyboardShortcutLabel
                hideAlternativeKey
                hideAltKey
                character="Space"
                name="Show a spelling error [You must be stepping on an spelling error word]"
            />
            <KeyboardShortcutLabel
                hideAlternativeKey
                hideAltKey
                character="b"
                name="Insert bidirectional text control code"
            />
        </div>
    </Dialog>
);

export default KeyboardShortcutsModal;

import { ReactElement } from "react";
import { os } from "platform";

export interface Props {
    character: string;
    name: string;
    hideShiftKey?: boolean | false;
    hideMetaKey?: boolean | false;
    hideAltKey?: boolean | false;
    hideAlternativeKey?: boolean | false;
}

const KeyboardShortcutLabel = (props: Props): ReactElement => {
    const commandKey = os && os.family === "OS X" ? "Command" : "Ctrl";
    return (
        <div style={{ display: "flex", alignItems: "center" }}>
            <div className={`${props.hideMetaKey? "hidden" : "flex"} items-center justify-center`}>
                <h4 className="m-0">
                    <span className="sbte-keyboard-label">
                        {commandKey}
                    </span>
                </h4>
                <span>&#160;+&#160;</span>
            </div>

            <div className={`${props.hideShiftKey? "hidden" : "flex"} items-center justify-center`}>
                <h4 className="m-0">
                    <span className="sbte-keyboard-label">
                        Shift
                    </span>
                </h4>
                <span>&#160;+&#160;</span>
            </div>
            <div className="flex items-center justify-center">
                <h4 className="m-0">
                    <span className="sbte-keyboard-label">
                        {props.character}
                    </span>
                </h4>
            </div>
            <div
                className={(props.hideAlternativeKey? "hidden" : "flex") +
                    " items-center justify-center"}
            >
                <span>&#160;&#160;&#160;or&#160;&#160;&#160;</span>
                <div className={`${props.hideAltKey? "hidden" : "flex"} items-center justify-center`}>
                    <h4 className="m-0">
                        <span className="sbte-keyboard-label">
                            Alt
                        </span>
                    </h4>
                    <span>&#160;+&#160;</span>
                </div>
                <div className={`${props.hideShiftKey? "hidden" : "flex"} items-center justify-center`}>
                    <h4 className="m-0">
                        <span className="sbte-keyboard-label">
                            Shift
                        </span>
                    </h4>
                    <span>&#160;+&#160;</span>
                </div>
                <div className="flex items-center justify-center">
                    <h4 className="m-0">
                        <span className="sbte-keyboard-label">
                            {props.character}
                        </span>
                    </h4>
                </div>
            </div>
            <span>
                <span>&#160;&#160;&#160;:&#160;&#160;&#160;</span>
                {props.name}
            </span>
        </div>
    );
};

export default KeyboardShortcutLabel;

import { ReactElement } from "react";

interface Props {
    children: ReactElement;
    offsetKey?: number;
}

export const CueExtraCharacters = (props: Props): ReactElement | null => {
    return (
        <span
            className="text-red-primary"
            data-offset-key={props.offsetKey}
        >
            {props.children}
        </span>
    );
};

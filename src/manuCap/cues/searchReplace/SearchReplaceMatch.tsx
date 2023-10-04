import { ReactElement } from "react";

const BLUE_BACKGROUND_COLOR = "#D9E9FF";

interface Props {
    children: ReactElement;
}

export const SearchReplaceMatch = (props: Props): ReactElement => (
    <span style={{ backgroundColor: BLUE_BACKGROUND_COLOR }}>
        {props.children}
    </span>
);

import { ReactElement, SyntheticEvent } from "react";
// @ts-ignore no types for react-advanced-timefield
import TimeField from "react-advanced-timefield";

import { getTimeFromString, getTimeString } from "../../utils/timeUtils";

interface Props {
    time?: number;
    onChange: (time: number) => void;
}

const styles = {
    width: "110px",
    maxWidth: "200px",
    padding: "5px",
    textAlign: "center"
};

const onChange = (props: Props, time: number): void => props.onChange(time);

const TimeEditor = (props: Props): ReactElement => {
    const handleChange = (_e: SyntheticEvent<HTMLInputElement>, timeString: string): void => {
        const time = getTimeFromString(timeString);
        onChange(props, time);
    };
    return (
        <TimeField
            className="sbte-time-input mousetrap tw-block"
            style={styles}
            value={getTimeString(props.time || 0)}
            onChange={handleChange}
            showSeconds
            showMillis
        />
    );
};

TimeEditor.defaultProps = {
    time: 0
} as Partial<Props>;

export default TimeEditor;

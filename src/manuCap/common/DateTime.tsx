import { ReactElement } from "react";
import moment from "moment";

export const getUserLocale = (): string => {
    return navigator.languages
        ? navigator.languages[0]
        : navigator.language;
};

const renderDateTime = (value: string): ReactElement => {
    const userLocale = getUserLocale();
    const locale = userLocale ? userLocale : moment.locale();
    const date = moment(value).locale(locale).format("L");
    const time = moment(value).locale(locale).format("LT");
    const dateTime = `${date}, ${time}`;
    return (
        <span>{dateTime}</span>
    );
};

interface Props {
    value?: string;
}

const DateTime = (props: Props): ReactElement =>
    props.value ? renderDateTime(props.value) : <span />;

export default DateTime;

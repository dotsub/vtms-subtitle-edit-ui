import { FunctionComponent, PropsWithChildren, MouseEvent, ReactElement, useEffect, useState } from "react";

interface Props {
    className?: string;
    onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
    toggled?: boolean;
    disabled?: boolean;
    title?: string;
    render: (toggle: boolean) => ReactElement;
}

const ToggleButton: FunctionComponent<Props> = (props: PropsWithChildren<Props>) => {
    const [toggle, setToggle] = useState(false);
    useEffect(() => {
        setToggle(props.toggled || false);
    }, [props.toggled]);
    return (
        <button
            type="button"
            className={(props.className ? props.className : "") + (toggle ? " outline-0 active" : "")}
            onClick={(event): void => {
                setToggle(!toggle);
                props.onClick && props.onClick(event);
            }}
            disabled={props.disabled}
            title={props.title}
        >
            { props.render(toggle) }
        </button>
    );
};

export default  ToggleButton;

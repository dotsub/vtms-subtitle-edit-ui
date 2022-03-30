import { MouseEvent, ReactElement, useRef } from "react";
import { CueCategory } from "../../model";
import { cueCategoryToPrettyName } from "../cueUtils";
import { Menu } from "primereact/menu";

interface Props {
    category?: CueCategory;
    onChange: (value: CueCategory) => void;
}

const CueCategoryButton = (props: Props): ReactElement => {
    const menu = useRef(null);

    const toggleMenu = (event?: MouseEvent<HTMLElement>): void => {
        if (menu.current) {
            (menu.current as any).toggle(event);
        }
    };

    const menuModel = Object.keys(cueCategoryToPrettyName).map(category => ({
        template: () => (
            <span
                onClick={(event) => {
                    props.onChange(category as CueCategory);
                    toggleMenu(event);
                }}
            >
                {cueCategoryToPrettyName[category]}
            </span>
        )
    }));

    return (
        <>
            <button
                className="dropdown-toggle btn btn-outline-secondary"
                aria-controls="cueCategoryMenu"
                aria-haspopup
                onClick={toggleMenu}
            >
                {cueCategoryToPrettyName[props.category || "DIALOGUE"]}
            </button>
            <Menu
                id="cueCategoryMenu"
                ref={menu}
                popup
                model={menuModel}
            />
        </>
    );
};

export default CueCategoryButton;

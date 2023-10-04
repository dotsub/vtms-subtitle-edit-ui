import { ReactElement } from "react";
import { FieldErrors } from "react-hook-form";

interface ErrorProps {
    errors: FieldErrors;
    field: string;
}

const JoiError = (props: ErrorProps): ReactElement | null => props.errors && props.errors[props.field]
    ? (
        <div className="text-red-light mt-2 text-sm">
            {
                props.errors[props.field].message
            }
        </div>
    ) : null;

export default JoiError;

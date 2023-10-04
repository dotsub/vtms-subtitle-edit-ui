import { ReactElement, useCallback, useState } from "react";
import * as React from "react";
import { CueComment, CueDto } from "../../model";
import { useDispatch, useSelector } from "react-redux";
import { addCueComment, deleteCueComment } from "../cuesList/cuesListActions";
import { AppThunk, ManuCapState } from "../../manuCapReducers";
import { Character } from "../../utils/shortcutConstants";
import { Tooltip } from "primereact/tooltip";
import DateTime from "../../common/DateTime";

interface Props {
    index: number;
    cue: CueDto;
    commentAuthor?: string;
}

const CueComments = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const [text, setText] = useState("");
    const currentUser = useSelector((state: ManuCapState) => state.subtitleUser);

    const addNewComment = useCallback(() => {
        if (text) {
            const newComment = {
                userId: currentUser?.userId,
                author: props.commentAuthor || "N/A",
                comment: text,
                date: new Date().toISOString()
            };
            dispatch(addCueComment(props.index, newComment));
            setText("");
        }
    }, [currentUser, dispatch, props.commentAuthor, props.index, text]);

    const getDeleteButton = (cueIndex: number, commentIndex: number): ReactElement => (
        <>
            <button
                id={`deleteCueCommentButton-${cueIndex}-${commentIndex}`}
                data-testid="sbte-delete-cue-comment-button"
                className="sbte-btn sbte-btn-primary sbte-btn-xs sbte-delete-cue-comment-button"
                data-pr-tooltip="Delete comment"
                data-pr-position="left"
                data-pr-at="left top+10"
                onClick={(): AppThunk => dispatch(deleteCueComment(cueIndex, commentIndex))}
            >
                <i className="fa-duotone fa-trash" />
            </button>
            <Tooltip
                id={`deleteCueCommentButtonTooltip-${cueIndex}-${commentIndex}`}
                target={`#deleteCueCommentButton-${cueIndex}-${commentIndex}`}
            />
        </>
    );

    return (
        <div
            className="text-base bg-white"
            style={{
                position: "relative",
                flex: "1",
                display: "flex",
                flexDirection: "column",
                borderRadius: "5px",
                padding: "10px 10px 5px 10px",
            }}
        >
            {
                props.cue.comments?.map((comment: CueComment, index: number): ReactElement => (
                    <div
                        style={{ marginBottom: "8px" }}
                        key={`cueComment-${props.index}-${index}`}
                        className="flex items-center justify-between"
                    >
                        <div>
                            <span
                                className="sbte-cue-comment-user"
                                style={{
                                    borderRadius: "5px",
                                    padding: "2px 6px",
                                    whiteSpace: "nowrap",
                                    width: "80px",
                                    marginRight: "5px",
                                    textAlign: "center",
                                    textOverflow: "ellipsis",
                                    display: "inline-block"
                                }}
                            >
                                {comment.author}
                            </span>
                            <span>{comment.comment}</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                            <span className="text-gray-500">
                                <i><DateTime value={comment.date} /></i>
                            </span>
                            {
                                comment.userId === currentUser?.userId
                                    ? getDeleteButton(props.index, index)
                                    : null
                            }
                        </div>
                    </div>
                ))
            }
            {
                !props.cue.comments || props.cue.comments.length < 1
                    ? <div style={{ marginBottom: "8px" }}>No comments</div>
                    : null
            }
            <hr
                className="border-t border-blue-light-mostly-transparent"
                style={{
                    width: "100%",
                    height: "0px",
                    marginLeft: "auto",
                    marginRight: "auto",
                    marginTop: "0",
                    marginBottom: "5px"
                }}
            />
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                <input
                    type="text"
                    value={text}
                    placeholder="Type your comment here"
                    style={{
                        borderStyle: "none",
                        width: "100%"
                    }}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setText(e.target.value)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>): void => {
                        if (e.keyCode === Character.ENTER) {
                            addNewComment();
                        }
                    }}
                />
                <button
                    type="button"
                    className="sbte-btn sbte-btn-xs sbte-btn-primary"
                    style={{ float: "right", marginLeft: "5px" }}
                    onClick={addNewComment}
                    disabled={!text}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default CueComments;

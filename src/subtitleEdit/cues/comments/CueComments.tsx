import React, { ReactElement, useState } from "react";
import { CueComment, CueDto } from "../../model";
import { useDispatch, useSelector } from "react-redux";
import { addCueComment } from "../cuesList/cuesListActions";
import { SubtitleEditState } from "../../subtitleEditReducers";

interface Props {
    index: number;
    cue: CueDto;
}

const CueComments = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const [text, setText] = useState("");
    const currentUser = useSelector((state: SubtitleEditState) => state.subtitleUser);
    const task = useSelector((state: SubtitleEditState) => state.cuesTask);
    const isReviewTask = task?.type === "TASK_REVIEW";
    const commentType = isReviewTask ? "Reviewer" : "Linguist";

    return (
        <div className="sbte-cue-comments sbte-medium-font">
            {
                props.cue.comments?.map((comment: CueComment): ReactElement => (
                    <div className="sbte-cue-comment">
                        <span className="sbte-cue-comment-user">{comment.userName}</span>
                        <span> {comment.comment} </span>
                        <span className="sbte-cue-comment-date sbte-light-gray-text"><i>{comment.date}</i></span>
                    </div>
                ))
            }
            {
                !props.cue.comments || props.cue.comments.length < 1
                    ? <div className="sbte-cue-comment">No comments</div>
                    : null
            }
            <hr style={{
                borderTop: "2px solid lightgray",
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
                    className="sbte-cue-comment-input"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setText(e.target.value)}
                />
                <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    style={{ float: "right" }}
                    onClick={(): void => {
                        const newComment = {
                            userName: currentUser?.systemAdmin ? "Admin" : commentType,
                            comment: text,
                            date: new Date().toLocaleString()
                        };
                        dispatch(addCueComment(props.index, newComment));
                        setText("");
                    }}
                    disabled={!text}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default CueComments;


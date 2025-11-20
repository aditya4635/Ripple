import { CheckCheck, Trash2 } from "lucide-react";
import { formatMessageTime } from "../lib/utils";
import { getAvatarUrl } from "../lib/avatarUtils";

const MessageBubble = ({ 
  message, 
  authUser, 
  selectedUser, 
  isConsecutive, 
  isLastInGroup, 
  deleteMessage, 
  handleImageClick 
}) => {
  const isMyMessage = message.senderId === authUser._id;
  const chatClassName = isMyMessage ? "chat-end" : "chat-start";
  const bubbleColorClass = isMyMessage ? "message-bubble-sent" : "message-bubble-received";
  const shakeClass = message.shouldShake ? "shake" : ""; // Assuming you might add shake animation later

  return (
    <div className={`chat ${chatClassName} animate-slide-up ${isConsecutive ? "mt-0.5" : "mt-4"}`}>
      <div className="chat-image avatar">
        <div className={`size-10 rounded-full border border-base-300 overflow-hidden bg-base-200 shadow-sm ${!isLastInGroup ? "invisible" : ""}`}>
          <img
            src={isMyMessage ? getAvatarUrl(authUser) : getAvatarUrl(selectedUser)}
            alt="profile pic"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'block';
            }}
          />
        </div>
      </div>

      <div className="chat-bubble bg-transparent p-0 shadow-none flex items-end gap-2 group">
        {/* Sent Message: Time & Status on Left */}
        {isMyMessage && (
          <div className="flex items-center gap-1 mb-1 shrink-0 self-end">
             {/* Delete Dropdown - Visible on Hover */}
            {!message.isDeleted && (
              <div className="dropdown dropdown-top dropdown-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-xs btn-circle text-error hover:bg-error/10" title="Delete message">
                  <Trash2 className="size-3" />
                </div>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40 border border-base-300">
                  <li><a onClick={() => deleteMessage(message._id, "me")} className="text-base-content">Delete for me</a></li>
                  <li><a onClick={() => deleteMessage(message._id, "everyone")} className="text-base-content">Delete for everyone</a></li>
                </ul>
              </div>
            )}

            {/* Time & Read Receipt - Always Visible or handled as per design */}
            <div className="flex flex-col items-end">
                <time className="text-[10px] text-base-content/50">
                  {formatMessageTime(message.createdAt)}
                </time>
                {message.isRead ? (
                  <CheckCheck className="size-3 text-blue-500" />
                ) : (
                  <CheckCheck className="size-3 text-base-content/50" />
                )}
            </div>
          </div>
        )}

        {/* Message Content Bubble */}
        <div className={`flex flex-col p-3 max-w-sm ${bubbleColorClass} ${message.isDeleted ? "italic opacity-70" : ""}`}>
          {message.image && (
            <img
              src={message.image}
              alt="Attachment"
              className="sm:max-w-[200px] rounded-xl mb-2 border border-base-300/20 cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
              onClick={() => handleImageClick(message.image)}
            />
          )}
          {message.text && <p className="leading-relaxed">{message.text}</p>}
        </div>

        {/* Received Message: Time on Right */}
        {!isMyMessage && (
          <div className="flex items-center gap-1 mb-1 shrink-0 self-end">
             {/* Delete Dropdown - Visible on Hover */}
             {!message.isDeleted && (
              <div className="dropdown dropdown-top dropdown-start opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-xs btn-circle text-error hover:bg-error/10" title="Delete message">
                  <Trash2 className="size-3" />
                </div>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40 border border-base-300">
                  <li><a onClick={() => deleteMessage(message._id, "me")} className="text-base-content">Delete for me</a></li>
                </ul>
              </div>
            )}
            <time className="text-[10px] text-base-content/50">
              {formatMessageTime(message.createdAt)}
            </time>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;

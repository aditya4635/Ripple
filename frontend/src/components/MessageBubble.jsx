import { CheckCheck, Trash2, MoreVertical, Forward } from "lucide-react";
import { formatMessageTime } from "../lib/utils";
import { getAvatarUrl } from "../lib/avatarUtils";

const MessageBubble = ({ 
  message, 
  authUser, 
  selectedUser, 
  isConsecutive, 
  isLastInGroup, 
  deleteMessage, 
  handleImageClick,
  onForward,
  isSelectionMode,
  isSelected,
  onToggleSelection,
  messageIndex
}) => {
  const isMyMessage = message.senderId === authUser._id;
  const chatClassName = isMyMessage ? "chat-end" : "chat-start";
  const bubbleColorClass = isMyMessage ? "message-bubble-sent" : "message-bubble-received";
  
  // Use dropdown-bottom for the first 3 messages to avoid clipping
  const dropdownDirection = messageIndex < 3 ? "dropdown-bottom" : "dropdown-top";

  const handleBubbleClick = () => {
    if (isSelectionMode) {
      onToggleSelection(message._id);
    }
  };

  return (
    <div className={`chat ${chatClassName} animate-slide-up ${isConsecutive ? "mt-0.5" : "mt-4"} ${isSelectionMode ? "cursor-pointer hover:opacity-80" : ""}`} onClick={handleBubbleClick}>
      <div className="chat-image avatar">
        {isSelectionMode ? (
           <div className="size-10 flex items-center justify-center">
             <input 
                type="checkbox" 
                checked={isSelected} 
                readOnly 
                className="checkbox checkbox-primary checkbox-sm" 
             />
           </div>
        ) : (
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
        )}
      </div>

      <div className={`chat-bubble bg-transparent p-0 shadow-none flex items-end gap-2 group ${isSelected ? "opacity-100" : ""}`}>
        {/* Sent Message: Time & Status on Left */}
        {isMyMessage && (
          <div className="flex items-center gap-1 mb-1 shrink-0 self-end">
             {/* Options Dropdown - Visible on Hover - HIDDEN IN SELECTION MODE */}
            {!message.isDeleted && !isSelectionMode && (
              <div className={`dropdown ${dropdownDirection} dropdown-end opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                <div tabIndex={0} role="button" className="btn btn-ghost btn-xs btn-circle text-base-content/50 hover:bg-base-200" title="Options">
                  <MoreVertical className="size-3" />
                </div>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-48 border border-base-300">
                  <li><a onClick={() => onToggleSelection(message._id)} className="text-base-content gap-3">Select</a></li>
                  <li><a onClick={() => onForward(message)} className="text-base-content gap-3"><Forward className="size-4" /> Forward</a></li>
                  <div className="divider my-1"></div>
                  <li><a onClick={() => deleteMessage(message._id, "me")} className="text-error gap-3"><Trash2 className="size-4" /> Delete for me</a></li>
                  <li><a onClick={() => deleteMessage(message._id, "everyone")} className="text-error gap-3"><Trash2 className="size-4" /> Delete for everyone</a></li>
                </ul>
              </div>
            )}

            {/* Time & Read Receipt */}
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
        <div className={`flex flex-col p-3 max-w-sm ${bubbleColorClass} ${message.isDeleted ? "italic opacity-70" : ""} ${isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-base-100" : ""}`}>
          {message.image && (
            <img
              src={message.image}
              alt="Attachment"
              className="sm:max-w-[200px] rounded-xl mb-2 border border-base-300/20 cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
              onClick={() => !isSelectionMode && handleImageClick(message.image)}
            />
          )}
          {message.text && <p className="leading-relaxed">{message.text}</p>}
        </div>

        {/* Received Message: Time on Right */}
        {!isMyMessage && (
          <div className="flex items-center gap-1 mb-1 shrink-0 self-end">
             {/* Options Dropdown - Visible on Hover - HIDDEN IN SELECTION MODE */}
             {!message.isDeleted && !isSelectionMode && (
              <div className={`dropdown ${dropdownDirection} dropdown-start opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                <div tabIndex={0} role="button" className="btn btn-ghost btn-xs btn-circle text-base-content/50 hover:bg-base-200" title="Options">
                  <MoreVertical className="size-3" />
                </div>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-48 border border-base-300">
                  <li><a onClick={() => onToggleSelection(message._id)} className="text-base-content gap-3">Select</a></li>
                  <li><a onClick={() => onForward(message)} className="text-base-content gap-3"><Forward className="size-4" /> Forward</a></li>
                  <div className="divider my-1"></div>
                  <li><a onClick={() => deleteMessage(message._id, "me")} className="text-error gap-3"><Trash2 className="size-4" /> Delete for me</a></li>
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

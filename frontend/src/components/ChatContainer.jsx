import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { getAvatarUrl } from "../lib/avatarUtils";
import ImageViewerModal from "./ImageViewerModal";
import { Check, CheckCheck, Trash2, X, Forward } from "lucide-react";
import MessageBubble from "./MessageBubble";
import ForwardMessageModal from "./ForwardMessageModal";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    subscribeToTypingEvents,
    unsubscribeFromTypingEvents,
    deleteMessage,
    sendMessage,
    isSelectionMode,
    selectedMessages,
    toggleMessageSelection,
    clearSelection,
    deleteMultipleMessages
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  // Forwarding state
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
  const [messageToForward, setMessageToForward] = useState(null); // Can be single message or null if bulk

  const handleImageClick = (imageUrl) => {
    setViewerImage(imageUrl);
    setShowImageViewer(true);
  };

  const handleForwardClick = (message) => {
    setMessageToForward(message);
    setIsForwardModalOpen(true);
  };

  const handleBulkForwardClick = () => {
    if (selectedMessages.length === 0) return;
    setMessageToForward(null); // Indicates bulk forward
    setIsForwardModalOpen(true);
  };

  const handleForwardMessage = async (userId) => {
    try {
      if (messageToForward) {
        // Single message forward
        await sendMessage({
          text: messageToForward.text,
          image: messageToForward.image,
        }, userId);
      } else {
        // Bulk forward
        // We need to find the actual message objects for the selected IDs
        const messagesToForward = messages.filter(m => selectedMessages.includes(m._id));
        // Send them sequentially or in parallel
        // Parallel might be better but let's do sequential to keep order roughly
        for (const msg of messagesToForward) {
             await sendMessage({
                text: msg.text,
                image: msg.image,
              }, userId);
        }
        clearSelection();
      }
      
      setIsForwardModalOpen(false);
      setMessageToForward(null);
    } catch (error) {
      console.error("Failed to forward message:", error);
    }
  };

  useEffect(() => {
    getMessages(selectedUser._id);
    clearSelection(); // Clear selection when changing chat

    subscribeToMessages();
    subscribeToTypingEvents();

    return () => {
      unsubscribeFromMessages();
      unsubscribeFromTypingEvents();
      clearSelection();
    };
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages, subscribeToTypingEvents, unsubscribeFromTypingEvents, clearSelection]);

  useEffect(() => {
    if (messageEndRef.current && messages && !isSelectionMode) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isSelectionMode]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto backdrop-blur-[2px] relative" style={{backgroundColor: 'hsl(var(--b1) / 0.7)'}}>
      {/* Selection Header Overlay */}
      {isSelectionMode ? (
        <div className="absolute top-0 left-0 right-0 z-20 bg-base-100 border-b border-base-300 p-2 px-4 flex items-center justify-between shadow-md animate-slide-down">
          <div className="flex items-center gap-3">
            <button onClick={clearSelection} className="btn btn-ghost btn-circle btn-sm">
              <X className="size-5" />
            </button>
            <span className="font-medium text-lg">{selectedMessages.length} Selected</span>
          </div>
          <div className="flex items-center gap-2">
             <button onClick={handleBulkForwardClick} className="btn btn-ghost btn-circle" title="Forward">
              <Forward className="size-5" />
            </button>
            
            <div className="dropdown dropdown-end dropdown-bottom">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle text-error" title="Delete">
                <Trash2 className="size-5" />
              </div>
              <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 border border-base-300">
                <li><a onClick={() => deleteMultipleMessages("me")} className="text-error gap-3">Delete for me</a></li>
                {messages.filter(m => selectedMessages.includes(m._id)).every(m => m.senderId === authUser._id) && (
                  <li><a onClick={() => deleteMultipleMessages("everyone")} className="text-error gap-3">Delete for everyone</a></li>
                )}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <ChatHeader />
      )}

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar pt-20"> {/* Added pt-20 to account for header */}
        {messages.map((message, index) => {
          const isConsecutive = index > 0 && messages[index - 1].senderId === message.senderId;
          const isLastInGroup = index === messages.length - 1 || messages[index + 1].senderId !== message.senderId;
          
          return (
            <div key={message._id} ref={messageEndRef}>
              <MessageBubble
                message={message}
                authUser={authUser}
                selectedUser={selectedUser}
                isConsecutive={isConsecutive}
                isLastInGroup={isLastInGroup}
                deleteMessage={deleteMessage}
                handleImageClick={handleImageClick}
                onForward={handleForwardClick}
                isSelectionMode={isSelectionMode}
                isSelected={selectedMessages.includes(message._id)}
                onToggleSelection={toggleMessageSelection}
                messageIndex={index}
              />
            </div>
          );
        })}
      </div>



      {/* Image Viewer Modal */}
      <ImageViewerModal
        isOpen={showImageViewer}
        onClose={() => setShowImageViewer(false)}
        imageUrl={viewerImage}
        userName={selectedUser.fullName}
      />
      
      {/* Forward Message Modal */}
      <ForwardMessageModal
        isOpen={isForwardModalOpen}
        onClose={() => setIsForwardModalOpen(false)}
        onForward={handleForwardMessage}
      />
    </div>
  );
};
export default ChatContainer;

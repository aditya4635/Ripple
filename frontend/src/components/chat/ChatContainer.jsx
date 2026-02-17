import { useChatStore } from "../../stores/chatStore";
import { useEffect, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "../shared/MessageSkeleton";
import { useAuthStore } from "../../stores/authStore";
import ImageViewerModal from "../shared/ImageViewerModal";
import { Trash2, X, Forward } from "lucide-react";
import MessageBubble from "./MessageBubble";
import ForwardMessageModal from "./ForwardMessageModal";
import { messageApi } from "../../api/index";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    deleteMessage,
    isSelectionMode,
    selectedMessages,
    toggleMessageSelection,
    clearSelection,
    deleteSelectedMessages
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewerImage, setViewerImage] = useState("");

  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
  const [messageToForward, setMessageToForward] = useState(null);

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
    setMessageToForward(null);
    setIsForwardModalOpen(true);
  };

  const handleForwardMessage = async (userId) => {
    try {
      if (messageToForward) {
        await messageApi.sendMessage(userId, {
          text: messageToForward.text,
          image: messageToForward.image,
        });
      } else {
        const messagesToForward = messages.filter(m => selectedMessages.includes(m._id));
        for (const msg of messagesToForward) {
          await messageApi.sendMessage(userId, {
            text: msg.text,
            image: msg.image,
          });
        }
        clearSelection();
      }
      
      setIsForwardModalOpen(false);
      setMessageToForward(null);
    } catch {
      // Error handled by API layer
    }
  };

  useEffect(() => {
    getMessages(selectedUser._id);
    clearSelection();
    subscribeToMessages();

    return () => {
      unsubscribeFromMessages();
      clearSelection();
    };
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages, clearSelection]);

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
                <li><a onClick={() => deleteSelectedMessages("me")} className="text-error gap-3">Delete for me</a></li>
                {messages.filter(m => selectedMessages.includes(m._id)).every(m => m.senderId === authUser._id) && (
                  <li><a onClick={() => deleteSelectedMessages("everyone")} className="text-error gap-3">Delete for everyone</a></li>
                )}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <ChatHeader />
      )}

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar pt-20">
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

      <MessageInput />

      <ImageViewerModal
        isOpen={showImageViewer}
        onClose={() => setShowImageViewer(false)}
        imageUrl={viewerImage}
        userName={selectedUser.fullName}
      />
      
      <ForwardMessageModal
        isOpen={isForwardModalOpen}
        onClose={() => setIsForwardModalOpen(false)}
        onForward={handleForwardMessage}
      />
    </div>
  );
};
export default ChatContainer;

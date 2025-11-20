import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { getAvatarUrl } from "../lib/avatarUtils";
import ImageViewerModal from "./ImageViewerModal";
import { Check, CheckCheck, Trash2 } from "lucide-react";
import MessageBubble from "./MessageBubble";

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
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewerImage, setViewerImage] = useState("");

  const handleImageClick = (imageUrl) => {
    setViewerImage(imageUrl);
    setShowImageViewer(true);
  };

  useEffect(() => {
    getMessages(selectedUser._id);

    subscribeToMessages();
    subscribeToTypingEvents();

    return () => {
      unsubscribeFromMessages();
      unsubscribeFromTypingEvents();
    };
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages, subscribeToTypingEvents, unsubscribeFromTypingEvents]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

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
    <div className="flex-1 flex flex-col overflow-auto bg-base-100/40 backdrop-blur-sm">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
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
              />
            </div>
          );
        })}
      </div>

      <MessageInput />

      {/* Image Viewer Modal */}
      <ImageViewerModal
        isOpen={showImageViewer}
        onClose={() => setShowImageViewer(false)}
        imageUrl={viewerImage}
        userName={selectedUser.fullName}
      />
    </div>
  );
};
export default ChatContainer;

import { useChatStore } from "../store/useChatStore";
import { X, Trash2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { getAvatarUrl } from "../lib/avatarUtils";
import { useState } from "react";
import UserProfileModal from "./UserProfileModal";
import ImageViewerModal from "./ImageViewerModal";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, typingUsers, clearChatHistory } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewerImage, setViewerImage] = useState({ url: "", name: "" });

  const handleImageClick = (imageUrl, userName) => {
    setViewerImage({ url: imageUrl, name: userName });
    setShowImageViewer(true);
    setShowProfileModal(false);
  };

  return (
    <>
      <div className="p-2.5 glass-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="avatar cursor-pointer" onClick={() => setShowProfileModal(true)}>
              <div className="size-10 rounded-full relative border border-base-content/10 hover:ring-2 hover:ring-primary/30 transition-all shadow-md hover:shadow-lg">
                <img src={getAvatarUrl(selectedUser)} alt={selectedUser.fullName} />
              </div>
            </div>

            {/* User info */}
            <div className="cursor-pointer" onClick={() => setShowProfileModal(true)}>
              <h3 className="font-medium hover:text-primary transition-colors text-base-content/90">{selectedUser.fullName}</h3>
              <p className="text-sm text-base-content/70">
                {typingUsers.includes(selectedUser._id) ? (
                  <span className="text-primary animate-pulse font-medium">Typing...</span>
                ) : (
                  onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"
                )}
              </p>
            </div>
          </div>

          {/* Close button */}
          <div className="flex items-center gap-2">
             <button onClick={() => document.getElementById('clear_chat_modal').showModal()} className="hover:bg-base-200/60 backdrop-blur-md p-2 rounded-full transition-all duration-300 hover:scale-110" title="Clear Chat">
              <Trash2 className="size-5 text-base-content/70 hover:text-error" />
            </button>
            <button onClick={() => setSelectedUser(null)} className="hover:bg-base-200/60 backdrop-blur-md p-2 rounded-full transition-all hover:rotate-90 duration-300 hover:scale-110">
              <X className="text-base-content/70" />
            </button>
          </div>
        </div>
      </div>

      {/* Clear Chat Confirmation Modal */}
      <dialog id="clear_chat_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Clear Chat History?</h3>
          <p className="py-4">Are you sure you want to delete all messages with {selectedUser.fullName}? This action cannot be undone.</p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-ghost mr-2">Cancel</button>
              <button onClick={clearChatHistory} className="btn btn-error">Clear Chat</button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* Modals */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={selectedUser}
        onImageClick={handleImageClick}
      />
      
      <ImageViewerModal
        isOpen={showImageViewer}
        onClose={() => setShowImageViewer(false)}
        imageUrl={viewerImage.url}
        userName={viewerImage.name}
      />
    </>
  );
};
export default ChatHeader;

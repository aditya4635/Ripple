import { useChatStore } from "../store/useChatStore";
import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { getAvatarUrl } from "../lib/avatarUtils";
import { useState } from "react";
import UserProfileModal from "./UserProfileModal";
import ImageViewerModal from "./ImageViewerModal";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, typingUsers } = useChatStore();
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
              <div className="size-10 rounded-full relative border border-base-300 hover:ring-2 hover:ring-primary/20 transition-all shadow-sm">
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
          <button onClick={() => setSelectedUser(null)} className="hover:bg-base-200/50 p-2 rounded-full transition-colors hover:rotate-90 duration-300">
            <X className="text-base-content/70" />
          </button>
        </div>
      </div>

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

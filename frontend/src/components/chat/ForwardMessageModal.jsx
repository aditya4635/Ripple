import { useEffect, useState } from "react";
import { useChatStore } from "../../stores/chatStore";
import { useAuthStore } from "../../stores/authStore";
import { Search, X, Send } from "lucide-react";
import Avatar from "../shared/Avatar";

const ForwardMessageModal = ({ isOpen, onClose, onForward }) => {
  const { users, getUsers } = useChatStore();
  const { authUser } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      getUsers();
      setSearchTerm("");
      setSelectedUserId(null);
    }
  }, [isOpen, getUsers]);

  if (!isOpen) return null;

  const filteredUsers = users.filter(
    (user) =>
      user._id !== authUser._id &&
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleForward = () => {
    if (selectedUserId) {
      onForward(selectedUserId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-base-100 rounded-2xl shadow-xl w-full max-w-md border border-base-300 flex flex-col max-h-[80vh] animate-scale-up">
        <div className="p-4 border-b border-base-300 flex justify-between items-center">
          <h3 className="font-semibold text-lg">Forward</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X className="size-5" />
          </button>
        </div>

        <div className="p-4 pb-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="size-5 text-base-content/40" />
            </div>
            <input
              type="text"
              className="input input-bordered w-full pl-10 rounded-xl bg-base-200/50 focus:bg-base-200 transition-colors"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-base-content/50">No users found</div>
          ) : (
            filteredUsers.map((user) => (
              <button
                key={user._id}
                onClick={() => setSelectedUserId(user._id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  selectedUserId === user._id
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-base-200 border border-transparent"
                }`}
              >
                <Avatar user={user} size="sm" />
                <div className="text-left flex-1 min-w-0">
                  <div className="font-medium truncate">{user.fullName}</div>
                  <div className="text-xs text-base-content/50 truncate">{user.email}</div>
                </div>
                {selectedUserId === user._id && (
                  <div className="size-5 rounded-full bg-primary flex items-center justify-center">
                    <Send className="size-3 text-primary-content" />
                  </div>
                )}
              </button>
            ))
          )}
        </div>

        <div className="p-4 border-t border-base-300 flex justify-end gap-2">
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button
            onClick={handleForward}
            disabled={!selectedUserId}
            className="btn btn-primary px-6"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForwardMessageModal;

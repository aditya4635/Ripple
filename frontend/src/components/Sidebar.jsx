import { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Users } from "lucide-react";
import { getAvatarUrl } from "../lib/avatarUtils";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading, subscribeToUnreadMessages, unsubscribeFromUnreadMessages, markMessagesAsRead } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    getUsers();
    subscribeToUnreadMessages();
    return () => unsubscribeFromUnreadMessages();
  }, [getUsers, subscribeToUnreadMessages, unsubscribeFromUnreadMessages]);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    if (user.unreadCount > 0) {
      markMessagesAsRead(user._id);
    }
  };

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 sidebar-glass flex flex-col transition-all duration-200">
      <div className="border-b border-base-content/5 w-full p-5 glass-header">
        <div className="flex items-center gap-2">
          <Users className="size-6 text-primary" />
          <span className="font-medium hidden lg:block text-lg">Contacts</span>
        </div>
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2 hover:opacity-80 transition-opacity">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm checkbox-primary rounded-md"
            />
            <span className="text-sm font-medium text-base-content/70">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3 px-2 space-y-1 custom-scrollbar">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => handleUserSelect(user)}
            className={`
              w-full p-3 flex items-center gap-3 rounded-smooth transition-all duration-300
              hover:bg-base-200/60 hover:backdrop-blur-md hover:scale-[1.02] hover:shadow-md active:scale-[0.98]
              ${selectedUser?._id === user._id ? "bg-primary/10 ring-2 ring-primary/30 shadow-glass backdrop-blur-md" : ""}
            `}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={getAvatarUrl(user)}
                alt={user.name}
                className="size-12 object-cover rounded-full border-2 border-base-content/10 shadow-md"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-base-100 shadow-sm"
                />
              )}
            </div>

            {/* User info - only visible on larger screens */}
            <div className="hidden lg:block text-left min-w-0 flex-1">
              <div className="flex justify-between items-center">
                <div className="font-medium truncate text-sm text-base-content/90">{user.fullName}</div>
                {user.unreadCount > 0 && (
                  <span className="badge badge-sm badge-primary ml-2 shadow-sm animate-scale-in">
                    {user.unreadCount}
                  </span>
                )}
              </div>
              <div className="text-xs text-base-content/60">
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-8">No online users</div>
        )}
      </div>
    </aside>
  );
};
export default Sidebar;

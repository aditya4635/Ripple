import { X, Mail, Calendar, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "./Avatar";

const UserProfileModal = ({ isOpen, onClose, user, onImageClick }) => {
  if (!isOpen || !user) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-base-200 rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-primary/10 p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-base-100/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col items-center">
              <div 
                className="relative cursor-pointer group"
                onClick={() => {
                  if (user.profilePic) {
                    onImageClick(user.profilePic, user.fullName);
                  }
                }}
              >
                <Avatar
                  user={user}
                  size="xl"
                  className="group-hover:scale-105 transition-transform duration-200 border-4 border-base-100"
                />
                {user.profilePic && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-full transition-colors duration-200 flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 text-xs">View</span>
                  </div>
                )}
              </div>
              
              <h2 className="mt-4 text-2xl font-bold">{user.fullName}</h2>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 p-3 bg-base-300 rounded-lg">
              <Mail className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-base-content/60">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-base-300 rounded-lg">
              <User className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-base-content/60">Full Name</p>
                <p className="font-medium">{user.fullName}</p>
              </div>
            </div>

            {user.createdAt && (
              <div className="flex items-center gap-3 p-3 bg-base-300 rounded-lg">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-base-content/60">Member Since</p>
                  <p className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UserProfileModal;

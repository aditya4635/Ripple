import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, Trash2, Edit2, Check, X } from "lucide-react";
import { getAvatarUrl } from "../lib/avatarUtils";
import { validateImageFile, compressImage, fileToBase64 } from "../lib/imageUtils";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile, initiateEmailChange, verifyEmailChange } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  // Edit mode states
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [editedFullName, setEditedFullName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  
  // Email OTP modal states
  const [showEmailOTPModal, setShowEmailOTPModal] = useState(false);
  const [emailOTP, setEmailOTP] = useState("");

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Client-side validation
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      e.target.value = ''; // Clear file input
      return;
    }

    setIsUploadingImage(true);
    let uploadAborted = false;
    
    // Set upload timeout (30 seconds)
    const uploadTimeout = setTimeout(() => {
      uploadAborted = true;
      toast.dismiss('compress');
      toast.dismiss('upload');
      toast.error('Upload timed out. Please try again with a smaller image.');
      setIsUploadingImage(false);
      setSelectedImg(null);
    }, 30000); // 30 seconds
    
    try {
      // Show preview immediately
      const previewUrl = URL.createObjectURL(file);
      setSelectedImg(previewUrl);

      // Compress image if larger than 1MB
      let base64Image;
      const fileSizeInMB = file.size / (1024 * 1024);
      
      if (fileSizeInMB > 1) {
        toast.loading('Compressing image...', { id: 'compress' });
        base64Image = await compressImage(file, 1);
        toast.dismiss('compress');
      } else {
        base64Image = await fileToBase64(file);
      }

      // Check if upload was aborted
      if (uploadAborted) {
        URL.revokeObjectURL(previewUrl);
        return;
      }

      // Upload to server with timeout check
      toast.loading('Uploading...', { id: 'upload' });
      const success = await updateProfile({ profilePic: base64Image });
      
      // Clear timeout if upload completes
      clearTimeout(uploadTimeout);
      
      toast.dismiss('upload');
      
      // Check again if upload was aborted during the request
      if (uploadAborted) {
        URL.revokeObjectURL(previewUrl);
        return;
      }
      
      if (success) {
        toast.success("Profile picture updated successfully!");
      } else {
        // Revert to old image on failure
        setSelectedImg(null);
        toast.error("Failed to update profile picture");
      }
      
      // Clean up preview URL
      URL.revokeObjectURL(previewUrl);
    } catch (error) {
      // Clear timeout on error
      clearTimeout(uploadTimeout);
      
      console.error('Image upload error:', error);
      setSelectedImg(null);
      
      if (!uploadAborted) {
        toast.dismiss('compress');
        toast.dismiss('upload');
        toast.error(error.message || 'Failed to upload image. Please try again.');
      }
    } finally {
      if (!uploadAborted) {
        setIsUploadingImage(false);
      }
      e.target.value = ''; // Clear file input for re-upload
    }
  };

  const handleRemoveProfilePic = async () => {
    if (window.confirm("Are you sure you want to remove your profile picture?")) {
      setIsUploadingImage(true);
      try {
        const success = await updateProfile({ profilePic: "" });
        if (success) {
          setSelectedImg(null);
          toast.success("Profile picture removed!");
        } else {
          toast.error("Failed to remove profile picture");
        }
      } catch (error) {
        toast.error("Failed to remove profile picture");
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  const handleEditName = () => {
    setEditedFullName(authUser?.fullName || "");
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (!editedFullName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    const success = await updateProfile({ fullName: editedFullName });
    if (success) {
      setIsEditingName(false);
    }
  };

  const handleCancelName = () => {
    setIsEditingName(false);
    setEditedFullName("");
  };

  const handleEditEmail = () => {
    setEditedEmail(authUser?.email || "");
    setIsEditingEmail(true);
  };

  const handleSaveEmail = async () => {
    if (!editedEmail.trim()) {
      toast.error("Email cannot be empty");
      return;
    }
    const success = await initiateEmailChange(editedEmail);
    if (success) {
      setIsEditingEmail(false);
      setShowEmailOTPModal(true);
    }
  };

  const handleCancelEmail = () => {
    setIsEditingEmail(false);
    setEditedEmail("");
  };

  const handleVerifyEmailOTP = async () => {
    if (!emailOTP.trim()) {
      toast.error("Please enter OTP");
      return;
    }
    const success = await verifyEmailChange(emailOTP);
    if (success) {
      setShowEmailOTPModal(false);
      setEmailOTP("");
      setEditedEmail("");
    }
  };

  const handleCloseOTPModal = () => {
    setShowEmailOTPModal(false);
    setEmailOTP("");
  };

  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold ">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          {/* avatar upload section */}

          {authUser && (
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <img
                  src={selectedImg || getAvatarUrl(authUser)}
                  alt="Profile"
                  className="size-32 rounded-full object-cover border-4 "
                  onError={(e) => {
                    // Fallback if SVG fails to load
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%234ECDC4'/%3E%3Ctext x='50' y='50' font-size='40' fill='white' text-anchor='middle' dominant-baseline='central' font-family='Arial'%3E?%3C/text%3E%3C/svg%3E";
                  }}
                />
                <label
                  htmlFor="avatar-upload"
                  className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUploadingImage || isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
                >
                  <Camera className="w-5 h-5 text-base-200" />
                  <input
                    type="file"
                    id="avatar-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploadingImage || isUpdatingProfile}
                  />
                </label>
              </div>
              
              <div className="flex gap-2">
                {authUser.profilePic && (
                  <button
                    onClick={handleRemoveProfilePic}
                    className="btn btn-error btn-sm"
                    disabled={isUploadingImage || isUpdatingProfile}
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove Picture
                  </button>
                )}
              </div>

              <p className="text-sm text-zinc-400">
                {isUploadingImage 
                  ? "Uploading..." 
                  : isUpdatingProfile 
                    ? "Updating..." 
                    : "Click the camera icon to update your photo"}
              </p>
            </div>
          )}


          <div className="space-y-6">
            {/* Full Name Section */}
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </div>
                {!isEditingName && (
                  <button
                    onClick={handleEditName}
                    className="btn btn-ghost btn-xs"
                    disabled={isUpdatingProfile}
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </button>
                )}
              </div>
              
              {isEditingName ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editedFullName}
                    onChange={(e) => setEditedFullName(e.target.value)}
                    className="input input-bordered flex-1"
                    placeholder="Enter your full name"
                    disabled={isUpdatingProfile}
                  />
                  <button
                    onClick={handleSaveName}
                    className="btn btn-success btn-sm"
                    disabled={isUpdatingProfile}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCancelName}
                    className="btn btn-ghost btn-sm"
                    disabled={isUpdatingProfile}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.fullName}</p>
              )}
            </div>

            {/* Email Section */}
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </div>
                {!isEditingEmail && (
                  <button
                    onClick={handleEditEmail}
                    className="btn btn-ghost btn-xs"
                    disabled={isUpdatingProfile}
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </button>
                )}
              </div>
              
              {isEditingEmail ? (
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={editedEmail}
                    onChange={(e) => setEditedEmail(e.target.value)}
                    className="input input-bordered flex-1"
                    placeholder="Enter your email"
                    disabled={isUpdatingProfile}
                  />
                  <button
                    onClick={handleSaveEmail}
                    className="btn btn-success btn-sm"
                    disabled={isUpdatingProfile}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCancelEmail}
                    className="btn btn-ghost btn-sm"
                    disabled={isUpdatingProfile}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.email}</p>
                  {authUser?.pendingEmail && (
                    <div className="badge badge-warning gap-2">
                      <span className="text-xs">Verification Pending: {authUser.pendingEmail}</span>
                      <button
                        onClick={() => setShowEmailOTPModal(true)}
                        className="text-xs underline hover:no-underline"
                      >
                        Verify Now
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 bg-base-200 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-base-300">
                <span className="text-base-content/70">Member Since</span>
                <span className="font-medium">
                  {authUser?.createdAt 
                    ? new Date(authUser.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })
                    : 'N/A'
                  }
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-base-content/70">Account Status</span>
                <span className="text-success font-medium">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email OTP Modal */}
      {showEmailOTPModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-base-100 rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
            <h3 className="text-xl font-semibold mb-2">Verify Your New Email</h3>
            <p className="text-sm text-base-content/70 mb-4">
              We sent a 6-digit code to <span className="font-semibold">{editedEmail || authUser?.pendingEmail}</span>
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text">Enter OTP</span>
                </label>
                <input
                  type="text"
                  value={emailOTP}
                  onChange={(e) => setEmailOTP(e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="000000"
                  maxLength={6}
                  disabled={isUpdatingProfile}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleVerifyEmailOTP}
                  className="btn btn-primary flex-1"
                  disabled={isUpdatingProfile}
                >
                  {isUpdatingProfile ? "Verifying..." : "Verify"}
                </button>
                <button
                  onClick={handleCloseOTPModal}
                  className="btn btn-ghost"
                  disabled={isUpdatingProfile}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ProfilePage;

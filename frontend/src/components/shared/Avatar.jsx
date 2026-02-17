import { useMemo, useState } from "react";

const AVATAR_COLORS = [
  "bg-red-400", "bg-teal-400", "bg-sky-400", "bg-orange-300",
  "bg-emerald-400", "bg-yellow-400", "bg-purple-400", "bg-blue-300",
  "bg-amber-400", "bg-green-400", "bg-pink-400", "bg-indigo-400",
];

const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getColorClass = (name) => {
  const index = (name?.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

const isValidPicUrl = (pic) => {
  if (!pic || pic === "") return false;
  if (pic.startsWith("data:image/svg+xml")) return false;
  return true;
};

const Avatar = ({
  user,
  size = "md",
  className = "",
  onClick,
  showStatus,
  isOnline,
}) => {
  const [imgError, setImgError] = useState(false);
  const hasProfilePic = isValidPicUrl(user?.profilePic) && !imgError;
  const initials = useMemo(() => getInitials(user?.fullName), [user?.fullName]);
  const colorClass = useMemo(() => getColorClass(user?.fullName), [user?.fullName]);

  const sizeClasses = {
    xs: "size-8 text-xs",
    sm: "size-10 text-sm",
    md: "size-12 text-base",
    lg: "size-16 text-xl",
    xl: "size-24 text-3xl",
    "2xl": "size-32 text-4xl",
  };

  const statusSizes = {
    xs: "size-2",
    sm: "size-2.5",
    md: "size-3",
    lg: "size-3.5",
    xl: "size-4",
    "2xl": "size-5",
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const statusSize = statusSizes[size] || statusSizes.md;

  return (
    <div className={`relative inline-block ${onClick ? "cursor-pointer" : ""} ${className}`} onClick={onClick}>
      <div
        className={`${sizeClass} rounded-full overflow-hidden border-2 border-base-content/10 shadow-md
          ${hasProfilePic ? "" : `${colorClass} flex items-center justify-center font-bold text-white select-none`}`}
      >
        {hasProfilePic ? (
          <img
            src={user.profilePic}
            alt={user?.fullName || "User"}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          initials
        )}
      </div>

      {showStatus && isOnline && (
        <span
          className={`absolute bottom-0 right-0 ${statusSize} bg-green-500
            rounded-full ring-2 ring-base-100 shadow-sm`}
        />
      )}
    </div>
  );
};

export default Avatar;

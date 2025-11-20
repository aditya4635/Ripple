export const getAvatarUrl = (user) => {
  if (user?.profilePic && user.profilePic !== "") {
    return user.profilePic;
  }
  
  // Generate a default avatar with initials
  const initials = user?.fullName
    ?.split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";
  
  // Generate a color based on the user's name
  const colors = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8",
    "#F7DC6F", "#BB8FCE", "#85C1E2", "#F8B739", "#52B788"
  ];
  
  const colorIndex = (user?.fullName?.charCodeAt(0) || 0) % colors.length;
  const bgColor = colors[colorIndex];
  
  // Create SVG avatar with larger dimensions for better quality
  const svg = `<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="800" fill="${bgColor}"/><text x="400" y="400" font-size="320" fill="white" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif" font-weight="bold">${initials}</text></svg>`;
  
  // Use encodeURIComponent instead of btoa for better Unicode support
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

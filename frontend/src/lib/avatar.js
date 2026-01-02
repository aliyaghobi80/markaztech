// مسیر: src/lib/avatar.js

/**
 * Get full avatar URL from relative path
 * @param {string} avatarPath - The avatar path (could be relative or absolute)
 * @returns {string|null} - Full avatar URL or null if no avatar
 */
export const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return null;
  
  // If already a full URL, return as is
  if (avatarPath.startsWith('http')) return avatarPath;
  
  // Construct full URL with backend base URL
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
  return `${baseUrl}${avatarPath}`;
};

/**
 * Avatar component with error handling
 * @param {Object} props - Component props
 * @param {string} props.src - Avatar source path
 * @param {string} props.alt - Alt text
 * @param {string} props.className - CSS classes
 * @param {React.ReactNode} props.fallback - Fallback component when no avatar
 */
export const Avatar = ({ src, alt = "پروفایل", className = "", fallback = null }) => {
  const avatarUrl = getAvatarUrl(src);
  
  if (!avatarUrl) {
    return fallback;
  }
  
  return (
    <img 
      src={avatarUrl}
      alt={alt}
      className={className}
      onError={(e) => {
        console.error("Avatar failed to load:", avatarUrl);
        e.target.style.display = 'none';
        // Show fallback if available
        if (fallback && e.target.parentNode) {
          const fallbackElement = document.createElement('div');
          fallbackElement.innerHTML = fallback;
          e.target.parentNode.appendChild(fallbackElement);
        }
      }}
      onLoad={() => {
        console.log("Avatar loaded successfully:", avatarUrl);
      }}
    />
  );
};
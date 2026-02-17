import { useRef, useState } from "react";
import { useChatStore } from "../../stores/chatStore";
import { useAuthStore } from "../../stores/authStore";
import { Image, Send, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { validateImageFile } from "../../utils/imageUtils";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const { sendMessage, selectedUser } = useChatStore();
  const { socket } = useAuthStore();
  const typingTimeoutRef = useRef(null);

  const handleInputChange = (e) => {
    setText(e.target.value);

    if (!socket) return;

    if (e.target.value.trim().length > 0) {
      socket.emit("typing", { toUserId: selectedUser._id });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stopTyping", { toUserId: selectedUser._id });
      }, 2000);
    } else {
      socket.emit("stopTyping", { toUserId: selectedUser._id });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const { valid, error } = validateImageFile(file);
    if (!valid) {
      toast.error(error);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      compressImage(reader.result, (compressedImage) => {
        setImagePreview(compressedImage);
      });
    };
    reader.readAsDataURL(file);
  };

  const compressImage = (base64Image, callback) => {
    const img = new window.Image();
    img.src = base64Image;
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      const MAX_WIDTH = 800;
      const MAX_HEIGHT = 800;
      
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
      callback(compressedBase64);
    };
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    if (isSending) return;

    try {
      setIsSending(true);
      
      if (socket) {
        socket.emit("stopTyping", { toUserId: selectedUser._id });
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      }

      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    } catch {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-4 w-full">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-base-300 shadow-md"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-error hover:bg-error/80
              flex items-center justify-center transition-colors shadow-sm"
              type="button"
            >
              <X className="size-3 text-white" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            ref={inputRef}
            className="w-full input input-bordered rounded-full input-sm sm:input-md glass-input shadow-sm"
            placeholder="Type a message..."
            value={text}
            onChange={handleInputChange}
            disabled={isSending}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="button"
            className={`flex btn btn-circle btn-sm sm:btn-md btn-premium
                     ${imagePreview ? "text-emerald-500" : "text-base-content/40 hover:text-base-content/80"}`}
            onClick={() => fileInputRef.current?.click()}
            title="Attach Image"
            disabled={isSending}
          >
            <Image size={20} />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-primary btn-sm sm:btn-md btn-circle btn-premium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={(!text.trim() && !imagePreview) || isSending}
        >
          {isSending ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Send size={20} />
          )}
        </button>
      </form>
    </div>
  );
};
export default MessageInput;

import { X, ZoomIn, ZoomOut, Maximize2, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const ImageViewerModal = ({ isOpen, onClose, imageUrl, userName }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${userName || 'image'}_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(imageUrl, '_blank');
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const newScale = Math.min(Math.max(0.5, scale + delta), 5);
    setScale(newScale);
  };

  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = () => {
    if (scale === 1) {
      setScale(2);
    } else {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  const zoomIn = () => setScale(Math.min(scale + 0.5, 5));
  const zoomOut = () => {
    const newScale = Math.max(scale - 0.5, 0.5);
    setScale(newScale);
    if (newScale === 1) setPosition({ x: 0, y: 0 });
  };
  const resetZoom = () => { setScale(1); setPosition({ x: 0, y: 0 }); };

  const handleClose = () => { setScale(1); setPosition({ x: 0, y: 0 }); onClose(); };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center"
        onClick={handleClose}
      >
        <button onClick={handleClose} className="fixed top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-50 backdrop-blur-sm">
          <X className="w-8 h-8 text-white" />
        </button>
        <button onClick={handleDownload} className="fixed top-6 right-20 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-50 backdrop-blur-sm" title="Download Image">
          <Download className="w-8 h-8 text-white" />
        </button>
        <div className="fixed top-6 left-6 flex flex-col gap-2 z-50">
          <button onClick={zoomIn} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm" title="Zoom In"><ZoomIn className="w-6 h-6 text-white" /></button>
          <button onClick={zoomOut} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm" title="Zoom Out"><ZoomOut className="w-6 h-6 text-white" /></button>
          <button onClick={resetZoom} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm" title="Reset Zoom"><Maximize2 className="w-6 h-6 text-white" /></button>
        </div>
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full z-50">
          <span className="text-white text-sm font-medium">{Math.round(scale * 100)}%</span>
        </div>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full h-full flex items-center justify-center overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img
            src={imageUrl}
            alt={userName || "Profile"}
            className="max-w-full max-h-[95vh] rounded-xl object-contain select-none"
            style={{
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
              transition: isDragging ? 'none' : 'transform 0.2s ease-out',
              cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
            }}
            onDoubleClick={handleDoubleClick}
            draggable={false}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageViewerModal;

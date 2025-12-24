import { create } from "zustand";

export const useVideoCallStore = create((set, get) => ({
  // State
  isCalling: false,
  isIncomingCall: false,
  isCallAccepted: false,
  isCallEnded: false,
  callerName: "",
  callerId: "",
  callSignal: null,
  
  // Streams
  localStream: null,
  remoteStream: null,

  // Peer Connection
  peerConnection: null,

  // Actions
  setCalling: (isCalling) => set({ isCalling }),
  setIncomingCall: (isIncomingCall) => set({ isIncomingCall }),
  setCallAccepted: (isCallAccepted) => set({ isCallAccepted }),
  setCallEnded: (isCallEnded) => set({ isCallEnded }),
  setCallerInfo: (name, id, signal) => set({ callerName: name, callerId: id, callSignal: signal }),
  
  setLocalStream: (stream) => set({ localStream: stream }),
  setRemoteStream: (stream) => set({ remoteStream: stream }),
  setPeerConnection: (pc) => set({ peerConnection: pc }),

  resetCall: () => {
    const { localStream, peerConnection } = get();
    
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    if (peerConnection) {
      peerConnection.close();
    }

    set({
      isCalling: false,
      isIncomingCall: false,
      isCallAccepted: false,
      isCallEnded: true,
      callerName: "",
      callerId: "",
      callSignal: null,
      localStream: null,
      remoteStream: null,
      peerConnection: null,
    });
    
    // Reset callEnded flag after a short delay
    setTimeout(() => set({ isCallEnded: false }), 2000);
  },
}));

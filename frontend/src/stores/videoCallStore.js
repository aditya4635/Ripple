import { create } from "zustand";

export const useVideoCallStore = create((set, get) => ({
  // State
  isCalling: false,
  isIncomingCall: false,
  isCallAccepted: false,
  isCallEnded: false,
  callerName: "",
  callerId: null,
  callSignal: null,
  localStream: null,
  remoteStream: null,
  peerConnection: null,

  // Actions
  setCallState: (state) => {
    if (state === "calling") {
      set({ isCalling: true, isCallEnded: false });
    } else if (state === "idle") {
      set({ isCalling: false, isIncomingCall: false, isCallAccepted: false });
    }
  },

  setIncomingCall: (isIncoming) => set({ isIncomingCall: isIncoming }),

  setCallAccepted: (accepted) => set({ isCallAccepted: accepted }),

  setCallerInfo: (name, id, signal) =>
    set({
      callerName: name,
      callerId: id,
      callSignal: signal,
      isIncomingCall: true,
    }),

  setLocalStream: (stream) => set({ localStream: stream }),
  setRemoteStream: (stream) => set({ remoteStream: stream }),
  setPeerConnection: (pc) => set({ peerConnection: pc }),

  resetCall: () => {
    const state = get();

    if (state.localStream) {
      state.localStream.getTracks().forEach((track) => track.stop());
    }
    if (state.peerConnection) {
      state.peerConnection.close();
    }

    set({
      isCalling: false,
      isIncomingCall: false,
      isCallAccepted: false,
      isCallEnded: true,
      callerName: "",
      callerId: null,
      callSignal: null,
      localStream: null,
      remoteStream: null,
      peerConnection: null,
    });
  },
}));

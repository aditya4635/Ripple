import { useEffect, useRef, useState } from "react";
import { useVideoCallStore } from "../../stores/videoCallStore";
import { useAuthStore } from "../../stores/authStore";
import { useChatStore } from "../../stores/chatStore";
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from "lucide-react";
import toast from "react-hot-toast";

const VideoCall = () => {
  const {
    isCalling,
    isIncomingCall,
    isCallAccepted,
    isCallEnded,
    callerName,
    callSignal,
    setCallAccepted,
    resetCall,
  } = useVideoCallStore();
  
  const { socket, authUser } = useAuthStore();
  const { selectedUser } = useChatStore();
  
  const [stream, setStream] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [isAnswered, setIsAnswered] = useState(false);
  
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    let myStream;

    const startCall = async () => {
        try {
            myStream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: "user"
                }, 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            setStream(myStream);
            if (myVideo.current) myVideo.current.srcObject = myStream;

            socket.on("callEnded", () => {
                toast.dismiss();
                toast("Call ended by user", { icon: '📞' });
                resetCall();
            });

            if (isCalling && !isIncomingCall) {
                const peer = new RTCPeerConnection({
                    iceServers: [
                        { urls: "stun:stun.l.google.com:19302" }
                    ]
                });

                myStream.getTracks().forEach(track => peer.addTrack(track, myStream));

                peer.onicecandidate = (event) => {
                    if (event.candidate) {
                       socket.emit("ice-candidate", {
                           to: selectedUser._id,
                           candidate: event.candidate
                       });
                    }
                };

                peer.ontrack = (event) => {
                    if (userVideo.current) userVideo.current.srcObject = event.streams[0];
                };

                const offer = await peer.createOffer();
                await peer.setLocalDescription(offer);

                socket.emit("callUser", {
                    userToCall: selectedUser._id,
                    signalData: offer,
                    from: authUser._id,
                    name: authUser.fullName
                });
                
                socket.on("callAccepted", async (signal) => {
                    setCallAccepted(true);
                    await peer.setRemoteDescription(new RTCSessionDescription(signal));
                });
                
                socket.on("ice-candidate", async ({ candidate }) => {
                    try {
                        await peer.addIceCandidate(new RTCIceCandidate(candidate));
                    } catch (e) {
                        console.error("Error adding ice candidate", e);
                    }
                });

                connectionRef.current = peer;
            }
        } catch (err) {
            console.error("Error starting call:", err);
            toast.error("Could not access camera/microphone");
            resetCall();
        }
    };

    startCall();

    return () => {
        socket.off("callAccepted");
        socket.off("ice-candidate");
        socket.off("callEnded");
        if (myStream) myStream.getTracks().forEach(track => track.stop());
    };
  }, [socket]);

  const answerCall = async () => {
      setIsAnswered(true);
      setCallAccepted(true);

      const peer = new RTCPeerConnection({
          iceServers: [
              { urls: "stun:stun.l.google.com:19302" }
          ]
      });
      
      if (stream) {
          stream.getTracks().forEach(track => peer.addTrack(track, stream));
      }

      peer.onicecandidate = (event) => {
          if (event.candidate) {
              const fromId = useVideoCallStore.getState().callerId;
              socket.emit("ice-candidate", {
                  to: fromId,
                  candidate: event.candidate
              });
          }
      };

      peer.ontrack = (event) => {
          if (userVideo.current) userVideo.current.srcObject = event.streams[0];
      };

      await peer.setRemoteDescription(new RTCSessionDescription(callSignal));

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      
      const fromId = useVideoCallStore.getState().callerId;
      socket.emit("answerCall", { signal: answer, to: fromId });
      
      socket.on("ice-candidate", async ({ candidate }) => {
           try {
               await peer.addIceCandidate(new RTCIceCandidate(candidate));
           } catch (e) {
               console.error("Error adding ice candidate", e);
           }
      });

      connectionRef.current = peer;
  };
  
  const handleEndCall = () => {
    const targetId = isIncomingCall ? useVideoCallStore.getState().callerId : selectedUser?._id;
    if (targetId) {
        socket.emit("endCall", { to: targetId });
    }
    
    if (connectionRef.current) connectionRef.current.close();
    if (stream) stream.getTracks().forEach(track => track.stop());
    resetCall();
  };
  
  const toggleMic = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = !micOn;
      setMicOn(!micOn);
    }
  };

  const toggleCamera = () => {
    if (stream) {
      stream.getVideoTracks()[0].enabled = !cameraOn;
      setCameraOn(!cameraOn);
    }
  };

  if (isCallEnded) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="relative w-full h-full max-w-4xl max-h-[800px] flex flex-col p-4">
        
        <div className="flex-1 relative bg-base-300 rounded-3xl overflow-hidden shadow-2xl border border-base-content/10">
           {isCallAccepted && (
               <video 
                 playsInline 
                 ref={userVideo} 
                 autoPlay 
                 className="w-full h-full object-cover"
               />
           )}
           
           {!isCallAccepted && (
               <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                   <div className="size-24 rounded-full bg-base-100 flex items-center justify-center animate-pulse">
                       <span className="text-4xl font-bold text-primary">
                         {isIncomingCall ? callerName?.charAt(0) : selectedUser?.fullName?.charAt(0)}
                       </span>
                   </div>
                   <h3 className="text-2xl font-semibold text-base-content">
                       {isIncomingCall ? `${callerName} is calling...` : "Calling..."}
                   </h3>
                   {isIncomingCall && !isAnswered && (
                       <button 
                         className="btn btn-primary btn-lg rounded-full px-8 shadow-lg hover:scale-105 transition-transform"
                         onClick={answerCall}
                       >
                           <Phone className="mr-2" /> Answer
                       </button>
                   )}
               </div>
           )}

           {stream && (
             <div className="absolute top-4 right-4 w-48 aspect-video bg-black rounded-xl overflow-hidden shadow-lg border border-white/10 z-10">
                <video 
                  playsInline 
                  muted 
                  ref={myVideo} 
                  autoPlay 
                  className="w-full h-full object-cover" 
                  style={{ transform: "scaleX(-1)" }}
                />
             </div>
           )}
        </div>

        <div className="h-20 flex items-center justify-center gap-6 mt-4">
             <button onClick={toggleMic} className={`btn btn-circle btn-lg ${micOn ? 'btn-ghost bg-base-100' : 'btn-error'}`}>
                 {micOn ? <Mic /> : <MicOff />}
             </button>
             
             <button onClick={handleEndCall} className="btn btn-circle btn-lg btn-error hover:scale-110 transition-transform shadow-lg">
                 <PhoneOff className="size-8 text-white" />
             </button>

             <button onClick={toggleCamera} className={`btn btn-circle btn-lg ${cameraOn ? 'btn-ghost bg-base-100' : 'btn-error'}`}>
                 {cameraOn ? <Video /> : <VideoOff />}
             </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;

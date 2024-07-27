// import React, { useEffect, useRef, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import io from 'socket.io-client';
// import { auth } from '../firebase';

// const VideoChat = () => {
//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const [socket, setSocket] = useState(null);
//   const [peerConnection, setPeerConnection] = useState(null);
//   const navigate = useNavigate();
//   const servers = {
//     iceServers: [{ urls: 'stun:stun.stunprotocol.org' }],
//   };

//   useEffect(() => {
//     const currentUser = auth.currentUser;
//     const newSocket = io('https://dating-app-97152.cloudfunctions.net/socketApi');
//     setSocket(newSocket);

//     newSocket.on('connect', () => {
//       console.log('Connected to signaling server');
//       if (currentUser) {
//         newSocket.emit('join-room', 'random-room', currentUser.uid);
//       }
//     });

//     return () => newSocket.close();
//   }, []);

//   useEffect(() => {
//     if (socket) {
//       const pc = new RTCPeerConnection(servers);
//       setPeerConnection(pc);

//       navigator.mediaDevices.getUserMedia({ video: true, audio: true })
//         .then((stream) => {
//           localVideoRef.current.srcObject = stream;
//           stream.getTracks().forEach(track => pc.addTrack(track, stream));
//         });

//       pc.onicecandidate = (event) => {
//         if (event.candidate) {
//           socket.emit('signal', { type: 'ice-candidate', candidate: event.candidate, to: peerConnection.remoteUserId });
//         }
//       };

//       pc.ontrack = (event) => {
//         const [remoteStream] = event.streams;
//         remoteVideoRef.current.srcObject = remoteStream;
//       };

//       socket.on('user-connected', async (userId) => {
//         console.log('User connected:', userId);
//         peerConnection.remoteUserId = userId;
//         const offer = await pc.createOffer();
//         await pc.setLocalDescription(new RTCSessionDescription(offer));
//         socket.emit('signal', { type: 'offer', offer, to: userId });
//       });

//       socket.on('signal', async (data) => {
//         console.log('Signal data:', data);
//         if (data.type === 'offer') {
//           await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
//           const answer = await pc.createAnswer();
//           await pc.setLocalDescription(new RTCSessionDescription(answer));
//           socket.emit('signal', { type: 'answer', answer, to: data.from });
//         } else if (data.type === 'answer') {
//           await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
//         } else if (data.type === 'ice-candidate') {
//           if (data.candidate) {
//             await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
//           }
//         }
//       });

//       socket.on('user-disconnected', (userId) => {
//         console.log('User disconnected:', userId);
//         pc.close();
//         // Optionally reconnect to a new user
//         socket.emit('join-room', 'random-room');
//       });

//       return () => pc.close();
//     }
//   }, [socket]);

//   const handleLogout = () => {
//     auth.signOut();
//     navigate('/login');
//   };

//   return (
//     <div className="container">
//       <div className="video-chat-container">
//         <div className="profile-header">
//           <div className="profile-picture">
//             <video ref={localVideoRef} autoPlay muted className="local-video-frame" />
//           </div>
//           <div className="profile-name">Name</div>
//           <button className="report-btn">Report</button>
//         </div>
//         <div className="remote-video-frame">
//           <video ref={remoteVideoRef} autoPlay className="video-frame" />
//         </div>
//         <div className="chat-controls">
//           <button className="chat-btn">Chat</button>
//           <button className="skip-btn">Skip</button>
//           <button className="like-btn">Like</button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VideoChat;


// import React, { useState, useEffect, useRef } from 'react';
// import io from 'socket.io-client';
// import Peer from 'peerjs';

// const socket = io('http://localhost:5001'); // Update with your server URL

// const VideoChat = () => {
//     const [me, setMe] = useState('');
//     const [stream, setStream] = useState();
//     const [receivingCall, setReceivingCall] = useState(false);
//     const [caller, setCaller] = useState('');
//     const [callerSignal, setCallerSignal] = useState();
//     const [callAccepted, setCallAccepted] = useState(false);
//     const [callEnded, setCallEnded] = useState(false);
//     const [roomId, setRoomId] = useState('');
//     const myVideo = useRef();
//     const userVideo = useRef();
//     const connectionRef = useRef();

//     useEffect(() => {
//         navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
//             setStream(stream);
//             myVideo.current.srcObject = stream;
//         });

//         const peer = new Peer(undefined, {
//             path: '/peerjs',
//             host: '/',
//             port: '5001'
//         });

//         peer.on('open', (id) => {
//             setMe(id);
//             socket.emit('join-room', id);
//         });

//         socket.on('room-assigned', (roomId) => {
//             setRoomId(roomId);
//         });

//         peer.on('call', (call) => {
//             setReceivingCall(true);
//             setCaller(call.peer);
//             setCallerSignal(call.metadata.signal);
//         });

//         socket.on('callUser', ({ signal, from, name: callerName }) => {
//             setReceivingCall(true);
//             setCaller(from);
//             setCallerSignal(signal);
//         });

//         socket.on('callAccepted', ({ signal }) => {
//             setCallAccepted(true);
//             peer.signal(signal);
//         });

//         return () => {
//             peer.destroy();
//             socket.disconnect();
//         };
//     }, []);

//     const callUser = () => {
//         const peer = new Peer({ initiator: true, trickle: false, stream });

//         peer.on('signal', (data) => {
//             socket.emit('callUser', { roomId, signalData: data, from: me });
//         });

//         peer.on('stream', (stream) => {
//             userVideo.current.srcObject = stream;
//         });

//         socket.on('callAccepted', ({ signal }) => {
//             setCallAccepted(true);
//             peer.signal(signal);
//         });

//         connectionRef.current = peer;
//     };

//     const answerCall = () => {
//         setCallAccepted(true);
//         const peer = new Peer({ initiator: false, trickle: false, stream });

//         peer.on('signal', (data) => {
//             socket.emit('answerCall', { roomId, signal: data });
//         });

//         peer.on('stream', (stream) => {
//             userVideo.current.srcObject = stream;
//         });

//         peer.signal(callerSignal);
//         connectionRef.current = peer;
//     };

//     return (
//         <div>
//             <div>
//                 <video playsInline muted ref={myVideo} autoPlay style={{ width: '300px' }} />
//                 {callAccepted && !callEnded ? (
//                     <video playsInline ref={userVideo} autoPlay style={{ width: '300px' }} />
//                 ) : null}
//             </div>
//             <div>
//                 {receivingCall && !callAccepted ? (
//                     <div>
//                         <h1>Someone is calling...</h1>
//                         <button onClick={answerCall}>Answer</button>
//                     </div>
//                 ) : (
//                     <div>
//                         <button onClick={callUser}>Find Match</button>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default VideoChat;

import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import Peer from 'peerjs';

const socket = io('http://localhost:5001'); // Update with your server URL

const VideoChat = () => {
    const [me, setMe] = useState('');
    const [stream, setStream] = useState();
    const [receivingCall, setReceivingCall] = useState(false);
    const [caller, setCaller] = useState('');
    const [callerSignal, setCallerSignal] = useState();
    const [callAccepted, setCallAccepted] = useState(false);
    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            setStream(stream);
            myVideo.current.srcObject = stream;
        });

        const peer = new Peer(undefined, {
            path: '/peerjs',
            host: '/',
            port: '5001'
        });

        peer.on('open', (id) => {
            setMe(id);
            socket.emit('join-room', id);
        });

        socket.on('session-assigned', (session) => {
            console.log('Assigned to session: ', session);
        });

        socket.on('start-call', ({ with: otherUserId }) => {
            const peer = new Peer({ initiator: true, trickle: false, stream });

            peer.on('signal', (data) => {
                socket.emit('callUser', { signalData: data, to: otherUserId });
            });

            peer.on('stream', (stream) => {
                userVideo.current.srcObject = stream;
            });

            socket.on('callAccepted', ({ signal }) => {
                setCallAccepted(true);
                peer.signal(signal);
            });

            connectionRef.current = peer;
        });

        socket.on('callUser', ({ signal, from }) => {
            setReceivingCall(true);
            setCaller(from);
            setCallerSignal(signal);
        });

        socket.on('callAccepted', ({ signal }) => {
            setCallAccepted(true);
            connectionRef.current.signal(signal);
        });

        return () => {
            peer.destroy();
            socket.disconnect();
        };
    }, []);

    const answerCall = () => {
        setCallAccepted(true);
        const peer = new Peer({ initiator: false, trickle: false, stream });

        peer.on('signal', (data) => {
            socket.emit('answerCall', { signalData: data, to: caller });
        });

        peer.on('stream', (stream) => {
            userVideo.current.srcObject = stream;
        });

        peer.signal(callerSignal);
        connectionRef.current = peer;
    };

    return (
        <div>
            <div>
                <video playsInline muted ref={myVideo} autoPlay style={{ width: '300px' }} />
                {callAccepted && (
                    <video playsInline ref={userVideo} autoPlay style={{ width: '300px' }} />
                )}
            </div>
            <div>
                {receivingCall && !callAccepted ? (
                    <div>
                        <h1>Someone is calling...</h1>
                        <button onClick={answerCall}>Answer</button>
                    </div>
                ) : (
                    <div>
                        <h1>Waiting for a match...</h1>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoChat;

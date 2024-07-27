import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { auth } from '../firebase';

const VideoChat = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const navigate = useNavigate();
  const servers = {
    iceServers: [{ urls: 'stun:stun.stunprotocol.org' }],
  };

  useEffect(() => {
    const currentUser = auth.currentUser;
    const newSocket = io('https://dating-app-97152.cloudfunctions.net/socketApi');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to signaling server');
      if (currentUser) {
        newSocket.emit('join-room', 'test-room', currentUser.uid);
      }
    });

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (socket) {
      const pc = new RTCPeerConnection(servers);
      setPeerConnection(pc);

      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          localVideoRef.current.srcObject = stream;
          stream.getTracks().forEach(track => pc.addTrack(track, stream));
        });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('signal', { type: 'ice-candidate', candidate: event.candidate });
        }
      };

      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        remoteVideoRef.current.srcObject = remoteStream;
      };

      socket.on('user-connected', async (userId) => {
        console.log('User connected:', userId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(new RTCSessionDescription(offer));
        socket.emit('signal', { type: 'offer', offer });
      });

      socket.on('signal', async (data) => {
        console.log('Signal data:', data);
        if (data.type === 'offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(new RTCSessionDescription(answer));
          socket.emit('signal', { type: 'answer', answer });
        } else if (data.type === 'answer') {
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        } else if (data.type === 'ice-candidate') {
          if (data.candidate) {
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          }
        }
      });

      socket.on('user-disconnected', (userId) => {
        console.log('User disconnected:', userId);
        pc.close();
      });

      return () => pc.close();
    }
  }, [socket]);

  const handleLogout = () => {
    auth.signOut();
    navigate('/login');
  };

  return (
    <div className="container">
      <div className="video-chat-container">
        <div className="profile-header">
          <div className="profile-picture">
            <video ref={localVideoRef} autoPlay muted className="local-video-frame" />
          </div>
          <div className="profile-name">Name</div>
          <button className="report-btn">Report</button>
        </div>
        <div className="remote-video-frame">
          <video ref={remoteVideoRef} autoPlay className="video-frame" />
        </div>
        <div className="chat-controls">
          <button className="chat-btn">Chat</button>
          <button className="skip-btn">Skip</button>
          <button className="like-btn">Like</button>
        </div>
      </div>

    </div>
  );
};

export default VideoChat;

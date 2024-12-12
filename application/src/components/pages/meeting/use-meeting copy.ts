import { socket } from '@/socket';
import { useCallback, useEffect, useRef } from 'react';

const peerId = crypto.randomUUID();

type UseMeetingProps = {
  meetingId: string;
};

export const useMeeting = ({ meetingId }: UseMeetingProps) => {
  const localStreamRef = useRef<MediaStream>(null);
  const localPeerConnectionRef = useRef<RTCPeerConnection>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const startMicAndCamera = useCallback(() => {
    return navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
  }, []);

  const startPeerConnection = useCallback(
    async (stream: MediaStream) => {
      const peerConnection = new RTCPeerConnection();

      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });

      peerConnection.onicecandidate = ({ candidate }) => {
        if (!candidate) return;

        socket.emit('signal', { to: peerId, signal: { candidate } });
      };

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      socket.emit('signal', { to: peerId, signal: { sdp: peerConnection.localDescription } });

      localPeerConnectionRef.current = peerConnection;
    },
    [localStreamRef]
  );

  useEffect(() => {
    startMicAndCamera()
      .then((stream) => {
        localStreamRef.current = stream;

        if (localVideoRef.current && 'srcObject' in localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        startPeerConnection(stream);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [startMicAndCamera, localStreamRef, startPeerConnection]);

  useEffect(() => {
    socket.on('signal', async ({ from, signal }) => {
      const localStream = localStreamRef.current;

      if (!localPeerConnectionRef.current && localStream) {
        const peerConnection = new RTCPeerConnection();

        localStream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, localStream);
        });

        peerConnection.onicecandidate = ({ candidate }) => {
          if (!candidate) return;

          socket.emit('signal', { to: from, signal: { candidate } });
        };

        peerConnection.ontrack = (event) => {
          if (remoteVideoRef.current && 'srcObject' in remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };

        localPeerConnectionRef.current = peerConnection;
      }

      if (signal.sdp && localPeerConnectionRef.current) {
        await localPeerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(signal.sdp));

        if (signal.sdp.type === 'offer') {
          const answer = await localPeerConnectionRef.current.createAnswer();
          await localPeerConnectionRef.current.setLocalDescription(answer);

          socket.emit('signal', { to: from, signal: { sdp: localPeerConnectionRef.current.localDescription } });
        }
      }
    });

    return () => {
      socket.off('signal');
    };
  }, [localPeerConnectionRef, localStreamRef]);

  return { localVideoRef, remoteVideoRef };
};

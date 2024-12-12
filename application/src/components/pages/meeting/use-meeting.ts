import { socket } from '@/socket';
import { useCallback, useEffect, useRef } from 'react';

const peerId = crypto.randomUUID();

const peerConfiguration = {
  iceServers: [
    {
      urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'],
    },
  ],
};

type UseMeetingProps = {
  meetingId: string;
};

export const useMeeting = ({ meetingId }: UseMeetingProps) => {
  const localPeerConnectionRef = useRef<RTCPeerConnection>(null);

  const localStreamRef = useRef<MediaStream>(null);
  const remoteStreamRef = useRef<MediaStream>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const startMicAndCamera = useCallback(() => {
    return navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
  }, []);

  const createPeerConnection = useCallback(async (stream: MediaStream) => {
    const peerConnection = new RTCPeerConnection(peerConfiguration);
    const remoteStream = new MediaStream();

    stream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, stream);
    });

    peerConnection.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });
    };

    localPeerConnectionRef.current = peerConnection;

    localStreamRef.current = stream;
    remoteStreamRef.current = remoteStream;

    if (localVideoRef.current && 'srcObject' in localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }

    if (remoteVideoRef.current && 'srcObject' in remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }

    socket.emit('start-call', { meetingId });
  }, []);

  const createOffer = useCallback(async () => {
    console.log('createOffer');

    if (!localPeerConnectionRef.current) return;

    localPeerConnectionRef.current.onicecandidate = (event) => {
      if (!event.candidate) return;

      socket.emit('offers', { meetingId, candidate: event.candidate });
    };

    const offer = await localPeerConnectionRef.current.createOffer();
    await localPeerConnectionRef.current.setLocalDescription(offer);

    socket.emit('offer', { meetingId, offer });
  }, []);

  const associateAnswer = useCallback((answer: RTCSessionDescriptionInit) => {
    console.log('associateAnswer');

    if (!localPeerConnectionRef.current) return;

    if (!localPeerConnectionRef.current.currentRemoteDescription && answer) {
      const answerDescription = new RTCSessionDescription(answer);
      localPeerConnectionRef.current.setRemoteDescription(answerDescription);
    }
  }, []);

  const addCandidate = useCallback((data: RTCIceCandidateInit) => {
    if (!localPeerConnectionRef.current) return;

    const candidate = new RTCIceCandidate(data);
    localPeerConnectionRef.current.addIceCandidate(candidate);
  }, []);

  const createAnswer = useCallback(async (offer: RTCSessionDescriptionInit, offerCandidates: RTCIceCandidateInit[]) => {
    if (!localPeerConnectionRef.current) return;

    localPeerConnectionRef.current.onicecandidate = (event) => {
      if (!event.candidate) return;

      socket.emit('answers', { meetingId, candidate: event.candidate });
    };

    await localPeerConnectionRef.current.setRemoteDescription(offer);

    const answerDescription = await localPeerConnectionRef.current.createAnswer();
    await localPeerConnectionRef.current.setLocalDescription(answerDescription);

    socket.emit('answer', { meetingId, answer: answerDescription });

    offerCandidates.forEach((offerCandidate) => {
      localPeerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(offerCandidate));
    });
  }, []);

  useEffect(() => {
    startMicAndCamera()
      .then((stream) => {
        createPeerConnection(stream);
      })
      .catch((err) => {
        console.log(err);
      });

    return () => {};
  }, [localStreamRef, startMicAndCamera]);

  useEffect(() => {
    socket.on('create-offer', async () => {
      createOffer();
    });

    socket.on('create-answer', async ({ offer, offerCandidates }) => {
      createAnswer(offer, offerCandidates);
    });

    socket.on('answer', async ({ answer }) => {
      associateAnswer(answer);
    });

    socket.on('answers', async ({ data }) => {
      addCandidate(data);
    });

    return () => {
      // socket.off('start-call');
    };
  }, [createOffer, associateAnswer]);

  return { localVideoRef, remoteVideoRef };
};

import { SocketIoContext } from '@/providers/SocketIoProvider';
import { useRouter } from 'next/navigation';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { MeetingContext } from './MeetingProvider';

export type UserType = {
  id: string;
  name: string;
};

export type UserConnectionMapType = {
  peerConnection: RTCPeerConnection;
  stream: MediaStream;
  appDataChannel: RTCDataChannel;
  chatDataChannel: RTCDataChannel;
  state: 'idle' | 'created';
};

const peerConfiguration = {
  iceServers: [
    {
      urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'],
    },
  ],
};

type UseConnectionsProps = {
  meetingId: string;
};

export const useConnections = ({ meetingId }: UseConnectionsProps) => {
  const { socket, isConnected, userId } = useContext(SocketIoContext);
  const { onDataAppReceived, onDataChatReceived } = useContext(MeetingContext);
  const userConnectionsMapRef = useRef<Map<string, UserConnectionMapType>>(new Map());
  const localStreamRef = useRef<MediaStream>(null);
  const [currentUsers, setCurrentUsers] = useState<UserType[]>([]);
  const router = useRouter();

  const sendAppData = useCallback((data: string) => {
    userConnectionsMapRef.current.forEach((connection) => {
      connection.appDataChannel.send(data);
    });
  }, []);

  const sendChatData = useCallback((data: string) => {
    userConnectionsMapRef.current.forEach((connection) => {
      connection.chatDataChannel.send(data);
    });
  }, []);

  const onUserLeave = useCallback(
    (user: UserType) => {
      userConnectionsMapRef.current.delete(user.id);

      setCurrentUsers((oldUsers) => oldUsers.filter((oldUser) => oldUser.id !== user.id));
    },
    [setCurrentUsers]
  );

  const onUserEnter = useCallback(
    (users: UserType[]) => {
      users.forEach((user) => {
        if (user.id === userId || userConnectionsMapRef.current.has(user.id)) return;

        const localeStream = localStreamRef.current;
        const peerConnection = new RTCPeerConnection(peerConfiguration);
        const remoteStream = new MediaStream();

        if (localeStream) {
          localeStream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, localeStream);
          });
        }

        peerConnection.ontrack = (event) => {
          event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track);
          });
        };

        peerConnection.ondatachannel = (event) => {
          const dataChannel = event.channel;

          if (dataChannel.label === 'app') {
            dataChannel.onmessage = (channelEvent) => {
              onDataAppReceived(user.id, channelEvent);
            };
          }

          if (dataChannel.label === 'chat') {
            dataChannel.onmessage = (channelEvent) => {
              onDataChatReceived(user.id, channelEvent);
            };
          }
        };

        peerConnection.onconnectionstatechange = () => {
          if (peerConnection.connectionState === 'disconnected') {
            onUserLeave(user);
          }
        };

        const appDataChannel = peerConnection.createDataChannel('app');
        const chatDataChannel = peerConnection.createDataChannel('chat');

        userConnectionsMapRef.current.set(user.id, {
          peerConnection: peerConnection,
          appDataChannel,
          chatDataChannel,
          stream: remoteStream,
          state: 'idle',
        });

        socket?.emit('decide-offer-answer', { meetingId, anotherUserId: user.id });
      });

      setCurrentUsers(() => users.filter((userToFilter) => userToFilter.id !== userId));
    },
    [socket, userId, meetingId, setCurrentUsers, onDataAppReceived, onDataChatReceived, onUserLeave]
  );

  const onCreateOffer = useCallback(
    async (peerId: string) => {
      const userConnection = userConnectionsMapRef.current.get(peerId);

      if (!userConnection || userConnection.state !== 'idle') return;

      userConnection.state = 'created';

      userConnection.peerConnection.onicecandidate = ({ candidate }) => {
        if (!candidate) return;

        socket?.emit('offer-candidates', { meetingId, toId: peerId, candidate });
      };

      const offerDescription = await userConnection.peerConnection.createOffer();
      await userConnection.peerConnection.setLocalDescription(offerDescription);

      socket?.emit('offer', { meetingId, toId: peerId, offer: offerDescription });
    },
    [socket, meetingId]
  );

  const onCreateAnswer = useCallback(
    async (peerId: string, offer: RTCSessionDescriptionInit) => {
      const userConnection = userConnectionsMapRef.current.get(peerId);

      if (!userConnection) return;

      userConnection.peerConnection.onicecandidate = ({ candidate }) => {
        if (!candidate) return;

        socket?.emit('answer-candidates', { meetingId, toId: peerId, candidate });
      };

      userConnection.peerConnection.setRemoteDescription(offer);

      const answerDescription = await userConnection.peerConnection.createAnswer();
      await userConnection.peerConnection.setLocalDescription(answerDescription);

      socket?.emit('answer', { meetingId, toId: peerId, answer: answerDescription });
    },
    [socket, meetingId]
  );

  const onAnswerFound = useCallback((peerId: string, answer: RTCSessionDescriptionInit) => {
    const userConnection = userConnectionsMapRef.current.get(peerId);

    if (!userConnection) return;

    const answerDescription = new RTCSessionDescription(answer);
    userConnection.peerConnection.setRemoteDescription(answerDescription);
  }, []);

  const onOfferCandidate = useCallback((peerId: string, data: RTCIceCandidateInit) => {
    const userConnection = userConnectionsMapRef.current.get(peerId);

    const candidate = new RTCIceCandidate(data);
    userConnection?.peerConnection.addIceCandidate(candidate);
  }, []);

  const onAnswerCandidate = useCallback((peerId: string, data: RTCIceCandidateInit) => {
    const userConnection = userConnectionsMapRef.current.get(peerId);

    const candidate = new RTCIceCandidate(data);
    userConnection?.peerConnection.addIceCandidate(candidate);
  }, []);

  const onInvalidMeeting = useCallback(() => {
    router.push('/meetings');
  }, [router]);

  useEffect(() => {
    socket?.on('user-enter', async ({ users }) => {
      onUserEnter(users);
    });

    socket?.on('create-offer', async ({ peerId }) => {
      onCreateOffer(peerId);
    });

    socket?.on('create-answer', async ({ peerId, offer }) => {
      onCreateAnswer(peerId, offer);
    });

    socket?.on('answer-found', async ({ peerId, answer }) => {
      onAnswerFound(peerId, answer);
    });

    socket?.on('offer-candidate', async ({ peerId, candidate }) => {
      onOfferCandidate(peerId, candidate);
    });

    socket?.on('answer-candidate', async ({ peerId, candidate }) => {
      onAnswerCandidate(peerId, candidate);
    });

    socket?.on('user-leave', onUserLeave);

    socket?.on('invalid-meeting', onInvalidMeeting);

    return () => {
      socket?.off('user-enter');
      socket?.off('create-offer');
      socket?.off('create-answer');
      socket?.off('answer-found');
      socket?.off('offer-candidate');
      socket?.off('answer-candidate');
      socket?.off('user-leave');
    };
  }, [
    socket,
    isConnected,
    onUserEnter,
    onUserLeave,
    onCreateOffer,
    onCreateAnswer,
    onAnswerFound,
    onOfferCandidate,
    onAnswerCandidate,
    onInvalidMeeting,
  ]);

  return { currentUsers, localStreamRef, userConnectionsMapRef, sendAppData, sendChatData };
};

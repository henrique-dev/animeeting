import { SocketIoContext } from '@/providers/SocketIoProvider';
import { useRouter } from 'next/navigation';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useMedia } from '../use-media';
import { ChatContext } from './ChatProvider';
import { ConnectionContext } from './ConnectionProvider';
import { MediaContext } from './MediaProvider';
import { MeetingContext } from './MeetingProvider';

export type UserType = {
  id: string;
  name: string;
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
  const { userConnectionsMapRef } = useContext(ConnectionContext);
  const { onDataAppReceived } = useContext(MeetingContext);
  const { onDataChatReceived, onDataFileReceived } = useContext(ChatContext);
  const { localStreamRef } = useContext(MediaContext);
  const [currentUsers, setCurrentUsers] = useState<UserType[]>([]);
  const { getUserMedia } = useMedia();
  const router = useRouter();

  const updateLocalStream = async (props?: {
    video: boolean | MediaTrackConstraints | undefined;
    audio: boolean | MediaTrackConstraints | undefined;
  }) => {
    return new Promise(async (resolve, reject) => {
      try {
        const localStream = await getUserMedia(props);

        userConnectionsMapRef.current.forEach((userConnection) => {
          const senders = userConnection.peerConnection.getSenders();
          const videoSender = senders.find((sender) => sender.track?.kind === 'video');
          const audioSender = senders.find((sender) => sender.track?.kind === 'audio');

          localStream.getTracks().forEach((track) => {
            if (track.kind === 'video' && videoSender) {
              videoSender.replaceTrack(track);
            }
            if (track.kind === 'audio' && audioSender) {
              audioSender.replaceTrack(track);
            }
          });
        });

        localStreamRef.current = localStream;

        resolve(localStream);
      } catch (err) {
        console.warn('cannot get the media');
        console.warn(err);
        reject();
      }
    });
  };

  const onUserLeave = useCallback(
    (user: UserType) => {
      userConnectionsMapRef.current.delete(user.id);

      setCurrentUsers((oldUsers) => oldUsers.filter((oldUser) => oldUser.id !== user.id));
    },
    [userConnectionsMapRef, setCurrentUsers]
  );

  const onUserEnter = useCallback(
    (users: UserType[]) => {
      users.forEach((user) => {
        if (user.id === userId || userConnectionsMapRef.current.has(user.id)) return;

        const localStream = localStreamRef.current;
        const peerConnection = new RTCPeerConnection(peerConfiguration);
        const remoteStream = new MediaStream();

        if (localStream) {
          localStream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, localStream);
          });
        }

        peerConnection.ontrack = (event) => {
          event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track);
          });
        };

        peerConnection.onconnectionstatechange = () => {
          if (peerConnection.connectionState === 'disconnected') {
            onUserLeave(user);
          }
        };

        const appDataChannel = peerConnection.createDataChannel('app', { negotiated: true, id: 0 });
        const chatDataChannel = peerConnection.createDataChannel('chat', { negotiated: true, id: 1 });
        const fileDataChannel = peerConnection.createDataChannel('file', { negotiated: true, id: 2 });

        appDataChannel.onmessage = (channelEvent) => {
          onDataAppReceived(user.id, channelEvent);
        };

        chatDataChannel.onmessage = (channelEvent) => {
          onDataChatReceived(user.id, channelEvent);
        };

        fileDataChannel.onmessage = (channelEvent) => {
          onDataFileReceived(user.id, channelEvent);
        };

        userConnectionsMapRef.current.set(user.id, {
          peerConnection: peerConnection,
          appDataChannel,
          chatDataChannel,
          fileDataChannel,
          stream: remoteStream,
          state: 'idle',
        });

        socket?.emit('decide-offer-answer', { meetingId, anotherUserId: user.id });
      });

      setCurrentUsers(() => users.filter((userToFilter) => userToFilter.id !== userId));
    },
    [
      localStreamRef,
      userConnectionsMapRef,
      socket,
      userId,
      meetingId,
      setCurrentUsers,
      onUserLeave,
      onDataAppReceived,
      onDataChatReceived,
      onDataFileReceived,
    ]
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
    [userConnectionsMapRef, socket, meetingId]
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
    [userConnectionsMapRef, socket, meetingId]
  );

  const onAnswerFound = useCallback(
    (peerId: string, answer: RTCSessionDescriptionInit) => {
      const userConnection = userConnectionsMapRef.current.get(peerId);

      if (!userConnection) return;

      const answerDescription = new RTCSessionDescription(answer);
      userConnection.peerConnection.setRemoteDescription(answerDescription);
    },
    [userConnectionsMapRef]
  );

  const onOfferCandidate = useCallback(
    (peerId: string, data: RTCIceCandidateInit) => {
      const userConnection = userConnectionsMapRef.current.get(peerId);

      const candidate = new RTCIceCandidate(data);
      userConnection?.peerConnection.addIceCandidate(candidate);
    },
    [userConnectionsMapRef]
  );

  const onAnswerCandidate = useCallback(
    (peerId: string, data: RTCIceCandidateInit) => {
      const userConnection = userConnectionsMapRef.current.get(peerId);

      const candidate = new RTCIceCandidate(data);
      userConnection?.peerConnection.addIceCandidate(candidate);
    },
    [userConnectionsMapRef]
  );

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

  return { currentUsers, userConnectionsMapRef, updateLocalStream };
};

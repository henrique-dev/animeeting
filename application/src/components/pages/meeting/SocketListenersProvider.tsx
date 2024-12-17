import { SocketIoContext } from '@/providers/SocketIoProvider';
import { useRouter } from 'next/navigation';
import React, { useCallback, useContext, useEffect } from 'react';
import { ApplicationContext, UserType } from './ApplicationProvider';
import { ConnectionContext } from './ConnectionProvider';

type SocketListenersContextProps = {};

export const SocketListenersContext = React.createContext<SocketListenersContextProps>({});

type SocketListenersProviderProps = {
  children: React.ReactNode;
};

export const SocketListenersProvider = ({ children }: SocketListenersProviderProps) => {
  const { meetingId, addUser, updateUser, removeUser } = useContext(ApplicationContext);
  const { socket, isConnected, userId } = useContext(SocketIoContext);
  const { createConnection, removeConnection, createOffer, createAnswer, updateAnswer, addIceCandidate } = useContext(ConnectionContext);
  const router = useRouter();

  const onUserLeave = useCallback(
    (user: UserType) => {
      removeConnection(user.id);
      removeUser(user);
    },
    [removeConnection, removeUser]
  );

  const onUserEnter = useCallback(
    ({ users }: { users: UserType[] }) => {
      users.forEach((user) => {
        if (userId === '') return;
        if (user.id === userId) return;

        const peerConnection = createConnection(user.id);

        if (!peerConnection) return;

        peerConnection.onconnectionstatechange = () => {
          switch (peerConnection.connectionState) {
            case 'closed':
              onUserLeave(user);
              break;
            case 'connected':
              updateUser({ ...user, state: 'connected' });
              break;
            case 'connecting':
              addUser({ ...user, state: 'connecting' });
              break;
            case 'disconnected':
              onUserLeave(user);
              break;
            case 'failed':
              onUserLeave(user);
              break;
            case 'new':
              break;
          }
        };

        socket?.emit('decide-offer-answer', { meetingId, anotherUserId: user.id });
      });
    },
    [socket, userId, meetingId, addUser, onUserLeave, createConnection, updateUser]
  );

  const onCreateOffer = useCallback(
    async ({ peerId }: { peerId: string }) => {
      try {
        const [success, offer] = await createOffer(peerId, (candidate) => {
          socket?.emit('offer-candidates', { meetingId, toId: peerId, candidate });
        });

        if (success) {
          socket?.emit('offer', { meetingId, toId: peerId, offer });
        }
      } catch (err) {
        console.warn('cannot create the offer');
        console.warn(err);
      }
    },
    [socket, meetingId, createOffer]
  );

  const onCreateAnswer = useCallback(
    async ({ peerId, offer }: { peerId: string; offer: RTCSessionDescriptionInit }) => {
      try {
        const [success, answer] = await createAnswer(peerId, offer, (candidate) => {
          socket?.emit('answer-candidates', { meetingId, toId: peerId, candidate });
        });

        if (success) {
          socket?.emit('answer', { meetingId, toId: peerId, answer });
        }
      } catch (err) {
        console.warn('cannot create the answer');
        console.warn(err);
      }
    },
    [createAnswer, socket, meetingId]
  );

  const onAnswerFound = useCallback(
    ({ peerId, answer }: { peerId: string; answer: RTCSessionDescriptionInit }) => {
      try {
        updateAnswer(peerId, answer);
      } catch (err) {
        console.warn('cannot handler the answer');
        console.warn(err);
      }
    },
    [updateAnswer]
  );

  const onOfferCandidate = useCallback(
    ({ peerId, candidate }: { peerId: string; candidate: RTCIceCandidateInit }) => {
      try {
        addIceCandidate(peerId, candidate);
      } catch (err) {
        console.warn('cannot add the offer ice candidate');
        console.warn(err);
      }
    },
    [addIceCandidate]
  );

  const onAnswerCandidate = useCallback(
    ({ peerId, candidate }: { peerId: string; candidate: RTCIceCandidateInit }) => {
      try {
        addIceCandidate(peerId, candidate);
      } catch (err) {
        console.warn('cannot add the answer ice candidate');
        console.warn(err);
      }
    },
    [addIceCandidate]
  );

  const onInvalidMeeting = useCallback(() => {
    router.push('/meetings');
  }, [router]);

  useEffect(() => {
    socket?.on('user-enter', onUserEnter);
    socket?.on('create-offer', onCreateOffer);
    socket?.on('create-answer', onCreateAnswer);
    socket?.on('answer-found', onAnswerFound);
    socket?.on('offer-candidate', onOfferCandidate);
    socket?.on('answer-candidate', onAnswerCandidate);
    socket?.on('user-leave', onUserLeave);
    socket?.on('invalid-meeting', onInvalidMeeting);

    return () => {
      socket?.off('user-enter', onUserEnter);
      socket?.off('create-offer', onCreateOffer);
      socket?.off('create-answer', onCreateAnswer);
      socket?.off('answer-found', onAnswerFound);
      socket?.off('offer-candidate', onOfferCandidate);
      socket?.off('answer-candidate', onAnswerCandidate);
      socket?.off('user-leave', onUserLeave);
      socket?.off('invalid-meeting', onInvalidMeeting);
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

  return <SocketListenersContext.Provider value={{}}>{children}</SocketListenersContext.Provider>;
};

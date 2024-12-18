import fs from 'fs';
import http from 'http';
import https from 'https';
import next from 'next';
import { Server } from 'socket.io';
import { getConnectionPair, setConnectionPair } from './server/connection-pairs';
import { addUserToMeeting, createMeeting, getMeeting, removeUserFromMeeting } from './server/meetings';
import { createUser, deleteUser, getUser } from './server/users';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = Number(process.env.PORT ?? 3000);

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

const createServer = () => {
  if (dev) {
    const key = fs.readFileSync('certificates/cert.key');
    const cert = fs.readFileSync('certificates/cert.crt');

    return https.createServer({ key, cert }, handler);
  } else {
    return http.createServer(handler);
  }
};

app.prepare().then(async () => {
  const httpServer = createServer();

  const io = new Server(httpServer, {});

  io.on('connection', async (socket) => {
    await createUser(socket.id);

    const getMeetingAndValidate = async (meetingId: string) => {
      const meeting = await getMeeting(meetingId);

      if (meeting) return meeting;

      socket.emit('invalid-meeting');

      return undefined;
    };

    const getUserAndValidate = async (userId: string) => {
      const user = await getUser(userId);

      if (user) return user;

      socket.emit('invalid-meeting');

      return undefined;
    };

    socket.on('register', async () => {
      const user = await getUserAndValidate(socket.id);

      if (!user) return;

      socket.emit('register-created', user);
    });

    socket.on('create-meeting', async () => {
      const meeting = await createMeeting(socket.id);

      socket.emit('meeting-created', { id: meeting?.id });
    });

    socket.on('init-meeting', async (data) => {
      const { meetingId, userName } = data;

      const user = await getUserAndValidate(socket.id);

      if (!user) return;

      const meeting = await getMeetingAndValidate(meetingId);

      if (!meeting) return;

      socket.join(meeting.roomId);

      await addUserToMeeting(meeting, {
        ...user,
        name: userName,
      });

      io.to(meeting.roomId).emit('user-enter', { users: Array.from(meeting.users.values()) });
    });

    socket.on('exit-meeting', async () => {
      await removeUserFromMeeting(socket.id, (meeting) => {
        io.to(meeting.roomId).emit('user-leave', { id: socket.id });
      });

      await deleteUser(socket.id);
    });

    socket.on('decide-offer-answer', async (data) => {
      const { meetingId, anotherUserId } = data;

      const meeting = await getMeetingAndValidate(meetingId);

      if (!meeting) return;

      const userPair = await getConnectionPair(meeting, socket.id, anotherUserId);
      const anotherUserPair = await getConnectionPair(meeting, anotherUserId, socket.id);

      if (!userPair || !anotherUserPair) return;

      if (userPair.state === 'idle' && anotherUserPair.state === 'idle') {
        const offer = Math.random() < 0.5;

        userPair.role = offer ? 'offer' : 'answer';
        userPair.state = 'created';
        await setConnectionPair(meeting, socket.id, anotherUserId, userPair);

        anotherUserPair.role = offer ? 'answer' : 'offer';
        anotherUserPair.state = 'created';
        await setConnectionPair(meeting, anotherUserId, socket.id, anotherUserPair);
      }

      if (userPair.role === 'offer') {
        socket.emit('create-offer', { peerId: anotherUserId });
      } else {
        io.to(anotherUserId).emit('create-offer', { peerId: socket.id });
      }
    });

    socket.on('offer', async (data) => {
      const { meetingId, toId, offer } = data;

      const meeting = await getMeetingAndValidate(meetingId);

      if (!meeting) return;

      const userPair = await getConnectionPair(meeting, socket.id, toId);
      const anotherUserPair = await getConnectionPair(meeting, toId, socket.id);

      if (!userPair || !anotherUserPair) return;

      const anotherUser = meeting.users.get(toId);
      const userMeeting = meeting.users.get(socket.id);

      if (!anotherUser || !userMeeting) return;

      if (userPair.role === 'answer') {
        socket.emit('create-answer', { peerId: toId, offer });
      } else {
        io.to(toId).emit('create-answer', { peerId: socket.id, offer });
      }
    });

    socket.on('answer', async (data) => {
      const { meetingId, toId, answer } = data;

      const meeting = await getMeetingAndValidate(meetingId);

      if (!meeting) return;

      const userPair = await getConnectionPair(meeting, socket.id, toId);
      const anotherUserPair = await getConnectionPair(meeting, toId, socket.id);

      if (!userPair || !anotherUserPair) return;

      const anotherUser = meeting.users.get(toId);
      const userMeeting = meeting.users.get(socket.id);

      if (!anotherUser || !userMeeting) return;

      if (userPair.role === 'offer') {
        socket.emit('answer-found', { peerId: toId, answer });
      } else {
        io.to(toId).emit('answer-found', { peerId: socket.id, answer });
      }
    });

    socket.on('offer-candidates', async (data) => {
      const { meetingId, toId, candidate } = data;

      const meeting = await getMeetingAndValidate(meetingId);

      if (!meeting) return;

      const userPair = await getConnectionPair(meeting, socket.id, toId);
      const anotherUserPair = await getConnectionPair(meeting, toId, socket.id);

      if (!userPair || !anotherUserPair) return;

      const anotherUser = meeting.users.get(toId);
      const userMeeting = meeting.users.get(socket.id);

      if (!anotherUser || !userMeeting) return;

      if (userPair.role === 'answer') {
        socket.emit('offer-candidate', { peerId: toId, candidate });
      } else {
        io.to(toId).emit('offer-candidate', { peerId: socket.id, candidate });
      }
    });

    socket.on('answer-candidates', async (data) => {
      const { meetingId, toId, candidate } = data;

      const meeting = await getMeetingAndValidate(meetingId);

      if (!meeting) return;

      const userPair = await getConnectionPair(meeting, socket.id, toId);
      const anotherUserPair = await getConnectionPair(meeting, toId, socket.id);

      if (!userPair || !anotherUserPair) return;

      const anotherUser = meeting.users.get(toId);
      const userMeeting = meeting.users.get(socket.id);

      if (!anotherUser || !userMeeting) return;

      if (userPair.role === 'offer') {
        socket.emit('answer-candidate', { peerId: toId, candidate });
      } else {
        io.to(toId).emit('answer-candidate', { peerId: socket.id, candidate });
      }
    });

    socket.on('disconnect', async () => {
      await removeUserFromMeeting(socket.id, (meeting) => {
        io.to(meeting.roomId).emit('user-leave', { id: socket.id });
      });

      await deleteUser(socket.id);
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      if (dev) {
        console.log(`> Ready on https://${hostname}:${port}`);
      } else {
        console.log(`> Ready on http://${hostname}:${port}`);
      }
    });
});

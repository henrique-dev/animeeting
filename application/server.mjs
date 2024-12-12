import fs from 'fs';
import next from 'next';
import { createServer } from 'node:https';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

const key = fs.readFileSync('certificates/cert.key');
const cert = fs.readFileSync('certificates/cert.crt');

const meetings = new Map();

app.prepare().then(() => {
  const httpServer = createServer(
    {
      key,
      cert,
    },
    handler
  );

  const io = new Server(httpServer, {});

  const getMeeting = (meetingId) => {
    if (!meetings.has(meetingId)) {
      meetings.set(meetingId, {
        host: undefined,
        offer: undefined,
        answer: undefined,
        users: new Map(),
        offerCandidates: [],
        answerCandidates: [],
      });
    }

    return meetings.get(meetingId);
  };

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    const userId = socket.handshake.auth.userId;

    socket.on('start-call', (data) => {
      const { meetingId } = data;

      const meeting = getMeeting(meetingId);

      meeting.users.set(userId, {
        socketId: socket.id,
      });

      if (meeting.users.size === 1) {
        meeting.host = socket.id;
        io.to(meeting.host).emit('create-offer');
      } else {
        for (const user of meeting.users.values()) {
          if (user.socketId === meeting.host) continue;

          io.to(user.socketId).emit('create-answer', { offer: meeting.offer, offerCandidates: meeting.offerCandidates });
        }
      }
    });

    socket.on('offer', (data) => {
      const { meetingId, offer } = data;

      const meeting = getMeeting(meetingId);

      meeting.offer = offer;
    });

    socket.on('offers', (data) => {
      const { meetingId, candidate } = data;

      const meeting = getMeeting(meetingId);

      meeting.offerCandidates.push(candidate);
    });

    socket.on('answer', (data) => {
      const { meetingId, answer } = data;

      const meeting = getMeeting(meetingId);

      meeting.answer = answer;

      io.to(meeting.host).emit('answer', { answer: meeting.answer });
    });

    socket.on('disconnect', () => {
      for (const meeting of meetings.values()) {
        meeting.users.delete(userId);
      }
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on https://${hostname}:${port}`);
    });
});

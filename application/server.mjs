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

app.prepare().then(() => {
  const httpServer = createServer(
    {
      key,
      cert,
    },
    handler
  );

  const io = new Server(httpServer, {});

  io.on('connection', (socket) => {
    console.log('someone has connected');
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

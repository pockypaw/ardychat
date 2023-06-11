const { createServer } = require('http');
const { Server } = require('socket.io');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const server = createServer((req, res) => {
  const parsedUrl = parse(req.url, true);
  handle(req, res, parsedUrl);
});

const io = new Server(server, {
  /* Socket.IO options */
});

// Store nicknames and online users
const users = {};

io.on('connection', (socket) => {
  // Change nickname
  socket.on('changeNickname', (newNickname) => {
    const oldNickname = users[socket.id];
    users[socket.id] = newNickname;
    io.emit('nicknameChanged', { oldNickname, newNickname });
    io.emit('updateOnlineUsers', Object.values(users));
  });

  // Handle chat messages
  socket.on('chatMessage', (message) => {
    const nickname = users[socket.id] || 'Anonymous';
    io.emit('chatMessage', { nickname, message });
  });

  // Add user to online users and update all clients
  users[socket.id] = 'Anonymous';
  io.emit('updateOnlineUsers', Object.values(users));

  // Remove user from online users on disconnect
  socket.on('disconnect', () => {
    delete users[socket.id];
    io.emit('updateOnlineUsers', Object.values(users));
  });
});

app.prepare().then(() => {
  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});

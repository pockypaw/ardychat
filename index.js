const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
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

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});

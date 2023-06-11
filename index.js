const { Server } = require("socket.io");

module.exports = async (req, res) => {
  if (req.method === "POST") {
    const io = new Server();
    const users = {};

    io.on("connection", (socket) => {
      socket.on("changeNickname", (newNickname) => {
        const oldNickname = users[socket.id];
        users[socket.id] = newNickname;
        io.emit("nicknameChanged", { oldNickname, newNickname });
        io.emit("updateOnlineUsers", Object.values(users));
      });

      socket.on("chatMessage", (message) => {
        const nickname = users[socket.id] || "Anonymous";
        io.emit("chatMessage", { nickname, message });
      });

      users[socket.id] = "Anonymous";
      io.emit("updateOnlineUsers", Object.values(users));

      socket.on("disconnect", () => {
        delete users[socket.id];
        io.emit("updateOnlineUsers", Object.values(users));
      });
    });

    // Start the serverless WebSocket
    io.serveHttp(req, res);
  } else {
    res.statusCode = 404;
    res.end();
  }
};

const socket = io();

// Receive the initial username from the server
socket.on('username', (username) => {
  document.getElementById('nicknameInput').value = username;
});

// Handle a nickname change event
socket.on('nicknameChanged', ({ oldNickname, newNickname }) => {
  const chatDiv = document.getElementById('chat');
  chatDiv.innerHTML += `<div><em>${oldNickname} changed their nickname to ${newNickname}</em></div>`;
});

// Handle a chat message event
socket.on('chatMessage', ({ username, message }) => {
  const chatDiv = document.getElementById('chat');
  chatDiv.innerHTML += `<div><strong>${username}: </strong>${message}</div>`;
});

// Send a chat message
document.getElementById('messageForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const messageInput = document.getElementById('messageInput');
  const message = messageInput.value.trim();
  if (message !== '') {
    socket.emit('chatMessage', message);
    messageInput.value = '';
  }
});

// Change the nickname
document.getElementById('nicknameForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const nicknameInput = document.getElementById('nicknameInput');
  const newNickname = nicknameInput.value.trim();
  if (newNickname !== '') {
    socket.emit('changeNickname', newNickname);
  }
});

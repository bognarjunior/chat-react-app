const io = require('./index').io;

const {
  VERIFY_USER,
  USER_CONNECTED,
  USER_DISCONNECTED,
  LOGOUT,
  COMMUNITY_CHAT,
  MESSAGE_RECIEVED,
  MESSAGE_SENT,
  TYPING,
  PRIVATE_MESSAGE
} = require('./../Events');

const { createChat, createMessage, createUser } = require('./../Factories');

let connectedUsers = {};
let communityChat = createChat();

module.exports = function(socket){
  console.log(`Socket id: ${socket.id}`);
  
  let sendMessageToChatFromUser;
  let sendTypingFromUser;

  // Chama o chat global
	socket.on(COMMUNITY_CHAT, (callback)=>{
		callback(communityChat)
  })
  
  // Se o socket recebeu a chamada de verificar 
  socket.on(VERIFY_USER, (nickname, callback) => {
    // Já existe usuário
    if (isUser(connectedUsers, nickname)) {
      // retorna true e usuário vazio
      callback({
        isUser: true,
        user: null
      })
    } else {
      // Não existe usuário retorna false e cria um novo usuário
      callback({
        isUser: false,
        user: createUser({
          name: nickname,
          socketId: socket.id
        })
      })
    }
  });

  // Ação para conectar o usuário
  socket.on(USER_CONNECTED, (user) => {
    user.socketId = socket.id;
    connectedUsers = addUser(connectedUsers, user);
    socket.user = user;

    sendMessageToChatFromUser = sendMessageToChat(user.name);
    sendTypingFromUser = sendTypingToChat(user.name);

		io.emit(USER_CONNECTED, connectedUsers)
		console.log(connectedUsers);
  });

  // Chama a função quando o usuário é desconectado do chat
  // Cai a internet ou refresh na página 
  socket.on('disconnect', () => {
    if ("user" in socket) {
      connectedUsers = removeUser(connectedUsers, socket.user.name);
      io.emit(USER_DISCONNECTED, connectedUsers);
    }
  });

  // Ação para desconectar o usuário
	socket.on(LOGOUT, () => {
		connectedUsers = removeUser(connectedUsers, socket.user.name)
		io.emit(USER_DISCONNECTED, connectedUsers);
  });
  
  // Manda a mensagem
  socket.on(MESSAGE_SENT, ({chatId, message}) => {
		sendMessageToChatFromUser(chatId, message)
  });
  
  // Dispara o evento que fala que o usuário está escrevendo
  socket.on(TYPING, ({chatId, isTyping}) => {
		sendTypingFromUser(chatId, isTyping);
  });
  
  // Cria um chat privado
  socket.on(PRIVATE_MESSAGE, ({reciever, sender}) => {
		if (reciever in  connectedUsers) {
      const newChat = createChat({
        name: `Chat privado ${reciever} e ${sender}`,
        users: [reciever, sender]
      });
      const recieverSocket = connectedUsers[reciever].socketId;
      socket.to(recieverSocket).emit(PRIVATE_MESSAGE, newChat);
      socket.emit(PRIVATE_MESSAGE, newChat);
    }
	});
}

/** 
 * Valida se o usuário já está na lista
 * @param userList {Object} Objeto de usuários
 * @param username {String} usuário que será validado
 * @return userList {Object} Objeto de usuários
 */
function isUser(userList, username) {
  return username in userList
}

/** 
 * Remove um usuário da lista dos conectados
 * @param userList {Object} Objeto de usuários
 * @param username {string} nome do usuário que será removido
 * @return userList {Object} Objeto de usuários
 */
function removeUser(userList, username) {
  let newList = Object.assign({}, userList)
  delete newList[username]
  return newList
}

/** 
 * Adiciona um usuário na lista dos conectados
 * @param userList {Object} Objeto de usuários
 * @param user {User} usuário que será adicionado na lista
 * @return userList {Object} Objeto de usuários
 */
function addUser(userList, user) {
  let newList = Object.assign({}, userList)
  newList[user.name] = user
  return newList
}

/** 
 * Retorna uma função que levará o id do chat e uma mensagem
 * em seguida, emiti a mensagem para o chat
 * @param sender {string} usuários que mandou a mensagem
 * @return function(chatId, message)
 */
function sendMessageToChat(sender) {
	return (chatId, message) => {
		io.emit(`${MESSAGE_RECIEVED}-${chatId}`, createMessage({message, sender}));
	}
}

/** 
 * Retorna uma função que verifica se o usuário está digitando
 * @param user {string} usuário que esta verificando
 * @return function(chatId, message)
 */
function sendTypingToChat(user) {
	return (chatId, isTyping) => {
		io.emit(`${TYPING}-${chatId}`, {user, isTyping})
	}
}
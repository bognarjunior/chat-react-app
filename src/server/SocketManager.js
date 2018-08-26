const io = require('./index').io;

const { VERIFY_USER, USER_CONNECTED, USER_DISCONNECTED, LOGOUT, COMMUNITY_CHAT } = require('./../Events');
const { createChat, createMessage, createUser } = require('./../Factories');

let connectedUsers = {};
let communityChat = createChat();

module.exports = function(socket){
  console.log(`Socket id: ${socket.id}`);

  //Get Community Chat
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
          name: nickname
        })
      })
    }
  });

  // Ação para conectar o usuário
  socket.on(USER_CONNECTED, (user) => {
    connectedUsers = addUser(connectedUsers, user);
    socket.user = user;
  })

  // Chama a função quando o usuário é desconectado do chat
  // Cai a internet ou refresh na página 
  socket.on('disconnect', () => {
    if ("user" in socket) {
      connectedUsers = removeUser(connectedUsers, socket.user.name);
      io.emit(USER_DISCONNECTED, connectedUsers);
    }
  })

  // Ação para desconectar o usuário
	socket.on(LOGOUT, () => {
		connectedUsers = removeUser(connectedUsers, socket.user.name)
		io.emit(USER_DISCONNECTED, connectedUsers);
	})
}

/** 
 * Valida se o usuário já está na lista
 * @param userList {Object} Objeto de usuários
 * @param username {String} usuário que será validado
 * @return userList {Object} Objeto de usuários
 */
function isUser(userList, username){
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
function addUser(userList, user){
  let newList = Object.assign({}, userList)
  newList[user.name] = user
  return newList
}

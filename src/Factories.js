const uuidv4 = require('uuid/v4');
const getTime = (date)=> `${date.getHours()}:${("0"+date.getMinutes()).slice(-2)}`;

/**	
 * Cria o usuário
 * @prop id {string} id do usuário
 * @prop name {string} nome que aparecerá logado
 * @param {object} 
 * 	name {string}
 */
const createUser = ({name, socketId = null}) => (
	 {
		id: uuidv4(),
		name,
		socketId
	}
);

/**	
 * Cria a mensagem
 * @prop id {string}
 * @prop time {Date} data formato de 24 horas
 * @prop message {string} mensagem
 * @prop sender {string} quem enviou a mensagem
 * @param {object} 
 *	message {string}
 *	sender {string}
 */
const createMessage = ({message, sender})=>{
	return {
		id: uuidv4(),
		time: getTime(new Date(Date.now())),
		message: message,
		sender: sender
	}
} 

/**	
 * Cria o chat
 * @prop id {string}
 * @prop name {string}
 * @prop messages {Array.Message}
 * @prop users {Array.string}
 * @prop isCommunity {boolean}
 * @prop addMessage {function} adiciona mensagem no chat
 * @prop addTypingUser {function} adiciona o nome do usuário que está digitando
 * @prop removeTypingUser {function} remove o nome do usuário que está digitando
 * @param {object} 
 *		messages {Array.Message}
 *		name {string}
 *		users {Array.string} 
 */
const createChat = ({messages = [], name="Global", users=[], isCommunity = false} = {})=>(
	{
		id: uuidv4(),
		name: isCommunity ? name : createChatNameFromUsers(users),
		messages,
		users,
		isCommunity,
		typingUsers: [],

		addMessage: (messages, message)=>{
			return [...messages, message]
		},
		addTypingUser: (typingUsers, username)=>{
			return [...typingUsers, username]
		},
		removeTypingUser: (typingUsers, username) => {
			return typingUsers.filter((u)=>u === username)

		}
	}
)

/** 
* @param users {Array.string} Lista de usuários
* @param excludedUser {string} Usuário para excluir da lista
* @return {string} Nomes dos usuários concatenados por ' - ' ou "Chat vazio" se não tiver ninguém
*/
const createChatNameFromUsers = (users, excludedUser = "") => {
	return users.filter(u => u !== excludedUser).join(' - ') || "Chat vazio"
}

module.exports = {
	createChat,
	createMessage,
	createUser,
	createChatNameFromUsers
}

import React, { Component } from 'react'
import { values, difference, differenceBy } from 'lodash'

import {
  COMMUNITY_CHAT,
  MESSAGE_SENT,
  MESSAGE_RECIEVED,
	TYPING,
	PRIVATE_MESSAGE,
	USER_CONNECTED, 
	USER_DISCONNECTED,
	NEW_CHAT_USER
} from './../../Events';

import Sidebar from '../SideBar/SideBar';
import ChatHeading from './ChatHeading';
import Messages from './../Message/Messages';
import MessageInput from './../Message/MessageInput';


export default class ChatContainer extends Component {
  constructor(props) {
    super(props)
  
    this.state = {
			chats: [],
			users:[],
      activeChat: null
    }
  }
  
  componentDidMount() {
		const { socket } = this.props;
		this.initSocket(socket);
	}

	componentWillUnmount() {
		const { socket } = this.props;
		socket.off(PRIVATE_MESSAGE);
		socket.off(USER_CONNECTED);
		socket.off(USER_DISCONNECTED);
		socket.off(NEW_CHAT_USER);
	}

	initSocket = (socket) => {
		socket.emit(COMMUNITY_CHAT, this.resetChat);
		socket.on(PRIVATE_MESSAGE, this.addChat);

		socket.on('connect', () => {
			socket.emit(COMMUNITY_CHAT, this.resetChat);
		});

		socket.on(USER_CONNECTED, (users) => {
			this.setState({ 
				users: values(users) 
			});
		});

		socket.on(USER_DISCONNECTED, (users) => {
			const removedUsers = differenceBy(this.state.users, users, 'id');
			this.removeUsersFromChat(removedUsers);
			this.setState({ 
				users: values(users) 
			});	
		});

		socket.on(NEW_CHAT_USER, this.addUserToChat);
	}

	/**	
   * Reseta o chat
	 * @param chat {Chat}
	 */
	resetChat = (chat) => {
		return this.addChat(chat, true);
	}

	/**	
   * Adiciona chat ao contêiner de chat, 
   * se a redefinição for verdadeira, 
   * remove todos os chats e define o chat para o chat principal.
	 * Define a mensagem e digita eventos do socket para o chat
	 *	
	 *	@param chat {Chat} Chat que foi adicionado
	 *	@param reset {boolean} se true irá definir o chat como o único chat
	 */
	addChat = (chat, reset = false) => {
		const { socket } = this.props;
		const { chats } = this.state;

		const newChats = reset ? [chat] : [...chats, chat];
		this.setState({
      chats:newChats, 
      activeChat:reset ? chat : this.state.activeChat
    });

		const messageEvent = `${MESSAGE_RECIEVED}-${chat.id}`;
		const typingEvent = `${TYPING}-${chat.id}`;

		socket.on(typingEvent, this.updateTypingInChat(chat.id));
		socket.on(messageEvent, this.addMessageToChat(chat.id));
	}

	/** 	
   * Retorna uma função que adicionará uma mensagem 
   * para conversar com o chatId
	 *
	 * @param chatId {number} Id do chat
	 */
	addMessageToChat = (chatId) => {
		return message => {
			const { chats } = this.state
			let newChats = chats.map((chat) => {
				if( chat.id === chatId)
					chat.messages.push(message)
				return chat;
			})

			this.setState({chats:newChats})
		}
	}

	/**	
   * Atualiza a digitação do chat com o id
	 *	@param chatId {number} Id do Chat
	 */
	updateTypingInChat = (chatId) => {
		return ({isTyping, user}) => {
			if (user !== this.props.user.name) {

				const { chats } = this.state

				let newChats = chats.map((chat) => {
					if (chat.id === chatId){
						if (isTyping && !chat.typingUsers.includes(user)) {
							chat.typingUsers.push(user);
						} else if (!isTyping && chat.typingUsers.includes(user)) {
							chat.typingUsers = chat.typingUsers.filter(u => u !== user);
						}
					}
					return chat;
				});
				
				this.setState({
					chats: newChats
				})
			}
		}
  }
  
  /**	
   * Adiciona uma mensagem a um chat
	 * @param chatId {number}  Id do chat
	 * @param message {string} Mensagem que será adicionada ao chat
	 */
	sendMessage = (chatId, message)=>{
		const { socket } = this.props
		socket.emit(MESSAGE_SENT, {chatId, message} )
	}

	/**	
   * Manda para o servidor o status escrevendo
	 * @param	chatId {number} Id do chat
	 * @param	typing {boolean} Se o usuário está digitando ou não
	 */
	sendTyping = (chatId, isTyping) => {
		const { socket } = this.props
		socket.emit(TYPING, {chatId, isTyping})
  }
  
  setActiveChat = (activeChat) => this.setState({ activeChat });

	/**	
   * Chama a função para enviar mensagem privada
	 * @param	reciever {string} nome de quem receberá a mensagem
	 */
	sendOpenPrivateMessage = (reciever) => {
		const { socket, user } = this.props;
		const { activeChat } = this.state;

 		socket.emit(PRIVATE_MESSAGE, {
			reciever, 
			sender:user.name,
			activeChat
		});
	}

	addUserToChat = ({chatId, newUser}) => {
		const { chats } = this.state;
		const newChats = chats.map(chat => {
			if (chat.id === chatId) {
				return Object.assign({}, chat, {
					users: [...chat.users, newUser]
				});
			}
			return chat;
		});

		this.setState({
			chats: newChats
		});
	}

	removeUsersFromChat = removeUsers => {
		const { chats } = this.state;
		const newChats = chats.map(chat => {
			let newUsers = difference(chat.users, removeUsers.map(u => u.name))
			return Object.assign({}, chat, {
				users: newUsers
			});
		});
		this.setState({
			chats: newChats
		});
	}

  render() {
		const { user, logout} = this.props;
		
    const {
			chats,
			activeChat, 
			users 
		} = this.state;

    return (
      <div className="container">
        <Sidebar 
          logout={logout}
          chats={chats}
          user={user}
					users={users}
          activeChat={activeChat}
          setActiveChat={this.setActiveChat}
					onSendOpenPrivateMessage={this.sendOpenPrivateMessage}
        />
        <div className="chat-room-container">
        {
          activeChat ? (
            <div className="chat-room">
              <ChatHeading name={activeChat.name} />
              <Messages 
                messages={activeChat.messages}
                user={user}
                typingUsers={activeChat.typingUsers}
              />
              <MessageInput 
                sendMessage={(message) => {
                  this.sendMessage(activeChat.id, message)
                }}
                sendTyping={(isTyping) => {
                  this.sendTyping(activeChat.id, isTyping)
                }}
              />
            </div>
          ) : 
          <div className="chat-room choose">
            <h3>
              Escolha um chat
            </h3>
          </div>
        }
        </div>
      </div>
    )
  }
}

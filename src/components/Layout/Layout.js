import React, { Component } from 'react'
import io from 'socket.io-client';

import LoginForm from './../Login/LoginForm';
import ChatContainer from './../Chat/ChatContainer';

import { USER_CONNECTED, LOGOUT, VERIFY_USER } from './../../Events';

const socketURL = "http://192.168.15.13:3231/";

export default class Layout extends Component {

  constructor(props) {
    super(props);
  
    this.state = {
       socket: null,
       user: null
    }
  }

  componentDidMount = () => {
    this.initSocket();
  }
  
  initSocket = () => {
    const socket = io(socketURL);

    socket.on('connect', () => {
      if (this.state.user) {
        this.reconnect(socket);
      }
    });
    this.setState({
      socket
    })
  }

  setUser = (user) => {
    const { socket } = this.state;
    socket.emit(USER_CONNECTED, user);
    this.setState({
      user
    })
  }

  logout = () => {
    const { socket } = this.state;
    socket.emit(LOGOUT);
    this.setState({
      user: null
    })
  }

  reconnect = (socket) => {
    const { user } = this.state;
    socket.emit(VERIFY_USER, user.name, ({ isUser, name }) => {
      if (isUser) {
        this.setState({
          user: null
        })
      } else {
        this.setUser(user);
      }
    });
  }

  render() {
    const { socket, user } = this.state;
    return (
      <div className="container">
      {
        !user ?
          <LoginForm socket={socket} setUser={this.setUser}/>
        :
          <ChatContainer socket={socket} user={user} logout={this.logout}/>
      }
        
      </div>
    )
  }
}

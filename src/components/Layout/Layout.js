import React, { Component } from 'react'
import io from 'socket.io-client';

import { USER_CONNECTED, LOGOUT } from './../../Events';

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
      console.log('====================================')
      console.log('Conectado')
      console.log('====================================')
    })
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

  render() {
    const { title } = this.props;
    return (
      <div className="container">
        {title}
      </div>
    )
  }
}

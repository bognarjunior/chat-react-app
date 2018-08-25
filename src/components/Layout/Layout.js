import React, { Component } from 'react'
import io from 'socket.io-client';

const socketURL = "http://192.168.15.13:3231/";

export default class Layout extends Component {

  constructor(props) {
    super(props);
  
    this.state = {
       socket: null
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

  render() {
    const { title } = this.props;
    return (
      <div className="container">
        {title}
      </div>
    )
  }
}

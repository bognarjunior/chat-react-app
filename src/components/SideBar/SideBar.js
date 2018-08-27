import React, { Component } from 'react';
import { last, get, differenceBy } from 'lodash';

import {
  FaChevronDown, 
  FaListUl, 
  FaSearch, 
} from 'react-icons/fa';

import { MdEject } from 'react-icons/md';

import { SideBarOption } from './SideBarOption';

import { createChatNameFromUsers } from '../../Factories';

export default class SideBar extends Component{
  static type = {
		USERS:"users",
		CHATS:"chats"
  }
  
  constructor(props) {
    super(props)
  
    this.state = {
      reciever: "",
      activeSideBar: SideBar.type.CHATS
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { reciever } = this.state;
    const { onSendOpenPrivateMessage } = this.props;

    onSendOpenPrivateMessage(reciever);

    this.setState({
      reciever: ""
    })
  }
    
  addChatForUser = (reciever) => {
		this.props.onSendOpenPrivateMessage(reciever);
		this.setActiveSideBar(SideBar.type.CHATS);
  }
  
	setActiveSideBar = (type) => {
		this.setState({ activeSideBar:type })
  }
  
	render() {

		const {
      chats, 
      activeChat, 
      users,
      user, 
      setActiveChat, 
      logout
    } = this.props;

    const { reciever, activeSideBar } = this.state;

		return (
			<div id="side-bar">
        <div className="heading">
          <div className="app-name">Chat <FaChevronDown /></div>
          <div className="menu">
            <FaListUl />
          </div>
        </div>
        <form onSubmit={this.handleSubmit} className="search">
          <i className="search-icon"><FaSearch /></i>
          <input 
            placeholder="Search" 
            type="text"
            value={reciever}
            onChange={(e) => this.setState({ 
              reciever: e.target.value 
            })}
          />
          <div className="plus"></div>
        </form>
        <div className="side-bar-select">
					<div 
            onClick = { () => { this.setActiveSideBar(SideBar.type.CHATS) } }
            className={`side-bar-select__option ${ activeSideBar === SideBar.type.CHATS ? 'active':''}`}>
            <span>Chats</span>
          </div>
          <div 
            onClick = { () => { this.setActiveSideBar(SideBar.type.USERS) } }
            className={`side-bar-select__option ${ activeSideBar === SideBar.type.USERS ? 'active':''}`}>
            <span>Usuários</span>
          </div>
        </div>
        <div 
          className="users" 
          ref='users' 
          onClick={(e) => {
            (e.target === this.refs.user) && setActiveChat(null) 
          }}
        >
          {
						activeSideBar === SideBar.type.CHATS ?
						chats.map((chat) => {
							return (
								<SideBarOption 
									key={chat.id}
									lastMessage={ get(last(chat.messages), 'message', '') }
									name={ 
                    chat.isCommunity ? 
                    chat.name : createChatNameFromUsers(chat.users, user.name) 
                  }
									active={activeChat.id === chat.id}
									onClick={() => this.props.setActiveChat(chat)}
								/>
							)
						})	
						:
							differenceBy(users, [user], 'name').map((user) => {
								return (
                  <SideBarOption 
                    key={user.id }
                    name={user.name}
                    onClick={() => this.addChatForUser(user.name)}
								  />
                )
							})
						}
        </div>
        <div className="current-user">
          <span>{user.name}</span>
          <div onClick={() => { logout() }} title="Sair" className="logout">
            <MdEject/>	
          </div>
        </div>
    </div>
	)}
}
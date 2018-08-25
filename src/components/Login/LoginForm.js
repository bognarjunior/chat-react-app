import React, { Component } from 'react';
import { VERIFY_USER } from './../../Events';

export default class LoginForm extends Component {
  constructor(props) {
    super(props)
  
    this.state = {
      nickname: "",
      error: null
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { socket } = this.props;
    const { nickname } = this.state;
    socket.emit(VERIFY_USER, nickname, this.setUser);
  }

  handleChange = (e) => this.setState({ nickname: e.target.value });
  
  setUser = ({ user, isUser }) => {
    if (isUser) {
      this.setError("Apelido já utilizado");
    } else {
      this.props.setUser(user);
    }
  }

  setError = (error) => this.setState({ error });

  render() {
    const { nickname, error } = this.state;
    return (
      <div className="login">
        <form onSubmit={this.handleSubmit} className="login-form">
          <label htmlFor="nickname">
            <h2>Escolha um apelido</h2>
          </label>
          <input
            type="text"
            ref={(input) => this.textInput = input}
            id="nickname"
            value={nickname}
            onChange={this.handleChange}
            placeholder={'Digite um apelido'}
          >
          </input>
          <div className="error">
            {error ? error : null}
          </div>
        </form>
      </div>
    )
  }
}

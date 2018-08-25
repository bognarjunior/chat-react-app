import React, { Component } from 'react'

export default class LoginForm extends Component {
  constructor(props) {
    super(props)
  
    this.state = {
      nickname: "",
      error: null
    }
  }
  
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

import React, { Component } from 'react'

export default class ChatContainer extends Component {
  render() {
    const { user, logout} = this.props;
    return (
      <div className="container">
        Chat container
      </div>
    )
  }
}

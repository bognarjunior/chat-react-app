import React from 'react'

export default ({name, numberOfUsers}) => {
  return (
    <div className="chat-header">
      <div className="user-info">
        <div className="user-name">
          {name}
        </div>
        <div className="status">
          <div className="indicator"></div>
          {
            numberOfUsers ?
              <span>{numberOfUsers}</span>
            : null
          }
        </div>
      </div>
    </div>
  )
}

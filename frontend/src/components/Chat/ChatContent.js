import React from 'react';
import './ChatContent.css';

function formatMessage(message) {
  // 将文本按行分割
  const lines = message.split('\n');
  const formattedContent = [];

  lines.forEach((line, index) => {
    // 检查是否为编号列表项 (数字开头的项目)
    const numberedListItemMatch = line.match(/^(\d+)\.\s+(.*)/);
    
    // 检查是否为无序列表项 (用 * 或 - 开头的项目)
    const bulletListItemMatch = line.match(/^[-*]\s+(.*)/);

    // 处理带有加粗内容的行
    const boldParts = line.split(/\*\*(.*?)\*\*/g).map((part, idx) => 
      idx % 2 === 1 ? <strong key={idx}>{part}</strong> : part
    );

    if (numberedListItemMatch) {
      // 编号列表项
      formattedContent.push(
        <li key={index}>
          {boldParts} {/* 使用处理后的文本内容 */}
        </li>
      );
    } else if (bulletListItemMatch) {
      // 无序列表项
      formattedContent.push(
        <li key={index}>
          {boldParts} {/* 使用处理后的文本内容 */}
        </li>
      );
    } else {
      // 普通文本
      formattedContent.push(<p key={index}>{boldParts}</p>);
    }
  });

  return (
    <ul>
      {formattedContent}
    </ul>
  );
}

function ChatContent({ chatHistory }) {
  return (
    <div className="chat-content">
      {chatHistory.map((chat, index) => (
        <div key={index} className={chat.type === 'impressionCard' ? '' : `chat-message ${chat.isUser !== undefined ? (chat.isUser ? 'user' : 'system') : (chat.role === 'user' ? 'user' : 'system')}`}>
          {chat.type === 'impressionCard' ? (
            <div className="impression-card">
              <h4>{chat.PoI}</h4>
              <div className="impression-card-slider">
                {chat.pic_urls.map((url, idx) => (
                  <img key={idx} src={url} alt={chat.PoI} />
                ))}
              </div>
              <p>{chat.city}</p>
              <a href={chat.source_urls[0]} target="_blank" rel="noopener noreferrer">More Info</a>
            </div>
          ) : (
            <div className="message-text">
                {formatMessage(chat.message || chat.content)}
            </div>
          )}
          {/* Uncomment to show message date */}
          {/* <div className="message-date">{new Date(chat.date).toLocaleString()}</div> */}
        </div>
      ))}
    </div>
  );
}


export default ChatContent;

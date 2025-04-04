import React, { useState, useEffect, useContext } from "react";
import { FaCommentAlt } from "react-icons/fa";
import Context from "../../context";
import { useSelector } from "react-redux";

const Chat = () => {
  const user = useSelector((state) => state?.user?.user);
  const { socket } = useContext(Context);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };
  
  useEffect(() => {
    console.log(user);

    if (socket) {
      socket.on("receiveMessage", (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      return () => {
        socket.off("receiveMessage");
      };
    }
  }, [socket]);

  const sendMessage = (e) => {
    e.preventDefault();

    if (newMessage.trim() === "") return;

    socket.emit("sendMessage", newMessage);

    setMessages((prevMessages) => [
      ...prevMessages,
      { user: "Me", message: newMessage },
    ]);
    setNewMessage("");
  };

  return (
    <div className="chat-container">
      {isChatOpen && (
        <div className="chat-box">
          <div className="chat-header">
            <h4>Chat with Support</h4>
            <button className="close-btn" onClick={toggleChat}>
              X
            </button>
          </div>

          <div className="messages">
            {messages.map((msg, index) => (
              <div key={index} className="message">
                <strong>{msg.user}: </strong>
                {msg.message}
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage} className="message-form">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="message-input"
            />
            <button type="submit" className="send-btn">
              Send
            </button>
          </form>
        </div>
      )}

      {!isChatOpen && (
        <button className="open-chat-btn" onClick={toggleChat}>
          <FaCommentAlt />
        </button>
      )}
    </div>
  );
};

export default Chat;

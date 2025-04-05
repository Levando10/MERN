import React, { useState, useEffect, useContext, useRef } from "react";
import { FaCommentAlt } from "react-icons/fa";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import SweetAlert from "sweetalert";
import SummaryApi from "../../common";

const Chat = () => {
  const user = useSelector((state) => state?.user?.user);
  const socketRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const toggleChat = async () => {
    setIsChatOpen(!isChatOpen);

    if (!isChatOpen) {
      messagesEndRef?.current?.scrollIntoView({ behavior: "smooth" });

      const fetchMessagesData = await fetch(SummaryApi.fetchMessages.url, {
        method: SummaryApi.fetchMessages.method,
        credentials: "include",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ userId: user?._id }),
      });

      const messagesData = await fetchMessagesData.json();
      if (messagesData.success) {
        const formattedMessages = messagesData.data.map((msg) => {
          return {
            user: msg.sender === "67e7d4d4239e88be03f4c93e" ? "Admin" : "User",
            message: msg.content,
          };
        });

        setMessages(formattedMessages);
      } else {
        SweetAlert("Error", "Failed to fetch messages.", "error");
      }
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    // const newSocket = io("http://localhost:8080", {
    const newSocket = io("https://mern-v6c4.onrender.com", {
      auth: { token },
    });

    newSocket.on("connect", () => {});

    socketRef.current = newSocket;
    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (socketRef.current) {
      console.log("Connected to WebSocket server!");

      socketRef.current.on("receiveMessage", (data) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            user: data.from === user?._id ? "User" : "Admin",
            message: data.message,
          },
        ]);

        if (data.from === "67e7d4d4239e88be03f4c93e") {
          toast.info(`💬 New messages from Admin`, {
            position: "top-right",
          });
        }

        if (data.to === "67e7d4d4239e88be03f4c93e") {
          toast.info(`💬 New messages from User ${data.emailUser}`, {
            position: "top-right",
          });
        }
      });

      return () => {
        socketRef.current.off("receiveMessage");
      };
    }
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();

    if (!user?._id) {
      return;
    }

    if (newMessage.trim() === "") return;
    const messagePayload = {
      from: user?._id,
      to: "67e7d4d4239e88be03f4c93e",
      message: newMessage,
    };
    socketRef.current.emit("sendMessage", messagePayload);
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        user: "User",
        message: newMessage,
      },
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
              <div
                key={index}
                className={`message ${
                  msg.user === "User" ? "my-message" : "admin-message"
                }`}
              >
                {msg.user !== "User"}
                {msg.message}
              </div>
            ))}
            <div ref={messagesEndRef} />
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

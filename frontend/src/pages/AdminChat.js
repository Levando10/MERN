import React, { useEffect, useRef, useState } from "react";
import SummaryApi from "../common";
import SweetAlert from "sweetalert";
import { FaRegCircleUser } from "react-icons/fa6";
import { io } from "socket.io-client";
import { toast } from "react-toastify";

const AdminChat = () => {
  const [allUser, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  const fetchMessages = async (userId) => {
    const fetchMessagesData = await fetch(SummaryApi.fetchMessages.url, {
      method: SummaryApi.fetchMessages.method,
      credentials: "include",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ userId }),
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
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    fetchMessages(user._id);
  };

  const handleSendMessage = (message) => {
    if (message.trim() === "") return;
    const newMessageData = {
      from: "67e7d4d4239e88be03f4c93e",
      to: selectedUser._id,
      message: message,
    };

    if (socket) {
      socket.emit("sendMessage", newMessageData);
    }

    setMessages((prev) => [
      ...prev,
      {
        user: "Admin",
        message: message,
      },
    ]);
    setNewMessage("");
  };

  const fetchAllUsers = async () => {
    const fetchData = await fetch(SummaryApi.allUser.url, {
      method: SummaryApi.allUser.method,
      credentials: "include",
    });

    const dataResponse = await fetchData.json();
    if (dataResponse.success) {
      setAllUsers(dataResponse.data);
    }

    if (dataResponse.error) {
      SweetAlert(
        "Failed to load user list!",
        "An error occurred while fetching the user list. Please try again later.",
        "error"
      );
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    // const newSocket = io("http://localhost:8080", {
    const newSocket = io("https://mern-v6c4.onrender.com", {
      auth: { token },
    });

    newSocket.on("connect", () => {
      console.log("Connected to WebSocket server!");
    });

    setSocket(newSocket);
    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("receiveMessage", (data) => {
        if (selectedUser && selectedUser._id === data.from) {
          setMessages((prev) => [
            ...prev,
            {
              user: data.from === "67e7d4d4239e88be03f4c93e" ? "Admin" : "User",
              message: data.message,
            },
          ]);
        }
        if (data.from !== "67e7d4d4239e88be03f4c93e") {
          toast.info(`💬 New messages from ${data.emailUser}`, {
            position: "top-right",
          });
        }
      });

      return () => {
        socket.off("receiveMessage");
      };
    }
  }, [socket, selectedUser]);

  useEffect(() => {
    fetchAllUsers();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="adm-chat-container">
      {/* User List */}
      <div className="adm-user-list">
        {allUser.map((user, index) => (
          <div
            key={index}
            className="adm-user-card"
            onClick={() => handleUserSelect(user)}
          >
            <div className="adm-user-avatar">
              {user?.profilePic ? (
                <img
                  src={user?.profilePic}
                  className="w-8 h-8 rounded-full"
                  alt={user?.name}
                />
              ) : (
                <FaRegCircleUser className="w-8 h-8" />
              )}
            </div>
            <div className="adm-user-name">{user.name}</div>
          </div>
        ))}
      </div>

      {/* Chat Box */}
      <div className="adm-user-chat-details">
        {selectedUser ? (
          <>
            <h4
              style={{ display: "flex", gap: "8px" }}
              className="adm-user-name text-xl font-semibold mb-4 px-3"
            >
              <div className="adm-user-avatar">
                {selectedUser?.profilePic ? (
                  <img
                    src={selectedUser?.profilePic}
                    className="w-8 h-8 rounded-full"
                    alt={selectedUser?.name}
                  />
                ) : (
                  <FaRegCircleUser className="w-8 h-8" />
                )}
              </div>
              {selectedUser.name}
            </h4>

            <div className="adm-messages mb-4 h-80 overflow-y-scroll p-3 border rounded-lg">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`adm-message p-2 mb-2 rounded-lg max-w-3/4 ${
                    msg.user === "Admin"
                      ? "bg-red-200 self-start"
                      : "bg-blue-200 self-end"
                  }`}
                  style={{
                    alignSelf: msg.user === "Admin" ? "flex-start" : "flex-end",
                  }}
                >
                  {msg.user !== "Admin" && (
                    <>
                      {" "}
                      {selectedUser?.profilePic ? (
                        <img
                          src={selectedUser?.profilePic}
                          className="w-8 h-8 rounded-full"
                          alt={selectedUser?.name}
                        />
                      ) : (
                        <FaRegCircleUser className="w-8 h-8" />
                      )}{" "}
                    </>
                  )}
                  {msg.message}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="adm-message-input">
              <input
                type="text"
                className="adm-input p-2 w-full border rounded-lg"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleSendMessage(newMessage)
                }
              />
              <button
                className="adm-send-btn p-2 bg-blue-500 text-white rounded-lg"
                onClick={() => handleSendMessage(newMessage)}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-400">
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChat;

import React, { useEffect, useState } from "react";
import "./Styles/Chatuser.css";

function UserSupport() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChat, setSelectedChat] = useState(null); // Track the selected chat
  const [chatPage, setChatPage] = useState(1); // Pagination state for Load More functionality
  const [chats, setChats] = useState([]); // Chats data
  const [loading, setLoading] = useState(false); // Loading state
  const [message, setMessage] = useState(""); // State for new message input

  // Mock chat data (to be replaced with real API data)
  const initialChatUsers = [
    {
      name: "Chatgram",
      message: "Chatgram Web was updated.",
      time: "19:48",
      isVerified: true,
      notificationCount: 1,
      unread: true,
    },
    {
      name: "Jessica Drew",
      message: "Ok, see you later",
      time: "18:30",
      notificationCount: 2,
      unread: false,
    },
    {
      name: "David Moore",
      message: "You: I don't remember anything 😄",
      time: "18:16",
      unread: true,
    },
    {
      name: "Greg James",
      message: "I got a job at SpaceX 🚀🎉",
      time: "18:02",
      unread: false,
    },
    {
      name: "Emily Dorson",
      message: "Table for four, 5 PM. Be there.",
      time: "17:42",
      unread: true,
    },
    {
      name: "Office Chat",
      message: "Lewis: All done mate 👍",
      time: "17:08",
      unread: false,
    },
    {
      name: "Announcements",
      message: "Channel created",
      time: "16:15",
      unread: false,
    },
    {
      name: "Little Sister",
      message: "Tell mom I will be home for tea 💜",
      time: "Wed",
      unread: true,
    },
    {
      name: "Art Class",
      message: "Emily: Editorial",
      time: "Tue",
      unread: false,
    },
  ];

  // Fetch chats for the current page
  useEffect(() => {
    const startIndex = (chatPage - 1) * 5;
    const newChats = initialChatUsers.slice(startIndex, startIndex + 5);
    setChats((prevChats) => [...prevChats, ...newChats]);
  }, [chatPage]);

  // Filter users based on the search term
  const filteredUsers = chats.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle click on a chat item
  const handleChatClick = (user) => {
    setSelectedChat(user); // Set the selected chat to the clicked one
  };

  // Handle sending a new message
  const handleSendMessage = () => {
    if (message.trim() !== "") {
      const updatedChat = {
        ...selectedChat,
        message: message,
        time: new Date().toLocaleTimeString(),
      };
      setSelectedChat(updatedChat); // Update the selected chat with the new message
      setMessage(""); // Clear the message input
    }
  };

  // Load more chats when the user scrolls to the bottom or clicks 'Load More'
  const loadMoreChats = () => {
    setLoading(true);
    setChatPage((prevPage) => prevPage + 1);
    setLoading(false);
  };

  return (
    <div className="chat-container">
      {/* Left Sidebar */}
      <div className="chat-sidebar">
        <div className="chat-search">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Search Suggestions */}
        {searchTerm && filteredUsers.length === 0 ? (
          <div className="search-suggestions">
            <p>No results found for "{searchTerm}".</p>
          </div>
        ) : (
          <ul className="chat-list">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <li
                  key={index}
                  className="chat-item"
                  onClick={() => handleChatClick(user)} // Add click event handler here
                >
                  <div className="chat-avatar">{user.name[0]}</div>
                  <div className="chat-info">
                    <div className="chat-header">
                      <span className="chat-name">{user.name}</span>
                      {user.isVerified && (
                        <span className="verified-badge">✔️</span>
                      )}
                      <span className="chat-time">{user.time}</span>
                    </div>
                    <div className="chat-message">{user.message}</div>
                    {user.unread && (
                      <div className="unread-indicator">
                        <span className="unread-dot"></span>
                      </div>
                    )}
                    {user.notificationCount && (
                      <div
                        className={`chat-notification ${
                          user.notificationCount > 5 ? "high" : "low"
                        }`}
                      >
                        {user.notificationCount}
                      </div>
                    )}
                  </div>
                </li>
              ))
            ) : (
              <p className="empty-state">No chats found</p>
            )}
          </ul>
        )}

        {/* Load More Chats */}
        {loading ? (
          <p>Loading more chats...</p>
        ) : (
          <button className="load-more" onClick={loadMoreChats}>
            Load More
          </button>
        )}
      </div>

      {/* Right Panel */}
      <div className="chat-background">
        {selectedChat ? (
          <div className="chat-details">
            <h2>Chat with {selectedChat.name}</h2>
            <p>{selectedChat.message}</p>
            <span>{selectedChat.time}</span>

            {/* Message input */}
            <div className="chat-input">
              <input
                type="text"
                placeholder="Type a message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button onClick={handleSendMessage}>Send</button>
            </div>
          </div>
        ) : (
          <p>Select a chat to view details.</p>
        )}
      </div>
    </div>
  );
}

export default UserSupport;

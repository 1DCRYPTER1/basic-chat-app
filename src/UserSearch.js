import React, { useState } from "react";

const UserSearch = ({ client, onSelectUser }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const searchUsers = async (e) => {
    const value = e.target.value;
    setQuery(value);

    // Only search if the client is connected and we have at least 2 characters
    if (!client.userID || value.length < 2) {
      setResults([]);
      return;
    }

    setSearching(true);

    try {
      const response = await client.queryUsers({
        id: { $ne: client.userID },
      });

      setResults(response.users);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div
      style={{
        padding: "15px",
        borderBottom: "1px solid #ddd",
        backgroundColor: "#fff",
      }}
    >
      <label
        style={{
          fontSize: "12px",
          fontWeight: "bold",
          color: "#666",
          marginBottom: "5px",
          display: "block",
        }}
      >
        START A NEW CONVERSATION
      </label>
      <input
        placeholder={
          client.userID ? "Type a name or email..." : "Connecting to Chat..."
        }
        disabled={!client.userID}
        value={query}
        onChange={searchUsers}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          boxSizing: "border-box",
          outline: "none",
        }}
      />

      {searching && (
        <div style={{ padding: "10px", fontSize: "12px" }}>Searching...</div>
      )}

      {/* Wrap the entire results container in a conditional check */}
      {(results.length > 0 || (query.length >= 2 && !searching)) && (
        <div
          style={{
            marginTop: "10px",
            maxHeight: "200px",
            overflowY: "auto",
            position: "relative", // Keeps it in the flow but clear
            zIndex: 2, // Ensures results sit above the list when visible
          }}
        >
          {results.length > 0 ? (
            results.map((user) => (
              <div
                key={user.id}
                onClick={() => {
                  console.log("UserSearch: Clicking user", user.id);
                  onSelectUser(user.id);
                  setQuery("");
                  setResults([]);
                }}
                style={{
                  cursor: "pointer",
                  padding: "12px",
                  borderRadius: "6px",
                  marginBottom: "5px",
                  backgroundColor: "#f0f7ff",
                  border: "1px solid #cce5ff",
                }}
              >
                <div style={{ fontWeight: "bold", fontSize: "14px" }}>
                  {user.name || "Unknown User"}
                </div>
                <div style={{ fontSize: "11px", color: "#888" }}>
                  ID: {user.id}
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: "10px", fontSize: "12px", color: "#999" }}>
              No users found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserSearch;

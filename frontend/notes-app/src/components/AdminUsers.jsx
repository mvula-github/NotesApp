// AdminUsers.jsx
import React, { useState } from "react";
import axios from "axios";

const AdminUsers = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const fetchAllUsers = async () => {
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.data.error) {
        setUsers(res.data.users);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "You are not authorized or an error occurred."
      );
    }
  };

  // Only show to admins
  if (!user || user.role !== "admin") return null;

  return (
    <div>
      <h2>Admin Panel</h2>
      <button onClick={fetchAllUsers}>View All Users</button>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {users.length > 0 && (
        <ul>
          {users.map((u) => (
            <li key={u._id}>
              {u.fullName} ({u.email}) - {u.role}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminUsers;

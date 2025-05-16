import React from "react";
import ProfileInfo from "./ProfileInfo";

const Navbar = () => {
  const navigate = useNavigate;

  const onLogout = () => {
    navigate("/login");
  };

  return (
    <div className="bg-white flex items-center justify-between px-6 py-6 drop-shadow">
      <h2 className="text-xl font-medium text-black py-2">Notes</h2>

      <ProfileInfo onLogout={onLogout} />
    </div>
  );
};

export default Navbar;

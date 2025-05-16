import React from "react";
import Navbar from "../../components/Navbar";
import NoteCard from "../../components/NoteCard";

const Home = () => {
  return (
    <>
      <Navbar />

      <div classname="container mx-auto">
        <div className="grid grid-cols-3 gap-4 mt-8">
          <NoteCard
            title="Meeting on the 1st of January"
            date="29th December 2024"
            content="none of your business"
            tags="#Meeting"
            isPinned={true}
            onEdit={() => {}}
            onDelete={() => {}}
            onPinNote={() => {}}
          />
        </div>
      </div>

      <button className="" onClick={() => {}}></button>
    </>
  );
};

export default Home;

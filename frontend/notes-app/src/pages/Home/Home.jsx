import React from "react";
import Navbar from "../../components/Navbar";
import NoteCard from "../../components/NoteCard";
import { MdAdd } from "react-icons/md";
import AddEditNotes from "./AddEditNotes";

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

      <button
        className="w-16 h-16 flex items-center justify-center rounded-2xl bg-black hover:bg-blue-600 absolute right-10 bottom-10"
        onClick={() => {}}
      >
        <MdAdd className="text-[32px] text-white" />
      </button>

      <AddEditNotes />
    </>
  );
};

export default Home;

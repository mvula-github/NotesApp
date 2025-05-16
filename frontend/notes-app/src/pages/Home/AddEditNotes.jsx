import React from "react";
import TagInput from "../../components/TagInput";

const AddEditNotes = () => {
  return (
    <div>
      <div classname="flex flex-col gap-2">
        <label className="input-label">TITLE</label>
        <br />
        <input
          type="text"
          className="text-2xl text-slate-950 outline-none"
          placeholder="Go to school at 9am"
        />
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <label className="input-label">CONTENT</label>

        <textarea
          type="text"
          className="text-sm text-slate-950 bg-slate-50 p-2 rounded "
          placeholder="Content"
          rows={10}
        />
      </div>

      <div className="mt-3">
        <label className="input-label">TAGS</label>
        <TagInput />
      </div>

      <button className="btn-primary font-medium mt-5 pt-3" onClick={() => {}}>
        ADD
      </button>
    </div>
  );
};

export default AddEditNotes;

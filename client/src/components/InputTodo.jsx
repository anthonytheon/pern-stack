import { useState } from "react";

const InputTodo = () => {
  const [description, setDescription] = useState("");

  // CREATE todo
  const onSubmitForm = async (e) => {
    e.preventDefault();

    try {
      const body = { description };

      const response = await fetch("http://localhost:5000/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Failed to create todo");
      }

      window.location.reload();
    } catch (error) {
      console.error("Error creating todo:", error);
    }
  };

  return (
    <>
      <form
        className="d-flex gap-3 justify-content-center"
        onSubmit={onSubmitForm}
      >
        <input
          type="text"
          className="form-control w-50"
          placeholder="Add a todo..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button className="btn btn-success">
          Add
        </button>
      </form>
    </>
  );
};

export default InputTodo;
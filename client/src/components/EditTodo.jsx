import { useState } from "react";

const EditTodo = ({ todo }) => {
  const [description, setDescription] = useState(todo.description);

  // UPDATE todo
  const updateDescription = async (e) => {
    e.preventDefault();

    try {
      const body = { description };

      const response = await fetch(
        `http://localhost:5000/todos/${todo.todo_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update todo");
      }

      window.location.reload();
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  return (
    <>
      <button
        type="button"
        className="btn btn-warning"
        data-bs-toggle="modal"
        data-bs-target={`#id${todo.todo_id}`}
      >
        Edit
      </button>

      <div
        className="modal fade"
        id={`id${todo.todo_id}`}
        tabIndex="-1"
        data-bs-backdrop="static"
      >
        <div className="modal-dialog">
          <div
            className="modal-content"
            style={{ color: "black" }}
          >
            <div className="modal-header">
              <h5 className="modal-title">
                Edit Todo
              </h5>

              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                onClick={() =>
                  setDescription(todo.description)
                }
              ></button>
            </div>

            <div className="modal-body">
              <input
                type="text"
                className="form-control"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
              />
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-warning"
                data-bs-dismiss="modal"
                onClick={updateDescription}
              >
                Edit
              </button>

              <button
                type="button"
                className="btn btn-danger"
                data-bs-dismiss="modal"
                onClick={() =>
                  setDescription(todo.description)
                }
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditTodo;
import { useEffect, useState } from "react";

import EditTodo from "./EditTodo";

const ListTodos = () => {
  const [todos, setTodos] = useState([]);

  // GET all todos
  const getTodos = async () => {
    try {
      const response = await fetch("http://localhost:5000/todos");

      if (!response.ok) {
        throw new Error("Failed to fetch todos");
      }

      const data = await response.json();

      setTodos(data);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  // DELETE todo
  const deleteTodo = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5000/todos/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete todo");
      }

      setTodos((prevTodos) =>
        prevTodos.filter((todo) => todo.todo_id !== id)
      );
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  useEffect(() => {
    getTodos();
  }, []);

  return (
    <div className="table-responsive">
      <table className="table table-dark table-hover table-striped rounded overflow-hidden">
        <thead>
          <tr>
            <th>Description</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>

        <tbody>
          {todos.map((todo) => (
            <tr key={todo.todo_id} className="align-middle">
              <td>{todo.description}</td>

              <td>
                <EditTodo todo={todo} />
              </td>

              <td>
                <button
                  className="btn btn-danger"
                  onClick={() => deleteTodo(todo.todo_id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListTodos;
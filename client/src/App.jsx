import InputTodo from "./components/InputTodo";
import ListTodos from "./components/ListTodos";

import "./App.css";

function App() {
  return (
    <main className="container py-5">
      <h1 className="text-center mb-5 display-3 fw-bold">
        PERN Todo List
      </h1>

      <InputTodo />

      <div className="mt-5">
        <ListTodos />
      </div>
    </main>
  );
}

export default App;
import { useState } from "react";

import InputTodo from "./components/InputTodo";
import ListTodos from "./components/ListTodos";

import "./App.css";

function App() {
  const [page, setPage] = useState("dashboard");

  return (
    <main>

      <ul className="navbar">

        <li
          onClick={() => setPage("dashboard")}
          className={page === "dashboard" ? "active" : ""}
        >
          Dashboard
        </li>

        <li
          onClick={() => setPage("export")}
          className={page === "export" ? "active" : ""}
        >
          Export
        </li>

        <li
          onClick={() => setPage("import")}
          className={page === "import" ? "active" : ""}
        >
          Import
        </li>

        <li
          onClick={() => setPage("domestic")}
          className={page === "domestic" ? "active" : ""}
        >
          Domestic
        </li>

        <li
          onClick={() => setPage("form")}
          className={page === "form" ? "active" : ""}
        >
          Create JO
        </li>

      </ul>

      {page === "dashboard" && <ListTodos type="ALL" />}

      {page === "export" && <ListTodos type="EXPORT" />}

      {page === "import" && <ListTodos type="IMPORT" />}

      {page === "domestic" && <ListTodos type="DOMESTIC" />}

      {page === "form" && <InputTodo />}

    </main>
  );
}

export default App;
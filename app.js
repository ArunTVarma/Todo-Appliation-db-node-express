const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// API 1

app.get("/todos/", async (request, response) => {
  try {
    let query = ``;
    const { search_q = "", priority, status } = request.query;
    if (priority !== undefined && status !== undefined) {
      query = `
        select * from todo
        where todo like '%${search_q}%'
        and status = '${status}'
        and priority = '${priority}';`;
    } else if (status !== undefined) {
      query = `
          select * from todo
          where todo like '%${search_q}%'
          and status = '${status}';`;
    } else if (priority !== undefined) {
      query = `
          select * from todo
          where todo like '%${search_q}%'
          and priority = '${priority}';`;
    } else {
      query = `
          select * from todo
          where todo like '%${search_q}%';`;
    }
    const dbResponse = await db.all(query);
    response.send(dbResponse);
  } catch (e) {
    console.log(`Error:${e.message}`);
  }
});

// API 2 Returns a specific todo based on the todo ID

app.get("/todos/:todoId/", async (request, response) => {
  try {
    const { todoId } = request.params;
    const query = `
        select * from todo
        where id=${todoId};`;
    const dbResponse = await db.get(query);
    response.send(dbResponse);
  } catch (e) {
    console.log(`Error:${e.message}`);
  }
});

// API 3 Create a todo in the todo table

app.post("/todos/", async (request, response) => {
  try {
    const { id, todo, priority, status } = request.body;
    const query = `
    insert into todo (id,todo,priority,status)
    values (${id},'${todo}','${priority}','${status}');`;
    const dbResponse = await db.run(query);
    response.send("Todo Successfully Added");
  } catch (e) {
    console.log(`Error:${e.message}`);
  }
});

// API 4 Updates the details of a specific todo based on the todo ID

app.put("/todos/:todoId/", async (request, response) => {
  try {
    let query = ``;
    const { todoId } = request.params;
    const { status, priority, todo } = request.body;

    if (status !== undefined) {
      query = `
    update todo
    set status='${status}'
    where id =${todoId};`;
      const dbResponse = await db.run(query);
      response.send("Status Updated");
    } else if (priority !== undefined) {
      query = `
    update todo
    set priority='${priority}'
    where id =${todoId};`;
      const dbResponse = await db.run(query);
      response.send("Priority Updated");
    } else if (todo !== undefined) {
      query = `
    update todo
    set todo='${todo}'
    where id =${todoId};`;
      const dbResponse = await db.run(query);
      response.send("Todo Updated");
    }
  } catch (e) {
    console.log(`Error:${e.message}`);
  }
});

// API 5 Deletes a todo from the todo table based on the todo ID

app.delete("/todos/:todoId", async (request, response) => {
  try {
    const { todoId } = request.params;
    const query = `
        delete from todo
        where id = ${todoId};`;
    const dbResponse = await db.run(query);
    response.send("Todo Deleted");
  } catch (e) {
    console.log(`Error:${e.message}`);
  }
});

module.exports = app;

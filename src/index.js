const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(user => user.username === username);
  if (!user) {
    return response.status(404).json({ error: "user not found!" })
  }
  request.user = user;
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const userALreadyExists = users.find(
    user => user.username === username
  );
  if (userALreadyExists) {
    return response.status(400).json({ error: "Username already exists!" });
  };
  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  users.push(user);
  return response.status(201).send(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const newTodo = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    created_at: new Date(),
    done: false
  };
  user.todos.push(newTodo);
  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;
  const updatedUserTodo = user.todos.find(todo => todo.id === id);
  if(!updatedUserTodo){
    return response.status(404).json({error: "Todo not found!"})
  }
  updatedUserTodo.title = title;
  updatedUserTodo.deadline = new Date(deadline);

  return response.json(updatedUserTodo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const updatedUserTodo = user.todos.find(todo => todo.id === id);
  if(!updatedUserTodo){
    return response.status(404).json({error: "Todo not found!"})
  }
  updatedUserTodo.done = true;

  return response.json(updatedUserTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const{ id} = request.params;
  const deletedUserTodo = user.todos.findIndex(todo => todo.id === id);
  if(deletedUserTodo === -1){
    return response.status(404).json({error: "Todo not found!"})
  };
  user.todos.splice(deletedUserTodo, 1);
  return response.status(204).json();
});

module.exports = app;
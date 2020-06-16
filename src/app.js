const express = require("express");
const cors = require("cors");

const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function validateRepositoryId(request, response, next) {
  const { id } = request.params;

  if (!isUuid(id)) {
    return response.status(400).json({ message: 'Invalid Repository id.' }).end();
  }

  return next();
}

app.use('/repositories/:id', validateRepositoryId);

app.get("/repositories", (request, response) => {
  return response.status(200).json({ repositories }).end();
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    like: 0
  };

  repositories.push(repository);

  response.setHeader('Location', `/${repository.id}`);
  return response.status(201).end();
});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;

  const repositoryIndex = repositories.findIndex(repository => repository.id === id);

  if (repositoryIndex < 0) return response.status(400).json({ message: "Repository not found." }).end();

  const foundRepository = repositories[repositoryIndex];

  const repositoryUpdated = {
    title,
    url,
    techs
  };

  repositories[repositoryIndex] = {
    ...foundRepository,
    ...repositoryUpdated
  };

  return response.status(200).json(repositories[repositoryIndex]).end();

});

app.delete("/repositories/:id", (request, response) => {
  const {id} = request.params;
  const repositoryIndex = repositories.findIndex(repository => repository.id === id);
  repositories.splice(repositoryIndex, 1);
  return response.status(204).end();
});

app.post("/repositories/:id/like", (request, response) => {
  // TODO
});

module.exports = app;

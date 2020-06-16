const express = require("express");
const cors = require("cors");

const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];
const likes = [];

function validateRepositoryId(request, response, next) {
  const { id } = request.params;

  if (!isUuid(id)) {
    return response.status(400).json({ message: 'Invalid Repository id.' }).end();
  }

  return next();
}

function validateIfThereIsAValidRepository(request, response, next) {
  const { id } = request.params;

  const repositoryIndex = findRepositoryIndex(id);
  if (repositoryIndex < 0) return response.status(400).end();

  return next();
}

function updateRequestWithRepositoryIndex(request, response, next) {
  const { id } = request.params;

  const repositoryIndex = findRepositoryIndex(id);
  request.foundedRepositoryIndex = repositoryIndex;
  return next();
}

app.use('/repositories/:id', validateRepositoryId, validateIfThereIsAValidRepository, updateRequestWithRepositoryIndex);

app.get("/repositories", (request, response) => {
  return response.status(200).json( repositories ).end();
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;

  const repository = {
    id: uuid(),
    url,
    title,
    techs,
    likes: 0
  };

  repositories.push(repository);

  response.setHeader('Location', `/${repository.id}`);
  return response.status(200).json(repository).end();
});

app.put("/repositories/:id", (request, response) => {
  const { title, url, techs } = request.body;

  const foundRepository = repositories[request.foundedRepositoryIndex];

  const repositoryUpdated = {
    ...foundRepository,
    title,
    url,
    techs
  };

  repositories[request.foundedRepositoryIndex] = repositoryUpdated;

  return response.status(200).json(repositoryUpdated).end();

});

app.delete("/repositories/:id", (request, response) => {
  const index = request.foundedRepositoryIndex;
  repositories.splice(index, 1);
  return response.status(204).end();
});

app.post("/repositories/:id/like", (request, response) => {
  const repository = repositories[request.foundedRepositoryIndex];
  
  likes.push({
    id: uuid(),
    repository,  
  });

  const repositoryLikes = likes.filter(like => like.repository.id === repository.id);

  repository.likes = repositoryLikes.length;
  
  response.setHeader('Location', `/${repository.id}`);
  return response.status(200).json({ 'likes': repository.likes }).end();
});

const findRepositoryIndex = (id) => {
  return repositories.findIndex(repository => repository.id === id);
}

module.exports = app;

require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const winston = require('winston');
const uuid = require('uuid/v4');

const app = express();
app.use(express.json());


////////////////////////////////////////////////////////////////////////////////////
//API token validation 
app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get('Authorization');

  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    //via winston: an invalid token will display this message and added that log to info.log
    logger.error(`Unauthorized request to path: ${req.path}`);
    return res.status(401).json({ error: 'Unauthorized request' });
  }
  //more to next middleware
  next();
});

//winston has 6 levels of severity: silly, debug, verbose, infom, warn, error(using info)
//stored in info.log in json format
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'info.log'})
  ]
});

if (NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.get('/', (req, res) => { 
  res.send('Hello, world!'); 
});


app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    console.error(error);
    response = { message: error.message, error};
  }
  res.status(500).json(response);
});


////////////////////////////////////////////////////////////////////////////////////
//ENDPOINTS

const cards = [{
  id: 1234,
  title: 'Take out the garbage',
  content: 'The garbage has smells and needs to be taken away'
}];

const lists = [{
  id: 1234,
  header: 'List One',
  cardIds: [1]
}];

app.get('/card', (req, res) => {
  res
    .json(cards);
});

app.get('/card/:id', (req, res) => {
  const { id } = req.params;
  // eslint-disable-next-line eqeqeq
  const card = cards.find(c => c.id == id);
  //DOSENT FIND CARD BY ID
  //make sure we found a card
  if (!card) {
    logger.error(`Card with id ${id} not found.`);
    return res
      .status(404)
      .send('Card Not Found');
  }
  res.json(card);
});

app.get('/list', (req, res) => {
  res
    .json(lists);
});

app.get('/list/:id', (req, res) => {
  const { id } = req.params;
  // eslint-disable-next-line eqeqeq
  const list = list.find(li => li.id == id);
  //make sure we found a list
  if (!list) {
    logger.error(`List with id ${id} not found`);
    return res
      .status(404)
      .send('List Not Found');
  }
  res.json(list);
});

app.post('/card', (req, res) => {
  const { title, content } = req.query;
  //why you give me an empty {}
  console.log(req.query);
  if (!title) {
    logger.error('Title is required');
    return res
      .status(400)
      .send('Invalid data');
  }

  if (!content) {
    logger.error('Content is required');
    return res
      .status(400)
      .send('Invalid data');
  }
  const id = uuid();
  const card = {
    id,
    title,
    content
  };

  cards.push(card);
  logger.info(`Card with id ${id} created`);

  res
    .status(201)
    .location(`http://localhost:8000/card/${id}`)
    .json(card);
});

////////////////////////////////////////////////////////////////////////////////////

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

module.exports = app;
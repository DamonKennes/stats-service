import { app, errorHandler, beforeExit, exitHandler, setExitHandler } from './server.js';
import sparql from './sparql.js';
import { SPARQL, query, update, sparqlEscape, sparqlEscapeString, sparqlEscapeUri, sparqlEscapeDecimal, sparqlEscapeInt, sparqlEscapeFloat, sparqlEscapeDate, sparqlEscapeDateTime, sparqlEscapeBool } from './sparql.js';
import pkg from 'uuid';
const { v1: uuidV1 } = pkg;   // or v4, etc.

// generates a uuid
const uuid = uuidV1;

const mu = {
  app,
  sparql,

  uuid,
  errorHandler,
  beforeExit,
  exitHandler,
  setExitHandler,

  SPARQL,
  query,
  update,
  sparqlEscape,
  sparqlEscapeString,
  sparqlEscapeUri,
  sparqlEscapeDecimal,
  sparqlEscapeInt,
  sparqlEscapeFloat,
  sparqlEscapeDate,
  sparqlEscapeDateTime,
  sparqlEscapeBool
};

export {
  app,
  sparql,
  SPARQL,
  query,
  update,
  sparqlEscape,
  sparqlEscapeString,
  sparqlEscapeUri,
  sparqlEscapeDecimal,
  sparqlEscapeInt,
  sparqlEscapeFloat,
  sparqlEscapeDate,
  sparqlEscapeDateTime,
  sparqlEscapeBool,
  uuid,
  errorHandler,
  beforeExit,
  exitHandler,
  setExitHandler
};

export default mu;

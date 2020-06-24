const JSONStream = require('JSONStream');
const fastCsv = require('fast-csv');

/**
 * Returns a readable data stream from a given data cursor.
 * Useful for sending file through response.
 *
 * @param cursor
 * @param response {object} `ExpressJS` response object
 * @param dataTransformer {function} A function that returns the shape of the data.
 * @param fileType {string} The data's file type. Default to json.
 * @returns {*}
 */
const createDataStreamResponse = (cursor, response, dataTransformer, fileType = 'json') => {
  const dataStream = fileType === 'json'
    ? JSONStream.stringify()
    : fastCsv.format({ headers: true })
      .transform(dataTransformer);

  if (fileType === 'json') {
    response.setHeader('Content-Type', 'application/json');
  } else {
    response.setHeader('Content-Disposition', 'attachment; filename=export.csv');
    response.writeHead(200, { 'Content-Type': 'text/csv' });
    response.flushHeaders();
  }

  return cursor.stream()
    .pipe(dataStream)
    .pipe(response);
};

module.exports = {
  createDataStreamResponse,
};

const escapeString = (str) => str.replace(new RegExp('\\\\', 'g'), '\\\\');

const isoDateToString = (isoDate) => isoDate.split('T')[0];

module.exports = {
  escapeString,
  isoDateToString,
};

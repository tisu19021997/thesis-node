function save(key, value) {
  return localStorage.setItem(key.toString(), JSON.stringify(value));
}

function get(key, parsed = true) {
  if (parsed) {
    return JSON.parse(localStorage.getItem(key.toString()));
  }
  return localStorage.getItem(key.toString());
}

export default {
  save,
  get,
};

const save = (key, value) => localStorage.setItem(key.toString(), JSON.stringify(value));

const get = (key, parsed = true) => {
  if (parsed) {
    return JSON.parse(localStorage.getItem(key.toString()));
  }
  return localStorage.getItem(key.toString());
};

const remove = (key) => localStorage.removeItem(key.toString());

export default {
  save,
  get,
  remove,
};

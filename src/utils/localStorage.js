/**
 * Read data from localStorage
 * @param {String} itemName
 * @param {String} key
 * @return {*}
 */
export function read(itemName, key) {
  let item = window.localStorage.getItem(itemName);

  item = JSON.parse(item);

  if (item) {
    return (!!key) ? item[key] : item;
  } else {
    return null;
  }
}

/**
 * Write data to localStorage
 * @param {String} itemName
 * @param {Object} obj
 */
export function write(itemName, obj) {
  let item = window.localStorage.getItem(itemName);

  item = JSON.parse(item);

  if (item) {
    Object.assign(item, obj);
  } else {
    item = obj;
  }

  window.localStorage.setItem(itemName, JSON.stringify(item));
}

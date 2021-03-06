import {
    read as lsRead,
    write as lsSave,
    del as lsDel
} from './localStorage';

/**
 * @param {Sting} val
 * @return {Boolean}
 */
function isEmpty(val) {
    if (!!val){
        return /^$/.test(val);
    }
    return true;
}

/**
 * @param {String} value
 * @param {Number} size
 * @return {String}
 */
function setPadding(value, size) {
  let s = String(value);
  while (s.length < (size || 2)) {
    s = `0${s}`;
  }
  return s;
}

/**
 * @param {Number|String|Date} d
 * @param {String} format
 * @return {String}
 */
function formatDate(d, format) {
  d = new Date(d) || new Date();
  let result = format || 'dd.MM.yyyy';

  const date = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const seconds = d.getSeconds();

  result = result.replace(/dd/, setPadding(date));
  result = result.replace(/MM/, setPadding(month));
  result = result.replace(/yyyy/, year);
  result = result.replace(/HH/, setPadding(hours));
  result = result.replace(/mm/, setPadding(minutes));
  result = result.replace(/ss/, setPadding(seconds));

  return result;
}

/**
 * Convert address Object->String
 * @param {Object} address
 * @return {String}
 */
function formatAddress(address) {
  const {
    region,
    city,
    town,
    hamlet,
    village,
    road,
    county,
    house_number: houseNumber
  } = address;
  let result = '';

  if (!isEmpty(region)) {
    result += `${ region }, `;
  }

  if (!isEmpty(city)) {
    result += `${ city }, `;
  } else if (!isEmpty(town)) {
    result += `${ town }, `;
  } else if (!isEmpty(hamlet)) {
    result += `${ hamlet }, `;
  } else if (!isEmpty(village)) {
    result += `${ village }, `;
  } else {
    result += `${ county }, `;
  }

  if (!isEmpty(road)) {
    result += `${ road }, `;
  }

  if (!isEmpty(houseNumber)) {
    result += `${ houseNumber }, `;
  }

  return result.replace(/,\s$/, '');
}

function short(s){
    var res, n = s.indexOf(' ');
    if ( n > 0 ){
        res = s.charAt(0) + s.charAt(n + 1);
    } else if (s.length > 2){
        res = s.substr(0, 2);
    } else {
        res = s;
    }
    return res.toUpperCase();
}

/**
 * Convert object to encode body for 'application/x-www-form-urlencoded'
 * request
 * @param {Object} obj
 * @return {String}
 */
function encode(obj) {
  /**
   * Transform array function
   * @param {String} key
   * @return {String}
   */
  function transform(key) {
    return `${ encodeURIComponent(key) }=${ encodeURIComponent(obj[key]) }`;
  }

  const keys = Object.keys(obj);
  const array = keys.map(transform);

  return array.join('&');
}

/**
 * Convert utf8 to base64
 * @param {String} str
 * @return {String}
 */
function utf8ToB64(str) {
  return window.btoa(unescape(encodeURIComponent(str)));
}

/**
 * Convert base64 to utf64
 * @param {String} str
 * @return {String}
 */
function b64ToUtf8(str) {
  return decodeURIComponent(escape(window.atob(str)));
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function sin2obj(cols, data){
    const keys = Object.keys(cols);
    var s, n, o = {};
    keys.map((key)=>{
            n = key.lastIndexOf('.');
            s = (n < 0) ? key : key.substr(n + 1);
            o[s] = data[cols[key]];
    });
    return o;
}

export {
  isEmpty,
  formatDate,
  formatAddress,
  short,
  encode,
  utf8ToB64,
  b64ToUtf8,
  uuidv4,
  sin2obj,
  lsRead,
  lsSave,
  lsDel
};

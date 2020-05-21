function prepareParams(params) {
  const preparedParams = {};

  for (let i = 0, size = params.length; i < size; i++) {
    const param = params[i];
    const {type} = param;

    /**
     * @todo
     * Пока не реализована поддержка blob, не обрабатываем параметры этого типа
     */
    if (type === 'blob') continue;

    let {value} = param;
    let mimeType;

    if (type === 'date' || type === 'dateTime') {
      value = new Date(value).toISOString();
    } else if (type === 'blob') {
      mimeType = value.mimeType;
      value = value.value;
    }

    const description = {
      '@class': 'ru.kih.sql.Parameter',
      'value': value,
      'type': type
    };

    if (type === 'blob') {
      Object.assign(description, {mimeType});
    }

    preparedParams[param.id] = description;
  }

  return preparedParams;
}


/**
 * Формируем параметр даты, который понимает sin2...
 * @param {Date} date
 * @return {Object}
 */
function getDate(date) {
    return {
        '@class': 'ru.kih.sql.Parameter',
        value: date.toISOString(),
        type: 'date'
    };
}
/**
 * Отправка GET-запроса
 * @param {String} url
 * @param {Object} options
 * @return {Promise}
 */
function get(url, options) {
    return $.get(url, options);
}

/**
 * Отправка POST-запроса
 * @param {String} url
 * @param {Object} options
 * @return {Promise}
 */
function post(u, o) {
    var options, url = u;
    if (typeof url === "object"){
        options = url;
        url = process.env.VUE_APP_BACKEND_RPC + '?d=jsonRpc';
    } else {
        options = o;
    }
    
    const now = new Date();
    const defaultContext = {
        dateBegin: getDate(now),
        dateWork: getDate(now),
        dateEnd: getDate(now)
    };

    var config = {
        dataType: 'json',
        method: 'POST',
        contentType: 'application/json;charset=utf-8'
    };
    switch (options.type) {
        case 'core-read':
            config.data = JSON.stringify({
                    method: 'ru.kih.sin.api2.Core.read',
                    params: [
                        {
                            query: options.query,
                            context: options.context || defaultContext
                        }
                    ],
                    jsonrpc: '2.0'
                });
            break;
        case 'core-create':
            config.data = JSON.stringify({
                  method: 'ru.kih.sin.api2.Core.create',
                  params: [
                    {
                      query: options.query,
                      context: options.context || defaultContext,
                      params: prepareParams(options.params),
                      offset: 0,
                      count: -1
                    }
                  ],
                  jsonrpc: '2.0'
                });
            break;
        case 'core-update':
            config.data = JSON.stringify({
                    method: 'ru.kih.sin.api2.Core.update',
                    params: [
                      {
                        query: options.query,
                        context: options.context || defaultContext,
                        params: prepareParams(options.params),
                        offset: 0,
                        count: -1
                      }
                    ],
                    jsonrpc: '2.0'
                });
            break;
        case 'tree-childs':
            config.data = JSON.stringify({
                    method: 'ru.kih.sin.api2.Tree.getChilds',
                    params: [
                        {
                            query: options.query
                        }
                    ],
                    jsonrpc: '2.0'
                });
            break;
        case 'auth':
            config.data = JSON.stringify({
                    method: 'web.AuthFunctions.getCurrentUserCredential',
                    jsonrpc: '2.0'
                });
            if (options.basicAuth) {
                config.beforeSend = function(xhr) {
                    xhr.setRequestHeader('Authorization', options.basicAuth);
                };
            }
            break;
        case 'logout':
            config.data = JSON.stringify({
                    method: 'web.Users.logout',
                    jsonrpc: '2.0'
                });
            break;
        case 'query':
            config.data = JSON.stringify({
                    method: 'ru.kih.sin.api2.NamedQueries.read',
                    params: [options.query, options.params],
                    jsonrpc: '2.0'
                });
            break;
        default:
            config = options;
            config.method = 'POST';
    }
    return $.ajax(url, config);
}
// Экспортируем публичные методы
export { get, post };

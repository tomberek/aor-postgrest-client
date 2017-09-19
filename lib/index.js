'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _fetch = require('admin-on-rest/lib/util/fetch');

var _types = require('admin-on-rest/lib/rest/types');

/**
 * Maps admin-on-rest queries to a postgrest API
 *
 * The REST dialect is similar to the one of FakeRest
 * @see https://github.com/marmelab/FakeRest
 * @example
 * GET_MANY_REFERENCE
 *              => GET http://my.api.url/posts/2
 * GET_LIST     => GET http://my.api.url/posts?order=title.asc
 * GET_ONE      => GET http://my.api.url/posts?id=eq.123
 * GET_MANY     => GET http://my.api.url/posts?id=in.123,456,789
 * UPDATE       => PATCH http://my.api.url/posts?id=eq.123
 * CREATE       => POST http://my.api.url/posts
 * DELETE       => DELETE http://my.api.url/posts?id=eq.123
 */
exports.default = function (apiUrl) {
  var httpClient = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _fetch.fetchJson;

  /**
     * @param {String} type One of the constants appearing at the top if this file, e.g. 'UPDATE'
     * @param {String} resource Name of the resource to fetch, e.g. 'posts'
     * @param {Object} params The REST request params, depending on the type
     * @returns {Object} { url, options } The HTTP request parameters
     */
  var convertFilters = function convertFilters(filters) {
    var rest = {};

    Object.keys(filters).map(function (key) {
      switch (_typeof(filters[key])) {
        case 'string':
          if (key === 'status' || key === 'relationship') {
            rest[key] = 'eq.' + filters[key];
          } else if (key === 'summary') {
            rest[key] = 'ilike.*' + filters[key] + '*';
          } else {
            rest[key] = 'ilike.*' + filters[key].replace(new RegExp(' ', 'g'), '') + '*';
          }
          break;

        case 'boolean':
          rest[key] = 'is.' + filters[key];
          break;

        case 'undefined':
          rest[key] = 'is.null';
          break;

        case 'number':
          rest[key] = 'eq.' + filters[key];
          break;

        case 'object':
          // Handles the case for objects with min and max dates
          if (filters[key].hasOwnProperty('minDate') && filters[key].hasOwnProperty('maxDate')) {
            rest[key] = '';
            if (filters[key].maxDate) {
              rest[key] += 'lte.' + filters[key].maxDate;
            }

            if (filters[key].minDate) {
              rest[key] += '&' + key + '=gte.' + filters[key].minDate;
            }
          }
          break;

        default:
          rest[key] = 'ilike.*' + filters[key].toString().replace(/:/, '') + '*';
          break;
      }
      return undefined;
    });
    return rest;
  };

  var convertRESTRequestToHTTP = function convertRESTRequestToHTTP(type, resource, params) {
    var url = '';
    var options = {};
    options.headers = new Headers();
    switch (type) {
      case _types.GET_LIST:
        {
          var _params$pagination = params.pagination,
              page = _params$pagination.page,
              perPage = _params$pagination.perPage;
          var _params$sort = params.sort,
              _field = _params$sort.field,
              _order = _params$sort.order;

          options.headers.set('Range-Unit', 'items');
          options.headers.set('Range', (page - 1) * perPage + '-' + (page * perPage - 1));
          options.headers.set("Prefer", "count=exact");
          var query = {
            order: _field + '.' + _order.toLowerCase()
          };
          Object.assign(query, convertFilters(params.filter));
          url = apiUrl + '/' + resource + '?' + (0, _fetch.queryParameters)(query);
          url = url.replace("%26", "&").replace("%3D", "=");
          break;
        }
      case _types.GET_ONE:
        url = apiUrl + '/' + resource + '?id=eq.' + params.id;
        break;
      case _types.GET_MANY:
        {
          url = apiUrl + '/' + resource + '?id=in.' + params.ids.join(',');
          break;
        }
      case _types.GET_MANY_REFERENCE:
        {
          var filters = {};
          filters[params.target] = params.id;
          var _query = {
            order: field + '.' + order.toLowerCase()
          };
          Object.assign(_query, convertFilters(params.filter));
          url = apiUrl + '/' + resource + '?' + (0, _fetch.queryParameters)(_query);
          url = url.replace("%26", "&").replace("%3D", "=");
          break;
        }
      case _types.UPDATE:
        url = apiUrl + '/' + resource + '?id=eq.' + params.id;
        options.method = 'PATCH';
        options.body = JSON.stringify(params.data);
        break;
      case _types.CREATE:
        url = apiUrl + '/' + resource;
        options.headers.set('Prefer', 'return=representation');
        options.method = 'POST';
        options.body = JSON.stringify(params.data);
        break;
      case _types.DELETE:
        url = apiUrl + '/' + resource + '?id=eq.' + params.id;
        options.method = 'DELETE';
        break;
      default:
        throw new Error('Unsupported fetch action type ' + type);
    }
    return { url: url, options: options };
  };

  /**
     * @param {Object} response HTTP response from fetch()
     * @param {String} type One of the constants appearing at the top if this file, e.g. 'UPDATE'
     * @param {String} resource Name of the resource to fetch, e.g. 'posts'
     * @param {Object} params The REST request params, depending on the type
     * @returns {Object} REST response
     */
  var convertHTTPResponseToREST = function convertHTTPResponseToREST(response, type, resource, params) {
    var headers = response.headers,
        json = response.json;

    switch (type) {
      case _types.GET_LIST:
        if (!headers.has('content-range')) {
          throw new Error('The Content-Range header is missing in the HTTP Response. The simple REST client expects responses for lists of resources to contain this header with the total number of results to build the pagination. If you are using CORS, did you declare Content-Range in the Access-Control-Expose-Headers header?');
        }
        var maxInPage = parseInt(headers.get('content-range').split('/')[0].split('-').pop(), 10) + 1;
        return {
          data: json.map(function (x) {
            return x;
          }),
          total: parseInt(headers.get('content-range').split('/').pop(), 10) || maxInPage
        };
      case _types.CREATE:
        return _extends({}, params.data, { id: json.id });
      case _types.UPDATE:
        return _extends({}, params.data, { id: params.id });
      default:
        return json;
    }
  };

  /**
     * @param {string} type Request type, e.g GET_LIST
     * @param {string} resource Resource name, e.g. "posts"
     * @param {Object} payload Request parameters. Depends on the request type
     * @returns {Promise} the Promise for a REST response
     */
  return function (type, resource, params) {
    var _convertRESTRequestTo = convertRESTRequestToHTTP(type, resource, params),
        url = _convertRESTRequestTo.url,
        options = _convertRESTRequestTo.options;

    return httpClient(url, options).then(function (response) {
      return convertHTTPResponseToREST(response, type, resource, params);
    });
  };
};

module.exports = exports['default'];
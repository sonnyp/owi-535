/*!
 * EventEmitter v4.2.7 - git.io/ee
 * Oliver Caldwell
 * MIT license
 * @preserve
 */

(function () {
	'use strict';

	/**
	 * Class for managing events.
	 * Can be extended to provide event functionality in other classes.
	 *
	 * @class EventEmitter Manages event registering and emitting.
	 */
	function EventEmitter() {}

	// Shortcuts to improve speed and size
	var proto = EventEmitter.prototype;
	var exports = this;
	var originalGlobalValue = exports.EventEmitter;

	/**
	 * Finds the index of the listener for the event in it's storage array.
	 *
	 * @param {Function[]} listeners Array of listeners to search through.
	 * @param {Function} listener Method to look for.
	 * @return {Number} Index of the specified listener, -1 if not found
	 * @api private
	 */
	function indexOfListener(listeners, listener) {
		var i = listeners.length;
		while (i--) {
			if (listeners[i].listener === listener) {
				return i;
			}
		}

		return -1;
	}

	/**
	 * Alias a method while keeping the context correct, to allow for overwriting of target method.
	 *
	 * @param {String} name The name of the target method.
	 * @return {Function} The aliased method
	 * @api private
	 */
	function alias(name) {
		return function aliasClosure() {
			return this[name].apply(this, arguments);
		};
	}

	/**
	 * Returns the listener array for the specified event.
	 * Will initialise the event object and listener arrays if required.
	 * Will return an object if you use a regex search. The object contains keys for each matched event. So /ba[rz]/ might return an object containing bar and baz. But only if you have either defined them with defineEvent or added some listeners to them.
	 * Each property in the object response is an array of listener functions.
	 *
	 * @param {String|RegExp} evt Name of the event to return the listeners from.
	 * @return {Function[]|Object} All listener functions for the event.
	 */
	proto.getListeners = function getListeners(evt) {
		var events = this._getEvents();
		var response;
		var key;

		// Return a concatenated array of all matching events if
		// the selector is a regular expression.
		if (evt instanceof RegExp) {
			response = {};
			for (key in events) {
				if (events.hasOwnProperty(key) && evt.test(key)) {
					response[key] = events[key];
				}
			}
		}
		else {
			response = events[evt] || (events[evt] = []);
		}

		return response;
	};

	/**
	 * Takes a list of listener objects and flattens it into a list of listener functions.
	 *
	 * @param {Object[]} listeners Raw listener objects.
	 * @return {Function[]} Just the listener functions.
	 */
	proto.flattenListeners = function flattenListeners(listeners) {
		var flatListeners = [];
		var i;

		for (i = 0; i < listeners.length; i += 1) {
			flatListeners.push(listeners[i].listener);
		}

		return flatListeners;
	};

	/**
	 * Fetches the requested listeners via getListeners but will always return the results inside an object. This is mainly for internal use but others may find it useful.
	 *
	 * @param {String|RegExp} evt Name of the event to return the listeners from.
	 * @return {Object} All listener functions for an event in an object.
	 */
	proto.getListenersAsObject = function getListenersAsObject(evt) {
		var listeners = this.getListeners(evt);
		var response;

		if (listeners instanceof Array) {
			response = {};
			response[evt] = listeners;
		}

		return response || listeners;
	};

	/**
	 * Adds a listener function to the specified event.
	 * The listener will not be added if it is a duplicate.
	 * If the listener returns true then it will be removed after it is called.
	 * If you pass a regular expression as the event name then the listener will be added to all events that match it.
	 *
	 * @param {String|RegExp} evt Name of the event to attach the listener to.
	 * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.addListener = function addListener(evt, listener) {
		var listeners = this.getListenersAsObject(evt);
		var listenerIsWrapped = typeof listener === 'object';
		var key;

		for (key in listeners) {
			if (listeners.hasOwnProperty(key) && indexOfListener(listeners[key], listener) === -1) {
				listeners[key].push(listenerIsWrapped ? listener : {
					listener: listener,
					once: false
				});
			}
		}

		return this;
	};

	/**
	 * Alias of addListener
	 */
	proto.on = alias('addListener');

	/**
	 * Semi-alias of addListener. It will add a listener that will be
	 * automatically removed after it's first execution.
	 *
	 * @param {String|RegExp} evt Name of the event to attach the listener to.
	 * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.addOnceListener = function addOnceListener(evt, listener) {
		return this.addListener(evt, {
			listener: listener,
			once: true
		});
	};

	/**
	 * Alias of addOnceListener.
	 */
	proto.once = alias('addOnceListener');

	/**
	 * Defines an event name. This is required if you want to use a regex to add a listener to multiple events at once. If you don't do this then how do you expect it to know what event to add to? Should it just add to every possible match for a regex? No. That is scary and bad.
	 * You need to tell it what event names should be matched by a regex.
	 *
	 * @param {String} evt Name of the event to create.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.defineEvent = function defineEvent(evt) {
		this.getListeners(evt);
		return this;
	};

	/**
	 * Uses defineEvent to define multiple events.
	 *
	 * @param {String[]} evts An array of event names to define.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.defineEvents = function defineEvents(evts) {
		for (var i = 0; i < evts.length; i += 1) {
			this.defineEvent(evts[i]);
		}
		return this;
	};

	/**
	 * Removes a listener function from the specified event.
	 * When passed a regular expression as the event name, it will remove the listener from all events that match it.
	 *
	 * @param {String|RegExp} evt Name of the event to remove the listener from.
	 * @param {Function} listener Method to remove from the event.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.removeListener = function removeListener(evt, listener) {
		var listeners = this.getListenersAsObject(evt);
		var index;
		var key;

		for (key in listeners) {
			if (listeners.hasOwnProperty(key)) {
				index = indexOfListener(listeners[key], listener);

				if (index !== -1) {
					listeners[key].splice(index, 1);
				}
			}
		}

		return this;
	};

	/**
	 * Alias of removeListener
	 */
	proto.off = alias('removeListener');

	/**
	 * Adds listeners in bulk using the manipulateListeners method.
	 * If you pass an object as the second argument you can add to multiple events at once. The object should contain key value pairs of events and listeners or listener arrays. You can also pass it an event name and an array of listeners to be added.
	 * You can also pass it a regular expression to add the array of listeners to all events that match it.
	 * Yeah, this function does quite a bit. That's probably a bad thing.
	 *
	 * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add to multiple events at once.
	 * @param {Function[]} [listeners] An optional array of listener functions to add.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.addListeners = function addListeners(evt, listeners) {
		// Pass through to manipulateListeners
		return this.manipulateListeners(false, evt, listeners);
	};

	/**
	 * Removes listeners in bulk using the manipulateListeners method.
	 * If you pass an object as the second argument you can remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
	 * You can also pass it an event name and an array of listeners to be removed.
	 * You can also pass it a regular expression to remove the listeners from all events that match it.
	 *
	 * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to remove from multiple events at once.
	 * @param {Function[]} [listeners] An optional array of listener functions to remove.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.removeListeners = function removeListeners(evt, listeners) {
		// Pass through to manipulateListeners
		return this.manipulateListeners(true, evt, listeners);
	};

	/**
	 * Edits listeners in bulk. The addListeners and removeListeners methods both use this to do their job. You should really use those instead, this is a little lower level.
	 * The first argument will determine if the listeners are removed (true) or added (false).
	 * If you pass an object as the second argument you can add/remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
	 * You can also pass it an event name and an array of listeners to be added/removed.
	 * You can also pass it a regular expression to manipulate the listeners of all events that match it.
	 *
	 * @param {Boolean} remove True if you want to remove listeners, false if you want to add.
	 * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add/remove from multiple events at once.
	 * @param {Function[]} [listeners] An optional array of listener functions to add/remove.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.manipulateListeners = function manipulateListeners(remove, evt, listeners) {
		var i;
		var value;
		var single = remove ? this.removeListener : this.addListener;
		var multiple = remove ? this.removeListeners : this.addListeners;

		// If evt is an object then pass each of it's properties to this method
		if (typeof evt === 'object' && !(evt instanceof RegExp)) {
			for (i in evt) {
				if (evt.hasOwnProperty(i) && (value = evt[i])) {
					// Pass the single listener straight through to the singular method
					if (typeof value === 'function') {
						single.call(this, i, value);
					}
					else {
						// Otherwise pass back to the multiple function
						multiple.call(this, i, value);
					}
				}
			}
		}
		else {
			// So evt must be a string
			// And listeners must be an array of listeners
			// Loop over it and pass each one to the multiple method
			i = listeners.length;
			while (i--) {
				single.call(this, evt, listeners[i]);
			}
		}

		return this;
	};

	/**
	 * Removes all listeners from a specified event.
	 * If you do not specify an event then all listeners will be removed.
	 * That means every event will be emptied.
	 * You can also pass a regex to remove all events that match it.
	 *
	 * @param {String|RegExp} [evt] Optional name of the event to remove all listeners for. Will remove from every event if not passed.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.removeEvent = function removeEvent(evt) {
		var type = typeof evt;
		var events = this._getEvents();
		var key;

		// Remove different things depending on the state of evt
		if (type === 'string') {
			// Remove all listeners for the specified event
			delete events[evt];
		}
		else if (evt instanceof RegExp) {
			// Remove all events matching the regex.
			for (key in events) {
				if (events.hasOwnProperty(key) && evt.test(key)) {
					delete events[key];
				}
			}
		}
		else {
			// Remove all listeners in all events
			delete this._events;
		}

		return this;
	};

	/**
	 * Alias of removeEvent.
	 *
	 * Added to mirror the node API.
	 */
	proto.removeAllListeners = alias('removeEvent');

	/**
	 * Emits an event of your choice.
	 * When emitted, every listener attached to that event will be executed.
	 * If you pass the optional argument array then those arguments will be passed to every listener upon execution.
	 * Because it uses `apply`, your array of arguments will be passed as if you wrote them out separately.
	 * So they will not arrive within the array on the other side, they will be separate.
	 * You can also pass a regular expression to emit to all events that match it.
	 *
	 * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
	 * @param {Array} [args] Optional array of arguments to be passed to each listener.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.emitEvent = function emitEvent(evt, args) {
		var listeners = this.getListenersAsObject(evt);
		var listener;
		var i;
		var key;
		var response;

		for (key in listeners) {
			if (listeners.hasOwnProperty(key)) {
				i = listeners[key].length;

				while (i--) {
					// If the listener returns true then it shall be removed from the event
					// The function is executed either with a basic call or an apply if there is an args array
					listener = listeners[key][i];

					if (listener.once === true) {
						this.removeListener(evt, listener.listener);
					}

					response = listener.listener.apply(this, args || []);

					if (response === this._getOnceReturnValue()) {
						this.removeListener(evt, listener.listener);
					}
				}
			}
		}

		return this;
	};

	/**
	 * Alias of emitEvent
	 */
	proto.trigger = alias('emitEvent');

	/**
	 * Subtly different from emitEvent in that it will pass its arguments on to the listeners, as opposed to taking a single array of arguments to pass on.
	 * As with emitEvent, you can pass a regex in place of the event name to emit to all events that match it.
	 *
	 * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
	 * @param {...*} Optional additional arguments to be passed to each listener.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.emit = function emit(evt) {
		var args = Array.prototype.slice.call(arguments, 1);
		return this.emitEvent(evt, args);
	};

	/**
	 * Sets the current value to check against when executing listeners. If a
	 * listeners return value matches the one set here then it will be removed
	 * after execution. This value defaults to true.
	 *
	 * @param {*} value The new value to check for when executing listeners.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.setOnceReturnValue = function setOnceReturnValue(value) {
		this._onceReturnValue = value;
		return this;
	};

	/**
	 * Fetches the current value to check against when executing listeners. If
	 * the listeners return value matches this one then it should be removed
	 * automatically. It will return true by default.
	 *
	 * @return {*|Boolean} The current value to check for or the default, true.
	 * @api private
	 */
	proto._getOnceReturnValue = function _getOnceReturnValue() {
		if (this.hasOwnProperty('_onceReturnValue')) {
			return this._onceReturnValue;
		}
		else {
			return true;
		}
	};

	/**
	 * Fetches the events object and creates one if required.
	 *
	 * @return {Object} The events storage object.
	 * @api private
	 */
	proto._getEvents = function _getEvents() {
		return this._events || (this._events = {});
	};

	/**
	 * Reverts the global {@link EventEmitter} to its previous value and returns a reference to this version.
	 *
	 * @return {Function} Non conflicting EventEmitter class.
	 */
	EventEmitter.noConflict = function noConflict() {
		exports.EventEmitter = originalGlobalValue;
		return EventEmitter;
	};

	// Expose the class either via AMD, CommonJS or the global object
	if (typeof module === 'object' && module.exports){
		module.exports = EventEmitter;
	}
	else {
		this.EventEmitter = EventEmitter;
		if (typeof define === 'function' && define.amd) {
			define(function () {
				return EventEmitter;
			});
		}
	}
}.call(this));

(function(global) {

  'use strict';

  var base64;
  if (typeof Buffer !== 'undefined') {
    base64 = function(str) {
      return (new Buffer(str)).toString('base64');
    };
  }
  else {
    base64 = global.btoa;
  }

  var methods = [
    //http://tools.ietf.org/html/rfc2616
    'OPTIONS',
    'GET',
    'HEAD',
    'POST',
    'PUT',
    'DELETE',
    'TRACE',
    'CONNECT',
    //http://tools.ietf.org/html/rfc5789
    'PATCH'
  ];

  var getPrototypeOf = function(obj) {
    if (Object.getPrototypeOf)
      return Object.getPrototypeOf(obj);
    else
      return obj.__proto__;
  };

  var prototypeOfObject = getPrototypeOf({});

  var isObject = function(obj) {
    if (typeof obj !== 'object')
      return false;

    return getPrototypeOf(obj) === prototypeOfObject || getPrototypeOf(obj) === null;
  };

  var defaultOptions = {
    query: {},
    secure: false,
    host: 'localhost',
    path: '/',
    headers: {},
    method: 'GET',
    port: 80,
    jsonp: false,
    username: '',
    password: ''
  };

  var handleOptions = function(opts, overrides) {

    opts = opts || {};

    var options = {};

    for (var i in defaultOptions) {
      if (typeof opts[i] === typeof defaultOptions[i])
        options[i] = opts[i];
      else if (overrides && typeof overrides[i] === typeof defaultOptions[i])
        options[i] = overrides[i];
      else
        options[i] = defaultOptions[i];
    }

    options.method = options.method.toUpperCase();

    //jsonp
    if (opts.jsonp === true)
      opts.jsonp = 'callback';
    if (typeof opts.jsonp === 'string') {
      options.jsonp = opts.jsonp;
      options.query[opts.jsonp] = 'HTTPClient' + Date.now();
    }

    //lower cases headers
    for (var k in options.headers) {
      var v = options.headers[k];
      delete options.headers[k];
      options.headers[k.toLowerCase()] = v;
    }

    //basic auth
    if (typeof opts.username === 'string' && opts.username && typeof opts.password === 'string' && opts.password) {
      var creds = opts.username + ':' + opts.password;
      options.headers.authorization = 'Basic ' + base64(creds);
    }

    //json
    if (Array.isArray(opts.body) || isObject(opts.body)) {
      options.body = JSON.stringify(opts.body);
      if (!options.headers['content-type'])
        options.headers['content-type'] = 'application/json; charset=utf-8';
    }
    //string
    else if (typeof opts.body === 'string') {
      options.body = opts.body;
      if (!options.headers['content-type'])
        options.headers['content-type'] = 'text/plain; charset=utf-8';
    }
    else if (opts.body !== undefined || opts.body !== null) {
      options.body = opts.body;
    }

    return options;
  };

  var getTypeFromHeaders = function(headers) {
    var type = '';
    if (typeof headers === 'object') {
      var contentType = headers['content-type'];
      if (contentType)
        type = contentType.split(';')[0];
    }
    return type;
  };

  var getSizeFromHeaders = function(headers) {
    var size = null;
    if (typeof headers === 'object') {
      var contentLength = headers['content-length'];
      if (contentLength)
        size = parseInt(contentLength, 10);
    }
    return size;
  };

  var Promise;
  if (typeof module !== 'undefined' && module.exports) {
    if (!global.Promise) {
      try {
        Promise = require('es6-promise').Promise;
      }
      catch (ex) {}
    }
  }
  else {
    Promise = global.Promise;
  }

  var HTTPResponse = function() {
  };
  HTTPResponse.prototype.onend = function() {
  };
  HTTPResponse.prototype.onprogress = function() {
  };

  var utils = {
    handleOptions: handleOptions,
    getTypeFromHeaders: getTypeFromHeaders,
    getSizeFromHeaders: getSizeFromHeaders,
    getPrototypeOf: getPrototypeOf,
    Promise: Promise,
    methods: methods,
    defaultOptions: defaultOptions,
    HTTPResponse: HTTPResponse
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = utils;
  else
    global.HTTPClient = {utils: utils};

})(this);
(function(global) {

  'use strict';

  var utils = global.HTTPClient.utils;

  var formatQuery = function(query, sep, eq) {
    //separator character
    sep = sep || '&';
    //assignement character
    eq = eq || '=';

    var querystring = '';
    if (typeof query === 'object') {
      for (var i in query) {
        querystring += i + eq + query[i] + sep;
      }

      if (querystring.length > 0)
        querystring = '?' + querystring.slice(0, -1);
    }
    return querystring;
  };

  var formatURL = function(obj, sep, eq) {

    var querystring = formatQuery(obj.query);

    return [
      obj.secure ? 'https' : 'http',
      '://',
      obj.host,
      obj.port ? ':' + obj.port : '',
      obj.path || '/',
      querystring,
      obj.hash || ''
    ].join('');
  };

  var parseStringHeaders = function(str) {
    var headers = {};
    if (str) {
      var lines = str.split('\n');
      for (var i = 0; i < lines.length; i++) {
        if (!lines[i])
          continue;

        var keyvalue = lines[i].split(':');
        headers[keyvalue[0].toLowerCase()] = keyvalue.slice(1).join().trim();
      }
    }
    return headers;
  };

  var XMLHttpRequest = global.XMLHttpRequest;

  var jsonp = function(opts, fn) {
    var cb = opts.query[opts.jsonp];
    var url = formatURL(opts);

    var el = document.createElement('script');
    el.src = url;
    el.async = true;

    global[cb] = function(b) {
      fn(null, b);
      delete global[cb];
      delete el.onerror;
      el.parentNode.remove(el);
    };

    el.onerror = function(e) {
      fn(e);
      delete el.onerror;
      delete global[cb];
      el.parentNode.remove(el);
    };

    var head = document.head || document.getElementsByTagName('head')[0];
    head.appendChild(el);
  };

  var HTTPRequest = function(opts) {
    opts = utils.handleOptions(opts);
    for (var j in opts)
      this[j] = opts[j];

    var request = this;
    this.request = this;
    var response = new utils.HTTPResponse();
    this.response = response;

    if (opts.body && (opts.method === 'GET' || opts.method === 'HEAD')) {
      console.warn('Request body ignored for GET and HEAD methods with XMLHttpRequest');
    }

    //jsonp
    if (typeof opts.jsonp === 'string') {
      if (opts.body)
        console.warn('Request body ignored for JSONP');

      jsonp(opts, function(err, body) {
        if (err)
          request.onerror(err);
        else
          response.onend(body);
      });
      return;
    }

    var req = new XMLHttpRequest();
    this.impl = req;

    req.addEventListener('error', function(err) {
      request.onerror(err);
    });

    req.addEventListener('readystatechange', function() {
      //0   UNSENT  open()has not been called yet.
      //1   OPENED  send()has not been called yet.
      //2   HEADERS_RECEIVED  send() has been called, and headers and status are available.
      //3   LOADING   Downloading; responseText holds partial data.
      //4   DONE  The operation is complete.
      // if (req.readyState === 1) {
      //   this.onopen();
      // }
      if (req.readyState === 2) {
        response.status = req.status;
        var headers = parseStringHeaders(req.getAllResponseHeaders());
        response.headers = headers;
        response.type = utils.getTypeFromHeaders(headers);
        response.size = utils.getSizeFromHeaders(headers);
        request.onresponse(response);
      }
      else if (req.readyState === 4) {
        response.onend(req.response);
      }
    });

    req.addEventListener('progress', function(e) {
      response.onprogress(e.loaded, e.lengthComputable ? e.total : null);
    });

    req.upload.addEventListener('progress', function(e) {
      request.onprogress(e.loaded, e.lengthComputable ? e.total : null);
    });

    req.open(opts.method, formatURL(opts), true);

    // if (this.responseType)
    //   req.responseType = this.responseType;

    for (var k in opts.headers) {
      req.setRequestHeader(k, opts.headers[k]);
    }

    req.send(opts.body);
  };
  HTTPRequest.prototype.abort = function() {
    this.req.abort();
  };
  HTTPRequest.prototype.onresponse = function() {};
  HTTPRequest.prototype.onprogress = function() {};
  HTTPRequest.prototype.onerror = function() {};

  global.HTTPClient.Request = HTTPRequest;

})(this);
(function(global) {

  'use strict';

  var utils;
  var Request;

  if (typeof module !== 'undefined' && module.exports) {
    utils = require('./utils');
    Request = require('./node');
  }
  else {
    utils = global.HTTPClient.utils;
    Request = global.HTTPClient.Request;
  }

  var HTTPClient = function(opts) {
    opts = utils.handleOptions(opts);

    for (var i in opts)
      this[i] = opts[i];
  };
  var request = function(opts, fn) {
    if (typeof opts === 'string')
      opts = {path: opts};

    opts = utils.handleOptions(opts, this);

    var req = new Request(opts);
    if (!fn)
      return req;

    req.onerror = function(err) {
      fn(err);
    };
    var res;
    req.onresponse = function(response) {
      res = response;

      response.onend = function(body) {
        fn(null, body);
      };
    };
    return req;
  };

  HTTPClient.request = request;
  HTTPClient.prototype.request = request;

  utils.methods.forEach(function(method) {
    var fn = function(opts, fn) {
      if (typeof opts === 'string')
        opts = {path: opts};

      opts.method = method;

      return this.request(opts, fn);
    };

    //instance
    HTTPClient.prototype[method] = fn;
    HTTPClient.prototype[method.toLowerCase()] = fn;
    //static
    HTTPClient[method] = fn;
    HTTPClient[method.toLowerCase()] = fn;
  });

  if (typeof module !== 'undefined' && module.exports)
    module.exports = HTTPClient;
  else {
    global.HTTPClient = HTTPClient;
    global.HTTPClient.utils = utils;
  }

})(this);

(function(global) {

  'use strict';

  if (typeof module !== 'undefined' && module.exports) {
    var utils = require('./lib/utils');
    var Connection = require('./lib/Connection');
    module.exports = {
      parse: utils.parse,
      serialize: utils.serialize,
      Connection: Connection,
      utils: utils
    };
  }
  else
    global.conducto = {};

})(this);
(function(global) {

  'use strict';

  var parseArguments = function(args) {
    var parsed = {
      arguments: []
    };

    if (!args || !args.length)
      return parsed;

    var i;

    if (typeof args[0] === 'object') {
      ['method', 'payload', 'id', 'error', 'result'].forEach(function(k) {
        if (k in args[0])
          parsed[k] = args[0][k];
      });

      if (typeof args[1] === 'function') {
        parsed.callback = args[1];
        i = 2;
      }
      else
        i = 1;
    }
    else if (typeof args[0] === 'string') {
      parsed.method = args[0];

      if (typeof args[1] === 'function') {
        parsed.callback = args[1];
        i = 2;
      }
      else if (1 in args) {
        parsed.payload = args[1];
        if (typeof args[2] === 'function') {
          parsed.callback = args[2];
          i = 3;
        }
        else {
          i = 2;
        }
      }
    }

    for (var l = args.length; i < l; i++)
      parsed.arguments.push(args[i]);

    return parsed;
  };
  var parse = function(data) {
    if (typeof data !== 'string')
      return new TypeError('Not a string');

    var returnValue;
    try {
      returnValue = JSON.parse(data);
    }
    catch(e) {
      returnValue = e;
    }
    return returnValue;
  };

  var serialize = function(data) {
    if (typeof data !== 'object' || data === null)
      return new TypeError('Not an object');

    try {
      data = JSON.stringify(data);
    }
    catch(e) {
      return e;
    }
    return data;
  };

  var inherits;
  if (typeof module !== 'undefined' && module.exports)
    inherits = require('util').inherits;
  else {
    //https://github.com/joyent/node/blob/master/lib/util.js#L558
    inherits = function(ctor, superCtor) {
      ctor.super_ = superCtor;
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
    };
  }

  var Promise;
  if (global.Promise) {
    Promise = global.Promise;
  }
  else if (typeof module !== 'undefined' && module.exports) {
    try {
      Promise = require('es6-promise').Promise;
    }
    catch (ex) {}
  }

  var mixin = function(dest, src) {
    for (var i in src) {
      if (src.hasOwnProperty(i)) {
        dest[i] = src[i];
      }
    }
    return dest;
  };

  var utils = {
    parseArguments: parseArguments,
    parse: parse,
    serialize: serialize,
    inherits: inherits,
    mixin: mixin,
    Promise: Promise
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = utils;
  else {
    global.conducto.parse = parse;
    global.conducto.serialize = serialize;
    global.conducto.utils = utils;
  }

})(this);
(function(global) {

  'use strict';

  var EventEmitter;
  var utils;
  var inherits;

  if (typeof module !== 'undefined' && module.exports) {
    utils = require('./utils');
    EventEmitter = require('events').EventEmitter;
  }
  else {
    utils = global.conducto.utils;
    EventEmitter = global.EventEmitter;
  }

  var Connection = function() {
    EventEmitter.call(this);
    this.actions = {};
    this.ignoreEvents = [];
    this.responseHandlers = {};
    this.lastId = 0;
  };
  utils.inherits(Connection, EventEmitter);
  var methods = {
    onError: function(error) {
      if (error.data)
        error = error.data;

      this.emit('error', error);
    },
    onOpen: function() {
      this.emit('open');
    },
    onClose: function() {
      this.emit('close');
    },
    close: function() {
      if (this.transport)
        this.transport.close();

      this.onClose();
    },
    onData: function(data) {
      if (typeof data === 'object' && 'data' in data)
        data = data.data;

      var message = utils.parse(data);
      if (message instanceof Error)
        return; //FIXME

      if (Array.isArray(message)) {
        for (var i = 0, l = message.length; i < l; i++)
          this.onMessage(message[i]);
      }
      else
        this.onMessage(message);

      this.emit('message', message, data);
    },
    onMessage: function(message) {
      if (message.method && this.ignoreEvents.indexOf(message.method) === -1)
        this.emit(message.method, message.payload);
      else if (!message.method)
        this.onResponse(message);
    },
    exec: function(method) {
      //overrided by a custom action
      if (this.actions[method]) {
        var h = this.actions[method].apply(this, Array.prototype.slice.call(arguments, 1));
        if (h !== false)
          return h;
      }

      return this.request.apply(this, arguments);
    },
    send: function(method, payload, cb) {
      var args = utils.parseArguments(arguments);

      //arguments
      if (typeof arguments[1] === 'function') {
        cb = arguments[1];
        payload = undefined;
      }
      else if (arguments[1] !== undefined) {
        payload = arguments[1];
        cb = typeof arguments[2] === 'function' ? arguments[2] : undefined;
      }

      if ('callback' in args) {
        if ('payload' in  args)
          this.request(args.method, args.payload, args.callback);
        else
          this.request(args.method, args.callback);
      }
      else
        this.notify(args.method, args.payload);
    },
    sendMessage: function(message) {
      if (!this.transport)
        return; //FIXME do something?
      if (this.readyState !== 1)
        return; //FIXME do something?

      var obj = Object.create(null);

      //request/notification
      if ('method' in message) {
        obj.method = message.method;
        if ('payload' in message)
          obj.payload = message.payload;
        if ('id' in message)
          obj.id = message.id;
      }
      //response
      else {
        if ('result' in message)
          obj.result = message.result;
        if ('error' in message)
          obj.error = message.error;
        if ('id' in message)
          obj.id = message.id;
      }

      var serialized = utils.serialize(obj);
      if (serialized instanceof Error)
        return serialized;

      this.transport.send(serialized);

      this.emit('send', obj, serialized);
    },
    onResponse: function(response) {
      var handler = this.getResponseHandler(response.id);
      if (handler) {
        handler(response.error, response.result);
        this.deleteResponseHandler(response.id);
      }
    },
    sendResponse: function(m) {
      delete m.method;
      delete m.payload;
      return this.sendMessage(m);
    },
    sendNotification: function(m) {
      delete m.id;
      return this.sendMessage(m);
    },
    sendRequest: function(m) {
      if (typeof m.id !== 'string')
        m.id = (this.lastId++).toString();

      return this.sendMessage(m);
    },
    notify: function(method, payload) {
      var args = utils.parseArguments(arguments);
      this.sendNotification(args);
    },
    request: function(method, payload, cb) {
      var args = utils.parseArguments(arguments);

      this.sendRequest(args);

      if (!utils.Promise && args.callback)
        return;

      var resolve;
      var reject;

      this.addResponseHandler(args.id, function(err, res) {
        if (args.callback)
          args.callback(err, res);
        if (err && reject)
          reject(err);
        else if (resolve)
          resolve(res);
      });

      if (utils.Promise) {
        return new utils.Promise(function(resolved, rejected) {
          resolve = resolved;
          reject = rejected;
        });
      }
    },
    respond: function(id, error, result) {
      if (typeof id === 'object')
        id = id.id;

      var m = {
        id: id
      };

      if (error !== null && error !== undefined)
        m.error = error;
      else if (result !== undefined)
        m.result = result;

      this.sendResponse(m);
    },
    //
    //response handler
    //
    addResponseHandler: function(id, fn) {
      this.responseHandlers[id] = fn.bind(this);
    },
    getResponseHandler: function(id) {
      return this.responseHandlers[id];
    },
    deleteResponseHandler: function(id) {
      delete this.responseHandlers[id];
    },
    define: function(method, bind) {
      var fn = function() {
        var o = {
          arguments: []
        };
        var cb;
        var i;
        if (typeof arguments[0] === 'function') {
          cb = arguments[0];
          i = 1;
        }
        else if (0 in arguments) {
          o.payload = arguments[0];
          if (typeof arguments[1] === 'function') {
            cb = arguments[1];
            i = 2;
          }
          else {
            i = 1;
          }
        }
        else {
          i = 0;
        }

        for (var l = arguments.length; i < l; i++)
          o.arguments.push(arguments[i]);

        var promise;
        var resolve;
        var reject;
        if (utils.Promise) {
          promise = new utils.Promise(function(res, rej) {
            resolve = res;
            reject = rej;
          });
        }
        fn = function(err, res) {
          if (err) {
            if (cb) cb(err);
            if (reject) reject(err);
            return;
          }

          if (cb) cb(null, res);
          if (resolve) resolve(res);
        };
        if (cb) fn.callback = cb;
        if (promise) fn.promise = promise;

        o.callback = fn;

        var h = bind.call(this, o);
        if (h === false)
          return h;

        if (promise) return promise;
      };

      this.actions[method] = fn;
    },
  };
  utils.mixin(Connection.prototype, methods);

  //FIXME
  Object.defineProperty(Connection.prototype, 'readyState', {
    get: function() {
      return this.transport ? this.transport.readyState : 3;
    }
  });

  if (typeof module !== 'undefined' && module.exports)
    module.exports = Connection;
  else
    global.conducto.Connection = Connection;

})(this);
(function(global) {

  'use strict';

  var WebSocket;
  var HTTPClient;
  var conducto;
  if (typeof module !== 'undefined' && module.exports) {
    conducto = require('conducto-core');
    WebSocket = require('ws');
    HTTPClient = require('httpclient');
  }
  else {
    conducto = global.conducto;
    WebSocket = global.WebSocket;
    HTTPClient = global.HTTPClient;
  }
  var Connection = conducto.Connection;
  var utils = conducto.utils;

  var formatQuery = function(query) {
    var querystring = '';
    if (typeof query === 'object') {
      for (var i in query) {
        querystring += i + '=' + query[i] + '&';
      }

      if (querystring.length > 0)
        querystring = '?' + querystring.slice(0, -1);
    }
    return querystring;
  };

  var opts = {
    keepalive: 5000,
    timeout: 2500,
    path: '/',
    port: 443,
    secure: true,
    host: 'localhost',
    query: {}
  };

  var Client = function(options) {
    this.transport = null;
    Connection.call(this);
    for (var i in opts)
      this[i] = opts[i];
    this.handleOption(options);
    this.http = new HTTPClient(options);
  };
  utils.inherits(Client, Connection);

  Client.utils = utils;

  var methods = {
    open: function(options, callback) {
      //arguments
      if (typeof arguments[0] === 'function')
        callback = arguments[0].bind(this);
      else if (arguments[0]) {
        this.handleOption(arguments[0]);
        if (typeof arguments[1] === 'function')
          callback = arguments[1].bind(this);
      }

      //callback
      if (callback) {
        var c = false;
        this.once('open', function() {
          if (c) return;
          callback();
          c = true;
        });
        this.once('error', function(err) {
          if (c) return;
          callback(err);
          c = true;
        });
      }

      //set up transport
      var url = (this.secure ? 'wss' : 'ws') + '://' + this.host + ':' + this.port + this.path;
      var qs = formatQuery(this.query);
      if (qs)
        url += qs;
      this.transport = new WebSocket(url);
      this.transport.onopen = this.onOpen.bind(this);
      this.transport.onclose = this.onClose.bind(this);
      this.transport.onerror = this.onError.bind(this);
      this.transport.onmessage = this.onData.bind(this);
      // this.transport.addEventListener('open', this.onOpen.bind(this));
      // this.transport.addEventListener('close', this.onClose.bind(this));
      // this.transport.addEventListener('error', this.onError.bind(this));
      // this.transport.addEventListener('message', this.onData.bind(this));

      //set up keepalive
      if (this.keepalive) {
        this.on('message', this.pingpong);
        this.once('close', function() {
          this.removeListener('message', this.pingpong);
        });
      }

      //return a promise
      if (utils.Promise)
        return new utils.Promise((function(resolve, reject) {
          this.once('open', resolve);
          this.once('error', reject);
        }).bind(this));
    },
    handleOption: function(option) {
      if (typeof option === 'string')
        this.host = option;
      else if (typeof option === 'object') {
        for (var i in opts) {
          if (i in option) {
            this[i] = option[i];
          }
        }
      }
    },
    pingpong: function() {
      if (this.pingTimeout)
        clearTimeout(this.pingTimeout);

      var that = this;
      this.pingTimeout = setTimeout(function() {
        var pong = setTimeout(function() {
          that.close();
        }, that.timeout);
        that.send('ping', function() {
          clearTimeout(pong);
        });
      }, this.keepalive);
    },
    HTTPRequest: function(opts, callback) {
      var options = {
        host: this.host,
        port: this.port,
        secure: this.secure,
        username: this.username,
        password: this.password,
        query: this.query,
        path: this.path
      };

      if (opts.auth === false) {
        delete options.username;
        delete options.password;
        delete opts.auth;
      }
      for (var i in opts)
        options[i] = opts[i];

      this.http.request(options, callback);
    },
  };

  utils.mixin(Client.prototype, methods);

  if (typeof module !== 'undefined' && module.exports)
    module.exports = Client;
  else
    conducto.Client = Client;

})(this);

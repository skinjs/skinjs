// skin.js 0.1.1
// © 2013 Soheil Jadidian
// skin.js may be freely distributed under the MIT license
// http://skinjs.org

define('hub', ['skin', 'adapter'], function(skin, adapter) {
  "use strict";




  // key strings, used in data objects
  var UID       = 'uid'
    , ALIAS     = 'alias'
    , BASE      = 'base'
    , PARENT    = 'parent'
    , NODES     = 'nodes'
    , CALLBACKS = 'callbacks';




  var Hub = skin.Hub = (function() {
    // singleton instance
    var _instance
    function _initialize() {

      // Private Methods and Properties
      // ==============================
        // data objects
      var _cache, _nodes, _templates, _actions, _recipes
        // to split and sanitize index paths
        , _splitter = /[\s.-]/
        // counter for generating unique ids
        , _token = 0;

      // initiate data
      _cache = {};
      _nodes = _set(_cache, [NODES], {});

      // sanitize index, convert multi arguments or chunked string to array
      function _sanitize() {
        var args = arguments
        return (adapter.isArray(args[0]))? args[0]
             : (args.length > 1)? adapter.arraySlice.call(args, 0)
             : (adapter.isString(args[0]))? args[0].split(_splitter)
             : []
      }

      // create unique id for everything
      // zero is reserved for null or undefined
      function _uid(symbol) {
        if (!symbol) return '0';
        // TODO: stored uid on dom elements should be removed at some point
        if (adapter.isObject(symbol)) return symbol[UID] || (symbol[UID] = ((symbol[ALIAS])? symbol[ALIAS] : '') + ++_token);
        return ((adapter.isString(symbol))? symbol : '') + ++_token;
      }

      function _get(pointer, index) {
        var key, flag;
        if (!index.length) return pointer;
        while (index.length) {
          key = index.shift();
          flag = false;
          if (adapter.objectHas.call(pointer, key)) {
            pointer = pointer[key];
            flag = true;
          } else {
            // check for value in base
            // TODO: implement MAP
            while (adapter.isObject(pointer[BASE])) {
              pointer = pointer[BASE];
              if (adapter.objectHas.call(pointer, key)) {
                pointer = pointer[key];
                flag = true;
                break;
              }
            }
            break;
          }
        }
        return (flag)? pointer : null;
      }

      function _set(pointer, index, value) {
        var key;
        if (!index.length) {
          // if value is a single string and there's no pointer or index
          // we parse the string for special cases
          if (adapter.isString(value)) {
            if (_splitter.test(value)) {
              // TODO: parse strings for some magic!
            } else {
              // only a single key has been passed in, no other arguments
              // create an empty object for that key if it doesn't exist
              pointer[value] || (pointer[value] = {});
              pointer[value][PARENT] = pointer;
              pointer = pointer[value];
            }
          // handle an empty index with an object as value
          // the value can't be assigned to the pointer directly
          // hence, if the value isn't an object we just ignore it
          // if the value is an object, we call set for each of its keys
          } else if (adapter.isObject(value)) for (key in value) _set(pointer, [key], value[key]);
        } else while (index.length) {
          key = index.shift();
          if (index.length) {
            // there are stil deeper levels
            if (!adapter.objectHas.call(pointer, key) || !adapter.isObject(pointer[key])) {
              // isObject() returns false for arrays
              // otherwise the next level object could be pushed in the existing array
              pointer[key] = {};
            }
            pointer[key][PARENT] = pointer;
            pointer = pointer[key];
          } else {
            // no more levels, last key
            // if value is undefined, we remove the key by convension
            // no one wants a key pointing to undefined!
            if (value == undefined) delete pointer[key];
            else if (key != BASE && adapter.isObject(value) && adapter.isObject(pointer[key])) {
              // merge two objects, keep existing reference
              pointer[key][PARENT] = pointer;
              pointer = pointer[key];
              for (key in value) _set(pointer, [key], value[key]);
            } else {
              // replace or create the value
              pointer[key] = value;
              if (adapter.isObject(value)) value[PARENT] = pointer;
              pointer = pointer[key];
            }
          }
        }
        return pointer;
      }

      function _match(target, condition, method) {
        // primary checks
        if (adapter.isUndefined(target)) return false;
        if (adapter.isUndefined(condition) || condition === target) return true;
        // wild card, any value except undefined
        if (condition === '*' && !adapter.isUndefined(target)) return true;
        // match function
        if (adapter.isFunction(condition) && !adapter.isFunction(target)) return condition(target);
        // recursive match for objects
        if (adapter.isObject(condition) && adapter.isObject(target)) {
          var key;
          // simple check if all keys exist for exact or all matching methods
          // before going into costly recursive matching
          if (adapter.isBoolean(method)) for (key in condition) if (adapter.isUndefined(target[key])) return false;
          // now go through every key
          for (key in condition) {
            if (_match(target[key], condition[key], method)) {
              // if method is any and we already have a match
              if (adapter.isUndefined(method)) return true;
            } else {
              // if method is all or exact and we don't have a match
              if (adapter.isBoolean(method)) return false;
            }
          }
          // inverse check, in exact match all target keys should have been covered
          if (method == true) for (key in target) if (adapter.isUndefined(condition[key])) return false;
          return (adapter.isUndefined(method))? false : true;
        }
        // recursive match for arrays
        if (adapter.isArray(condition) && adapter.isArray(target)) {
          var c, t, matched = [];
          // simple check if lengths are equal for exact match
          if (method == true && condition.length != target.length) return false;
          // go through all items for both
          for (c = 0; c < condition.length; c++) {
            for (t = 0; t < target.length; t++) {
              if (matched.indexOf(target[t]) == -1 && _match(target[t], condition[c], method)) {
                if (adapter.isUndefined(method)) return true;
                else matched.push(target[t]);
                break;
              }
            }
            if (matched.length < (c + 1) && adapter.isBoolean(method)) return false;
          }
          return (adapter.isUndefined(method))? false : true;
        }
        // none of above matched
        return false;
      }

      // recursive part of public find() method, collection is passed by reference
      function _find(collection, pointer, condition, recursive) {
        if (_match(pointer, condition)) collection.push(pointer);
        // avoid infinite loop, if the child has a reference to parent
        if (recursive && adapter.isObject(pointer)) for (var key in pointer) if (key != PARENT) _find(collection, pointer[key], condition, recursive);
      }

      function _filter(collection, condition, method) {
        for (var count = collection.length - 1; count >= 0; count--) {
          if (!_match(collection[count], condition, method)) collection.splice(count, 1);
        }
        return collection;
      }

      function _reject(collection, condition, method) {
        for (var count = collection.length - 1; count >= 0; count--) {
          if (_match(collection[count], condition, method)) collection.splice(count, 1);
        }
        return collection;
      }

      function _subscribe(publisher, message, callback) {
        var node, callbacks;
        message.unshift(_uid(publisher));
        node = _get(_nodes, message.slice(0)) || _set(_nodes, message.slice(0), {});
        callbacks = node[CALLBACKS] || (node[CALLBACKS] = []);
        // TODO: check indexOf() is supported
        if (callbacks.indexOf(callback) == -1) callbacks.push(callback);
      }

      function _unsubscribe(publisher, message, callback) {
        var nodes = [], node, callbacks, callback, condition = {};
        message || (message = []);
        message.unshift(_uid(publisher));
        node = _get(_nodes, message.slice(0));
        if (!node) return;
        // set condition and finding callbacks in sub branches
        condition[CALLBACKS] = (callback)? [callback] : '*';
        _find(nodes, node, condition, true);
        // removing callbacks
        for (node in nodes) {
          callbacks = nodes[node][CALLBACKS];
          callbacks.splice(callbacks.indexOf(callback), 1)
        }
        // TODO: clean empty branch
      }

      function _publish(publisher, message, parameters) {
        var nodes = [], node, callbacks, callback, condition = {};
        message.unshift(_uid(publisher));
        node = _get(_nodes, message.slice(0));
        // set condition and finding callbacks in sub branches
        condition[CALLBACKS] = '*';
        _find(nodes, node, condition, true);
        // calling callbacks
        for (node in nodes) {
          callbacks = nodes[node][CALLBACKS];
          for (callback in callbacks) {
            try {
              // TODO: if a callback returns false break the chain
              callbacks[callback](parameters);
            } catch(exception) {
              throw exception;
            }
          }
        }
      }

      return {

        // Public Methods
        // ==============
        // get the pointer to an index path, related to the starting pointer
        // index path can be an array, or string chunks sliced by . or -
        // returns null if the path doesn't exist
        // example: get(pointer, index)
        get: function() {
          var args = adapter.arraySlice.call(arguments, 0), pointer = _cache, index;
          if (adapter.isObject(args[0])) { pointer = args[0]; args = args.slice(1) }
          index = _sanitize.apply(this, args);
          return _get(pointer, index);
        }

        // set value for an index path, related to the starting pointer
        // index path can be an array, or string chunks sliced by . or -
        // returns pointer to the last modified object or array
        // example: set(pointer, index, value)
      , set: function() {
          var args = adapter.arraySlice.call(arguments, 0), pointer = _cache, index, value;
          // last argument is always the value
          value = args.slice(-1)[0];
          args = args.slice(0, -1);
          // if first argument is object, it is the pointer
          if (adapter.isObject(args[0])) { pointer = args[0]; args = args.slice(1) }
          index = _sanitize.apply(this, args);
          return _set(pointer, index, value);
        }

        // check if target object meets a condition, methods can be any, all and exact
        // method undefined (default) means if any of the conditions matched return true
        // method false, means all of the conditions should match
        // method true, means exact match, hence two given objects should contain exactly the same content tree
        // example: Data.match(target, { foo: 'bar', boo: someObject }, false);
        // TODO: implement BASE and MAP
      , match: function(target, condition, method) {
          return _match(target, condition, method);
        }

        // filter an array, keep items which match a condition
      , filter: function(collection, condition, method) {
          return _filter(collection, condition, method);
        }

        // reject an array, remove items which match a condition
      , reject: function(collection, condition, method) {
          return _reject(collection, condition, method);
        }

        // find { key: value, anotherKey: anotherValue } pairs in given pointer, index
        // and returns array of pointers to containing children
        // first arguments are pointer and index, will be passed to get() method
        // followed by the condition object { key: value }
        // last boolean argument indicates if we should search children recursively, default is false
        // example: data.find(pointer, index, { key: 'value' }, recursive);
      , find: function() {
          var args = adapter.arraySlice.call(arguments, 0), collection = [], pointer, condition, recursive;
          // recursive should be the last argument, if its boolean
          recursive = args.slice(-1)[0];
          if (adapter.isBoolean(recursive)) args = args.slice(0, -1);
          else recursive = false;
          // then the condition
          condition = args.slice(-1)[0];
          args = args.slice(0, -1);
          // remainings can be passed to get()
          pointer = this.get.apply(this, args);
          if (pointer) _find(collection, pointer, condition, recursive);
          return collection;
        }

        // example: on(object, event, callback)
      , on: function() {
          var args = adapter.arraySlice.call(arguments, 0), publisher, message, callback;
          if (!adapter.isString(args[0])) { publisher = args[0]; args = args.slice(1); }
          message = _sanitize(args[0]);
          callback = args[1];
          _subscribe(publisher, message, callback);
        }

        // example: off(object, event, callback)
      , off: function() {
          var args = adapter.arraySlice.call(arguments, 0), publisher, message, callback;
          if (!adapter.isString(args[0])) { publisher = args[0]; args = args.slice(1); }
          if (adapter.isString(args[0])) { message = _sanitize(args[0]); args = args.slice(1); }
          if (adapter.isFunction(args[0])) { callback = args[0]; }
          _unsubscribe(publisher, message, callback);
        }

        // example: trigger(object, event, parameters)
      , trigger: function() {
          var args = adapter.arraySlice.call(arguments, 0), publisher, message, parameters;
          if (!adapter.isString(args[0])) { publisher = args[0]; args = args.slice(1); }
          message = _sanitize(args[0]);
          parameters = args[1];
          _publish(publisher, message, parameters);
        }
      }
    }

    // get or create singleton instance
    return {
      getInstance: function() {
        if (!_instance) _instance = _initialize();
        return _instance;
      }
    }
  })()




  return Hub;
});
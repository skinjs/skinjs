// skin.js 0.1.1
// © 2013 Soheil Jadidian
// skin.js may be freely distributed under the MIT license
// http://skinjs.org

define('hub', ['skin', 'adapter'], function(skin, adapter) {
  "use strict";




  // key strings, used in data objects
  var UID    = 'uid'
    , ALIAS  = 'alias'
    , BASE   = 'base'
    , PARENT = 'parent';




  var Hub = skin.Hub = (function() {
    // singleton instance
    var _instance
    function _initialize() {

      // Private Methods and Properties
      // ==============================
        // main data object
      var _cache    = {}
        // to split and sanitize index paths
        , _splitter = /[\s.-]/
        // counter for generating unique ids
        , _token    = 0

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
              pointer = pointer[key] = value;
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

        // example: subscribe(publisher, message, callback)
      , subscribe: function() {
          var args = slice.call(arguments, 0)
            , publisher, message, callback, index, subscriber, callbacks
          if (!isString(args[0])) {
            publisher = args[0];
            args = args.slice(1);
          }
          message    = args[0];
          callback   = args[1];
          index      = uid(publisher) + '.' + message;
          subscriber = Data.get(subscriptions, index) || Data.set(true, subscriptions, index, {})
          callbacks  = subscriber[CALLBACKS]          || (subscriber[CALLBACKS] = [])
          if (callbacks.indexOf(callback) == -1) callbacks.push(callback)
        }

        // example: unsubscribe(publisher, message, callback)
      , unsubscribe: function() {
          var args      = slice.call(arguments, 0)
            , condition = {}
            , subscription, subscribers, publisher, message, callback, subscriber, callbacks, count
          if (!isString(args[0])) {
            publisher = args[0];
            args = args.slice(1);
          }
          subscription = subscriptions[uid(publisher)];
          if (!subscription) return;
          if (isString(args[0])) {
            message = args[0];
            args = args.slice(1);
          }
          condition[CALLBACKS] = '*';
          if (isFunction(args[0])) {
            callback = args[0];
            condition[CALLBACKS] = [callback];
          }
          subscribers = Data.find(subscription, message, condition, true);
          for (subscriber in subscribers) {
            callbacks = subscribers[subscriber][CALLBACKS]
            callbacks.splice(callbacks.indexOf(callback), 1)
          }
          // TODO: clean empty branch
        }

        // example: publish(publisher, message, data)
      , publish: function() {
          var args      = slice.call(arguments, 0)
            , condition = {}
            , publisher, message, index, subscribers, subscriber, callbacks, callback
          if (!isString(args[0])) {
            publisher = args[0];
            args = args.slice(1);
          }
          message = args[0];
          args    = args.slice(1);
          index   = uid(publisher) + '.' + message;
          // set condition and finding callbacks in sub branches
          condition[CALLBACKS] = '*';
          subscribers = Data.find(subscriptions, index, condition, true);
          // calling callbacks
          for (subscriber in subscribers) {
            callbacks = subscribers[subscriber][CALLBACKS];
            for (callback in callbacks) {
              try {
                // TODO: if a callback returns false break the chain
                callbacks[callback](args[0]);
              } catch(exception) {
                throw exception;
              }
            }
          }
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
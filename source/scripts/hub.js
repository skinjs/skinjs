// skin.js 0.1.1
// © 2013 Soheil Jadidian
// skin.js may be freely distributed under the MIT license
// http://skinjs.org

define('hub', ['skin', 'adapter'], function(skin, adapter) {
  "use strict";




  // Hub Module
  // ==========
  skin.Hub = (function() {
    // singleton instance
    var instance
    function initialize() {

      // Private Methods and Properties
      // ==============================
      var subscriptions = {}

      return {

        // Public Methods
        // ==============
        // example: subscribe(publisher, message, callback)
        subscribe: function() {
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
        if (!instance) instance = initialize();
        return instance;
      }
    }
  })()




});
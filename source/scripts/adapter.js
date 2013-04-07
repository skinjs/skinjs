// skin.js 0.1.2
// © 2013 Soheil Jadidian
// skin.js may be freely distributed under the MIT license
// http://skinjs.org

define('adapter', ['skin'], function(skin) {




  // Skin JavaScript Adapter Module
  // ==============================
  // extends existing basic adapter
  var _adapter = skin.adapter;
  _adapter.extend({

    // get an array of object keys
    keys: Object.keys || function(symbol) {
      var keys = [], key;
      for (key in symbol) if (_adapter.objectHas(symbol, key)) keys.push(key);
      return keys;
    },

    // get an element's offset x, y
    offset: function(element) {
      var left = 0, top = 0, pointer = element;
      while (pointer !== null) {
        left += pointer.offsetLeft;
        top  += pointer.offsetTop;
        pointer = pointer.offsetParent;
      }
      return { x: left, y: top };
    },

    // iterate an object or array, call iterator on every item
    each: function(object, iterator, context) {
      if (!object) return;
      if (_adapter.isArray(object)) {
        for (var count = 0; count < object.length; count++) {
          if (iterator.call(context, object[count], count, object) === false) return;
        }
      } else {
        for (var key in obj) {
          if (_adapter.objectHas.call(object, key)) {
            if (iterator.call(context, object[key], key, object) === false) return;
          }
        }
      }
    },

    // check object, array, string or null
    isEmpty: function(symbol) {
      if (symbol === null) return true;
      if (_adapter.isArray(symbol) || _adapter.isString(symbol)) return symbol.length === 0;
      for (var key in symbol) if (_adapter.objectHas.call(symbol, key)) return false;
      return true;
    },

    // get index of an item
    // TODO: IE8 doesn't support indexOf
    inArray: function(item, array, index) { return Arrays.indexOf.call(array, item, index); }

  });




  return _adapter;
});
// skin.js 0.1.1
// © 2013 Soheil Jadidian
// skin.js may be freely distributed under the MIT license
// http://skinjs.org

define('adapter', ['skin'], function(skin) {
  "use strict";

  // Skin JavaScript Adapter Module
  // ==============================
  var Adapter = skin.Adapter = {}

  var Objects    = Adapter.Objects    = Object.prototype
    , Arrays     = Adapter.Arrays     = Array.prototype
    , arraySlice = Adapter.arraySlice = Arrays.slice
    , objectHas  = Adapter.objectHas  = Objects.hasOwnProperty

  Adapter.isArray     = function(symbol) { return symbol != null && (symbol.isArray || symbol instanceof Array) }
  Adapter.isString    = function(symbol) { return typeof(symbol) === 'string' }
  Adapter.isFunction  = function(symbol) { return typeof(symbol) === 'function' }
  Adapter.isBoolean   = function(symbol) { return typeof(symbol) === 'boolean' }
  Adapter.isUndefined = function(symbol) { return typeof(symbol) === 'undefined' }
  Adapter.isObject    = function(symbol) { return symbol != null && typeof(symbol) === 'object' && !Adapter.isArray(symbol) }
  Adapter.isElement   = function(symbol) { return symbol != null && symbol.nodeType == Node.ELEMENT_NODE }

  Adapter.each = function(object, iterator, context) {
    if (!object) return;
    if (isArray(object)) {
      for (var count = 0, length = object.length; count < length; count++) {
        if (iterator.call(context, object[count], count, object) === false) return;
      }
    } else {
      for (var key in obj) {
        if (objectHas.call(object, key)) {
          if (iterator.call(context, object[key], key, object) === false) return;
        }
      }
    }
  }
  Adapter.isEmpty = function(symbol) {
    if (symbol == null) return true;
    if (Adapter.isArray(symbol) || Adapter.isString(symbol)) return symbol.length == 0;
    for (var key in symbol) if (objectHas.call(symbol, key)) return false;
    return true
  }
  Adapter.inArray = function(item, array, index) { return Arrays.indexOf.call(array, item, index) }
  Adapter.extend = function(target, source, recursive) {
    for (var key in source) {
      if (recursive && (Adapter.isObject(source[key]) || Adapter.isArray(source[key]))) {
        if (Adapter.isObject(source[key]) && !Adapter.isObject(target[key])) target[key] = {}
        if (Adapter.isArray(source[key])  && !Adapter.isArray(target[key]))  target[key] = []
        Adapter.extend(target[key], source[key], recursive)
      }
      else if (source[key] !== undefined) target[key] = source[key]
      else if (target[key]) delete target[key]
    }
  }

  return Adapter;
});
// skin.js 0.1.1
// © 2013 Soheil Jadidian
// skin.js may be freely distributed under the MIT license
// http://skinjs.org

define('query', ['skin', 'adapter'], function(skin, adapter) {
  "use strict";




  // Private Methods and Properties
  // ==============================
  // sanitize index, convert multi arguments or chunked string to array
  var _splitter = /[\s.-]/
  function _sanitize() {
    var args = arguments
    return (adapter.isArray(args[0]))? args[0] : (args.length > 1)? adapter.arraySlice.call(args, 0) : (adapter.isString(args[0]))? args[0].split(splitter) : []
  }

  // Query Module
  // ============
  // wraps data objects and adds cool functionality
  var Query = skin.Query = function() {
    var args = adapter.arraySlice.call(arguments, 0)
      , pointer, index, key, flag;
    pointer = args[0];
    args = args.slice(1);
    index = _sanitize.apply(this, args);
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
        // while (adapter.isObject(pointer[skin.keys.BASE])) {
        //   pointer = pointer[BASE];
        //   if (has.call(pointer, key)) {
        //     pointer = pointer[key];
        //     flag = true;
        //     break;
        //   }
        // }
        break;
      }
    }
    return (flag)? pointer : null;

  }




  return Query;
});
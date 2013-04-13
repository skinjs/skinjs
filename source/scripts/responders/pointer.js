// skin.js 0.1.3
// © 2013 Soheil Jadidian
// skin.js may be freely distributed under the MIT license
// http://skinjs.org

define('responders/pointer', ['skin'], function(skin) {


  // Pointer Responder Module
  // ========================
  // provides hooks for mouse, pen or touch events


  var name = 'pointer', adapter = skin.adapter, handlers = {}, events = ['resize', 'scroll', 'load', 'unload', 'hashchange'];

  function add() {}
  function remove() {}
  function handle() {}


  skin.responders[name] = { add: add, remove: remove };




  return skin;
});
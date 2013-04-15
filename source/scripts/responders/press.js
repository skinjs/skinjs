// Skin.js 0.1.4
// © 2013 Soheil Jadidian
// Skin.js may be freely distributed under the MIT license
// http://skinjs.org

define('responders/press', ['responders/pointer', 'skin'], function(Pointer, Skin) {

  // Press Responder Module
  // ======================
  // press, doublepress, longpress, controlpress

  var name = 'Press', Tools = Skin.Tools, hub = {}, indices = [];

  // supported events
  // ----------------
  // press:         tap, click, pointerdown followed by pointerup
  // doublepress:   double tap or double click, press press
  // longpress:     hold, long tap, long click, pointerdown and pointerup with delay
  // controlpress:  right click, contextmenu, pointerdown followed by pointerup with key type, altKey shiftKey or ctrlKey

  function add(element, name, context, callback) {
    Pointer.add(element, 'pointerdown', this, down);
    Pointer.add(element, 'pointerup', this, up);
  }

  function remove(element, name, context, callback) {
    Pointer.off(element, 'pointerdown', down);
    Pointer.off(element, 'pointerup', up);
  }

  function down(event) {
  }

  function up(event) {
  }


  Skin.Responders[name] = { add: add, remove: remove };
  return Skin;
});
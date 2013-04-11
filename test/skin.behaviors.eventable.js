$(document).ready(function() {

  module('skin: behaviors: eventable')

  test('availability', 2, function() {
    ok(typeof skin.behaviors.eventable.add === 'function', 'behavior add function is available');
    ok(typeof skin.behaviors.eventable.remove === 'function', 'behavior remove function is available');
  })

  test('on', 0, function() {
  })


});
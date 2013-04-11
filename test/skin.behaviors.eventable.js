$(document).ready(function() {

  module('skin: behaviors: eventable')

  asyncTest('availability', 2, function() {
    skin({ pack: { baseUrl: '../destination/scripts/' }})
    var Eventable = skin()
    Eventable.is('eventable')
    Eventable.ready(function() {
      ok(typeof skin.behaviors.eventable.add === 'function', 'behavior add function is available');
      ok(typeof skin.behaviors.eventable.remove === 'function', 'behavior remove function is available');
      start();
    })
  })

  test('on', 0, function() {
  })


});
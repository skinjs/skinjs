$(document).ready(function() {

  module('skin: events')

  var events

  test('availability', 1, function() {
    events = skin.events
    ok(events != undefined, 'skin events module is available')
  })

  test('on and trigger', 0, function() {
  })


});
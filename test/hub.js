$(document).ready(function() {

  module("Hub");

  var hub = Skin.Hub.getInstance()

  test('simple subscribe, unsubscribe and publish', 2, function() {
    var modified = false
      , modify   = function(data) { modified = data }

    hub.subscribe(null, 'foo.bar', modify)
    hub.publish(null, 'foo.bar', { data: true })
    ok(modified, 'simple subscription created and published, callback was invoked')

    hub.unsubscribe(null, 'foo.bar', modify)
    hub.publish(null, 'foo.bar', { data: false })
    ok(modified, 'simple subscription removed and published, callback was not invoked')

  });

});

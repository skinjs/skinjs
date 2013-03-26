$(document).ready(function() {

  module("Hub");

  var hub = Skin.Hub.getInstance()

  test('subscribe, unsubscribe and publish', 7, function() {
    var modified = false
      , modify   = function(data) { modified = data }
      , dummy    = {}

    hub.subscribe(null, 'foo.bar', modify)
    hub.publish(null, 'foo.bar', { data: true })
    ok(modified, 'simple subscription created and published, callback was invoked')

    // hub.unsubscribe(null, 'foo.bar', modify)
    // hub.publish(null, 'foo.bar', { data: false })
    // ok(modified, 'simple subscription removed and published, callback was not invoked')

    hub.subscribe(dummy, 'path.to.some.long.topic', modify);
    hub.publish(dummy, 'path.to.some.long.topic', 'hey')
    equal(modified, 'hey', 'full message path subscribe and publish')

    hub.publish(dummy, 'path.to.some', 'foo')
    equal(modified, 'foo', 'partial message path publish')

    hub.publish(dummy, 'path.to.some.wrong.topic', 'boo')
    equal(modified, 'foo', 'wrong message path publish')

    hub.subscribe(dummy, 'path.to.some.other.long.topic', modify);
    hub.publish(dummy, 'path.to.some.other.long.topic', 1)
    equal(modified, 1, 'another full message path subscribe and publish')

    hub.publish(dummy, 'path', 2)
    equal(modified, 2, 'another partial message path subscribe and publish')

    // hub.unsubscribe(null, 'path')
    // hub.publish(dummy, 'path', 3)
    // equal(modified, 3, 'other publisher unsubscribed, this publisher still works')
    // 
    // hub.unsubscribe(dummy, 'path.to.some.other')
    // hub.publish(dummy, 'path', 4)
    // equal(modified, 4, 'other path unsubscribed, this path still works')

    hub.unsubscribe(dummy, 'path')
    hub.publish(dummy, 'path', 5)
    equal(modified, 4, 'all paths unsubscribed')

  });

});

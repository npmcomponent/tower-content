
if ('undefined' === typeof window) {
  var content = require('..');
  var assert = require('assert');
} else {
  var content = require('tower-content');
  var assert = require('component-assert');
}

describe('content', function(){
  beforeEach(content.clear);

  it('should define', function(done){
    content.on('define', function(Content){
      assert('hello' === Content.id);
      done();
    });

    content('hello');
  });

  it('should init', function(done){
    content('menu').on('init', function(instance){
      assert('menu' === instance.name);
      done();
    }).init();
  });

  it('should print reliable `toString()`', function(){
    assert('[object Content]' === content('menu').init().toString());
  });

  describe('attr', function(){
    it('should define attrs', function(){
      content('menu')
        .attr('items', 'array', [ 1, 2, 3 ])

      var ctx = content('menu').init();
      assert('1,2,3' === ctx.get('items').join(','));
      assert('items' === content('menu').attrs['items'].name);
      assert('menu.items' === content('menu').attrs['items'].path);
    });

    it('should allow passing attrs on `init`', function(){
      content('menu')
        .attr('items', 'array');

      var ctx = content('menu').init({ items: [ 1, 2 ] });
      assert('1,2' === ctx.get('items').join(','));
    });

    /*it('should allow computed attributes', function(){
      content('menu')
        .attr('items', 'array', [ 'item a', 'item b', 'item c' ])
        .attr('selected', function(obj){
          console.log(obj)
          return obj.get('items')[0];
        });

      var ctx = content('menu').init();
      assert(undefined === ctx.data['selected']);
      assert('item a' === ctx.get('selected'));
      assert('item a' === ctx.data['selected']);
    });*/

    it('should get parent value if own value is undefined', function(){
      var parent = content('parent').init({ foo: 'bar' });
      var child = content('child').init({ }, parent);
      assert('bar' === child.get('foo'));
      assert('bar' === parent.get('foo'));
    });

    it('should handle dot.separated.names', function(){
      var random = content('random').init({ x: { y: 10 } });
      assert(10 === random.get('x.y'));
    });
  });

  describe('action', function(){
    it('should define actions', function(done){
      content('menu')
        .action('select', function(index){
          assert('menu' === this.name);
          assert(2 === index);
          done();
        });

      content('menu').init().call('select', 2);
    });

    it('should call parent action if own is undefined', function(done){
      var parent = content('parent').action('hello', function(val){
        assert('world' === val);
        done();
      }).init();
      var child = content('child').init({ }, parent);
      child.call('hello', 'world');
    });
  });

  describe('events', function(){
    it('should emit `"remove"` on `remove()`', function(){
      var calls = [];
      
      content('menu')
        .on('remove', function(instance){
          calls.push('constructor');
        });

      content('menu').init().on('remove', function(){
        calls.push('instance');
      }).remove();

      assert('instance,constructor' === calls.join(','));
    });
  });

  it('should define accessors', function(done){
    var scope = content('x').init({ post: { title: 'foo', body: 'bar' } });

    assert(scope.accessor);
    assert('foo' === scope.attr('post.title').get());
    assert('bar' === scope.attr('post.body').get());

    scope.attr('post.title').on('change', function(){
      done();
    });

    scope.attr('post.title').set('random');
  });

  it('should set `maxInstances` or something on `root` content');

  it('should define nested scopes', function(){
    content('one')
      .attr('one-a', 'string', 'a')
      .scope('two')
        .attr('two-a')
        .attr('two-b')
        .scope('three')
          .attr('three-a')
          .parent().parent()
      .scope('four');

    var obj = content('one').init();
    obj.set('two.two-a', 'asdf');

    var data = obj.data;
    var expected = { 'one-a': 'a', two: { three: {}, 'two-a': 'asdf' }, four: {} };
    assert.deepEqual(data, expected);

    assert(obj.scope('two'));
  });
});
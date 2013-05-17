if ('undefined' === typeof window) {
  var scope = require('..');
  var assert = require('assert');
} else {
  var scope = require('tower-scope');
  var assert = require('component-assert');
}

describe('scope', function(){
  beforeEach(scope.clear);

  it('should define', function(done){
    scope.on('define', function(Scope){
      assert('hello' === Scope.id);
      done();
    });

    scope('hello');
  });

  it('should init', function(done){
    scope('menu').on('init', function(instance){
      assert('menu' === instance.name);
      done();
    }).init();
  });

  it('should print reliable `toString()`', function(){
    assert('[object Scope]' === scope('menu').init().toString());
  });

  describe('attr', function(){
    it('should define attrs', function(){
      scope('menu')
        .attr('items', 'array', [1, 2, 3])

      var ctx = scope('menu').init();
      assert('1,2,3' === ctx.get('items').join(','));
    });

    it('should allow passing attrs on `init`', function(){
      scope('menu')
        .attr('items', 'array');

      var ctx = scope('menu').init({ items: [1, 2] });
      assert('1,2' === ctx.get('items').join(','));
    });

    it('should allow computed attributes', function(){
      scope('menu')
        .attr('items', 'array', [ 'item a', 'item b', 'item c' ])
        .attr('selected', function(obj){
          return obj.get('items')[0];
        });

      var ctx = scope('menu').init();
      assert(undefined === ctx.attrs['selected']);
      assert('item a' === ctx.get('selected'));
      assert('item a' === ctx.attrs['selected']);
    });

    it('should get parent value if own value is undefined', function(){
      var parent = scope('parent').init({ foo: 'bar' });
      var child = scope('child').init({ parent: parent });
      assert('bar' === child.get('foo'));
      assert('bar' === parent.get('foo'));
    });

    it('should handle dot.separated.names', function(){
      var random = scope('random').init({ x: { y: 10 } });
      assert(10 === random.get('x.y'));
    });
  });

  describe('action', function(){
    it('should define actions', function(done){
      scope('menu')
        .action('select', function(index){
          assert('menu' === this.name);
          assert(2 === index);
          done();
        });

      scope('menu').init().select(2);
    });

    it('should call parent action if own is undefined', function(done){
      var parent = scope('parent').action('hello', function(val){
        assert('world' === val);
        done();
      }).init();
      var child = scope('child').init({ parent: parent });
      child.call('hello', 'world');
    });
  });

  describe('events', function(){
    it('should emit `"remove"` on `remove()`', function(){
      var calls = [];
      
      scope('menu')
        .on('remove', function(instance){
          calls.push('constructor');
        });

      scope('menu').init().on('remove', function(){
        calls.push('instance');
      }).remove();

      assert('instance,constructor' === calls.join(','));
    });

    it('should emit `change` when property is set', function(done){
      var defaultItems = [ 'item a', 'item b', 'item c' ];
      var newItems = [ 'item d', 'item e' ];

      scope('menu')
        .attr('items', 'array', defaultItems)
        .attr('selected', function(obj){
          return obj.get('items')[0];
        });

      var menu = scope('menu').init();
      
      menu.on('change', function(name, val, prev){
        assert('items' === name);
        assert(newItems === val);
        // since it's a default, it was never set
        assert(undefined === prev);
        done();
      });

      menu.set('items', newItems);
    });

    it('should emit `change <name>` on all instances from constructor', function(){
      var calls = [];
      var items = [ 'item a', 'item b', 'item c' ];

      scope('menu')
        .attr('items', function(){
          return items;
        });

      var menu = scope('menu').init();
      // add instance event handler
      menu.on('change items', function(){
        assert(items === menu.get('items'));
        calls.push('change items');
      });
      // change items
      items = [ 'item d', 'item e' ];
      // emit `change items` from constructor.
      // this makes it so you can tell all scopes of a
      // particular type to emit events.
      scope('menu').changed('items');
      scope('menu').changed('items');
      menu.remove();
      // now it shouldn't register change events.
      scope('menu').changed('items');
      assert(2 === calls.length);
    });
  });

  it('should set `maxInstances` or something on `root` scope');
});
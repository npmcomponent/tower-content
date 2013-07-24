
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

      content('menu').init().select(2);
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

    it('should emit `change` when property is set', function(done){
      var defaultItems = [ 'item a', 'item b', 'item c' ];
      var newItems = [ 'item d', 'item e' ];

      content('menu')
        .attr('items', 'array', defaultItems);

      var menu = content('menu').init();
      
      menu.on('change', function(name, val, prev){
        assert('items' === name);
        assert(newItems.join(',') === val.join(','));
        // since it's a default, it was never set
        assert(defaultItems.join(',') === prev.join(','));
        done();
      });

      menu.set('items', newItems);
    });

    // XXX: not sure we need this anymore.
    /*it('should emit `change <name>` on all instances from constructor', function(){
      var calls = [];
      var items = [ 'item a', 'item b', 'item c' ];

      content('menu')
        .attr('items', function(){
          return items;
        });

      var menu = content('menu').init();
      // add instance event handler
      menu.on('change items', function(){
        assert(items === menu.get('items'));
        calls.push('change items');
      });

      // change items
      items = [ 'item d', 'item e' ];
      // emit `change items` from constructor.
      // this makes it so you can tell all contents of a
      // particular type to emit events.
      content('menu').changed('items');
      content('menu').changed('items');
      menu.remove();
      // now it shouldn't register change events.
      content('menu').changed('items');
      assert(2 === calls.length);
    });*/
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
});
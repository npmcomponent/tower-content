
/**
 * Module dependencies.
 */

var Emitter = require('tower-emitter')
  , proto = require('./lib/proto')
  , statics = require('./lib/statics')
  , toString = Object.prototype.toString
  , root;

/**
 * Expose `scope`.
 */

exports = module.exports = scope;

/**
 * Expose `collection`.
 */

exports.collection = [];

/**
 * Public API
 */

function scope(name, fn) {
  if (exports.collection[name]) return exports.collection[name];

  /**
   * Instantiate a new `Scope`.
   */

  function Scope(data) {
    this.name = name;
    // all actual attributes/values
    this.attrs = {};
    this.children = [];

    if (data) {
      // special prop
      this.parent = data.parent;
      delete data.parent;
      for (var key in data) this.set(key, data[key]);
    }

    // XXX: probably should do `this.set('parent')`
    //      so there is a standard way of managing parents.
    if (!this.parent && 'root' !== name)
      this.parent = exports.root();
    if (this.parent)
      this.parent.children.push(this);

    Scope.emit('init', this);
  }

  Scope.prototype = {};
  Scope.prototype.constructor = Scope;
  Scope.id = name;
  Scope.attrs = [];
  Scope.actions = {};

  // statics

  for (var key in statics) Scope[key] = statics[key];

  // proto

  for (var key in proto) Scope.prototype[key] = proto[key];

  if (fn) Scope.on('init', fn);

  exports.collection.push(Scope);
  exports.collection[name] = Scope;
  exports.emit('define', Scope);
  return Scope;
}

/**
 * Mixin `Emitter`.
 */

Emitter(exports);
Emitter(proto);
Emitter(statics);

/**
 * Clear the collections.
 *
 * Used for testing.
 */

exports.clear = function(){
  exports.off();
  exports.root().remove();
  exports.collection = [];
  root = undefined;
  return this;
};

exports.defined = function(name){
  return exports.collection.hasOwnProperty(name);
};

/**
 * Check if `obj` is a `Scope` object.
 */

exports.is = function(obj){
  return obj && '[object Scope]' === obj.toString();
};

/**
 * Root scope.
 */

exports.root = function(){
  if (root) return root;
  return root = scope('root').init();
};
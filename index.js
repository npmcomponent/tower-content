
/**
 * Module dependencies.
 */

var Emitter = require('tower-emitter')
  , proto = require('./lib/proto')
  , statics = require('./lib/statics')
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

  function Scope(data, parent) {
    this.name = name;
    this.parent = parent;
    this.children = [];
    if (data) {
      for (var key in data) this.set(key, data[key]);
    }
    Scope.emit('init', this);
  }

  Scope.prototype = {};
  Scope.prototype.constructor = Scope;
  Scope.id = name;
  Scope.attrs = [];

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
  exports.collection = [];
  root = undefined;
  return this;
};

/**
 * Root scope.
 */

exports.root = function(){
  if (root) return root;
  return root = scope('root').init();
}

/**
 * Module dependencies.
 */

var Emitter = require('tower-emitter')
  , proto = require('./lib/proto')
  , statics = require('./lib/statics');

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

  function Scope(data, el, parent) {
    this.name = name;
    this.data = data;
    this.el = el;
    this.parent = parent;
    this.children = [];

    Scope.emit('init', this);
  }

  Scope.prototype = {};
  Scope.prototype.constructor = Scope;
  Scope.id = name;

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
  return this;
}
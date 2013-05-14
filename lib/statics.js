
/**
 * Module dependencies.
 */

var attr = require('tower-attr').ns('scope');

/**
 * Instantiate a new `Scope`.
 *
 * @param {Object} data
 * @return {Scope} self
 */

exports.init = function(data){
  return new this(data);
};

/**
 * Define attr with the given `name` and `options`.
 *
 * @param {String} name
 * @param {Object} options
 * @return {Function} self
 * @api public
 */

exports.attr = function(name, type, options){
  var obj = this.context = attr(this.id + '.' + name, type, options);

  this.attrs[name] = obj;
  this.attrs.push(obj);

  return this;
};

/**
 * Define a method.
 *
 * @param {String} name
 * @param {Function} fn
 * @return {Function} self
 * @api public
 */

exports.action = function(name, fn){
  this.actions[name] = fn;

  this.prototype[name] = function(){
    fn.apply(this, arguments);
    return this; // chainable
  }
  return this;
}

/**
 * Emit `change <name>` event to all instances.
 *
 * XXX: Maybe there is a better API for this (less hardcoded).
 *
 * @param {String} name name of event
 */

exports.changed = function(name){
  if (this.instances.length) {
    for (var i = 0, n = this.instances.length; i < n; i++) {
      this.instances[i].emit('change ' + name);
    }
  }
  return this;
}
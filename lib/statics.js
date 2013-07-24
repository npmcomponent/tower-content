
/**
 * Module dependencies.
 */

var attr = require('tower-attr');

/**
 * Instantiate a new `Content`.
 *
 * @constructor Content
 * @param {Object} data The content's data to proxy.
 * @param {Parent} [parent] Parent content (defaults to the root content scope).
 * @return {Content} self
 * @api public
 */

exports.init = function(data, parent){
  return new this(data, parent);
};

/**
 * Define attr with the given `name` and `options`.
 *
 * @constructor Content
 * @chainable
 * @param {String} name
 * @param {Object} options
 * @return {Function} exports The main `content` function.
 * @api public
 */

exports.attr = function(name, type, options){
  var obj = this.context = attr(name, type, options, this.id + '.' + name);
  this.attrs[name] = obj;
  this.attrs.push(obj);
  if (obj.hasDefaultValue) this.attrs.__default__[name] = obj;

  return this;
};

/**
 * Define an action.
 *
 * @constructor Content
 * @chainable
 * @param {String} name The action's name.
 * @param {Function} fn The action's function definition.
 * @return {Function} exports The main `content` function.
 * @api public
 */

exports.action = function(name, fn){
  this.actions[name] = fn;

  this.prototype[name] = function(){
    return fn.apply(this, arguments);
  };

  return this;
};

/**
 * Set property across all content instances.
 *
 * @constructor Content
 * @chainable
 * @param {String} name The attribute name.
 * @param {Mixed} val The attribute value
 * @return {Function} exports The main `content` function.
 * @api public
 */

exports.set = function(name, val){
  if (this.instances.length) {
    for (var i = 0, n = this.instances.length; i < n; i++) {
      this.instances[i].set(name, val);
    }
  }
  return this;
};

/**
 * Trigger `change` event on all content instances.
 *
 * @constructor Content
 * @chainable
 * @param {String} name The attribute name
 * @return {Function} exports The main `content` function.
 * @api public
 */

exports.changed = function(name){
  if (this.instances.length) {
    for (var i = 0, n = this.instances.length; i < n; i++) {
      this.instances[i].changed(name);
    }
  }
  return this;
};

/**
 * Returns the default model attributes with their values.
 *
 * @constructor Content
 * @return {Object} The default model attributes with their values.
 * @api private
 */

exports._defaultAttrs = function(attrs, binding){
  // XXX: this can be optimized further.
  var defaultAttrs = this.attrs.__default__;
  attrs || (attrs = {});
  for (var name in defaultAttrs) {
    if (undefined === attrs[name]) {
      attrs[name] = defaultAttrs[name].apply(binding);
    }
  }
  return attrs;
};
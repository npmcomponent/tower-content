/**
 * Module dependencies.
 */

var attr = require('tower-attr').ns('content');

/**
 * Instantiate a new `Content`.
 *
 * @constructor Content
 * @param {Object} data The content's data.
 * @return {Content} self
 */

exports.init = function(data){
  return new this(data);
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
  var obj = this.context = attr(this.id + '.' + name, type, options);

  this.attrs[name] = obj;
  this.attrs.push(obj);

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
    fn.apply(this, arguments);
    return this; // chainable
  }
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
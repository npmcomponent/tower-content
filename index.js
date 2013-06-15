/**
 * Module that handles the data for the DOM.
 *
 * @module content
 */

/**
 * Module dependencies.
 */

var Emitter = require('tower-emitter');
var proto = require('./lib/proto');
var statics = require('./lib/statics');
var root;

/**
 * Expose `content`.
 */

exports = module.exports = content;

/**
 * Expose `collection`.
 */

exports.collection = [];

/**
 * Public API. Gets an existing content or creates a new one.
 *
 * @param {String} name The content's name.
 * @param {Function} fn Function called on content initialization.
 * @return {Content} A `Content` object.
 */

function content(name, fn) {
  if (exports.collection[name]) return exports.collection[name];

  /**
   * Class representing a specific data segment in the DOM.
   *
   * @class
   *
   * @param {Object} data The content's data.
   */

  function Content(data) {
    this.name = name;
    // all actual attributes/values
    this.attrs = {};
    this.children = [];

    if (data) {
      // special prop
      this.parent = data.parent;
      delete data.parent;
      this.update(data);
    }

    // XXX: probably should do `this.set('parent')`
    //      so there is a standard way of managing parents.
    if (!this.parent && 'root' !== name)
      this.parent = exports.root();
    if (this.parent)
      this.parent.children.push(this);

    // for being able to emit events to instances from class.
    Content.instances.push(this);
    Content.emit('init', this);
  }

  Content.prototype = {};
  Content.prototype.constructor = Content;
  Content.id = name;
  Content.attrs = [];
  Content.actions = {};
  Content.instances = [];

  // statics

  for (var key in statics) Content[key] = statics[key];

  // proto

  for (var key in proto) Content.prototype[key] = proto[key];

  if (fn) Content.on('init', fn);

  exports.collection.push(Content);
  exports.collection[name] = Content;
  exports.emit('define', Content);
  return Content;
}

/**
 * Mixin `Emitter`.
 */

Emitter(exports);
Emitter(proto);
Emitter(statics);

// XXX: maybe so you can do:
// content('body').emit('change x')
// to notify all instances of body
//statics._emit = statics.emit;
//statics.emit = function(name){
//  
//}

/**
 * Clear the collections.
 * Used for testing.
 *
 * @chainable
 *
 * @return {this} self.
 */

exports.clear = function(){
  exports.off();
  exports.root().remove();
  exports.collection = [];
  root = undefined;
  return this;
};

/**
 * Check if a content has been defined.
 *
 * @param {String} name The content's name.
 * @return {Boolean} true if the `Content` has been defined, but false otherwise.
 */

exports.defined = function(name){
  return exports.collection.hasOwnProperty(name);
};

/**
 * Check if `obj` is a `Content` object
 *
 * @param {Content} obj A content object.
 * @return {Boolean} true if `obj` is a Content object, but false otherwise.
 */

exports.is = function(obj){
  return obj && '[object Content]' === obj.toString();
};

/**
 * Get the initiated root content.
 *
 * @return {Content} The root content.
 */

exports.root = function(){
  if (root) return root;
  return root = content('root').init();
};

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
 * @api public
 */

function content(name, fn) {
  if (exports.collection[name]) return exports.collection[name];

  /**
   * Class representing a specific data segment in the DOM.
   *
   * @class
   *
   * @param {Object} data The content's data.
   * @api public
   */

  function Content(data, parent) {
    this.name = name;
    // all actual attributes/values
    this.data = {};
    this.edges = {};
    this.children = [];
    this.root = 'root' === name ? this : exports.root();
    this.setParent(parent);
    if (data) this.update(data);
    // for being able to emit events to instances from class.
    Content.instances.push(this);
    Content.emit('init', this);
  }

  Content.prototype = {};
  Content.prototype.constructor = Content;
  Content.id = name;
  Content.attrs = [];
  Content.actions = {};
  Content.helpers = {};
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

// XXX: not sure where this should go yet.
proto.serialize = function(){
  var json = {};
  var data = this.data;
  for (var key in data) {
    if (content.is(data[key])) {
      json[key] = data[key].serialize();
    } else if (this.constructor.attrs[key]) {
      json[key] = data[key];
    }
  }
  return json;
};

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
 * @return {Function} exports The main `content` function.
 * @api public
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
 * @api public
 */

exports.defined = function(name){
  return exports.collection.hasOwnProperty(name);
};

/**
 * Check if `obj` is a `Content` object
 *
 * @param {Content} obj A content object.
 * @return {Boolean} true if `obj` is a Content object, but false otherwise.
 * @api public
 */

exports.is = function(obj){
  return obj && '[object Content]' === obj.toString();
};

/**
 * Get the initiated root content.
 *
 * @return {Content} The root content.
 * @api public
 */

exports.root = function(){
  if (root) return root;
  return root = content('root').init();
};
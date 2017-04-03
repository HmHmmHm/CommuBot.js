let DeployEvent = require('deploy-event');

let EventPriority = DeployEvent.EventPriority;
let EventDispatcher = new DeployEvent.EventDispatcher();

EventDispatcher.LOWEST = EventPriority.LOWEST;
EventDispatcher.LOW = EventPriority.LOW;
EventDispatcher.NORMAL = EventPriority.NORMAL;
EventDispatcher.HIGH = EventPriority.HIGH;
EventDispatcher.HIGHEST = EventPriority.HIGHEST;
EventDispatcher.MONITOR = EventPriority.MONITOR;

/**
 * @callback eventCallback
 * @param {Event} eventInstance
 */
/**
 * @param {Event} event
 * @param {eventCallback} callback
 * @param {integer} priority
 */
//on(event, callback, priority)

/**
 * @param {Event} event
 */
//call(event)

module.exports = EventDispatcher;

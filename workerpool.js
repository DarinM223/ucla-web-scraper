var Worker = require('webworker-threads').Worker;

function Node(data, callback) {
  this.data = data;
  this.callback = callback;
  this.prev = null;
}

function Queue() {
  this.top = null;
  this.bot = null;
}

Queue.prototype.enqueue = function(node) {
  if (this.top === null) {
    this.top = node;
    this.bot = node;
  } else {
    this.bot.prev = node;
    this.bot = node;
  }
};

Queue.prototype.dequeue = function() {
  if (this.top === null) {
    return null;
  }

  var retValue = this.top;
  this.top = this.top.prev;
  return retValue;
};

Queue.prototype.isEmpty = function() {
  return (this.top === null);
};


function WorkerPool(size, func) {
  this.workers = [];
  this.freeWorkers = [];
  this.taskQueue = new Queue();

  for (var i = 0; i < size; i++) {
    this.workers.push(new Worker(func));
    this.freeWorkers.push(i);
  }
}

/**
 * Runs a worker in the pool with the parameter data
 * @param {Object} data the data to pass into the worker
 * @param {function(Object)} callback the returned data from the worker
 */
WorkerPool.prototype.run = function(data, callback) {
  var _this = this;

  var freeIndex = this.freeWorkers.pop();
  if (freeIndex === undefined) {
    taskQueue.enqueue(new Node(data, callback));
  } else {
    var worker = this.workers[freeIndex];

    worker.addEventListener('message', function(event) {
      _this.freeWorkers.push(freeIndex);
      if (!_this.taskQueue.isEmpty()) {
        var currentTask = _this.taskQueue.dequeue();
        _this.run(currentTask.data, currentTask.callback);
      }
      callback(event.data);
    });

    worker.postMessage(data);
  }
};

module.exports = WorkerPool;

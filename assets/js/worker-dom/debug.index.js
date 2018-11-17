var MainThread = (function (exports) {
    'use strict';

    /**
     * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *      http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS-IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    let count = 0;
    const strings = new Map();
    /**
     * Return a string for the specified index.
     * @param index string index to retrieve.
     * @returns string in map for the index.
     */

    function get(index) {
      return strings.get(index) || '';
    }
    /**
     * Stores a string in mapping and returns the index of the location.
     * @param value string to store
     * @return location in map
     */

    function store(value) {
      strings.set(++count, value);
    }

    /**
     * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *      http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS-IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    let count$1 = 2;
    let NODES;
    let BASE_ELEMENT;
    /**
     * Called when initializing a Worker, ensures the nodes in baseElement are known
     * for transmission into the Worker and future mutation events from the Worker.
     * @param baseElement Element that will be controlled by a Worker
     */

    function prepare(baseElement) {
      // The NODES map is populated with two default values pointing to baseElement.
      // These are [document, document.body] from the worker.
      NODES = new Map([[1, baseElement], [2, baseElement]]);
      BASE_ELEMENT = baseElement; // To ensure a lookup works correctly from baseElement
      // add an _index_ equal to the background thread document.body.

      baseElement._index_ = 2; // Lastly, it's important while initializing the document that we store
      // the default nodes present in the server rendered document.

      baseElement.childNodes.forEach(node => storeNodes(node));
    }
    /**
     * Store the requested node and all of its children.
     * @param node node to store.
     */

    function storeNodes(node) {
      storeNode(node, ++count$1);
      node.childNodes.forEach(node => storeNodes(node));
    }
    /**
     * Create a real DOM Node from a skeleton Object (`{ nodeType, nodeName, attributes, children, data }`)
     * @example <caption>Text node</caption>
     *   createNode({ nodeType:3, data:'foo' })
     * @example <caption>Element node</caption>
     *   createNode({ nodeType:1, nodeName:'div', attributes:[{ name:'a', value:'b' }], childNodes:[ ... ] })
     */


    function createNode(skeleton, sanitizer) {
      if (skeleton[0
      /* nodeType */
      ] === 3
      /* TEXT_NODE */
      ) {
          const node = document.createTextNode(get(skeleton[5
          /* textContent */
          ]));
          storeNode(node, skeleton[7
          /* _index_ */
          ]);
          return node;
        }

      const namespace = skeleton[6
      /* namespaceURI */
      ] !== undefined ? get(skeleton[6
      /* namespaceURI */
      ]) : undefined;
      const nodeName = get(skeleton[1
      /* nodeName */
      ]);
      const node = namespace ? document.createElementNS(namespace, nodeName) : document.createElement(nodeName); // TODO(KB): Restore Properties
      // skeleton.properties.forEach(property => {
      //   node[`${property.name}`] = property.value;
      // });
      // ((skeleton as TransferrableElement)[TransferrableKeys.childNodes] || []).forEach(childNode => {
      //   if (childNode[TransferrableKeys.transferred] === NumericBoolean.FALSE) {
      //     node.appendChild(createNode(childNode as TransferrableNode));
      //   }
      // });
      // If `node` is removed by the sanitizer, don't store it and return null.

      if (sanitizer && !sanitizer.sanitize(node)) {
        return null;
      }

      storeNode(node, skeleton[7
      /* _index_ */
      ]);
      return node;
    }
    /**
     * Returns the real DOM Element corresponding to a serialized Element object.
     * @param id
     * @return RenderableElement
     */

    function getNode(id) {
      const node = NODES.get(id);

      if (node && node.nodeName === 'BODY') {
        // If the node requested is the "BODY"
        // Then we return the base node this specific <amp-script> comes from.
        // This encapsulates each <amp-script> node.
        return BASE_ELEMENT;
      }

      return node;
    }
    /**
     * Establish link between DOM `node` and worker-generated identifier `id`.
     *
     * These _shouldn't_ collide between instances of <amp-script> since
     * each element creates it's own pool on both sides of the worker
     * communication bridge.
     * @param node
     * @param id
     */

    function storeNode(node, id) {
      node._index_ = id;
      NODES.set(id, node);
    }

    /**
     * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *      http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS-IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */

    /**
     * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *      http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS-IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const NODES_ALLOWED_TO_TRANSMIT_TEXT_CONTENT = [8
    /* COMMENT_NODE */
    , 3
    /* TEXT_NODE */
    ];
    const initialStrings = [];
    const strings$1 = new Map();
    let count$2 = 0;

    function store$1(value) {
      if (strings$1.has(value)) {
        // Safe to cast since we verified the mapping contains the value
        return strings$1.get(value) - 1;
      }

      strings$1.set(value, ++count$2);
      initialStrings.push(value);
      return count$2 - 1;
    }

    function createHydrateableNode(element) {
      let hydrated = {
        [7
        /* _index_ */
        ]: element._index_,
        [8
        /* transferred */
        ]: 0
        /* FALSE */
        ,
        [0
        /* nodeType */
        ]: element.nodeType,
        [1
        /* nodeName */
        ]: store$1(element.nodeName),
        [4
        /* childNodes */
        ]: [].map.call(element.childNodes || [], child => createHydrateableNode(child)),
        [2
        /* attributes */
        ]: [].map.call(element.attributes || [], attribute => [store$1(attribute.namespaceURI || 'null'), store$1(attribute.name), store$1(attribute.value)])
      };

      if (element.namespaceURI !== null) {
        hydrated[6
        /* namespaceURI */
        ] = store$1(element.namespaceURI);
      }

      if (NODES_ALLOWED_TO_TRANSMIT_TEXT_CONTENT.includes(element.nodeType) && element.textContent !== null) {
        hydrated[5
        /* textContent */
        ] = store$1(element.textContent);
      }

      return hydrated;
    }

    /**
     * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *      http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS-IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Stored callbacks for the most recently created worker.
     * Note: This can be easily changed to a lookup table to support multiple workers.
     */

    let callbacks_; // TODO(KB): Fetch Polyfill for IE11.

    function createWorker(baseElement, workerDomURL, authorScriptURL, callbacks) {
      callbacks_ = callbacks;
      return Promise.all([fetch(workerDomURL).then(response => response.text()), fetch(authorScriptURL).then(response => response.text())]).then((_ref) => {
        let workerScript = _ref[0],
            authorScript = _ref[1];
        // TODO(KB): Minify this output during build process.
        const keys = [];

        for (let key in document.body.style) {
          keys.push(`'${key}'`);
        }

        const hydratedNode = createHydrateableNode(baseElement);
        const code = `
        'use strict';
        ${workerScript}
        (function() {
          var self = this;
          var window = this;
          var document = this.document;
          var localStorage = this.localStorage;
          var location = this.location;
          var defaultView = document.defaultView;
          var Node = defaultView.Node;
          var Text = defaultView.Text;
          var Element = defaultView.Element;
          var SVGElement = defaultView.SVGElement;
          var Document = defaultView.Document;
          var Event = defaultView.Event;
          var MutationObserver = defaultView.MutationObserver;

          function addEventListener(type, handler) {
            return document.addEventListener(type, handler);
          }
          function removeEventListener(type, handler) {
            return document.removeEventListener(type, handler);
          }
          this.consumeInitialDOM(document, ${JSON.stringify(initialStrings)}, ${JSON.stringify(hydratedNode)});
          this.appendKeys([${keys}]);
          document.observe();
          ${authorScript}
        }).call(WorkerThread.workerDOM);
//# sourceURL=${encodeURI(authorScriptURL)}`;
        return new Worker(URL.createObjectURL(new Blob([code])));
      }).catch(error => {
        return null;
      });
    }
    /**
     * @param worker
     * @param message
     */

    function messageToWorker(worker, message) {
      if (callbacks_ && callbacks_.onSendMessage) {
        callbacks_.onSendMessage(message);
      }

      worker.postMessage(message);
    }

    /**
     * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *      http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS-IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const KNOWN_LISTENERS = [];
    /**
     * Instead of a whitelist of elements that need their value tracked, use the existence
     * of a property called value to drive the decision.
     * @param node node to check if values should be tracked.
     * @return boolean if the node should have its value property tracked.
     */

    const shouldTrackChanges = node => node && 'value' in node;
    /**
     * When a node that has a value needing synced doesn't already have an event listener
     * listening for changed values, ensure the value is synced with a default listener.
     * @param worker whom to dispatch value toward.
     * @param node node to listen to value changes on.
     */


    const applyDefaultChangeListener = (worker, node) => {
      shouldTrackChanges(node) && node.onchange === null && (node.onchange = () => fireValueChange(worker, node));
    };
    /**
     * Tell the worker DOM what the value is for a Node.
     * @param worker whom to dispatch value toward.
     * @param node where to get the value from.
     */

    const fireValueChange = (worker, node) => {
      messageToWorker(worker, {
        [9
        /* type */
        ]: 5
        /* SYNC */
        ,
        [38
        /* sync */
        ]: {
          [7
          /* _index_ */
          ]: node._index_,
          [18
          /* value */
          ]: node.value
        }
      });
    };
    /**
     * Register an event handler for dispatching events to worker thread
     * @param worker whom to dispatch events toward
     * @param _index_ node index the event comes from (used to dispatchEvent in worker thread).
     * @return eventHandler function consuming event and dispatching to worker thread
     */


    const eventHandler = (worker, _index_) => event => {
      if (shouldTrackChanges(event.currentTarget)) {
        fireValueChange(worker, event.currentTarget);
      }

      messageToWorker(worker, {
        [9
        /* type */
        ]: 1
        /* EVENT */
        ,
        [37
        /* event */
        ]: {
          [7
          /* _index_ */
          ]: _index_,
          [22
          /* bubbles */
          ]: event.bubbles,
          [23
          /* cancelable */
          ]: event.cancelable,
          [24
          /* cancelBubble */
          ]: event.cancelBubble,
          [25
          /* currentTarget */
          ]: {
            [7
            /* _index_ */
            ]: event.currentTarget._index_,
            [8
            /* transferred */
            ]: 1
            /* TRUE */

          },
          [26
          /* defaultPrevented */
          ]: event.defaultPrevented,
          [27
          /* eventPhase */
          ]: event.eventPhase,
          [28
          /* isTrusted */
          ]: event.isTrusted,
          [29
          /* returnValue */
          ]: event.returnValue,
          [10
          /* target */
          ]: {
            [7
            /* _index_ */
            ]: event.target._index_,
            [8
            /* transferred */
            ]: 1
            /* TRUE */

          },
          [30
          /* timeStamp */
          ]: event.timeStamp,
          [9
          /* type */
          ]: event.type,
          [32
          /* keyCode */
          ]: 'keyCode' in event ? event.keyCode : undefined
        }
      });
    };
    /**
     * Process commands transfered from worker thread to main thread.
     * @param nodesInstance nodes instance to execute commands against.
     * @param worker whom to dispatch events toward.
     * @param mutation mutation record containing commands to execute.
     */


    function process(worker, mutation) {
      const _index_ = mutation[10
      /* target */
      ];
      const target = getNode(_index_);
      (mutation[21
      /* removedEvents */
      ] || []).forEach(eventSub => {
        processListenerChange(worker, target, false, get(eventSub[9
        /* type */
        ]), eventSub[33
        /* index */
        ]);
      });
      (mutation[20
      /* addedEvents */
      ] || []).forEach(eventSub => {
        processListenerChange(worker, target, true, get(eventSub[9
        /* type */
        ]), eventSub[33
        /* index */
        ]);
      });
    }
    /**
     * If the worker requests to add an event listener to 'change' for something the foreground thread is already listening to
     * ensure that only a single 'change' event is attached to prevent sending values multiple times.
     * @param worker worker issuing listener changes
     * @param target node to change listeners on
     * @param addEvent is this an 'addEvent' or 'removeEvent' change
     * @param type event type requested to change
     * @param index number in the listeners array this event corresponds to.
     */

    function processListenerChange(worker, target, addEvent, type, index) {
      let changeEventSubscribed = target.onchange !== null;
      const shouldTrack = shouldTrackChanges(target);
      const isChangeEvent = type === 'change';

      if (addEvent) {
        if (isChangeEvent) {
          changeEventSubscribed = true;
          target.onchange = null;
        }

        target.addEventListener(type, KNOWN_LISTENERS[index] = eventHandler(worker, target._index_));
      } else {
        if (isChangeEvent) {
          changeEventSubscribed = false;
        }

        target.removeEventListener(type, KNOWN_LISTENERS[index]);
      }

      if (shouldTrack && !changeEventSubscribed) {
        applyDefaultChangeListener(worker, target);
      }
    }

    /**
     * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *      http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS-IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    let MUTATION_QUEUE = [];
    let PENDING_MUTATIONS = false;
    let worker;
    function prepareMutate(passedWorker) {
      worker = passedWorker;
    }
    const mutators = {
      [2
      /* CHILD_LIST */
      ](mutation, target, sanitizer) {
        (mutation[12
        /* removedNodes */
        ] || []).forEach(node => getNode(node[7
        /* _index_ */
        ]).remove());
        const addedNodes = mutation[11
        /* addedNodes */
        ];
        const nextSibling = mutation[14
        /* nextSibling */
        ];

        if (addedNodes) {
          addedNodes.forEach(node => {
            let newChild = null;
            newChild = getNode(node[7
            /* _index_ */
            ]);

            if (!newChild) {
              // Transferred nodes that are not stored were previously removed by the sanitizer.
              if (node[8
              /* transferred */
              ]) {
                return;
              } else {
                newChild = createNode(node, sanitizer);
              }
            }

            if (newChild) {
              target.insertBefore(newChild, nextSibling && getNode(nextSibling[7
              /* _index_ */
              ]) || null);
            }
          });
        }
      },

      [0
      /* ATTRIBUTES */
      ](mutation, target, sanitizer) {
        const attributeName = mutation[15
        /* attributeName */
        ] !== undefined ? get(mutation[15
        /* attributeName */
        ]) : null;
        const value = mutation[18
        /* value */
        ] !== undefined ? get(mutation[18
        /* value */
        ]) : null;

        if (attributeName != null) {
          if (value == null) {
            target.removeAttribute(attributeName);
          } else {
            if (!sanitizer || sanitizer.validAttribute(target.nodeName, attributeName, value)) {
              target.setAttribute(attributeName, value);
            }
          }
        }
      },

      [1
      /* CHARACTER_DATA */
      ](mutation, target) {
        const value = mutation[18
        /* value */
        ];

        if (value) {
          // Sanitization not necessary for textContent.
          target.textContent = get(value);
        }
      },

      [3
      /* PROPERTIES */
      ](mutation, target, sanitizer) {
        const propertyName = mutation[17
        /* propertyName */
        ] !== undefined ? get(mutation[17
        /* propertyName */
        ]) : null;
        const value = mutation[18
        /* value */
        ] !== undefined ? get(mutation[18
        /* value */
        ]) : null;

        if (propertyName && value) {
          if (!sanitizer || sanitizer.validProperty(target.nodeName, propertyName, value)) {
            target[propertyName] = value;
          }
        }
      },

      [4
      /* COMMAND */
      ](mutation) {
        process(worker, mutation);
      }

    };
    /**
     * Process MutationRecords from worker thread applying changes to the existing DOM.
     * @param nodes New nodes to add in the main thread with the incoming mutations.
     * @param mutations Changes to apply in both graph shape and content of Elements.
     * @param sanitizer Sanitizer to apply to content if needed.
     */

    function mutate(nodes, stringValues, mutations, sanitizer) {
      //mutations: TransferrableMutationRecord[]): void {
      // TODO(KB): Restore signature requiring lastMutationTime. (lastGestureTime: number, mutations: TransferrableMutationRecord[])
      // if (performance.now() || Date.now() - lastGestureTime > GESTURE_TO_MUTATION_THRESHOLD) {
      //   return;
      // }
      // this.lastGestureTime = lastGestureTime;
      stringValues.forEach(value => store(value));
      nodes.forEach(node => createNode(node, sanitizer));
      MUTATION_QUEUE = MUTATION_QUEUE.concat(mutations);

      if (!PENDING_MUTATIONS) {
        PENDING_MUTATIONS = true;
        requestAnimationFrame(() => syncFlush(sanitizer));
      }
    }
    /**
     * Apply all stored mutations syncronously. This method works well, but can cause jank if there are too many
     * mutations to apply in a single frame.
     *
     * Investigations in using asyncFlush to resolve are worth considering.
     */

    function syncFlush(sanitizer) {
      MUTATION_QUEUE.forEach(mutation => {
        mutators[mutation[9
        /* type */
        ]](mutation, getNode(mutation[10
        /* target */
        ]), sanitizer);
      });
      MUTATION_QUEUE = [];
      PENDING_MUTATIONS = false;
    }

    /**
     * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *      http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS-IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const ALLOWABLE_MESSAGE_TYPES = [3
    /* MUTATE */
    , 2
    /* HYDRATE */
    ];
    function install(baseElement, authorURL, workerDOMUrl, workerCallbacks, sanitizer) {
      prepare(baseElement);
      createWorker(baseElement, workerDOMUrl, authorURL, workerCallbacks).then(worker => {
        if (worker === null) {
          return;
        }

        prepareMutate(worker);

        worker.onmessage = message => {
          const data = message.data;

          if (!ALLOWABLE_MESSAGE_TYPES.includes(data[9
          /* type */
          ])) {
            return;
          } // TODO(KB): Hydration has special rules limiting the types of allowed mutations.
          // Re-introduce Hydration and add a specialized handler.


          mutate(data[35
          /* nodes */
          ], data[39
          /* strings */
          ], data[34
          /* mutations */
          ], sanitizer); // Invoke callbacks after hydrate/mutate processing so strings etc. are stored.

          if (workerCallbacks && workerCallbacks.onReceiveMessage) {
            workerCallbacks.onReceiveMessage(message);
          }
        };
      });
    }

    /**
     * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *      http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS-IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    function upgradeElement(baseElement, workerDOMUrl) {
      const authorURL = baseElement.getAttribute('src');

      if (authorURL) {
        upgrade(baseElement, authorURL, workerDOMUrl);
      }
    }
    function upgrade(baseElement, authorURL, workerDOMUrl) {
      install(baseElement, authorURL, workerDOMUrl);
    }

    exports.upgradeElement = upgradeElement;
    exports.upgrade = upgrade;

    return exports;

}({}));
//# sourceMappingURL=debug.index.js.map

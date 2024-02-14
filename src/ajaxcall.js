var container = document.querySelector('.container');
var outputTextarea = document.querySelector('.debug');

var schema = {
    "type": "object",
    "title": "string-tree-editor",
    "properties": {
        "field1": {
            "type": "string",
            "format": "tree",
            // "default": "empty",
            "options": {
                "tree": {
                    "value": "text",
                    "jstree": {
                        "core": {
                            "data": [
                                {
                                    id: 'ajson1', parent: '#', text: 'Simple root node'
                                },
                                {
                                    id: 'ajson2', parent: '#', text: 'Root node 2'
                                },
                                {
                                    id: 'ajson3', parent: 'ajson2', text: 'Child 1'
                                },
                                {
                                    id: 'ajson4', parent: 'ajson2', text: 'Child 2'
                                }
                            ]
                        },
                        "plugins": ["wholerow", "checkbox", "search"],
                        "search": {
                            "case_sensitive": false,
                            "show_only_matches": true
                        }
                    }
                }
            }
        },
        "field2": {
            "type": "string",
            "format": "tree",
            // "default": "empty2",
            "options": {
                "tree": {
                    "value": "text",
                    "jstree": {
                        "core": {
                            "data": [
                                {
                                    id: 'ajson2', parent: '#', text: 'Root node 2'
                                },
                                {
                                    id: 'ajson3', parent: 'ajson2', text: 'Child 1'
                                },
                                {
                                    id: 'ajson4', parent: 'ajson2', text: 'Child 2'
                                }
                            ]
                        }
                    }
                }
            }
        },
        "field3": {
            "type": "string",
            "default": "empty3"
        },
        "field4": {
            "type": "string",
            "format": "tree",
            // "default": "empty2",
            "options": {
                "tree": {
                    "value": "text",
                    "jstree": {
                        "core": {
                            'data': function abc (obj, cb) {
                                fetch('https://www.semantic-mediawiki.org/w/api.php?action=ask&query=[[Located%20in::Germany]]OR[[Demo:Germany]]|?Located%20in&format=json')
                                    .then(response => {
                                        return response.json();
                                    })
                                    .then(data => {
                                        let arrToCallback = []  // main array of nodes used in callback
                                        let allNodesArr = []  // array of all nodes
                                        let allParentsArr = []  // array of all parent nodes (potential root nodes)

                                        for (const [, value] of Object.entries(data.query.results)) {
                                            /*
                                            change here according to the JSON schema:
                                            "dispalytitle" is the label/text of a node to be displayed in a tree
                                            "fulltext" is the unqiue ID of a node
                                            */
                                            let nodeText = value["displaytitle"] !== "" ? value["displaytitle"] : value["fulltext"]
                                            let nodeId = value["fulltext"]
                                            let parentArr = value.printouts  // array of parents of this single node
                                            let parentNode = parentArr.length === 0 ? '#' : value.printouts["Located in"][0]["fulltext"]  // check if a node has any parent otherwise set to a root node
                                            // parentNode = parentNode["displaytitle"] !== "" ? parentNode["displaytitle"] : parentNode["fulltext"]

                                            arrToCallback.push({
                                                id: nodeId,
                                                parent: parentNode,
                                                text: nodeText
                                            })

                                            /*
                                            add a node to the array containing all nodes
                                            */
                                            if (!allNodesArr.includes(nodeId)) {
                                                allNodesArr.push(nodeId)
                                            }

                                            /*
                                            add a parent node to array containing nodes that have children (potential root nodes)
                                            */
                                            if (parentArr.length !== 0 && !allParentsArr.includes(parentNode)) {
                                                allParentsArr.push(parentNode)
                                            }
                                        }
                                        /*
                                        check if a parent node has any parents itself, if not - set the orphan node to a root node
                                        */
                                        let rootNodesArr = allParentsArr.filter(e => !allNodesArr.includes(e));  // get nodes with no parents from array containing nodes that have children
                                        rootNodesArr.forEach(e => arrToCallback.push({ id: e, parent: '#', text: e }))  // add root node to the array used in callback

                                        cb.call(this, arrToCallback);
                                    })
                                    .catch(console.error);
                            }
                            
                        },
                        "plugins": ["search"],
                        "search": {
                            "case_sensitive": false,
                            "show_only_matches": true
                        }
                    }
                }
            }
        }
    }
};

var editor = new JSONEditor(container, {
    schema: schema
});

document.querySelector('.get-value').addEventListener('click', function () {
    outputTextarea.value = JSON.stringify(editor.getValue());
});

/*
updates the formular with new schema values (provide node id instead of node title)
*/
document.querySelector('.set-value').addEventListener('click', function () {
    // get a JSON schema from an input/output area
    let updatedJson = JSON.parse(outputTextarea.value)

    /*
    check each field in formular of format tree for 'undefined'
    if a field is not specidied in a new json schema, set its value to ''
    */
    for (const [key, value] of Object.entries(schema.properties)) {
        if (value && value.format && value.format === 'tree' && updatedJson[key] === undefined) {
            updatedJson[key] = ''
        }
    }
    editor.setValue(updatedJson);
});


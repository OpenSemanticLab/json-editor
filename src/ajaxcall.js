var container = document.querySelector('.container');
var outputTextarea = document.querySelector('.debug');
var fetchedData = ['placeholder1', 'placeholder2', 'placeholder3'];

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
                                // console.log("AJAX REQUEST OBJ: ", obj);
                                // let arr = []
                                // let i = 0;
                                fetch('https://www.semantic-mediawiki.org/w/api.php?action=ask&query=[[Located%20in::Germany]]OR[[Demo:Germany]]|?Located%20in&format=json')
                                    .then(response => {
                                        // console.log('response: ', response);
                                        return response.json();
                                    })
                                    .then(data => {
                                        // console.log('data: ', data.query.results);
                                        let arrToCallback = []  // main array of nodes used in callback
                                        let allNodesArr = []  // array of all nodes
                                        let allParentsArr = []  // array of all parent nodes (potential root nodes)

                                        for (const [key, value] of Object.entries(data.query.results)) {
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

                                        console.log('arr: ', arrToCallback)
                                        fetchedData.push(arrToCallback);
                                        console.log('fetchedData: ', fetchedData)

                                        cb.call(this, arrToCallback);
                                        // console.log('fetchedData: ', fetchedData)
                                        // return fetchedData;
                                    })
                                    .catch(console.error);
                                // return data;
                            },
                            'dataArr': 
                                // console.log('fetchedData: ', fetchedData)
                                fetchedData
                            
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
    let json = editor.getValue()
    console.log('outputTextarea: ', JSON.parse(outputTextarea.value))
    // get a JSON schema from an input/output area
    let updatedJson = JSON.parse(outputTextarea.value)

    let counter = 0;
    for (const [key, value] of Object.entries(schema.properties)) {
        if (value && value.format && value.format === 'tree') {
            // -------- TO BE DELETED AFTERWARDS ---------
            console.log('field name : ', key)
            console.log('for-block SOLL TREE: ', fetchedData[counter]);
            // var data = value.options.tree.jstree.core.data
            if (counter == 3) {
                var data = fetchedData[counter];
            } else {
                var data = value.options.tree.jstree.core.data
            }
            console.log('for-block SOLL: ', data);
            // -------- TO BE DELETED AFTERWARDS ---------

            // get a new id value for the current field
            var newVal = updatedJson[key];
            console.log('updatedJson for this tree newVal: ', newVal)

            // get id of all tree elements
            var idArr = []
            data.forEach(e => {idArr.push(e.id)})

            if (newVal !== '' && newVal !== undefined) {
                // check if the provided node id values exist in the tree, if not - display alert msg
                Array.from(newVal).forEach(e => {if (!idArr.includes(e)) {alert(`Could not find any element with id=${e} in the ${key}.`)}})
                //  keep only id values that exist in the tree
                json[key] = newVal.filter(e => {if (idArr.includes(e)) {return e}})     
            }
            editor.setValue(json);
        }
        console.log('-----------------------------')
        counter ++;
    }
});


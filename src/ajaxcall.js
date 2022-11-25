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
                                        let arr = []
                                        let nodesArr = []
                                        let parentsArr = []

                                        for (const [key, value] of Object.entries(data.query.results)) {
                                            // console.log('=======BEGINN===========')

                                            let node = value["fulltext"]
                                            let parentArr = value.printouts;
                                            let parentNode = value.printouts["Located in"][0]["fulltext"]
                                            // parentNode = parentNode["displaytitle"] !== "" ? parentNode["displaytitle"] : parentNode["fulltext"]

                                            // console.log('ARR: ', arr)
                                            // console.log('NODE: ', node)
                                            // console.log('PARENT: ', parentNode)

                                            arr.push({
                                                id: node,
                                                parent: parentArr.length === 0 ? '#' : parentNode,
                                                text: node
                                            })

                                            if (!nodesArr.includes(node)) {
                                                nodesArr.push(node)
                                            }
                                            if (parentArr.length !== 0 && !parentsArr.includes(parentNode)) {
                                                parentsArr.push(parentNode)
                                            }
                                        }
                                        // set an orphan node to a root
                                        let rootNodesArr = parentsArr.filter(e => !nodesArr.includes(e));
                                        rootNodesArr.forEach(e => arr.push({ id: e, parent: '#', text: e }))

                                        // console.log('arr: ', arr)
                                        // console.log("nodesArr: ", nodesArr)
                                        // console.log("parentsArr: ", parentsArr)
                                        // console.log("rootNodesArr: ", rootNodesArr)
                                        console.log('arr: ', arr)
                                        fetchedData.push(arr);
                                        console.log('fetchedData: ', fetchedData)

                                        cb.call(this, arr);
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
                //  keep only id values that exist in the tree (not undefined)
                json[key] = newVal.filter(e => {if (idArr.includes(e)) {return e}})     
            }
            editor.setValue(json);
        }
        console.log('-----------------------------')
        counter ++;
    }
});


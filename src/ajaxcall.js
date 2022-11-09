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
                            'data': function (obj, cb) {
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

                                        cb.call(this, arr);
                                        // return arr;
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

document.querySelector('.set-value').addEventListener('click', function () {
    let json = editor.getValue()
    // let json = JSON.stringify(editor.getValue())
    // outputTextarea.value = JSON.stringify(json, null, 2)
    console.log('outputTextarea: ', JSON.parse(outputTextarea.value))
    let updatedJson = JSON.parse(outputTextarea.value)

    for (const [key, value] of Object.entries(schema.properties)) {
        if (value && value.format && value.format === 'tree') {
            console.log('field name : ', key)
            var data = value.options.tree.jstree.core.data
            console.log('for-block SOLL: ', data);

            // create a dict where (key, value) = (id, text) of tree elements
            var dict = {}
            data.forEach(e => dict[e.id] = e.text)
            console.log('DICTIONARY :', dict)

            console.log('updatedJson for this tree: ', updatedJson[key])

            var isSubArr = updatedJson[key].every((i => v => i = Object.keys(dict).indexOf(v, i) + 1)(0));
            if (isSubArr || updatedJson[key] === '') {
                console.log('master contains sub id OR empty? : TRUE')
                console.log('json BEFORE:', json)

                const labelArr = updatedJson[key].map(e => {return dict[e]});

                // json[key] = updatedJson[key]
                json[key] = labelArr

                console.log('dict[updatedJson[key]:', dict[key])
                console.log('json AFTER:', json[key])
                editor.setValue(json);
                // editor.setValue({ field1: ["Child 1"], field2: "",   field3: "Germany" });
            } else {
                console.log('contains updated id OR empty? : FALSE')
            }
        }
        // console.log('for-block: ', value)
        // console.log('for-block: ', value.format)
        console.log('-----------------------------')
    }

    // editor.setValue(JSON.parse(outputTextarea.value))
    // editor.setValue({ field1: ["Child 1"], field2: "", field3: "Germany", field4: ["Demo:Germany"] });
});


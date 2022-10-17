var container = document.querySelector('.container');
var debug = document.querySelector('.debug');

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
                                console.log("AJAX REQUEST OBJ: ", obj);
                                // let arr = []
                                // let i = 0;
                                fetch('https://www.semantic-mediawiki.org/w/api.php?action=ask&query=[[Located%20in::Germany]]OR[[Demo:Germany]]|?Located%20in&format=json')
                                    .then(response => {
                                        console.log('response: ', response);
                                        return response.json();
                                    })
                                    .then(data => {
                                        console.log('data: ', data.query.results);
                                        let arr = []
                                        let nodesArr = []
                                        let parentsArr = []

                                        for (const [key, value] of Object.entries(data.query.results)) {
                                            console.log('=======BEGINN===========')

                                            let node = value["fulltext"]
                                            let parentArr = value.printouts;
                                            let parentNode = value.printouts["Located in"][0]["fulltext"]
                                            // parentNode = parentNode["displaytitle"] !== "" ? parentNode["displaytitle"] : parentNode["fulltext"]

                                            console.log('ARR: ', arr)
                                            console.log('NODE: ', node)
                                            console.log('PARENT: ', parentNode)

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

                                        console.log('arr: ', arr)
                                        console.log("nodesArr: ", nodesArr)
                                        console.log("parentsArr: ", parentsArr)
                                        console.log("rootNodesArr: ", rootNodesArr)
                                        console.log('arr: ', arr)

                                        cb.call(this, arr);
                                    })
                                    .catch(console.error);
                            }
                        }
                    }
                }
            }
        }
    }
};

var editor = new JSONEditor(container, {
    schema: schema,
    // data:{"field1":"","field2":"","field3":"empty3","field4":["Demo:Germany"]}  //btn 'setValue'
});

document.querySelector('.get-value').addEventListener('click', function () {
    debug.value = JSON.stringify(editor.getValue());
});
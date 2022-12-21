# JSON Tree Editor

JSON Tree Editor allows to work with hierarchical tree structures and generate a corresponding JSON schema (‘Get Value’) as well as takes as input JSON schema and generates an HTML form (‘Update Form’).

## Demo

Working branch: *add-tree-editor-dev*


Build the project: 


```bash
npm run build
```
Run the project in debug modus:
```bash
npm run debug
``` 

## Important classes:
### tree.js

*tree.js* class inherits from *StringEditor* and creates an actual tree editor. The most important functions og this class:

- #### postBuild():
It creates a popup dialog and shows it on click on an input field. Also, it modifies selected tree nodes (input values) into tags. The manual key input is disabled. The two buttons ‘add’ and ‘clear’ are optional and can be omitted.

- #### setValue():
It is called by ‘Update Form’ button and updates an HTML form by taking over the IDs of tree nodes and displaying their labels in the form’s fields as tags. Also, the corresponding tree elements are checked in the tree popup dialog.

- #### createTree():
It takes fetch config from schema and creates a tree container inside the popup dialog. It differentiates whether a tree contains a search bar or not. After user selection of tree nodes it saves only the corresponding IDs (not labels).

### ajaxcall.js
The tree data is fetched here using callback APIs. It defines the tree schema including fields’ plugins. The current HTML form contains only one dynamically generated tree structure (field4) in contrast to the static ones (field1, field2). The array to be called in the callback functions contains ID, label and parent node of each tree node. Right before the callback, it sets an orphan node to a root node of the tree.
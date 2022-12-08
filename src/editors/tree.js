/*

Creates a tree view to select a value.
Based on https://www.jstree.com/

*/
import { StringEditor } from './string.js'
import { extend } from '../utilities.js'

export class TreeEditor extends StringEditor {
  postBuild () { /* 2. after getNumCols() */
    /* eslint-disable-next-line no-console */
    console.log('in postBuild fct')

    /*
    add "add", "clear" buttons to each filed
    alternatively click on field or use backspace key
    */
    const btnAdd = document.createElement('button')
    btnAdd.innerHTML = 'Add'
    this.container.appendChild(btnAdd)

    const btnClear = document.createElement('button')
    btnClear.innerHTML = 'Clear'
    this.container.appendChild(btnClear)

    /*
    create a popup container
    */
    this.popupContainer = document.createElement('div')
    this.popupContainer.id = 'popup-' + this.container.dataset.schemapath.replaceAll('.', '-') /* jQuery doesn't like dots and hyphens within the id */
    /* eslint-disable-next-line no-console */
    console.log('this.popupContainer.id: ', this.popupContainer.id)
    this.container.appendChild(this.popupContainer)
    /*
    create a popup dialog and show on input field click
    */
    window.jQuery('#' + this.popupContainer.id).dialog({
      title: 'Tree Structure : ' + this.popupContainer.id.split('-')[2],
      height: 400,
      width: 400,
      autoOpen: false,
      modal: true,
      buttons: {
        OK: function () { window.jQuery(this).dialog('close') }
        // Cancel: function () {
        //   window.jQuery(this).dialog('close')
        // }
      }
    })

    this.input.id = 'input-' + this.container.dataset.schemapath.replaceAll('.', '-')
    /*
    tagify input fields (only of format 'tree') by converting selected tree nodes into tags
    */
    this.tagify = window.jQuery('#' + this.input.id).tagify()
      .on('removeTag', (event, tagName) => { // tagName.data.value
        var treeId = 'tree-' + this.container.dataset.schemapath.replaceAll('.', '-')
        var labels = event.target.label
        window.jQuery('#' + treeId).jstree('deselect_node', '#' + labels[tagName.index])
        labels.splice(tagName.index, 1)
      })
    /*
    open a popup with a tree structure on click on the input field
    */
    window.document.addEventListener('click', (event) => {
      if (this.container.contains(event.target) && event.target.className === 'tagify__input') {
        // if (!event.target.classList.contains('my-selector-class')) return;
        /* eslint-disable-next-line no-console */
        console.log('event target NAME: ', event.target.className)
        window.jQuery('#' + this.popupContainer.id).dialog('open')
      }
    }, false)

    /*
    diasble manual inputs in the tagified input field
    */
    window.document.addEventListener('keydown', (event) => {
      if (this.container.contains(event.target) && event.target.className === 'tagify__input') {
        // window.jQuery(this).trigger('change')
        event.preventDefault()
        event.stopPropagation()
      }
    }, false)

    btnAdd.addEventListener('click', (event) => {
      window.jQuery('#' + this.popupContainer.id).dialog('open')
    })
    btnClear.addEventListener('click', (event) => {
      this.input.label = this.input.value = ''
      this.input.style.width = 165 + 'px'
      window.jQuery('#' + this.treeContainer.id).jstree('deselect_all')
      window.jQuery('#' + this.treeContainer.id).jstree('close_all')
    })
  }

  /*
  updates the formular by taking over id of tree elements, setting the corresponding text values in the input fields as tags
  and selecting the corresponding nodes in a tree
  */
  setValue (value) {
    /* eslint-disable-next-line no-console */
    console.log('in setValue fct:', value)
    var res = {}

    if (this.tree && this.treeContainer) {
      // get nodes' ids and labels (text)
      var nodeArr = []
      var labelArr = []
      var jsonNodes = this.tree.jstree(true).get_json('#', { flat: true })
      window.jQuery.each(jsonNodes, function (i, val) {
        nodeArr.push({
          id: window.jQuery(val).attr('id'),
          text: window.jQuery(val).attr('text')
        })
      })

      if (value !== '' && value !== undefined) {
        // map node id to its corresponding label (text)
        value.forEach(val => nodeArr.filter(e => { return e.id === val }).map(e => { labelArr.push(e.text) }))
        res = super.setValue(labelArr)
        /* eslint-disable-next-line no-console */
        console.log('labels to display : ', labelArr)
      } else if (value === '') {
        res = super.setValue(value)
      }

      // /* eslint-disable-next-line no-console */
      // console.log('in CREATE TREE ! : ', nodeArr)
      // /* eslint-disable-next-line no-console */
      // console.log('in CREATE TREE ! labelArr : ', labelArr)
    }

    if (this.tree && this.treeContainer && res && res.changed) {
      this.tree.jstree(true).select_node(value)
    }
    return res
  }

  getNumColumns () { /* 1. */
    /* eslint-disable-next-line no-console */
    console.log('in getNumColumns fct')
    return 2
  }

  afterInputReady () { /*  4. after getNumCols() -> postBuild() -> setValue() */
    /* eslint-disable-next-line no-console */
    console.log('in afterInputReady fct')
    super.afterInputReady()
    this.createTree(true)
  }

  disable () {
    /* eslint-disable-next-line no-console */
    console.log('in disable fct')
    super.disable()
  }

  enable () {
    /* eslint-disable-next-line no-console */
    // console.log('in enable fct')
    super.enable()
  }

  destroy () {
    /* eslint-disable-next-line no-console */
    console.log('in destroy fct')
    super.destroy()
    window.jQuery(this.treeContainer.id).jstree.destroy()
  }

  /* helper functions */
  createTree (create) {
    /* eslint-disable-next-line no-console */
    console.log('in createTree fct')
    // const editor = this

    /* fetch config from schema */
    this.options.tree = this.expandCallbacks('tree', extend({}, {
      editor: 'jstree', /* default use jstree */
      jstree: { data: [] }, /* default no data */
      value: 'text', /* store the nodes text attribute */
      mode: 'inline', /* show inline (no popup) */
      position: 'bottom' /* show in the bottom */
    }, this.defaults.options.tree || {}, this.options.tree || {}, {
      parent: this.popupContainer
    }))
    /*
    create a tree container inside the popup dialog
    */
    this.treeContainer = document.createElement('div')
    this.treeContainer.id = 'tree-' + this.container.dataset.schemapath.replaceAll('.', '-') /* jstree / jQuery doesn't like dots and hyphens within the id */

    /*
    create a search bar to the popup if jsTree includes 'search' plugin
    */
    if (this.options.tree.jstree.plugins && this.options.tree.jstree.plugins.includes('search')) {
      this.searchField = document.createElement('INPUT')
      this.searchField.setAttribute('type', 'search')
      this.searchField.setAttribute('placeholder', 'Search..')
      this.searchField.id = 'search-' + this.container.dataset.schemapath.replaceAll('.', '-')
      // this.searchField.addEventListener('keydown', (event) => { if (event.key === 'Enter') this.tree.jstree('search', this.searchField.value) })
      this.searchField.addEventListener('keydown', (event) => { this.tree.jstree('search', this.searchField.value) })
      this.searchField.addEventListener('click', (event) => { this.tree.jstree('search', true) })
      this.popupContainer.appendChild(this.searchField)
    }

    this.popupContainer.appendChild(this.treeContainer)
    this.tree = window.jQuery('#' + this.treeContainer.id).jstree(this.options.tree.jstree)

    /*
    take over checked tree elements into corresponding input field
    json output saves only id of each element
    */
    // this.input.setAttribute('style', 'height:' + (this.scrollHeight) + 'px;overflow-y:hidden;')
    this.tree.on('changed.jstree', (event, data) => {
      var checkedIds = []
      var checkedValues = []
      var selectedNodes = window.jQuery('#' + this.treeContainer.id).jstree('get_selected', true)
      /* eslint-disable-next-line no-console */
      console.log('selectedNodes: ', selectedNodes)
      window.jQuery.each(selectedNodes, function () {
        checkedIds.push(this.id)
        checkedValues.push(this.text)
      })
      /* eslint-disable-next-line no-console */
      console.log('checkedValues: ', checkedValues)

      // if (checkedIds.length === 0) {
      //   this.input.label = this.input.value = ''
      // } else {
      this.input.label = checkedIds
      this.input.value = checkedValues.join(', ')
    })

    // this.tree.on('model.jstree', (nodes, parents) => {
    //   /* eslint-disable-next-line no-console */
    //   console.log('nodes: ', nodes)
    //   /* eslint-disable-next-line no-console */
    //   console.log('parents: ', parents)
    // })
  }

  setVisible (visible) {
    /* eslint-disable-next-line no-console */
    console.log('in setVisible fct: ', visible)
    if (visible) this.treeContainer.style.display = 'block'
    else this.treeContainer.style.display = 'none'
  }
}

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

    const btnAdd = document.createElement('button')
    btnAdd.innerHTML = 'Add'
    this.container.appendChild(btnAdd)

    const btnClear = document.createElement('button')
    btnClear.innerHTML = 'Clear'
    this.container.appendChild(btnClear)

    /* create a popup container */
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
    this.tagify = window.jQuery('#' + this.input.id).tagify()
      .on('removeTag', (event, tagName) => { // tagName.data.value
        var treeId = 'tree-' + this.container.dataset.schemapath.replaceAll('.', '-')
        var labels = event.target.label
        window.jQuery('#' + treeId).jstree('deselect_node', '#' + labels[tagName.index])
        labels.splice(tagName.index, 1)
      })
    /* TODO : 1.search plugin
              2.API ajax dynamic tree
              3.deselect removed nodes
    */
    window.document.addEventListener('click', (event) => {
      if (this.container.contains(event.target) && event.target.className === 'tagify__input') {
        // if (!event.target.classList.contains('my-selector-class')) return;
        /* eslint-disable-next-line no-console */
        console.log('event target NAME: ', event.target.className)
        window.jQuery('#' + this.popupContainer.id).dialog('open')
      }
    }, false)

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

  setValue (value, initial, fromTemplate) { /*  3. after getNumCols() -> postBuild() */
    /* eslint-disable-next-line no-console */
    console.log('in setValue fct')
    const res = super.setValue(value, initial, fromTemplate)
    if (this.tree && this.treeContainer && res && res.changed) {
      this.tree.jstree(true).select_node(res.value)
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
    console.log('in enable fct')
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
    /* eslint-disable-next-line no-console */
    console.log('this.options.tree.jstree AJAX: ', this.data)

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
  }

  setVisible (visible) {
    /* eslint-disable-next-line no-console */
    console.log('in setVisible fct: ', visible)
    if (visible) this.treeContainer.style.display = 'block'
    else this.treeContainer.style.display = 'none'
  }
}

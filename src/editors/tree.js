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
    div
    */
    this.popupContainer = document.createElement('div')
    this.popupContainer.id = 'tree-' + this.container.dataset.schemapath.replaceAll('.', '-') /* jstree / jQuery doesn't like dots and hyphens within the id */
    /* eslint-disable-next-line no-console */
    console.log('this.popupContainer.id: ', this.popupContainer.id)
    this.container.appendChild(this.popupContainer)
    /*
    create a popup dialog and show on input field click
    */
    window.jQuery('#' + this.popupContainer.id).dialog({
      title: 'Tree Structure : ' + this.popupContainer.id,
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
    this.input.addEventListener('click', (event) => {
      /* eslint-disable-next-line no-console */
      console.log('input field eventListener : ', this.container.dataset.schemapath)
      window.jQuery('#' + this.popupContainer.id).dialog('open')
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
    this.treeContainer.innerText = 'This is a tree container ID: ' + this.treeContainer.id
    this.popupContainer.appendChild(this.treeContainer)
    this.tree = window.jQuery('#' + this.treeContainer.id).jstree(this.options.tree.jstree)

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
      this.input.label = checkedIds
      this.input.value = checkedValues
    })
  }

  setVisible (visible) {
    /* eslint-disable-next-line no-console */
    console.log('in setVisible fct: ', visible)
    if (visible) this.treeContainer.style.display = 'block'
    else this.treeContainer.style.display = 'none'
  }
}

/*

Creates a tree view to select a value.
Based on https://www.jstree.com/

*/
import { StringEditor } from './string.js'
import { extend } from '../utilities.js'

export class TreeEditor extends StringEditor {
  postBuild () {
    window.document.addEventListener('click', (event) => {
      if (!this.container.contains(event.target)) this.setVisible(false)
      else this.setVisible(true)
    })
  }

  setValue (value, initial, fromTemplate) {
    const res = super.setValue(value, initial, fromTemplate)
    if (this.tree && this.treeContainer && res && res.changed) {
      this.tree.jstree(true).select_node(res.value)
    }
    return res
  }

  getNumColumns () {
    return 2
  }

  afterInputReady () {
    super.afterInputReady()
    this.createTree(true)
  }

  disable () {
    super.disable()
  }

  enable () {
    super.enable()
  }

  destroy () {
    super.destroy()
    window.jQuery(this.treeContainer.id).jstree.destroy()
  }

  /* helper functions */
  createTree (create) {
    // const editor = this

    /* fetch config from schema */
    this.options.tree = this.expandCallbacks('tree', extend({}, {
      editor: 'jstree', /* default use jstree */
      jstree: { data: [] }, /* default no data */
      value: 'text', /* store the nodes text attribute */
      mode: 'inline', /* show inline (no popup) */
      position: 'bottom' /* show in the bottom */
    }, this.defaults.options.tree || {}, this.options.tree || {}, {
      parent: this.container
    }))

    this.treeContainer = document.createElement('div')
    this.treeContainer.id = 'tree-' + this.container.dataset.schemapath.replaceAll('.', '-') /* jstree / jQuery doesn't like dots and hyphens within the id */
    this.setVisible(false)
    this.container.appendChild(this.treeContainer)

    this.tree = window.jQuery('#' + this.treeContainer.id).jstree(this.options.tree.jstree)
    this.tree.on('changed.jstree', (event, data) => {
      /* eslint-disable-next-line no-console */
      console.log(this)
      this.setValue(data.node[this.options.tree.value])
    })
  }

  setVisible (visible) {
    if (visible) this.treeContainer.style.display = 'block'
    else this.treeContainer.style.display = 'none'
  }
}

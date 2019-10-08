import createNodeIterator from 'dom-node-iterator'
import seek from 'dom-seek'

import rangeToString from './range-to-string'

const NODE_TEXT = 3
const SHOW_TEXT = 4

export function fromRange(root, range) {
  if (root === undefined) {
    throw new Error('missing required parameter "root"')
  }
  if (range === undefined) {
    throw new Error('missing required parameter "range"')
  }

  let document = root.ownerDocument
  let prefix = document.createRange()

  let startNode = range.startContainer
  let startOffset = range.startOffset

  prefix.setStart(root, 0)
  prefix.setEnd(startNode, startOffset)

  let start = rangeToString(prefix).length
  let end = start + rangeToString(range).length

  return {
    start: start,
    end: end,
  }
}


export function toRange(root, selector = {}) {
  if (root === undefined) {
    throw new Error('missing required parameter "root"')
  }

  let document = root.ownerDocument
  let range = document.createRange()
  let iter = createNodeIterator(root, SHOW_TEXT)

  // Ensure the iterator points at the first text node, rather than the root.
  iter.nextNode();
  iter.previousNode();

  let start = selector.start || 0
  let end = selector.end || start
  let count = seek(iter, start)
  let remainder = start - count

  // If the seek ended exactly at a node boundary, rewind to previous node.
  if (!iter.pointerBeforeReferenceNode) {
    iter.previousNode();
    remainder += iter.referenceNode.length;
  }

  // If the iterator points at something other than a text node, or the text
  // node is not long enough, then the start position is out of range.
  if (
    iter.referenceNode.nodeType !== NODE_TEXT ||
    iter.referenceNode.length < remainder
  ) {
    throw new Error('Start offset of position selector is out of range');
  }

  range.setStart(iter.referenceNode, remainder)

  let length = (end - start) + remainder
  count = seek(iter, length)
  remainder = length - count

  // If the seek ended exactly at a node boundary, rewind to previous node.
  if (!iter.pointerBeforeReferenceNode) {
    iter.previousNode();
    remainder += iter.referenceNode.length;
  }

  // If the iterator points at something other than a text node, or the text
  // node is not long enough, then the end position is out of range.
  if (
    iter.referenceNode.nodeType !== NODE_TEXT ||
    iter.referenceNode.length < remainder
  ) {
    throw new Error('End offset of position selector is out of range');
  }

  range.setEnd(iter.referenceNode, remainder)

  return range
}

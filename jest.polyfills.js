/**
 * @jest-environment jsdom
 */

// Polyfills for MSW in Node.js environment
const { TextEncoder, TextDecoder } = require('util')

// Add missing globals
Object.defineProperties(globalThis, {
  TextEncoder: { value: TextEncoder },
  TextDecoder: { value: TextDecoder },
})

// Add ReadableStream if not available
if (!globalThis.ReadableStream) {
  const { ReadableStream } = require('stream/web')
  Object.defineProperty(globalThis, 'ReadableStream', {
    value: ReadableStream,
    writable: true,
  })
}

// Add TransformStream if not available
if (!globalThis.TransformStream) {
  const { TransformStream } = require('stream/web')
  Object.defineProperty(globalThis, 'TransformStream', {
    value: TransformStream,
    writable: true,
  })
}

// Add BroadcastChannel if not available
if (!globalThis.BroadcastChannel) {
  const { BroadcastChannel } = require('worker_threads')
  Object.defineProperty(globalThis, 'BroadcastChannel', {
    value: BroadcastChannel,
    writable: true,
  })
}
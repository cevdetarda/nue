
import { clickable } from './clickable.js'

test('event handler', () => {
  const template = '<button :click="count++">${ count }</button>'
  const data = { count: 1 }
  const root = clickable(template, data)
  expect(root.html).toBe('<button>1</button>')
  root.click()
  expect(data.count).toBe(2)
  expect(root.html).toBe('<button>2</button>')
})

test('event argument', () => {
  const template = '<button :click="setActive(item, $event)">${ active }</button>'
  const data = {
    item: 'foo',
    active: null,
    setActive: function(item, e) {
      expect(e.target.tagName).toBe('BUTTON')
      this.active = item
    }
  }
  const root = clickable(template, data)
  expect(root.html).toBe('<button></button>')
  root.click()
  expect(data.active).toBe('foo')
  expect(root.html).toBe('<button>foo</button>')
})

test('conditional', () => {
  const template = `
    <div>
      <h3 :if="count">Hello</h3>
      <a :click="count++"/>
    </div>
  `
  const root = clickable(template, { count: 0 })
  expect(root.html).toBe('<div><a></a></div>')

  root.click('a')
  expect(root.html).toBe('<div><h3>Hello</h3><a></a></div>')
})

test('loop + if', () => {
  const template = `
    <div>
      <a :for="val in [1,2]" :if="doit">\${val}</a>
      <button :click="doit = true"/>
    </div>
  `
  const root = clickable(template)
  expect(root.html).toBe('<div><button></button></div>')

  root.click()
  expect(root.html).toInclude('<a>1</a><a>2</a>')
})


test('callback', () => {
  const template = `
    <div>
      <child :callback=\${ callback }/>
    </div>

    <child>
      <button :click=run/>
      <script>
        run() {
          this.callback()
        }
      </script>
    </child>
  `
  let counter = 0
  const root = clickable(template, { callback: () => counter++ })
  root.click()
  root.click()
  expect(counter).toBe(2)
})

test('method', () => {
  const template = `
    <a :click="increment()">
      Count: \${ count }
      <script>
        this.count = 0
        this.increment = function() {
          this.count++
        }
      </script>
    </a>
  `
  const root = clickable(template)
  expect(root.html).toInclude('Count: 0')
  root.click('a') // Await click
  expect(root.block.data.count).toBe(1)
  expect(root.html).toInclude('Count: 1')
})

test('method syntax', () => {
  const template = `
    <a :click="hey()">
      \${ val }  \${ avg }
      <script>
        hey() {
          this.val = 'hey'
        }

        get avg() {
          return 100
        }
      </script>
    </a>
  `
  const root = clickable(template)
  root.click('a') // Await click
  const html = root.html
  expect(html).toInclude('hey')
  expect(html).toInclude('100')
})

test('child/bind updates', () => {
  const template = `
    <div>
      <h1>\${ data.hello }</h1>
      <child :bind="data"/>
      <button :click="update"/>
      <script>
        this.data = {
          hello: 'Hello',
          world: 'World',
        }
        update() {
          this.data = {
            hello: 'Holy',
            world: 'Smoke',
          }
        }
      </script>
    </div>

    <child>
      <p>\${ world }</p>
    </child>
  `

  const root = clickable(template)
  expect(root.html).toInclude('<h1>Hello</h1> <div><p>World</p>')
  root.click()
  expect(root.html).toInclude('<h1>Holy</h1> <div><p>Smoke</p>')
})


test('async method', async () => {
  const template = `
    <form :is="test-form">
      <script>
        this.status = 'init'

        async set() {

        }
      </script>
    </form>
  `
  const block = clickable(template)
  expect(block.html).toBe('<form></form>')
})
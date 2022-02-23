import { reactive, effect, ref, computed } from './lyu.js'

type Product = {
  quantity: number
  price: number
}

type SuperProduct = Product & {
  name: string
}

console.log('=== Test reactive ===')
let product: Product = reactive({ quantity: 2, price: 5 })
let total = 0

effect(() => {
  total = product.quantity * product.price
})

product.quantity = 2
product.price = 5
console.log(`total is: ${product.quantity} * ${product.price} = ${total}`)
product.quantity = 3
console.log(`total is: ${product.quantity} * ${product.price} = ${total}`)
product.price = 4
console.log(`total is: ${product.quantity} * ${product.price} = ${total}`)

console.log('=== Test ref ===')
let salePrice = ref(0)
let discountedTotal = 0

effect(() => {
  salePrice.value = product.price * 0.9
})
effect(() => {
  discountedTotal = salePrice.value * product.quantity
})

product.quantity = 2
product.price = 5
console.log(
  `discounted total is: ${product.quantity} * ${product.price} * 0.9 = ${discountedTotal}`
)
product.quantity = 3
console.log(
  `discounted total is: ${product.quantity} * ${product.price} * 0.9 = ${discountedTotal}`
)
product.price = 4
console.log(
  `discounted total is: ${product.quantity} * ${product.price} * 0.9 = ${discountedTotal}`
)

console.log('=== Test computed ===')
let computedSalePrice = computed(() => product.price * 0.9)
let computedTotal = computed(() => computedSalePrice.value * product.quantity)

product.quantity = 2
product.price = 5
console.log(
  `computed total is: ${product.quantity} * ${product.price} * 0.9 = ${computedTotal.value}`
)
product.quantity = 3
console.log(
  `computed total is: ${product.quantity} * ${product.price} * 0.9 = ${computedTotal.value}`
)
product.price = 4
console.log(
  `computed total is: ${product.quantity} * ${product.price} * 0.9 = ${computedTotal.value}`
)

console.log('=== Test new property ===')
let superProduct = product as SuperProduct
superProduct.name = 'shoes'

let message = computed(() => 'Buy some ' + superProduct.name)
console.log(message.value)

superProduct.name = 'clothes'
// In Vue 2 the message wouldn't change, because reactivity was added to indivual
// properties using Object.defineProperty().
// Vue 3 (and Lyu) uses proxy-based reactivity, which means reactivity is added
// on the whole object, so this is fine.
console.log(message.value)

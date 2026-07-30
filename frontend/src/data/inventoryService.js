const STORAGE_KEY = 'inventory-tracker-demo-items'

export const DEMO_INVENTORY_ITEMS = [
  { id: 'demo-2048', sku: 'ITM-2048', name: 'Wireless Scanner', description: 'Handheld scanner used for warehouse receiving.', category: 'Equipment', unit: 'Each', stock: 24, stockStatus: 'In stock', active: true, updated: '8:42 AM' },
  { id: 'demo-1987', sku: 'ITM-1987', name: 'Shipping Labels', description: 'Thermal shipping labels for outbound packages.', category: 'Supplies', unit: 'Roll', stock: 8, stockStatus: 'Low stock', active: true, updated: '8:18 AM' },
  { id: 'demo-1842', sku: 'ITM-1842', name: 'Packing Tape', description: 'Clear packing tape for standard cartons.', category: 'Supplies', unit: 'Roll', stock: 42, stockStatus: 'In stock', active: true, updated: 'Yesterday' },
  { id: 'demo-1721', sku: 'ITM-1721', name: 'Safety Gloves', description: 'General-purpose protective work gloves.', category: 'Safety', unit: 'Pair', stock: 0, stockStatus: 'Out of stock', active: true, updated: 'Yesterday' },
  { id: 'demo-1655', sku: 'ITM-1655', name: 'Storage Bin — Large', description: 'Large stackable bin for warehouse storage.', category: 'Storage', unit: 'Each', stock: 16, stockStatus: 'In stock', active: true, updated: 'Jul 25' },
]

function copyDemoItems() {
  return DEMO_INVENTORY_ITEMS.map((item) => ({ ...item }))
}

function saveInventoryItems(items) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    throw new Error('The item could not be saved to local demo storage. Please try again.')
  }

  return items
}

export function loadInventoryItems() {
  try {
    const storedItems = window.localStorage.getItem(STORAGE_KEY)
    if (!storedItems) return copyDemoItems()

    const parsedItems = JSON.parse(storedItems)
    return Array.isArray(parsedItems) ? parsedItems : copyDemoItems()
  } catch {
    return copyDemoItems()
  }
}

export function createInventoryItem(items, fields) {
  const normalizedSku = fields.sku.trim().toUpperCase()
  const duplicateSku = items.some((item) => item.sku.toUpperCase() === normalizedSku)

  if (duplicateSku) {
    throw new Error(`SKU ${normalizedSku} is already in use. Enter a unique SKU.`)
  }

  const newItem = {
    id: `local-${Date.now()}`,
    sku: normalizedSku,
    name: fields.name.trim(),
    description: fields.description.trim(),
    category: fields.category.trim(),
    unit: fields.unit.trim(),
    stock: 0,
    stockStatus: 'Out of stock',
    active: fields.active,
    updated: 'Just now',
  }
  const nextItems = [newItem, ...items]

  saveInventoryItems(nextItems)
  return nextItems
}

export function updateInventoryItem(items, itemId, fields) {
  const normalizedSku = fields.sku.trim().toUpperCase()
  const duplicateSku = items.some((item) => item.id !== itemId && item.sku.toUpperCase() === normalizedSku)

  if (duplicateSku) {
    throw new Error(`SKU ${normalizedSku} is already in use. Enter a unique SKU.`)
  }

  const nextItems = items.map((item) => (
    item.id === itemId
      ? {
          ...item,
          sku: normalizedSku,
          name: fields.name.trim(),
          description: fields.description.trim(),
          category: fields.category.trim(),
          unit: fields.unit.trim(),
          active: fields.active,
          updated: 'Just now',
        }
      : item
  ))

  saveInventoryItems(nextItems)
  return nextItems
}

export function setInventoryItemActive(items, itemId, active) {
  const nextItems = items.map((item) => (
    item.id === itemId ? { ...item, active, updated: 'Just now' } : item
  ))

  saveInventoryItems(nextItems)
  return nextItems
}

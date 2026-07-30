import { useEffect, useState } from 'react'
import {
  createInventoryItem,
  setInventoryItemActive,
  updateInventoryItem,
} from '../data/inventoryService'

const EMPTY_FORM = {
  sku: '',
  name: '',
  description: '',
  category: '',
  unit: '',
  active: true,
}

function validateItem(fields) {
  const errors = {}

  if (!fields.sku.trim()) {
    errors.sku = 'SKU is required.'
  } else if (!/^[a-z0-9][a-z0-9._-]*$/i.test(fields.sku.trim())) {
    errors.sku = 'Use letters, numbers, periods, underscores, or hyphens only.'
  }
  if (!fields.name.trim()) errors.name = 'Item name is required.'
  if (!fields.category.trim()) errors.category = 'Category is required.'
  if (!fields.unit.trim()) errors.unit = 'Unit of measure is required.'
  if (fields.description.trim().length > 300) errors.description = 'Description must be 300 characters or fewer.'

  return errors
}

export function InventoryTable({ items, compact = false, onEdit, onToggleActive }) {
  const visibleItems = compact ? items.slice(0, 4) : items
  const showAdminActions = Boolean(onEdit && onToggleActive)

  if (visibleItems.length === 0) {
    return (
      <div className="inventory-empty">
        <span className="empty-icon" aria-hidden="true">□</span>
        <h3>No inventory items yet</h3>
        <p>Add the first item to begin building the master inventory list.</p>
      </div>
    )
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Category</th>
            <th>Unit</th>
            <th>Available</th>
            <th>Stock</th>
            <th>Item status</th>
            <th>Updated</th>
            {showAdminActions && <th><span className="sr-only">Actions</span></th>}
          </tr>
        </thead>
        <tbody>
          {visibleItems.map((item) => (
            <tr key={item.id}>
              <td><strong>{item.name}</strong><small>{item.sku}</small></td>
              <td>{item.category}</td>
              <td>{item.unit}</td>
              <td><span className="stock-number">{item.stock}</span> units</td>
              <td><span className={`stock-status ${item.stockStatus.toLowerCase().replaceAll(' ', '-')}`}>{item.stockStatus}</span></td>
              <td><span className={`item-status ${item.active ? 'active' : 'inactive'}`}>{item.active ? 'Active' : 'Inactive'}</span></td>
              <td>{item.updated}</td>
              {showAdminActions && (
                <td>
                  <div className="row-actions">
                    <button type="button" className="table-action" onClick={() => onEdit(item)}>Edit</button>
                    <button
                      type="button"
                      className={`table-action ${item.active ? 'deactivate' : 'activate'}`}
                      onClick={() => onToggleActive(item)}
                    >
                      Mark {item.active ? 'inactive' : 'active'}
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ItemForm({ item, onClose, onSave }) {
  const [fields, setFields] = useState(item ? {
    sku: item.sku,
    name: item.name,
    description: item.description,
    category: item.category,
    unit: item.unit,
    active: item.active,
  } : EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  const updateField = (event) => {
    const { name, value, checked, type } = event.target
    setFields((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setSubmitError('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const validationErrors = validateItem(fields)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setSubmitError('Please correct the highlighted fields before saving.')
      return
    }

    try {
      onSave(fields)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'The item could not be saved.')
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <section className="item-modal" role="dialog" aria-modal="true" aria-labelledby="item-form-title">
        <div className="modal-header">
          <div>
            <p className="eyebrow">{item ? 'Edit master item' : 'New master item'}</p>
            <h2 id="item-form-title">{item ? `Edit ${item.name}` : 'Add inventory item'}</h2>
            <p>Fields marked with an asterisk are required.</p>
          </div>
          <button className="modal-close" type="button" onClick={onClose} aria-label="Close item form">×</button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {submitError && <div className="form-message error" role="alert">{submitError}</div>}
          <div className="form-grid">
            <label>
              <span>SKU / code *</span>
              <input name="sku" value={fields.sku} onChange={updateField} aria-invalid={Boolean(errors.sku)} aria-describedby={errors.sku ? 'sku-error' : undefined} />
              {errors.sku && <small id="sku-error" className="field-error">{errors.sku}</small>}
            </label>
            <label>
              <span>Item name *</span>
              <input name="name" value={fields.name} onChange={updateField} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'name-error' : undefined} />
              {errors.name && <small id="name-error" className="field-error">{errors.name}</small>}
            </label>
            <label>
              <span>Category *</span>
              <input name="category" value={fields.category} onChange={updateField} aria-invalid={Boolean(errors.category)} aria-describedby={errors.category ? 'category-error' : undefined} />
              {errors.category && <small id="category-error" className="field-error">{errors.category}</small>}
            </label>
            <label>
              <span>Unit of measure *</span>
              <input name="unit" value={fields.unit} onChange={updateField} placeholder="Each, case, roll…" aria-invalid={Boolean(errors.unit)} aria-describedby={errors.unit ? 'unit-error' : undefined} />
              {errors.unit && <small id="unit-error" className="field-error">{errors.unit}</small>}
            </label>
            <label className="full-field">
              <span>Description</span>
              <textarea name="description" value={fields.description} onChange={updateField} rows="4" aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? 'description-error' : 'description-help'} />
              <small id={errors.description ? 'description-error' : 'description-help'} className={errors.description ? 'field-error' : 'field-help'}>
                {errors.description || `${fields.description.length}/300 characters`}
              </small>
            </label>
            <label className="status-checkbox full-field">
              <input type="checkbox" name="active" checked={fields.active} onChange={updateField} />
              <span><strong>Active item</strong><small>Active items are available for daily inventory entry.</small></span>
            </label>
          </div>
          <div className="modal-actions">
            <button className="secondary-button" type="button" onClick={onClose}>Cancel</button>
            <button className="primary-button form-save" type="submit">{item ? 'Save changes' : 'Add item'}</button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default function InventoryItems({ items, setItems, addRequest, onAddRequestHandled }) {
  const [editingItem, setEditingItem] = useState(null)
  const [formOpen, setFormOpen] = useState(addRequest > 0)
  const [message, setMessage] = useState(null)

  const openAddForm = () => {
    setEditingItem(null)
    setFormOpen(true)
    setMessage(null)
  }

  const openEditForm = (item) => {
    setEditingItem(item)
    setFormOpen(true)
    setMessage(null)
  }

  const saveItem = (fields) => {
    const nextItems = editingItem
      ? updateInventoryItem(items, editingItem.id, fields)
      : createInventoryItem(items, fields)

    setItems(nextItems)
    setFormOpen(false)
    onAddRequestHandled()
    setMessage({
      tone: 'success',
      text: editingItem ? `${fields.name.trim()} was updated successfully.` : `${fields.name.trim()} was added successfully.`,
    })
  }

  const toggleActive = (item) => {
    try {
      const nextActive = !item.active
      setItems(setInventoryItemActive(items, item.id, nextActive))
      setMessage({
        tone: 'success',
        text: `${item.name} is now ${nextActive ? 'active' : 'inactive'}.`,
      })
    } catch (error) {
      setMessage({
        tone: 'error',
        text: error instanceof Error ? error.message : 'The item status could not be updated.',
      })
    }
  }

  return (
    <>
      <section className="demo-data-notice" aria-label="Demo data notice">
        <span className="status-dot" />
        <span><strong>Local demo inventory</strong><small>Changes are stored only in this browser until Mounwik’s inventory API is ready.</small></span>
      </section>

      {message && <div className={`page-message ${message.tone}`} role={message.tone === 'error' ? 'alert' : 'status'}>{message.text}</div>}

      <section className="panel page-panel">
        <div className="panel-header inventory-panel-header">
          <div><h2>All inventory</h2><p>{items.length} {items.length === 1 ? 'item' : 'items'} in local demo storage</p></div>
          <button className="primary-button small-button" type="button" onClick={openAddForm}>+ Add item</button>
        </div>
        <InventoryTable items={items} onEdit={openEditForm} onToggleActive={toggleActive} />
      </section>

      {formOpen && <ItemForm item={editingItem} onClose={() => {
        setFormOpen(false)
        onAddRequestHandled()
      }} onSave={saveItem} />}
    </>
  )
}

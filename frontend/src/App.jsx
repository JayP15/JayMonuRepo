import { useState } from 'react'
import './App.css'
import InventoryItems, { InventoryTable } from './components/InventoryItems'
import { loadInventoryItems } from './data/inventoryService'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
  { id: 'today', label: "Today's Inventory", icon: 'calendar' },
  { id: 'items', label: 'Inventory Items', icon: 'box' },
  { id: 'history', label: 'Inventory History', icon: 'history' },
  { id: 'audit', label: 'Audit Log', icon: 'clipboard' },
]

const pageDetails = {
  dashboard: { eyebrow: 'Monday overview', title: 'Good morning, Alex', description: 'Here’s what’s happening with your inventory today.' },
  today: { eyebrow: 'Daily snapshot', title: "Today’s Inventory", description: 'Review stock activity and changes recorded today.' },
  items: { eyebrow: 'Catalog', title: 'Inventory Items', description: 'Browse and manage every item in your inventory.' },
  history: { eyebrow: 'Activity', title: 'Inventory History', description: 'Review inventory changes across your workspace.' },
  audit: { eyebrow: 'Compliance', title: 'Audit Log', description: 'Track user actions and system activity.' },
}

function Icon({ name, size = 20 }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    box: <><path d="m21 8-9-5-9 5 9 5 9-5Z" /><path d="m3 8 9 5 9-5M12 13v9" /><path d="m21 8v9l-9 5-9-5V8" /></>,
    history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5M12 7v5l3 2" /></>,
    clipboard: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4.5V3h6v1.5M9 10h6M9 14h6M9 18h4" /></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /></>,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    arrow: <path d="m9 18 6-6-6-6" />,
    trend: <path d="m3 17 6-6 4 4 8-9M15 6h6v6" />,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    check: <path d="m5 12 4 4L19 6" />,
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  )
}

function Login({ onEnter }) {
  return (
    <main className="login-page">
      <div className="login-accent login-accent-one" />
      <div className="login-accent login-accent-two" />
      <section className="login-card" aria-labelledby="login-title">
        <div className="brand-mark" aria-hidden="true"><Icon name="box" size={25} /></div>
        <p className="login-kicker">INVENTORY TRACKER</p>
        <h1 id="login-title">Welcome to your workspace</h1>
        <p className="login-copy">A simple, reliable view of your stock—built to keep your team moving.</p>
        <div className="demo-profile">
          <span className="avatar">AD</span>
          <span><strong>Alex Demo</strong><small>Demo workspace</small></span>
          <span className="ready-dot" title="Demo ready" />
        </div>
        <button className="primary-button enter-button" type="button" onClick={onEnter}>
          Enter Demo <Icon name="arrow" size={18} />
        </button>
        <p className="login-note">No credentials required</p>
      </section>
      <p className="login-footer">Inventory Tracker · Monday frontend demo</p>
    </main>
  )
}

function Sidebar({ activePage, onNavigate, onLogout, isOpen, onClose }) {
  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'visible' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-mark small"><Icon name="box" size={20} /></div>
          <span>Inventory Tracker</span>
          <button className="icon-button sidebar-close" type="button" onClick={onClose} aria-label="Close menu"><Icon name="close" /></button>
        </div>
        <nav className="sidebar-nav" aria-label="Main navigation">
          <p className="nav-label">Workspace</p>
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => { onNavigate(item.id); onClose() }}
            >
              <Icon name={item.icon} size={19} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="backend-status">
            <span className="status-dot" />
            <span><strong>Backend pending</strong><small>Demo data is active</small></span>
          </div>
          <button className="logout-button" type="button" onClick={onLogout}>
            <Icon name="logout" size={19} /> Log Out
          </button>
          <div className="user-card">
            <span className="avatar small-avatar">AD</span>
            <span><strong>Alex Demo</strong><small>Administrator</small></span>
          </div>
        </div>
      </aside>
    </>
  )
}

function Dashboard({ inventoryItems, onNavigate, onAddItem }) {
  const cards = [
    { label: 'Total items', value: '1,248', meta: '+12 this month', tone: 'blue', icon: 'box' },
    { label: 'Low stock', value: '18', meta: 'Needs attention', tone: 'amber', icon: 'trend' },
    { label: 'Out of stock', value: '4', meta: 'Action required', tone: 'red', icon: 'clipboard' },
    { label: 'Updated today', value: '37', meta: 'Across 8 categories', tone: 'green', icon: 'check' },
  ]

  return (
    <>
      <section className="summary-grid" aria-label="Inventory summary">
        {cards.map((card) => (
          <article className="summary-card" key={card.label}>
            <div className={`card-icon ${card.tone}`}><Icon name={card.icon} size={20} /></div>
            <p>{card.label}</p>
            <strong className="card-value">{card.value}</strong>
            <small className={card.tone === 'green' ? 'positive' : ''}>{card.meta}</small>
          </article>
        ))}
      </section>
      <section className="panel">
        <div className="panel-header">
          <div><h2>Inventory overview</h2><p>Items that may need your attention</p></div>
          <button className="text-button" type="button" onClick={() => onNavigate('items')}>View all items <Icon name="arrow" size={16} /></button>
        </div>
        <InventoryTable items={inventoryItems} compact />
      </section>
      <section className="bottom-grid">
        <article className="panel activity-panel">
          <div className="panel-header"><div><h2>Recent activity</h2><p>Latest inventory changes</p></div></div>
          <div className="activity-list">
            <div className="activity-item"><span className="activity-icon green"><Icon name="plus" size={17} /></span><span><strong>24 Wireless Scanners received</strong><small>Alex Demo · 8:42 AM</small></span></div>
            <div className="activity-item"><span className="activity-icon amber"><Icon name="trend" size={17} /></span><span><strong>Shipping Labels reached low stock</strong><small>Automated alert · 8:18 AM</small></span></div>
            <div className="activity-item"><span className="activity-icon blue"><Icon name="check" size={17} /></span><span><strong>Weekly count completed</strong><small>Morgan Lee · Yesterday</small></span></div>
          </div>
        </article>
        <article className="panel quick-panel">
          <div className="panel-header"><div><h2>Quick actions</h2><p>Common inventory tasks</p></div></div>
          <button type="button" onClick={onAddItem}><span className="card-icon blue"><Icon name="plus" size={19} /></span><span><strong>Add inventory item</strong><small>Create a new item record</small></span><Icon name="arrow" size={17} /></button>
          <button type="button" onClick={() => onNavigate('today')}><span className="card-icon green"><Icon name="calendar" size={19} /></span><span><strong>Review today’s changes</strong><small>See all daily activity</small></span><Icon name="arrow" size={17} /></button>
        </article>
      </section>
    </>
  )
}

function StandardPage({ page }) {
  const content = {
    today: [
      ['8:42 AM', 'Stock received', 'Wireless Scanner', '+24 units', 'Alex Demo'],
      ['8:18 AM', 'Stock adjusted', 'Shipping Labels', '−4 units', 'Alex Demo'],
      ['7:55 AM', 'Item counted', 'Packing Tape', '42 confirmed', 'Morgan Lee'],
    ],
    history: [
      ['Jul 28, 8:42 AM', 'Stock received', 'Wireless Scanner', '+24 units', 'Alex Demo'],
      ['Jul 28, 8:18 AM', 'Stock adjusted', 'Shipping Labels', '−4 units', 'Alex Demo'],
      ['Jul 27, 4:12 PM', 'Item created', 'Storage Bin — Large', 'New record', 'Morgan Lee'],
    ],
    audit: [
      ['Today, 8:42 AM', 'Inventory updated', 'ITM-2048 quantity changed', 'Alex Demo', 'Successful'],
      ['Today, 8:18 AM', 'Inventory updated', 'ITM-1987 quantity changed', 'Alex Demo', 'Successful'],
      ['Yesterday, 4:12 PM', 'Item created', 'ITM-1655 added to catalog', 'Morgan Lee', 'Successful'],
    ],
  }

  const headings = page === 'audit'
    ? ['Time', 'Action', 'Details', 'User', 'Result']
    : ['Time', 'Activity', 'Item', 'Change', 'User']

  return (
    <section className="panel page-panel">
      <div className="panel-header"><div><h2>{page === 'audit' ? 'System activity' : 'Inventory activity'}</h2><p>Sample records for the frontend demo</p></div></div>
      <div className="table-wrap"><table><thead><tr>{headings.map((heading) => <th key={heading}>{heading}</th>)}</tr></thead><tbody>{content[page].map((row) => <tr key={row.join('')} >{row.map((cell, index) => <td key={cell}>{index === 1 ? <strong>{cell}</strong> : cell}</td>)}</tr>)}</tbody></table></div>
    </section>
  )
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activePage, setActivePage] = useState('dashboard')
  const [menuOpen, setMenuOpen] = useState(false)
  const [inventoryItems, setInventoryItems] = useState(loadInventoryItems)
  const [addItemRequest, setAddItemRequest] = useState(0)

  if (!isLoggedIn) return <Login onEnter={() => setIsLoggedIn(true)} />

  const details = pageDetails[activePage]
  const openAddItem = () => {
    setActivePage('items')
    setAddItemRequest((request) => request + 1)
  }

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onNavigate={setActivePage} onLogout={() => { setIsLoggedIn(false); setActivePage('dashboard') }} isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="main-content">
        <header className="mobile-header">
          <button className="icon-button" type="button" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Icon name="menu" /></button>
          <span>Inventory Tracker</span>
          <span className="mobile-avatar">AD</span>
        </header>
        <div className="content-inner">
          <div className="page-heading">
            <div><p className="eyebrow">{details.eyebrow}</p><h1>{details.title}</h1><p>{details.description}</p></div>
            <div className="top-status"><span className="status-dot" /><span><strong>Backend pending</strong><small>Using demo data</small></span></div>
          </div>
          {activePage === 'dashboard' && <Dashboard inventoryItems={inventoryItems} onNavigate={setActivePage} onAddItem={openAddItem} />}
          {activePage === 'items' && <InventoryItems items={inventoryItems} setItems={setInventoryItems} addRequest={addItemRequest} onAddRequestHandled={() => setAddItemRequest(0)} />}
          {!['dashboard', 'items'].includes(activePage) && <StandardPage page={activePage} />}
        </div>
      </main>
    </div>
  )
}

export default App

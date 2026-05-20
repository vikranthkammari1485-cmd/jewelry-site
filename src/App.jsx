import { useState, useMemo, useEffect } from 'react'
import './App.css'

import { db, auth } from './firebase'

import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore'

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from 'firebase/auth'

const CATEGORIES = ['All', 'Jewelry', 'Fashion', 'Gadgets', 'Gifts']

const EMPTY_FORM = {
  name: '',
  image: '',
  link: '',
  category: 'Jewelry',
  price: ''
}

// ─── PLATFORM DETECTOR ───────────────────────────────────────────────────────
function getPlatform(url) {
  if (!url) return { label: 'Shop Now', color: '#C9956C', icon: '🛍️' }

  const u = url.toLowerCase()

  if (u.includes('amazon')) return { label: 'Amazon', color: '#FF9900', icon: '📦' }
  if (u.includes('flipkart')) return { label: 'Flipkart', color: '#2874F0', icon: '🛒' }
  if (u.includes('meesho')) return { label: 'Meesho', color: '#9B2FAE', icon: '🛍️' }
  if (u.includes('pinterest')) return { label: 'Pinterest', color: '#E60023', icon: '📌' }
  if (u.includes('myntra')) return { label: 'Myntra', color: '#FF3F6C', icon: '👗' }
  if (u.includes('ajio')) return { label: 'Ajio', color: '#E8173F', icon: '✨' }
  if (u.includes('nykaa')) return { label: 'Nykaa', color: '#FC2779', icon: '💄' }
  if (u.includes('etsy')) return { label: 'Etsy', color: '#F56400', icon: '🎨' }
  if (u.includes('snapdeal')) return { label: 'Snapdeal', color: '#E40046', icon: '🔖' }
  if (u.includes('instagram')) return { label: 'Instagram', color: '#C13584', icon: '📷' }
  if (u.includes('shein')) return { label: 'Shein', color: '#222222', icon: '👘' }

  return { label: 'Shop Now', color: '#C9956C', icon: '🛍️' }
}

// ─── PINTEREST LOGO ───────────────────────────────────────────────────────────
const PINTEREST_SVG = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
  </svg>
)

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────
function ProductCard({ product, isAdmin, onDelete }) {
  const [imgError, setImgError] = useState(false)

  const platform = getPlatform(product.link)

  return (
    <article className="card">
      <div className="card-image-wrap">
        {imgError ? (
          <div className="card-img-fallback">📷</div>
        ) : (
          <img
            src={product.image}
            alt={product.name}
            className="card-img"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        )}

        <span className="card-category">
          {product.category}
        </span>

        {isAdmin && (
          <button
            className="card-delete"
            onClick={() => onDelete(product.id)}
          >
            ✕
          </button>
        )}
      </div>

      <div className="card-body">
        <h3 className="card-title">
          {product.name}
        </h3>

        <div className="card-footer">
          {product.price && (
            <span className="card-price">
              {product.price}
            </span>
          )}

          <a
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            className="card-btn"
            style={{ background: platform.color }}
          >
            <span>{platform.icon}</span>
            {platform.label}
          </a>
        </div>
      </div>
    </article>
  )
}

// ─── LOGIN MODAL ──────────────────────────────────────────────────────────────
function LoginModal({ onClose }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    try {
      setLoading(true)

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      )

      onClose()
    } catch (err) {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            🔒 Admin Login
          </h2>

          <button
            className="modal-close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="modal-body">

          <div className="field">
            <label className="field-label">
              Email
            </label>

            <input
              type="email"
              className="field-input"
              placeholder="Enter admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="field">
            <label className="field-label">
              Password
            </label>

            <input
              type="password"
              className="field-input"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <span className="field-error">
              {error}
            </span>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="btn-primary"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── ADD PRODUCT MODAL ────────────────────────────────────────────────────────
function AddProductModal({ onAdd, onClose }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}

    if (!form.name.trim()) {
      e.name = 'Product name is required'
    }

    if (!form.link.trim()) {
      e.link = 'Product link is required'
    }

    return e
  }

  const handleSubmit = async () => {
    const e = validate()

    if (Object.keys(e).length) {
      setErrors(e)
      return
    }

    setLoading(true)

    await onAdd({
      ...form,
      name: form.name.trim(),
      price: form.price.trim()
    })

    setLoading(false)

    onClose()
  }

  const field = (key, label, placeholder) => (
    <div className="field">
      <label className="field-label">
        {label}
      </label>

      <input
        type="text"
        className={`field-input ${errors[key] ? 'field-input--error' : ''}`}
        placeholder={placeholder}
        value={form[key]}
        onChange={(e) => {
          setForm((f) => ({
            ...f,
            [key]: e.target.value
          }))
        }}
      />

      {errors[key] && (
        <span className="field-error">
          {errors[key]}
        </span>
      )}
    </div>
  )

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>

        <div className="modal-header">
          <h2 className="modal-title">
            Add Product
          </h2>

          <button
            className="modal-close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="modal-body">

          {field('name', 'Product Name', 'Enter product name')}

          {field('link', 'Product Link', 'https://...')}

          {field('image', 'Image URL', 'https://...')}

          {field('price', 'Price', '₹499')}

          <div className="field">
            <label className="field-label">
              Category
            </label>

            <select
              className="field-input"
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  category: e.target.value
                }))
              }
            >
              {CATEGORIES.filter(c => c !== 'All').map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Add Product'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
function App() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const [activeCategory, setActive] = useState('All')

  const [search, setSearch] = useState('')

  const [isAdmin, setIsAdmin] = useState(false)

  const [showLogin, setShowLogin] = useState(false)

  const [showAdd, setShowAdd] = useState(false)

  // ─── AUTH LISTENER ─────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setIsAdmin(!!user)
    })

    return () => unsub()
  }, [])

  // ─── FIRESTORE LISTENER ────────────────────────────────────────────────────
  useEffect(() => {
    const q = query(
      collection(db, 'products'),
      orderBy('createdAt', 'desc')
    )

    const unsub = onSnapshot(q, (snapshot) => {
      setProducts(
        snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data()
        }))
      )

      setLoading(false)
    })

    return () => unsub()
  }, [])

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCat =
        activeCategory === 'All' ||
        p.category === activeCategory

      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase())

      return matchCat && matchSearch
    })
  }, [products, activeCategory, search])

  // ─── ADD PRODUCT ───────────────────────────────────────────────────────────
  const handleAdd = async (product) => {
    await addDoc(collection(db, 'products'), {
      ...product,
      createdAt: Date.now()
    })
  }

  // ─── DELETE PRODUCT ────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'products', id))
  }

  // ─── LOGOUT ────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await signOut(auth)
  }

  return (
    <>
      {/* HEADER */}
      <header className="header">
        <div className="header-inner">

          <div className="logo">
            <span className="logo-icon">
              {PINTEREST_SVG}
            </span>

            <span className="logo-text">
              Pinned<em>Picks</em>
            </span>
          </div>

          <p className="header-tagline">
            Curated finds • Jewelry · Fashion · Gadgets · Gifts
          </p>

          <div className="admin-corner">
            {isAdmin ? (
              <button
                className="admin-pill admin-pill--active"
                onClick={handleLogout}
              >
                🔓 Logout
              </button>
            ) : (
              <button
                className="admin-pill"
                onClick={() => setShowLogin(true)}
              >
                🔒 Admin
              </button>
            )}
          </div>
        </div>
      </header>

      {/* CONTROLS */}
      <div className="controls">
        <div className="controls-inner">

          <div className="search-wrap">
            <span className="search-icon">
              🔍
            </span>

            <input
              type="search"
              className="search-input"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filters">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`filter-btn ${
                  activeCategory === cat
                    ? 'filter-btn--active'
                    : ''
                }`}
                onClick={() => setActive(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {isAdmin && (
            <button
              className="btn-add"
              onClick={() => setShowAdd(true)}
            >
              + Add Product
            </button>
          )}
        </div>
      </div>

      {/* PRODUCTS */}
      <main className="main">
        {loading ? (
          <div className="empty">
            <p>⏳ Loading products...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <p>
              {products.length === 0
                ? '✨ Products coming soon'
                : 'No matching products'}
            </p>
          </div>
        ) : (
          <div className="grid">
            {filtered.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                isAdmin={isAdmin}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <p>
          Made with ♥ for PinnedPicks · {new Date().getFullYear()}
        </p>
      </footer>

      {/* LOGIN MODAL */}
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
        />
      )}

      {/* ADD PRODUCT MODAL */}
      {showAdd && isAdmin && (
        <AddProductModal
          onAdd={handleAdd}
          onClose={() => setShowAdd(false)}
        />
      )}
    </>
  )
}

export default App
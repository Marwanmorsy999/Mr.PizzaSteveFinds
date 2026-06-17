import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";

const API = import.meta.env.VITE_API_URL || "https://pizzasteve-api.m-2396.workers.dev";
const CLOUD_NAME = "dnggmrgmu";
const UPLOAD_PRESET = "pizzasteve4";
const TOKEN_KEY = "ps_admin_token";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  tags: string[];
  available: boolean;
  drop_id: string | null;
  created_at: string;
  sort_order?: number;
}

interface Order {
  id: string;
  product_id: string;
  product_name: string;
  customer_name: string;
  customer_phone: string;
  customer_instagram: string | null;
  notes: string | null;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
}

// ─── Auth helpers ────────────────────────────────────────────────────────────

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers["X-Admin-Token"] = token;
  const res = await fetch(`${API}${path}`, { ...options, headers });
  return res;
}

// ─── Image upload ─────────────────────────────────────────────────────────────

async function uploadImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: fd,
  });
  const data = await res.json();
  return data.secure_url;
}

// ─── Route ───────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminPage() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Session check on mount
  useEffect(() => {
    const token = getToken();
    if (!token) { setAuthLoading(false); return; }
    apiFetch("/api/session/check", { method: "POST" }).then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        if (data.token) setToken(data.token); // refresh
        setAuthed(true);
      } else {
        clearToken();
      }
      setAuthLoading(false);
    }).catch(() => { clearToken(); setAuthLoading(false); });
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch(`${API}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        setAuthed(true);
      } else {
        setLoginError("Wrong password.");
      }
    } catch {
      setLoginError("Can't reach server. Check connection.");
    }
    setLoginLoading(false);
  }

  function handleLogout() {
    clearToken();
    setAuthed(false);
    setPassword("");
  }

  if (authLoading) {
    return (
      <div style={styles.splash}>
        <div style={styles.spinner} />
      </div>
    );
  }

  if (!authed) {
    return (
      <div style={styles.loginWrap}>
        <div style={styles.loginCard}>
          <div style={styles.loginLogo}>🍕</div>
          <h1 style={styles.loginTitle}>Admin</h1>
          <p style={styles.loginSub}>Mr. Pizza Steve Finds</p>
          <form onSubmit={handleLogin} style={styles.loginForm}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.loginInput}
              autoFocus
            />
            {loginError && <p style={styles.loginError}>{loginError}</p>}
            <button
              type="submit"
              disabled={loginLoading || !password}
              style={{
                ...styles.loginBtn,
                opacity: loginLoading || !password ? 0.5 : 1,
              }}
            >
              {loginLoading ? "Logging in…" : "Login"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <AdminDashboard onLogout={handleLogout} />;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

type Tab = "dashboard" | "products" | "orders" | "settings";

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const pendingCount = orders.filter((o) => o.status === "pending").length;

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [pr, or] = await Promise.all([
      apiFetch("/api/products?admin=true").then((r) => r.json()),
      apiFetch("/api/orders").then((r) => r.json()),
    ]);
    setProducts(pr.products || []);
    setOrders(or.orders || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return (
    <div style={styles.shell}>
      {/* Top bar */}
      <header style={styles.topbar}>
        <span style={styles.topbarTitle}>🍕 Admin</span>
        <button onClick={onLogout} style={styles.logoutBtn}>Logout</button>
      </header>

      {/* Content */}
      <main style={styles.main}>
        {loading ? (
          <div style={styles.centerSpin}><div style={styles.spinner} /></div>
        ) : (
          <>
            {tab === "dashboard" && (
              <DashboardTab products={products} orders={orders} pendingCount={pendingCount} setTab={setTab} />
            )}
            {tab === "products" && (
              <ProductsTab products={products} refresh={fetchAll} />
            )}
            {tab === "orders" && (
              <OrdersTab orders={orders} refresh={fetchAll} />
            )}
            {tab === "settings" && (
              <SettingsTab products={products} refresh={fetchAll} />
            )}
          </>
        )}
      </main>

      {/* Bottom nav */}
      <nav style={styles.bottomNav}>
        {(["dashboard", "products", "orders", "settings"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              ...styles.navBtn,
              ...(tab === t ? styles.navBtnActive : {}),
            }}
          >
            <span style={styles.navIcon}>{navIcon(t)}</span>
            <span style={styles.navLabel}>
              {t === "orders" && pendingCount > 0
                ? `Orders ${pendingCount > 9 ? "9+" : pendingCount}`
                : capitalize(t)}
            </span>
            {t === "orders" && pendingCount > 0 && (
              <span style={styles.badge}>{pendingCount > 9 ? "9+" : pendingCount}</span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}

function navIcon(t: Tab) {
  if (t === "dashboard") return "📊";
  if (t === "products") return "👕";
  if (t === "orders") return "📦";
  return "⚙️";
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Dashboard tab ────────────────────────────────────────────────────────────

function DashboardTab({
  products, orders, pendingCount, setTab,
}: {
  products: Product[];
  orders: Order[];
  pendingCount: number;
  setTab: (t: Tab) => void;
}) {
  const available = products.filter((p) => p.available).length;
  const sold = products.filter((p) => !p.available).length;
  const totalOrders = orders.length;
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div style={styles.tabContent}>
      <h2 style={styles.tabTitle}>Overview</h2>

      {/* Stats grid */}
      <div style={styles.statsGrid}>
        <StatCard label="Available" value={available} color="#22c55e" />
        <StatCard label="Sold" value={sold} color="#94a3b8" />
        <StatCard
          label="Pending Orders"
          value={pendingCount}
          color={pendingCount > 0 ? "#f97316" : "#94a3b8"}
          onClick={() => setTab("orders")}
          clickable
        />
        <StatCard label="Total Orders" value={totalOrders} color="#818cf8" />
      </div>

      {/* Pending orders callout */}
      {pendingCount > 0 && (
        <div style={styles.pendingCallout} onClick={() => setTab("orders")}>
          <span>🔔 {pendingCount} reservation{pendingCount > 1 ? "s" : ""} waiting for you</span>
          <span style={{ color: "#f97316" }}>→</span>
        </div>
      )}

      {/* Recent orders */}
      <h3 style={styles.sectionHead}>Recent Reservations</h3>
      {recentOrders.length === 0 ? (
        <p style={styles.empty}>No reservations yet.</p>
      ) : (
        <div style={styles.orderList}>
          {recentOrders.map((o) => (
            <div key={o.id} style={styles.orderRow}>
              <div>
                <p style={styles.orderName}>{o.customer_name}</p>
                <p style={styles.orderMeta}>{o.product_name}</p>
              </div>
              <StatusPill status={o.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label, value, color, onClick, clickable,
}: {
  label: string;
  value: number;
  color: string;
  onClick?: () => void;
  clickable?: boolean;
}) {
  return (
    <div
      style={{
        ...styles.statCard,
        cursor: clickable ? "pointer" : "default",
        borderColor: color,
      }}
      onClick={onClick}
    >
      <span style={{ ...styles.statValue, color }}>{value}</span>
      <span style={styles.statLabel}>{label}</span>
    </div>
  );
}

// ─── Products tab ─────────────────────────────────────────────────────────────

function ProductsTab({ products, refresh }: { products: Product[]; refresh: () => void }) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  });

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function bulkAction(action: "markSold" | "markAvailable" | "delete") {
    if (selected.size === 0) return;
    setBulkLoading(true);
    const ids = [...selected];
    if (action === "delete") {
      if (!confirm(`Delete ${ids.length} item(s)?`)) { setBulkLoading(false); return; }
      await Promise.all(ids.map((id) => apiFetch(`/api/products/${id}`, { method: "DELETE" })));
    } else {
      await Promise.all(
        ids.map((id) =>
          apiFetch(`/api/products/${id}`, {
            method: "PATCH",
            body: JSON.stringify({ available: action === "markAvailable" }),
          })
        )
      );
    }
    setSelected(new Set());
    setBulkLoading(false);
    refresh();
  }

  async function duplicateProduct(p: Product) {
    await apiFetch("/api/products", {
      method: "POST",
      body: JSON.stringify({
        name: `${p.name} (copy)`,
        price: p.price,
        description: p.description,
        images: p.images,
        tags: p.tags,
        available: true,
        drop_id: p.drop_id,
      }),
    });
    refresh();
  }

  async function deleteProduct(id: string) {
    if (!confirm("Delete this item?")) return;
    await apiFetch(`/api/products/${id}`, { method: "DELETE" });
    refresh();
  }

  if (showForm || editProduct) {
    return (
      <ProductForm
        product={editProduct}
        onDone={() => { setShowForm(false); setEditProduct(null); refresh(); }}
        onCancel={() => { setShowForm(false); setEditProduct(null); }}
      />
    );
  }

  return (
    <div style={styles.tabContent}>
      <div style={styles.tabHeader}>
        <h2 style={styles.tabTitle}>Products</h2>
        <button style={styles.primaryBtn} onClick={() => setShowForm(true)}>+ Add</button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name or tag…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={styles.searchInput}
      />

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div style={styles.bulkBar}>
          <span style={styles.bulkCount}>{selected.size} selected</span>
          <button style={styles.bulkBtn} onClick={() => bulkAction("markAvailable")} disabled={bulkLoading}>
            Mark Available
          </button>
          <button style={styles.bulkBtn} onClick={() => bulkAction("markSold")} disabled={bulkLoading}>
            Mark Sold
          </button>
          <button
            style={{ ...styles.bulkBtn, color: "#f87171" }}
            onClick={() => bulkAction("delete")}
            disabled={bulkLoading}
          >
            Delete
          </button>
          <button style={styles.bulkBtnGhost} onClick={() => setSelected(new Set())}>Clear</button>
        </div>
      )}

      {filtered.length === 0 && (
        <p style={styles.empty}>{search ? "No results." : "No products yet. Add your first drop."}</p>
      )}

      <div style={styles.productList}>
        {filtered.map((p) => (
          <div key={p.id} style={styles.productCard}>
            {/* Checkbox + image */}
            <div style={styles.productLeft}>
              <input
                type="checkbox"
                checked={selected.has(p.id)}
                onChange={() => toggleSelect(p.id)}
                style={styles.checkbox}
              />
              {p.images?.[0] ? (
                <img src={p.images[0]} alt={p.name} style={styles.productThumb} />
              ) : (
                <div style={styles.productThumbEmpty}>📷</div>
              )}
            </div>

            {/* Info */}
            <div style={styles.productInfo}>
              <div style={styles.productNameRow}>
                <span style={styles.productName}>{p.name}</span>
                <span style={{
                  ...styles.availPill,
                  background: p.available ? "#14532d" : "#1c1917",
                  color: p.available ? "#86efac" : "#78716c",
                }}>
                  {p.available ? "Available" : "Sold"}
                </span>
              </div>
              <span style={styles.productPrice}>
                {p.price.toLocaleString()} EGP
              </span>
              {p.tags?.length > 0 && (
                <div style={styles.tagRow}>
                  {p.tags.map((t) => (
                    <span key={t} style={styles.tag}>{t}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={styles.productActions}>
              <button style={styles.iconBtn} onClick={() => setEditProduct(p)} title="Edit">✏️</button>
              <button style={styles.iconBtn} onClick={() => duplicateProduct(p)} title="Duplicate">📋</button>
              <button style={styles.iconBtn} onClick={() => deleteProduct(p.id)} title="Delete">🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Product form ─────────────────────────────────────────────────────────────

function ProductForm({
  product, onDone, onCancel,
}: {
  product: Product | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(product?.name || "");
  const [price, setPrice] = useState(product?.price?.toString() || "");
  const [description, setDescription] = useState(product?.description || "");
  const [tags, setTags] = useState((product?.tags || []).join(", "));
  const [available, setAvailable] = useState(product?.available ?? true);
  const [dropId, setDropId] = useState(product?.drop_id || "");
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const url = await uploadImage(file);
      urls.push(url);
    }
    setImages((prev) => [...prev, ...urls]);
    setUploading(false);
  }

  function removeImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    if (!name || !price) return;
    setSaving(true);
    const body = {
      name,
      price: parseFloat(price),
      description,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      available,
      drop_id: dropId || null,
      images,
    };
    if (product) {
      await apiFetch(`/api/products/${product.id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
    } else {
      await apiFetch("/api/products", {
        method: "POST",
        body: JSON.stringify(body),
      });
    }
    setSaving(false);
    onDone();
  }

  return (
    <div style={styles.tabContent}>
      <div style={styles.tabHeader}>
        <h2 style={styles.tabTitle}>{product ? "Edit Product" : "New Product"}</h2>
        <button style={styles.ghostBtn} onClick={onCancel}>Cancel</button>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Name</label>
        <input
          style={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Vintage Levi's Tee"
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Price (EGP)</label>
        <input
          style={styles.input}
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0"
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Description</label>
        <textarea
          style={{ ...styles.input, minHeight: 80, resize: "vertical" }}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Details, condition, size…"
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Tags (comma separated)</label>
        <input
          style={styles.input}
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="tee, vintage, large"
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Drop ID (optional)</label>
        <input
          style={styles.input}
          value={dropId}
          onChange={(e) => setDropId(e.target.value)}
          placeholder="drop-01"
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Status</label>
        <div style={styles.toggleRow}>
          <button
            style={{ ...styles.toggleBtn, ...(available ? styles.toggleActive : {}) }}
            onClick={() => setAvailable(true)}
          >
            Available
          </button>
          <button
            style={{ ...styles.toggleBtn, ...(!available ? styles.toggleActive : {}) }}
            onClick={() => setAvailable(false)}
          >
            Sold
          </button>
        </div>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Images</label>
        <div style={styles.imageGrid}>
          {images.map((url, i) => (
            <div key={i} style={styles.imageThumbWrap}>
              <img src={url} alt="" style={styles.imageThumb} />
              <button style={styles.removeImgBtn} onClick={() => removeImage(i)}>×</button>
            </div>
          ))}
          <button
            style={styles.addImageBtn}
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "⏳" : "+"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={handleImageUpload}
          />
        </div>
      </div>

      <button
        style={{
          ...styles.primaryBtn,
          width: "100%",
          padding: "14px",
          marginTop: 8,
          opacity: saving || !name || !price ? 0.5 : 1,
        }}
        onClick={handleSave}
        disabled={saving || !name || !price}
      >
        {saving ? "Saving…" : product ? "Save Changes" : "Add Product"}
      </button>
    </div>
  );
}

// ─── Orders tab ───────────────────────────────────────────────────────────────

function OrdersTab({ orders, refresh }: { orders: Order[]; refresh: () => void }) {
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "cancelled">("pending");
  const [updating, setUpdating] = useState<string | null>(null);

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  async function updateStatus(id: string, status: Order["status"]) {
    setUpdating(id);
    await apiFetch(`/api/orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    setUpdating(null);
    refresh();
  }

  const pendingCount = orders.filter((o) => o.status === "pending").length;

  return (
    <div style={styles.tabContent}>
      <div style={styles.tabHeader}>
        <h2 style={styles.tabTitle}>
          Orders{pendingCount > 0 && (
            <span style={styles.titleBadge}>{pendingCount}</span>
          )}
        </h2>
      </div>

      {/* Filter tabs */}
      <div style={styles.filterRow}>
        {(["pending", "all", "confirmed", "cancelled"] as const).map((f) => (
          <button
            key={f}
            style={{ ...styles.filterBtn, ...(filter === f ? styles.filterBtnActive : {}) }}
            onClick={() => setFilter(f)}
          >
            {capitalize(f)}
          </button>
        ))}
      </div>

      {sorted.length === 0 && (
        <p style={styles.empty}>No {filter === "all" ? "" : filter} orders.</p>
      )}

      <div style={styles.orderList}>
        {sorted.map((o) => (
          <div key={o.id} style={styles.orderCard}>
            <div style={styles.orderTop}>
              <div>
                <p style={styles.orderName}>{o.customer_name}</p>
                <p style={styles.orderMeta}>{o.product_name}</p>
              </div>
              <StatusPill status={o.status} />
            </div>

            <div style={styles.orderDetails}>
              <p style={styles.orderDetail}>📱 {o.customer_phone}</p>
              {o.customer_instagram && (
                <p style={styles.orderDetail}>@{o.customer_instagram}</p>
              )}
              {o.notes && <p style={styles.orderDetail}>💬 {o.notes}</p>}
              <p style={styles.orderDetail}>
                🕐 {new Date(o.created_at).toLocaleDateString("en-GB", {
                  day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                })}
              </p>
            </div>

            {/* Actions */}
            <div style={styles.orderBtns}>
              <a
                href={`https://wa.me/${o.customer_phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                  `Hey ${o.customer_name}! Your reservation for ${o.product_name} is confirmed. DM or call to arrange pickup. 🍕`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.waBtn}
              >
                WhatsApp
              </a>
              {o.status === "pending" && (
                <button
                  style={styles.confirmBtn}
                  onClick={() => updateStatus(o.id, "confirmed")}
                  disabled={updating === o.id}
                >
                  {updating === o.id ? "…" : "Confirm"}
                </button>
              )}
              {o.status !== "cancelled" && (
                <button
                  style={styles.cancelBtn}
                  onClick={() => updateStatus(o.id, "cancelled")}
                  disabled={updating === o.id}
                >
                  {updating === o.id ? "…" : "Cancel"}
                </button>
              )}
              {o.status === "cancelled" && (
                <button
                  style={styles.confirmBtn}
                  onClick={() => updateStatus(o.id, "pending")}
                  disabled={updating === o.id}
                >
                  Restore
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Settings tab ─────────────────────────────────────────────────────────────

function SettingsTab({ products, refresh }: { products: Product[]; refresh: () => void }) {
  const [dropId, setDropId] = useState("");
  const [marking, setMarking] = useState(false);
  const [msg, setMsg] = useState("");

  async function markAllSold() {
    if (!confirm("Mark ALL available items as sold?")) return;
    setMarking(true);
    const available = products.filter((p) => p.available);
    await Promise.all(
      available.map((p) =>
        apiFetch(`/api/products/${p.id}`, {
          method: "PATCH",
          body: JSON.stringify({ available: false }),
        })
      )
    );
    setMarking(false);
    setMsg(`Marked ${available.length} items as sold.`);
    refresh();
    setTimeout(() => setMsg(""), 3000);
  }

  async function newDrop() {
    if (!dropId.trim()) return;
    setMarking(true);
    await apiFetch("/api/drops", {
      method: "POST",
      body: JSON.stringify({ id: dropId.trim(), active: true }),
    });
    setMarking(false);
    setMsg(`Drop "${dropId.trim()}" created.`);
    setDropId("");
    setTimeout(() => setMsg(""), 3000);
  }

  return (
    <div style={styles.tabContent}>
      <h2 style={styles.tabTitle}>Settings</h2>

      {msg && <div style={styles.successMsg}>{msg}</div>}

      <div style={styles.settingCard}>
        <h3 style={styles.settingTitle}>New Drop</h3>
        <p style={styles.settingDesc}>Create a drop ID to group new products.</p>
        <div style={styles.inlineRow}>
          <input
            style={{ ...styles.input, flex: 1 }}
            value={dropId}
            onChange={(e) => setDropId(e.target.value)}
            placeholder="e.g. drop-02"
          />
          <button
            style={{ ...styles.primaryBtn, flexShrink: 0 }}
            onClick={newDrop}
            disabled={marking || !dropId.trim()}
          >
            Create
          </button>
        </div>
      </div>

      <div style={styles.settingCard}>
        <h3 style={styles.settingTitle}>End of Drop</h3>
        <p style={styles.settingDesc}>
          Mark all currently available items as sold at once (e.g. after a drop closes).
        </p>
        <button
          style={{ ...styles.dangerBtn, width: "100%" }}
          onClick={markAllSold}
          disabled={marking}
        >
          {marking ? "Working…" : "Mark All as Sold"}
        </button>
      </div>

      <div style={styles.settingCard}>
        <h3 style={styles.settingTitle}>Install Admin on Phone</h3>
        <p style={styles.settingDesc}>
          Open this page in your phone's browser, then tap{" "}
          <strong style={{ color: "#f97316" }}>Share → Add to Home Screen</strong>.
          You'll get a direct icon that opens straight into admin — no URL typing needed.
        </p>
      </div>
    </div>
  );
}

// ─── Status pill ──────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: Order["status"] }) {
  const map = {
    pending: { bg: "#431407", color: "#fb923c", label: "Pending" },
    confirmed: { bg: "#14532d", color: "#86efac", label: "Confirmed" },
    cancelled: { bg: "#1c1917", color: "#78716c", label: "Cancelled" },
  };
  const s = map[status];
  return (
    <span style={{
      background: s.bg,
      color: s.color,
      padding: "3px 10px",
      borderRadius: 99,
      fontSize: 12,
      fontWeight: 600,
      whiteSpace: "nowrap",
    }}>
      {s.label}
    </span>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  splash: {
    minHeight: "100dvh",
    background: "#09090b",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    width: 32,
    height: 32,
    border: "3px solid #27272a",
    borderTop: "3px solid #f97316",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
  loginWrap: {
    minHeight: "100dvh",
    background: "#09090b",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  loginCard: {
    background: "#18181b",
    border: "1px solid #27272a",
    borderRadius: 16,
    padding: "40px 32px",
    width: "100%",
    maxWidth: 360,
    textAlign: "center",
  },
  loginLogo: {
    fontSize: 48,
    marginBottom: 12,
  },
  loginTitle: {
    color: "#fafafa",
    fontSize: 24,
    fontWeight: 700,
    margin: 0,
  },
  loginSub: {
    color: "#71717a",
    fontSize: 14,
    marginTop: 4,
    marginBottom: 28,
  },
  loginForm: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  loginInput: {
    background: "#09090b",
    border: "1px solid #3f3f46",
    borderRadius: 10,
    color: "#fafafa",
    fontSize: 16,
    padding: "13px 16px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  loginError: {
    color: "#f87171",
    fontSize: 13,
    margin: 0,
  },
  loginBtn: {
    background: "#f97316",
    border: "none",
    borderRadius: 10,
    color: "#fff",
    fontSize: 16,
    fontWeight: 700,
    padding: "13px",
    cursor: "pointer",
    transition: "opacity 0.15s",
  },
  shell: {
    minHeight: "100dvh",
    background: "#09090b",
    display: "flex",
    flexDirection: "column",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#fafafa",
  },
  topbar: {
    background: "#18181b",
    borderBottom: "1px solid #27272a",
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    zIndex: 50,
  },
  topbarTitle: {
    fontWeight: 700,
    fontSize: 18,
  },
  logoutBtn: {
    background: "transparent",
    border: "1px solid #3f3f46",
    borderRadius: 8,
    color: "#71717a",
    cursor: "pointer",
    fontSize: 13,
    padding: "6px 12px",
  },
  main: {
    flex: 1,
    overflowY: "auto",
    paddingBottom: 80,
  },
  centerSpin: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  bottomNav: {
    background: "#18181b",
    borderTop: "1px solid #27272a",
    display: "flex",
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 50,
  },
  navBtn: {
    flex: 1,
    background: "transparent",
    border: "none",
    color: "#52525b",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
    padding: "10px 4px 12px",
    position: "relative",
    transition: "color 0.15s",
  },
  navBtnActive: {
    color: "#f97316",
  },
  navIcon: {
    fontSize: 20,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: 600,
  },
  badge: {
    position: "absolute",
    top: 6,
    right: "calc(50% - 18px)",
    background: "#f97316",
    color: "#fff",
    fontSize: 9,
    fontWeight: 700,
    borderRadius: 99,
    minWidth: 16,
    height: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 4px",
  },
  tabContent: {
    padding: 16,
    maxWidth: 640,
    margin: "0 auto",
    width: "100%",
    boxSizing: "border-box",
  },
  tabHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  tabTitle: {
    fontSize: 20,
    fontWeight: 700,
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  titleBadge: {
    background: "#f97316",
    color: "#fff",
    borderRadius: 99,
    fontSize: 12,
    fontWeight: 700,
    padding: "1px 8px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    background: "#18181b",
    border: "1px solid",
    borderRadius: 12,
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 800,
    lineHeight: 1,
  },
  statLabel: {
    color: "#71717a",
    fontSize: 12,
    fontWeight: 500,
  },
  pendingCallout: {
    background: "#431407",
    border: "1px solid #7c2d12",
    borderRadius: 10,
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    color: "#fb923c",
    fontWeight: 600,
    fontSize: 14,
    marginBottom: 20,
  },
  sectionHead: {
    fontSize: 14,
    fontWeight: 600,
    color: "#71717a",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    margin: "20px 0 10px",
  },
  orderList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  orderRow: {
    background: "#18181b",
    border: "1px solid #27272a",
    borderRadius: 10,
    padding: "12px 14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  orderCard: {
    background: "#18181b",
    border: "1px solid #27272a",
    borderRadius: 12,
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  orderTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  orderName: {
    fontWeight: 600,
    fontSize: 15,
    margin: 0,
  },
  orderMeta: {
    color: "#71717a",
    fontSize: 13,
    margin: "2px 0 0",
  },
  orderDetails: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  orderDetail: {
    color: "#a1a1aa",
    fontSize: 13,
    margin: 0,
  },
  orderBtns: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  waBtn: {
    background: "#14532d",
    border: "none",
    borderRadius: 8,
    color: "#86efac",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    padding: "8px 14px",
    textDecoration: "none",
    display: "inline-block",
  },
  confirmBtn: {
    background: "#1e3a5f",
    border: "none",
    borderRadius: 8,
    color: "#93c5fd",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    padding: "8px 14px",
  },
  cancelBtn: {
    background: "#1c1917",
    border: "1px solid #3f3f46",
    borderRadius: 8,
    color: "#71717a",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    padding: "8px 14px",
  },
  filterRow: {
    display: "flex",
    gap: 6,
    marginBottom: 14,
    flexWrap: "wrap",
  },
  filterBtn: {
    background: "#18181b",
    border: "1px solid #27272a",
    borderRadius: 8,
    color: "#71717a",
    cursor: "pointer",
    fontSize: 13,
    padding: "7px 14px",
  },
  filterBtnActive: {
    background: "#27272a",
    color: "#fafafa",
    borderColor: "#3f3f46",
  },
  searchInput: {
    background: "#18181b",
    border: "1px solid #3f3f46",
    borderRadius: 10,
    color: "#fafafa",
    fontSize: 15,
    padding: "11px 14px",
    width: "100%",
    boxSizing: "border-box",
    marginBottom: 12,
    outline: "none",
  },
  bulkBar: {
    background: "#27272a",
    borderRadius: 10,
    padding: "10px 12px",
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 12,
  },
  bulkCount: {
    fontWeight: 600,
    fontSize: 13,
    marginRight: 4,
    color: "#f97316",
  },
  bulkBtn: {
    background: "#3f3f46",
    border: "none",
    borderRadius: 7,
    color: "#fafafa",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
    padding: "6px 12px",
  },
  bulkBtnGhost: {
    background: "transparent",
    border: "none",
    color: "#71717a",
    cursor: "pointer",
    fontSize: 12,
    padding: "6px 8px",
  },
  productList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  productCard: {
    background: "#18181b",
    border: "1px solid #27272a",
    borderRadius: 12,
    padding: "12px",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  productLeft: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  checkbox: {
    width: 18,
    height: 18,
    cursor: "pointer",
    accentColor: "#f97316",
  },
  productThumb: {
    width: 52,
    height: 52,
    borderRadius: 8,
    objectFit: "cover",
    flexShrink: 0,
  },
  productThumbEmpty: {
    width: 52,
    height: 52,
    borderRadius: 8,
    background: "#27272a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    flexShrink: 0,
  },
  productInfo: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },
  productNameRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  productName: {
    fontWeight: 600,
    fontSize: 14,
  },
  availPill: {
    borderRadius: 99,
    fontSize: 11,
    fontWeight: 600,
    padding: "2px 8px",
  },
  productPrice: {
    color: "#f97316",
    fontSize: 13,
    fontWeight: 600,
  },
  tagRow: {
    display: "flex",
    gap: 4,
    flexWrap: "wrap",
  },
  tag: {
    background: "#27272a",
    borderRadius: 6,
    color: "#a1a1aa",
    fontSize: 11,
    padding: "2px 7px",
  },
  productActions: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    flexShrink: 0,
  },
  iconBtn: {
    background: "#27272a",
    border: "none",
    borderRadius: 7,
    cursor: "pointer",
    fontSize: 15,
    padding: "6px 8px",
    lineHeight: 1,
  },
  empty: {
    color: "#52525b",
    textAlign: "center",
    padding: "40px 0",
    fontSize: 14,
  },
  primaryBtn: {
    background: "#f97316",
    border: "none",
    borderRadius: 10,
    color: "#fff",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
    padding: "10px 18px",
  },
  ghostBtn: {
    background: "transparent",
    border: "1px solid #3f3f46",
    borderRadius: 10,
    color: "#a1a1aa",
    cursor: "pointer",
    fontSize: 14,
    padding: "10px 18px",
  },
  dangerBtn: {
    background: "#450a0a",
    border: "1px solid #7f1d1d",
    borderRadius: 10,
    color: "#fca5a5",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    padding: "12px 18px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "#a1a1aa",
  },
  input: {
    background: "#18181b",
    border: "1px solid #3f3f46",
    borderRadius: 10,
    color: "#fafafa",
    fontSize: 15,
    padding: "11px 14px",
    width: "100%",
    boxSizing: "border-box",
    outline: "none",
    fontFamily: "inherit",
  },
  toggleRow: {
    display: "flex",
    gap: 8,
  },
  toggleBtn: {
    background: "#18181b",
    border: "1px solid #3f3f46",
    borderRadius: 8,
    color: "#71717a",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    padding: "9px 20px",
  },
  toggleActive: {
    background: "#27272a",
    borderColor: "#f97316",
    color: "#f97316",
  },
  imageGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  imageThumbWrap: {
    position: "relative",
  },
  imageThumb: {
    width: 72,
    height: 72,
    borderRadius: 8,
    objectFit: "cover",
  },
  removeImgBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    background: "#f87171",
    border: "none",
    borderRadius: 99,
    color: "#fff",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
    width: 20,
    height: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
    padding: 0,
  },
  addImageBtn: {
    width: 72,
    height: 72,
    background: "#18181b",
    border: "2px dashed #3f3f46",
    borderRadius: 8,
    color: "#71717a",
    cursor: "pointer",
    fontSize: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  settingCard: {
    background: "#18181b",
    border: "1px solid #27272a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: 700,
    margin: "0 0 4px",
  },
  settingDesc: {
    color: "#71717a",
    fontSize: 13,
    margin: "0 0 14px",
    lineHeight: 1.5,
  },
  inlineRow: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
  successMsg: {
    background: "#14532d",
    border: "1px solid #166534",
    borderRadius: 10,
    color: "#86efac",
    fontSize: 14,
    fontWeight: 600,
    padding: "12px 14px",
    marginBottom: 14,
  },
};

// Inject spinner keyframes
const style = document.createElement("style");
style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(style);

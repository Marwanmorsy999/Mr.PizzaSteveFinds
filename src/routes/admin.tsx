import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";

const API = import.meta.env.VITE_API_URL || "https://pizzasteve-api.m-2396.workers.dev";
const CLOUD_NAME = "dnggmrgmu";
const UPLOAD_PRESET = "pizzasteve4";
const TOKEN_KEY = "ps_admin_token";

interface Product {
  id: string; name: string; size?: string; price?: number; priceLabel?: string;
  status: string; emoji?: string; tag?: string; imageUrl?: string;
  images?: string[]; condition?: string; description?: string; sortOrder?: number;
}

export const Route = createFileRoute("/admin")({ component: AdminPage });

// ── Auth helpers ──────────────────────────────────────────────────────────────
function getToken() { return localStorage.getItem(TOKEN_KEY); }
function setToken(t: string) { localStorage.setItem(TOKEN_KEY, t); }
function clearToken() { localStorage.removeItem(TOKEN_KEY); }

function authHeaders(): Record<string, string> {
  const t = getToken();
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (t) h["X-Admin-Token"] = t;
  return h;
}

async function apiFetch(path: string, opts: RequestInit = {}) {
  return fetch(`${API}${path}`, {
    ...opts,
    headers: { ...authHeaders(), ...(opts.headers as Record<string, string> || {}) },
  });
}

async function uploadImg(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: "POST", body: fd });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Upload failed (${res.status})`);
  }
  const data = await res.json();
  if (!data.secure_url) throw new Error(data.error?.message || "No URL returned");
  return data.secure_url;
}

// ── Root ──────────────────────────────────────────────────────────────────────
function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [pass, setPass] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) { setAuthLoading(false); return; }
    apiFetch("/api/session/check", { method: "POST" }).then(async (res) => {
      if (res.ok) { const d = await res.json(); if (d.token) setToken(d.token); setAuthed(true); }
      else clearToken();
      setAuthLoading(false);
    }).catch(() => { clearToken(); setAuthLoading(false); });
  }, []);

  async function login() {
    setLoginLoading(true); setLoginErr("");
    try {
      const res = await fetch(`${API}/api/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pass }),
      });
      if (res.ok) { const d = await res.json(); setToken(d.token); setAuthed(true); }
      else setLoginErr("Wrong password.");
    } catch { setLoginErr("Can't reach server."); }
    setLoginLoading(false);
  }

  if (authLoading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-zinc-800 border-t-orange-400 rounded-full animate-spin" />
    </div>
  );

  if (!authed) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-sm">
        <div className="text-4xl mb-6 text-center">🍕</div>
        <input type="password" placeholder="Password" value={pass}
          onChange={e => setPass(e.target.value)}
          onKeyDown={e => e.key === "Enter" && login()}
          className="w-full bg-zinc-800 text-white border border-zinc-700 rounded-xl px-4 py-3 mb-4 outline-none focus:border-zinc-200 placeholder-zinc-500" />
        {loginErr && <p className="text-red-400 text-sm mb-3 text-center">{loginErr}</p>}
        <button onClick={login} disabled={loginLoading || !pass}
          className="w-full bg-zinc-800 hover:bg-orange-400 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition-colors">
          {loginLoading ? "Logging in…" : "Enter"}
        </button>
      </div>
    </div>
  );

  return <Dashboard onLogout={() => { clearToken(); setAuthed(false); setPass(""); }} />;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
type Tab = "products" | "orders" | "settings";

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [announcement, setAnnouncement] = useState("");
  const [savedAnnouncement, setSavedAnnouncement] = useState("");
  const [whatsappInput, setWhatsappInput] = useState("");
  const [savedWhatsapp, setSavedWhatsapp] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"ok" | "err">("ok");
  const [uploading, setUploading] = useState<string | null>(null);

  // Add product form
  const [addMode, setAddMode] = useState<"single" | "bulk">("single");
  const [form, setForm] = useState({
    name: "", size: "", price: "", tag: "TEE", emoji: "🍕",
    status: "available", condition: "Good", description: "", imageUrl: "", images: [] as string[]
  });
  const [bulkItems, setBulkItems] = useState<any[]>([
  { id: Date.now(), name: "", size: "", price: "", tag: "TEE", condition: "Good", description: "", imageUrl: "", images: [] as string[] }
  ]);
  const [uploadingBulk, setUploadingBulk] = useState<Record<string, boolean>>({});
  const [bulkPublishing, setBulkPublishing] = useState(false);

  // Product list controls
  const [search, setSearch] = useState("");
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set());
  const [reorderMode, setReorderMode] = useState(false);
  const [dragOrder, setDragOrder] = useState<Product[]>([]);

  const pendingCount = orders.filter((o: any) => o.status === "pending").length;

  function showMsg(text: string, type: "ok" | "err" = "ok") {
    setMsg(text); setMsgType(type);
    setTimeout(() => setMsg(""), 3000);
  }

  const load = useCallback(async () => {
    try {
      const res = await apiFetch("/api/products?admin=true");
      const data = await res.json();
      const prods = data.products || data || [];
      setProducts(prods);
      setDragOrder(prods.filter((p: Product) => p.status === "available"));
    } catch { }
    try {
      const oRes = await apiFetch("/api/orders");
      if (oRes.ok) { const d = await oRes.json(); setOrders(d.orders || d || []); }
    } catch { }
    try {
      const a = await fetch(`${API}/api/announcement`);
      if (a.ok) { const d = await a.json(); setAnnouncement(d.text || ""); setSavedAnnouncement(d.text || ""); }
    } catch { }
    try {
      const s = await fetch(`${API}/api/settings`);
      if (s.ok) { const d = await s.json(); setWhatsappInput(d.whatsapp || ""); setSavedWhatsapp(d.whatsapp || ""); }
    } catch { }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Product actions ───────────────────────────────────────────────────────
  async function handleExtraImgNew(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading("new-extra");
    try {
      const url = await uploadImg(file);
      setForm(f => ({ ...f, images: [...f.images, url] }));
    } catch { showMsg("Upload failed", "err"); }
    setUploading(null);
  }
  function removeExtraImgNew(idx: number) {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  }

  async function addProduct() {
    if (!form.name) return showMsg("Name required", "err");
    await apiFetch("/api/products", {
      method: "POST",
      body: JSON.stringify({ ...form, price: form.price ? parseInt(form.price) : null, images: form.images })
    });
    setForm({ name: "", size: "", price: "", tag: "TEE", emoji: "🍕", status: "available", condition: "Good", description: "", imageUrl: "", images: [] });
    showMsg("✓ Product added — it's live"); load();
  }

  async function handleMainImg(e: React.ChangeEvent<HTMLInputElement>, productId?: string) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(productId || "new-main");
    try {
      const url = await uploadImg(file);
      if (productId) {
        await apiFetch(`/api/products/${productId}`, { method: "PATCH", body: JSON.stringify({ imageUrl: url }) });
        load(); showMsg("Main image updated");
      } else { setForm(f => ({ ...f, imageUrl: url })); }
    } catch { showMsg("Upload failed", "err"); }
    setUploading(null);
  }

  async function handleExtraImg(e: React.ChangeEvent<HTMLInputElement>, productId: string, existing: string[]) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(productId + "-extra");
    try {
      const url = await uploadImg(file);
      await apiFetch(`/api/products/${productId}`, { method: "PATCH", body: JSON.stringify({ images: [...existing, url] }) });
      load(); showMsg("Extra image added");
    } catch { showMsg("Upload failed", "err"); }
    setUploading(null);
  }

  async function removeExtraImg(productId: string, existing: string[], idx: number) {
    const updated = existing.filter((_, i) => i !== idx);
    await apiFetch(`/api/products/${productId}`, { method: "PATCH", body: JSON.stringify({ images: updated }) });
    load(); showMsg("Image removed");
  }

  async function quickSell(id: string) {
    await apiFetch(`/api/products/${id}`, { method: "PATCH", body: JSON.stringify({ status: "sold" }) });
    showMsg("Marked sold"); load();
  }

  async function toggleStatus(id: string, current: string) {
    const next = current === "available" ? "sold" : "available";
    await apiFetch(`/api/products/${id}`, { method: "PATCH", body: JSON.stringify({ status: next }) });
    load();
  }

  async function deleteProduct(id: string) {
    if (!confirm("Delete this product?")) return;
    await apiFetch(`/api/products/${id}`, { method: "DELETE" });
    showMsg("Deleted"); load();
  }

  async function duplicateProduct(p: Product) {
    await apiFetch("/api/products", {
      method: "POST",
      body: JSON.stringify({
        name: `${p.name} (copy)`, size: p.size, price: p.price,
        tag: p.tag, emoji: p.emoji, status: "available",
        condition: p.condition, description: p.description,
        imageUrl: p.imageUrl, images: p.images || []
      })
    });
    showMsg("Duplicated ✓"); load();
  }

  async function bulkMarkSold() {
    if (bulkSelected.size === 0) return;
    await apiFetch("/api/products/bulk-sold", {
      method: "POST", body: JSON.stringify({ ids: Array.from(bulkSelected) })
    });
    showMsg(`✓ ${bulkSelected.size} item${bulkSelected.size > 1 ? "s" : ""} marked sold`);
    setBulkSelected(new Set()); setBulkMode(false); load();
  }

  // Drag reorder
  const dragItem = useRef<number | null>(null);
  function onDragStart(i: number) { dragItem.current = i; }
  function onDragEnter(i: number) {
    const copy = [...dragOrder];
    const dragged = copy.splice(dragItem.current!, 1)[0];
    copy.splice(i, 0, dragged);
    dragItem.current = i;
    setDragOrder(copy);
  }
  function onDragEnd() { dragItem.current = null; }

  async function saveReorder() {
    await apiFetch("/api/products/reorder", {
      method: "POST", body: JSON.stringify({ order: dragOrder.map(p => p.id) })
    });
    showMsg("Order saved"); setReorderMode(false); load();
  }

  // Bulk drop
  function addBulkItemRow() {
    setBulkItems(prev => [...prev, { id: Date.now(), name: "", size: "", price: "", tag: "TEE", condition: "Good", description: "", imageUrl: "", images: [] }]);
  }
  function removeBulkItem(id: number) { setBulkItems(prev => prev.filter(i => i.id !== id)); }
  function updateBulkItem(id: number, patch: any) {
    setBulkItems(prev => prev.map(item => item.id === id ? { ...item, ...patch } : item));
  }
  async function handleBulkExtraImg(e: React.ChangeEvent<HTMLInputElement>, itemId: number) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploadingBulk(prev => ({ ...prev, [itemId + "-extra"]: true }));
    try {
      const url = await uploadImg(file);
      const item = bulkItems.find(i => i.id === itemId);
      if (item) updateBulkItem(itemId, { images: [...(item.images || []), url] });
      showMsg("Extra image added");
    } catch { showMsg("Upload failed", "err"); }
    setUploadingBulk(prev => ({ ...prev, [itemId + "-extra"]: false }));
  }
  function removeBulkExtraImg(itemId: number, idx: number) {
    const item = bulkItems.find(i => i.id === itemId);
    if (item) updateBulkItem(itemId, { images: item.images.filter((_: any, i: number) => i !== idx) });
  }

  async function handleBulkImgUpload(e: React.ChangeEvent<HTMLInputElement>, itemId: number) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploadingBulk(prev => ({ ...prev, [itemId]: true }));
    try { const url = await uploadImg(file); updateBulkItem(itemId, { imageUrl: url }); showMsg("Image uploaded"); }
    catch { showMsg("Upload failed", "err"); }
    setUploadingBulk(prev => ({ ...prev, [itemId]: false }));
  }
  async function publishBulkDrop() {
    const valid = bulkItems.filter(i => i.name.trim() !== "");
    if (valid.length === 0) return showMsg("At least one item required", "err");
    setBulkPublishing(true);
    try {
        const res = await apiFetch("/api/products/bulk", { method: "POST", body: JSON.stringify(valid.map(i => ({ ...i, images: i.images || [] }))) });
      if (res.ok) {
        showMsg(`✓ Drop published: ${valid.length} items live`);
        setBulkItems([{ id: Date.now(), name: "", size: "", price: "", tag: "TEE", condition: "Good", description: "", imageUrl: "", images: [] }]);
        load();
      } else showMsg("Publish failed", "err");
    } catch { showMsg("Publish failed", "err"); }
    setBulkPublishing(false);
  }

  // Orders
  async function updateOrderStatus(id: string, status: string) {
    const r = await apiFetch(`/api/orders/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
    if (r.ok) { showMsg(`Status → ${status}`); load(); }
    else showMsg("Failed to update", "err");
  }
  async function deleteOrder(id: string) {
    if (!confirm("Delete this order?")) return;
    const r = await apiFetch(`/api/orders/${id}`, { method: "DELETE" });
    if (r.ok) { showMsg("Order deleted"); load(); }
    else showMsg("Failed to delete", "err");
  }

  // Settings
  async function saveAnnouncement() {
    await apiFetch("/api/announcement", { method: "POST", body: JSON.stringify({ text: announcement }) });
    setSavedAnnouncement(announcement); showMsg("Banner saved");
  }
  async function saveWhatsapp() {
    await apiFetch("/api/settings", { method: "POST", body: JSON.stringify({ key: "whatsapp", value: whatsappInput }) });
    setSavedWhatsapp(whatsappInput); showMsg("WhatsApp number saved");
  }

  const available = products.filter(p => p.status === "available");
  const sold = products.filter(p => p.status === "sold");

  const filteredAvailable = available.filter(p => {
    const q = search.toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || (p.tag || "").toLowerCase().includes(q) || (p.size || "").toLowerCase().includes(q);
  });
  const filteredSold = sold.filter(p => {
    const q = search.toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || (p.tag || "").toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black tracking-widest">🍕 ADMIN</h1>
          <div className="flex items-center gap-3">
            {msg && (
              <span className={`text-sm px-3 py-1 rounded-full border ${msgType === "ok" ? "text-zinc-100 bg-zinc-800/10 border-zinc-200/20" : "text-red-400 bg-red-500/10 border-red-500/20"}`}>
                {msg}
              </span>
            )}
            <button onClick={onLogout}
              className="text-xs px-3 py-1.5 border border-red-900/50 text-red-600 hover:bg-red-900/30 hover:text-red-400 font-bold rounded-lg transition-colors">
              Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: "TOTAL", value: products.length },
            { label: "LIVE", value: available.length, color: "text-emerald-400" },
            { label: "SOLD", value: sold.length, color: "text-zinc-500" },
            { label: "PENDING", value: pendingCount, color: pendingCount > 0 ? "text-orange-400" : "text-zinc-500", onClick: () => setActiveTab("orders") },
          ].map(s => (
            <div key={s.label}
              onClick={s.onClick}
              className={`bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center ${s.onClick ? "cursor-pointer hover:border-zinc-600" : ""}`}>
              <div className={`text-xl font-black ${s.color || "text-zinc-100"}`}>{s.value}</div>
              <div className="text-zinc-500 text-xs tracking-widest">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Pending callout */}
        {pendingCount > 0 && (
          <div onClick={() => setActiveTab("orders")}
            className="bg-orange-950/30 border border-orange-900/50 rounded-xl px-4 py-3 mb-6 flex items-center justify-between cursor-pointer hover:border-orange-800 transition-colors">
            <span className="text-orange-400 font-bold text-sm">🔔 {pendingCount} reservation{pendingCount > 1 ? "s" : ""} waiting</span>
            <span className="text-orange-400">→</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {(["products", "orders", "settings"] as Tab[]).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`relative text-xs font-bold tracking-widest px-4 py-2 rounded-full border transition-colors ${activeTab === t ? "bg-zinc-800 border-zinc-200 text-white" : "border-zinc-700 text-zinc-400 hover:border-zinc-200 hover:text-zinc-100"}`}>
              {t.toUpperCase()}
              {t === "orders" && pendingCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[9px] font-black rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── ORDERS ── */}
        {activeTab === "orders" && (
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-zinc-100 font-bold tracking-widest text-sm">CUSTOMER RESERVATIONS ({orders.length})</span>
            </div>
            <div className="space-y-4">
              {orders.map((order: any) => {
                const items = order.items || [];
                const itemNames = items.map((i: any) => `${i.name}${i.size ? ` (${i.size})` : ""}`).join(", ");
                const phone = (order.customerPhone || order.customer_phone || "").replace(/\D/g, "");
                const name = order.customerName || order.customer_name || "";
                const waChatMsg = encodeURIComponent(`Hi ${name}! This is Steve from Mr. Pizza Steve Finds. Confirming your reservation for: ${itemNames || order.product_name || "your item"}.`);
                const waLink = `https://wa.me/${phone.startsWith("0") ? `2${phone}` : phone}?text=${waChatMsg}`;
                const status = order.status || "pending";
                const createdAt = order.createdAt || order.created_at;

                return (
                  <div key={order.id} className={`bg-zinc-900 border rounded-2xl p-6 space-y-4 transition-colors ${status === "completed" || status === "confirmed" ? "border-zinc-800 bg-zinc-900/40 opacity-75" :
                      status === "cancelled" ? "border-red-950/40 bg-zinc-900/20 opacity-50" :
                        "border-zinc-200/35 shadow-lg shadow-orange-500/5"
                    }`}>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-zinc-100 font-black text-sm">{order.id}</span>
                        <span className="text-zinc-500 text-xs">{createdAt ? new Date(createdAt).toLocaleString() : ""}</span>
                      </div>
                      <span className={`text-xs font-black tracking-widest px-3 py-1 rounded-full border ${status === "completed" || status === "confirmed" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
                          status === "cancelled" ? "text-red-400 bg-red-500/10 border-red-500/20" :
                            "text-zinc-100 bg-zinc-800/10 border-zinc-200/20"
                        }`}>{status.toUpperCase()}</span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/60 text-sm">
                      <div>
                        <p className="text-zinc-500 text-xs tracking-wider uppercase mb-1">CUSTOMER</p>
                        <p className="font-bold text-white text-base">{name}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <a href={`tel:${phone}`} className="text-zinc-400 hover:text-white underline">{order.customerPhone || order.customer_phone}</a>
                          {order.customer_instagram && <span className="text-zinc-500">@{order.customer_instagram}</span>}
                          <a href={waLink} target="_blank" rel="noreferrer"
                            className="text-emerald-400 hover:text-emerald-300 font-bold text-xs bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded">
                            💬 Message
                          </a>
                        </div>
                      </div>
                      <div>
                        <p className="text-zinc-500 text-xs tracking-wider uppercase mb-1">DETAILS</p>
                        {order.pickup !== undefined && (
                          <p className="text-zinc-300">{order.pickup ? "📍 Zamalek Pickup" : `🚚 Delivery: ${order.address}`}</p>
                        )}
                        {(order.notes || order.customer_notes) && (
                          <p className="text-zinc-400 text-xs italic mt-1.5">"{order.notes || order.customer_notes}"</p>
                        )}
                        {order.product_name && <p className="text-zinc-300 mt-1">📦 {order.product_name}</p>}
                      </div>
                    </div>

                    {items.length > 0 && (
                      <div>
                        <p className="text-zinc-500 text-xs tracking-wider uppercase mb-2">RESERVED ITEMS</p>
                        <div className="divide-y divide-zinc-800 bg-zinc-950/30 rounded-xl border border-zinc-800/40 overflow-hidden">
                          {items.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center px-4 py-3 text-sm">
                              <div>
                                <p className="font-bold text-zinc-100">{item.name}</p>
                                {item.size && <p className="text-zinc-500 text-xs">Size: {item.size}</p>}
                              </div>
                              <span className="text-zinc-100 font-mono font-bold">
                                {item.price ? (
                                  <>
                                    {item.price} <span className="text-[0.65em] font-sans font-bold tracking-wider text-zinc-500 ml-0.5">EGP</span>
                                  </>
                                ) : item.priceLabel || "DM price"}
                              </span>
                            </div>
                          ))}
                          {order.total > 0 && (
                            <div className="flex justify-between items-center px-4 py-3 bg-zinc-950/70">
                              <span className="text-zinc-400 font-bold">Total</span>
                              <span className="text-zinc-100 font-black font-mono">
                                {order.total} <span className="text-[0.65em] font-sans font-bold tracking-wider text-zinc-500 ml-0.5">EGP</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 flex-wrap justify-between items-center border-t border-zinc-800 pt-4">
                      <div className="flex gap-2 flex-wrap">
                        {(status === "pending") && (
                          <>
                            <button onClick={() => updateOrderStatus(order.id, "completed")}
                              className="text-xs px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors">
                              ✓ Completed
                            </button>
                            <button onClick={() => updateOrderStatus(order.id, "confirmed")}
                              className="text-xs px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors">
                              Confirm
                            </button>
                            <button onClick={() => updateOrderStatus(order.id, "cancelled")}
                              className="text-xs px-4 py-2 border border-red-900/60 text-red-400 hover:bg-red-950/20 font-bold rounded-lg transition-colors">
                              ✕ Cancel
                            </button>
                          </>
                        )}
                        {(status === "completed" || status === "confirmed") && (
                          <>
                            <button onClick={() => updateOrderStatus(order.id, "pending")}
                              className="text-xs px-4 py-2 border border-zinc-700 text-zinc-400 hover:bg-zinc-800 font-bold rounded-lg transition-colors">
                              Restore to Pending
                            </button>
                            <button onClick={() => updateOrderStatus(order.id, "cancelled")}
                              className="text-xs px-4 py-2 border border-red-900/60 text-red-400 hover:bg-red-950/20 font-bold rounded-lg transition-colors">
                              ✕ Cancel
                            </button>
                          </>
                        )}
                        {status === "cancelled" && (
                          <button onClick={() => updateOrderStatus(order.id, "pending")}
                            className="text-xs px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg transition-colors">
                            Restore to Pending
                          </button>
                        )}
                      </div>
                      <button onClick={() => deleteOrder(order.id)}
                        className="text-xs px-3 py-2 border border-red-900/50 text-red-600 hover:bg-red-900/30 hover:text-red-400 font-bold rounded-lg transition-colors">
                        Delete Order
                      </button>
                    </div>
                  </div>
                );
              })}
              {orders.length === 0 && <p className="text-zinc-600 text-sm text-center py-12">No reservations yet.</p>}
            </div>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {activeTab === "settings" && (
          <div className="space-y-6 mb-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-zinc-100 font-bold tracking-widest mb-1">ANNOUNCEMENT BANNER</h2>
              <p className="text-zinc-500 text-xs mb-4">Shows at the top of the homepage. Leave empty to hide.</p>
              <input value={announcement} onChange={e => setAnnouncement(e.target.value)}
                placeholder="e.g. New drop this Friday — come through!"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:border-zinc-200 placeholder-zinc-500 mb-3" />
              {savedAnnouncement && <p className="text-zinc-600 text-xs mb-3">Live: "{savedAnnouncement}"</p>}
              <div className="flex gap-3">
                <button onClick={saveAnnouncement}
                  className="bg-zinc-800 hover:bg-orange-400 text-white font-bold px-6 py-2 rounded-xl transition-colors">Save Banner</button>
                {savedAnnouncement && (
                  <button onClick={() => { setAnnouncement(""); saveAnnouncement(); }}
                    className="border border-zinc-700 hover:border-red-700 text-zinc-400 hover:text-red-400 font-bold px-4 py-2 rounded-xl transition-colors text-sm">Clear</button>
                )}
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-zinc-100 font-bold tracking-widest mb-1">WHATSAPP NUMBER</h2>
              <p className="text-zinc-500 text-xs mb-4">Number that receives reservation notifications (include country code, e.g. 201012345678).</p>
              <input value={whatsappInput} onChange={e => setWhatsappInput(e.target.value)}
                placeholder="e.g. 201012345678"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:border-zinc-200 placeholder-zinc-500 mb-3" />
              {savedWhatsapp && <p className="text-zinc-600 text-xs mb-3">Active: {savedWhatsapp}</p>}
              <button onClick={saveWhatsapp}
                className="bg-zinc-800 hover:bg-orange-400 text-white font-bold px-6 py-2 rounded-xl transition-colors">Save Number</button>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-zinc-100 font-bold tracking-widest mb-1">INSTALL ON PHONE</h2>
              <p className="text-zinc-500 text-xs">Open <span className="text-zinc-300">mr.pizzastevefinds.com/admin</span> in Safari → tap <span className="text-orange-400 font-bold">Share → Add to Home Screen</span>. Opens straight to admin, no typing needed.</p>
            </div>
          </div>
        )}

        {/* ── PRODUCTS ── */}
        {activeTab === "products" && (
          <>
            {/* Add product */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-zinc-100 font-bold tracking-widest uppercase text-sm">ADD PRODUCT</h2>
                <div className="flex bg-zinc-800 rounded-lg p-0.5 border border-zinc-700">
                  {(["single", "bulk"] as const).map(m => (
                    <button key={m} onClick={() => setAddMode(m)}
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-md transition-colors tracking-wider ${addMode === m ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-white"}`}>
                      {m === "single" ? "SINGLE ITEM" : "BULK DROP"}
                    </button>
                  ))}
                </div>
              </div>

              {addMode === "single" ? (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input placeholder="Name *" value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      onKeyDown={e => e.key === "Enter" && addProduct()}
                      className="col-span-2 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-zinc-200 placeholder-zinc-500 text-sm" />
                    <input placeholder="Size (e.g. L, XL, OS)" value={form.size}
                      onChange={e => setForm(f => ({ ...f, size: e.target.value }))}
                      className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-zinc-200 placeholder-zinc-500 text-sm" />
                    <input placeholder="Price (EGP)" value={form.price} type="number"
                      onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                      className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-zinc-200 placeholder-zinc-500 text-sm" />
                    <select value={form.tag} onChange={e => setForm(f => ({ ...f, tag: e.target.value }))}
                      className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-zinc-200 text-sm">
                      {["TEE", "JORTS", "ACCESSORIES", "DROP", "GRAIL", "OUTERWEAR", "PANTS", "SHIRT"].map(t => <option key={t}>{t}</option>)}
                    </select>
                    <select value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}
                      className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-zinc-200 text-sm">
                      {["Deadstock", "Excellent", "Good", "Fair"].map(c => <option key={c}>{c}</option>)}
                    </select>
                    <textarea placeholder="Description (optional)" value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      className="col-span-2 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-zinc-200 placeholder-zinc-500 text-sm h-16 resize-none" />
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <label className="cursor-pointer bg-zinc-800 border border-dashed border-zinc-600 hover:border-zinc-200 rounded-xl px-4 py-2.5 text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
                      {uploading === "new-main" ? "Uploading..." : form.imageUrl ? "✓ Change image" : "Upload main image"}
                      <input type="file" accept="image/*" className="hidden" onChange={e => handleMainImg(e)} />
                    </label>
                    {form.imageUrl && <img src={form.imageUrl} className="w-14 h-14 object-cover rounded-xl border border-zinc-700" alt="" />}
                  </div>
                  {form.images.length > 0 && (
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {form.images.map((img, i) => (
                        <div key={i} className="relative w-14 h-14">
                          <img src={img} className="w-full h-full object-cover rounded-xl border border-zinc-700" alt="" />
                          <button onClick={() => removeExtraImgNew(i)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-900 text-white text-[10px] font-bold flex items-center justify-center hover:bg-red-700">✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <label className="cursor-pointer bg-zinc-800 border border-dashed border-zinc-600 hover:border-zinc-200 rounded-xl px-4 py-2.5 text-sm text-zinc-400 hover:text-zinc-100 transition-colors inline-block mb-4">
                    {uploading === "new-extra" ? "Uploading..." : "+ Add extra images"}
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleExtraImgNew} />
                  </label>
                  <button onClick={addProduct}
                    className="w-full sm:w-auto bg-zinc-800 hover:bg-orange-400 active:scale-95 text-white font-bold px-8 py-3 rounded-xl transition-all text-sm tracking-widest">
                    + ADD PRODUCT
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                    {bulkItems.map((item) => (
                      <div key={item.id} className="relative bg-zinc-950/80 p-4 rounded-xl border border-zinc-800/80 space-y-3 md:space-y-0 md:flex md:items-center md:gap-3">
                        {bulkItems.length > 1 && (
                          <button onClick={() => removeBulkItem(item.id)}
                            className="absolute -top-1.5 -right-1.5 md:static w-6 h-6 rounded-full border border-red-900/60 bg-red-950/20 text-red-500 hover:bg-red-900 hover:text-white transition-colors text-xs font-bold flex items-center justify-center">✕</button>
                        )}
                        <label className="cursor-pointer w-11 h-11 border border-dashed border-zinc-700 hover:border-zinc-200 rounded-lg flex items-center justify-center transition-colors text-xs text-zinc-500 hover:text-zinc-100 flex-shrink-0 overflow-hidden">
                          {uploadingBulk[item.id] ? <span className="text-[10px]">...</span>
                            : item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" alt="" />
                              : <span className="text-xl font-light">+</span>}
                          <input type="file" accept="image/*" className="hidden" onChange={e => handleBulkImgUpload(e, item.id)} />
                        </label>
                        {(item.images || []).length > 0 && (
                          <div className="flex gap-1 flex-shrink-0">
                            {item.images.map((img: string, i: number) => (
                              <div key={i} className="relative w-8 h-8">
                                <img src={img} className="w-full h-full object-cover rounded border border-zinc-700" alt="" />
                                <button onClick={() => removeBulkExtraImg(item.id, i)} className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-900 text-white text-[8px] font-bold flex items-center justify-center hover:bg-red-700">✕</button>
                              </div>
                            ))}
                          </div>
                        )}
                        <label className="cursor-pointer w-8 h-8 border border-dashed border-zinc-700 hover:border-zinc-200 rounded flex items-center justify-center transition-colors text-zinc-500 hover:text-zinc-100 flex-shrink-0">
                          {uploadingBulk[item.id + "-extra"] ? <span className="text-[10px]">...</span> : <span className="text-lg font-light">+</span>}
                          <input type="file" accept="image/*" className="hidden" onChange={e => handleBulkExtraImg(e, item.id)} />
                        </label>
                        <input placeholder="Item Name *" value={item.name}
                          onChange={e => updateBulkItem(item.id, { name: e.target.value })}
                          className="w-full md:flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-white outline-none focus:border-zinc-200 placeholder-zinc-600 text-xs" />
                        <input placeholder="Size" value={item.size}
                          onChange={e => updateBulkItem(item.id, { size: e.target.value })}
                          className="w-full md:w-20 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-white outline-none focus:border-zinc-200 placeholder-zinc-600 text-xs" />
                        <input placeholder="Price" value={item.price} type="number"
                          onChange={e => updateBulkItem(item.id, { price: e.target.value })}
                          className="w-full md:w-24 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-white outline-none focus:border-zinc-200 placeholder-zinc-600 text-xs" />
                        <select value={item.tag} onChange={e => updateBulkItem(item.id, { tag: e.target.value })}
                          className="w-full md:w-28 bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-zinc-200 text-xs">
                          {["TEE", "JORTS", "ACCESSORIES", "DROP", "GRAIL", "OUTERWEAR", "PANTS", "SHIRT"].map(t => <option key={t}>{t}</option>)}
                        </select>
                         <select value={item.condition} onChange={e => updateBulkItem(item.id, { condition: e.target.value })}
                           className="w-full md:w-24 bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-zinc-200 text-xs">
                           {["Deadstock", "Excellent", "Good", "Fair"].map(c => <option key={c}>{c}</option>)}
                         </select>
                         <textarea placeholder="Description (optional)" value={item.description || ""}
                           onChange={e => updateBulkItem(item.id, { description: e.target.value })}
                           className="w-full md:col-span-5 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-white outline-none focus:border-zinc-200 placeholder-zinc-600 text-xs" />
                       </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3 items-center justify-between mt-4">
                    <button onClick={addBulkItemRow}
                      className="text-xs font-bold text-zinc-100 border border-zinc-200/30 hover:border-zinc-200 px-4 py-2 rounded-xl transition-colors">
                      + ADD ANOTHER ITEM
                    </button>
                    <button onClick={publishBulkDrop} disabled={bulkPublishing}
                      className="bg-zinc-800 hover:bg-orange-400 active:scale-95 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-bold px-6 py-2.5 rounded-xl transition-all text-xs tracking-widest">
                      {bulkPublishing ? "Publishing..." : `Publish Drop (${bulkItems.filter(i => i.name.trim()).length} Items) ✓`}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Search by name, tag, or size…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-zinc-200 placeholder-zinc-500 text-sm mb-4"
            />

            {/* Toolbar */}
            <div className="flex flex-wrap gap-2 mb-4 items-center">
              <span className="text-zinc-100 font-bold tracking-widest text-sm mr-1">AVAILABLE ({filteredAvailable.length})</span>
              <button onClick={() => { setBulkMode(b => !b); setBulkSelected(new Set()); }}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${bulkMode ? "bg-zinc-800/20 border-zinc-200 text-zinc-100" : "border-zinc-700 text-zinc-400 hover:border-zinc-200 hover:text-zinc-100"}`}>
                {bulkMode ? "✕ Cancel bulk" : "Bulk sold"}
              </button>
              <button onClick={() => { setReorderMode(r => !r); setDragOrder(available); }}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${reorderMode ? "bg-blue-500/20 border-blue-500 text-blue-400" : "border-zinc-700 text-zinc-400 hover:border-zinc-200 hover:text-zinc-100"}`}>
                {reorderMode ? "✕ Cancel" : "⠿ Reorder"}
              </button>
              {bulkMode && bulkSelected.size > 0 && (
                <button onClick={bulkMarkSold}
                  className="text-xs font-bold px-4 py-1.5 rounded-lg bg-red-500 hover:bg-red-400 text-white transition-colors">
                  Mark {bulkSelected.size} as sold →
                </button>
              )}
              {reorderMode && (
                <button onClick={saveReorder}
                  className="text-xs font-bold px-4 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-white transition-colors">
                  Save order ✓
                </button>
              )}
            </div>

            {/* Reorder mode */}
            {reorderMode && (
              <div className="space-y-2 mb-8">
                <p className="text-zinc-500 text-xs mb-3">Drag rows to reorder. First = shows first in shop.</p>
                {dragOrder.map((p, i) => (
                  <div key={p.id} draggable
                    onDragStart={() => onDragStart(i)}
                    onDragEnter={() => onDragEnter(i)}
                    onDragEnd={onDragEnd}
                    onDragOver={e => e.preventDefault()}
                    className="flex items-center gap-3 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 cursor-grab active:cursor-grabbing active:border-blue-500 active:bg-zinc-800 transition-colors">
                    <span className="text-zinc-600 text-lg">⠿</span>
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                      {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover" alt="" />
                        : <div className="w-full h-full flex items-center justify-center text-lg">{p.emoji}</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{p.name}</p>
                      <p className="text-xs text-zinc-500">{p.tag} · {p.size || "OS"}</p>
                    </div>
                    <span className="text-xs text-zinc-600">#{i + 1}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Available list */}
            {!reorderMode && (
              <div className="space-y-3 mb-8">
                {filteredAvailable.map(p => (
                  <AdminRow key={p.id} product={p} uploading={uploading}
                    bulkMode={bulkMode} bulkSelected={bulkSelected.has(p.id)}
                    onBulkToggle={() => {
                      setBulkSelected(prev => { const n = new Set(prev); n.has(p.id) ? n.delete(p.id) : n.add(p.id); return n; });
                    }}
                    onMainImg={(e: React.ChangeEvent<HTMLInputElement>) => handleMainImg(e, p.id)}
                    onExtraImg={(e: React.ChangeEvent<HTMLInputElement>) => handleExtraImg(e, p.id, p.images || [])}
                    onRemoveImg={(i: number) => removeExtraImg(p.id, p.images || [], i)}
                    onToggle={() => toggleStatus(p.id, p.status)}
                    onQuickSell={() => quickSell(p.id)}
                    onDuplicate={() => duplicateProduct(p)}
                    onDelete={() => deleteProduct(p.id)}
                    onSave={async (price: string, label: string, condition: string, description: string) => {
                      await apiFetch(`/api/products/${p.id}`, { method: "PATCH", body: JSON.stringify({ price: price ? parseInt(price) : null, priceLabel: label || null, condition, description }) });
                      showMsg("Saved ✓"); load();
                    }}
                  />
                ))}
                {filteredAvailable.length === 0 && <p className="text-zinc-600 text-sm text-center py-8">{search ? "No results." : "No available products."}</p>}
              </div>
            )}

            {/* Sold list */}
            {sold.length > 0 && !reorderMode && (
              <>
                <h2 className="text-zinc-600 font-bold tracking-widest text-sm mb-3">SOLD ({filteredSold.length})</h2>
                <div className="space-y-3 opacity-60">
                  {filteredSold.map(p => (
                    <AdminRow key={p.id} product={p} uploading={uploading}
                      bulkMode={false} bulkSelected={false} onBulkToggle={() => { }}
                      onMainImg={(e: React.ChangeEvent<HTMLInputElement>) => handleMainImg(e, p.id)}
                      onExtraImg={(e: React.ChangeEvent<HTMLInputElement>) => handleExtraImg(e, p.id, p.images || [])}
                      onRemoveImg={(i: number) => removeExtraImg(p.id, p.images || [], i)}
                      onToggle={() => toggleStatus(p.id, p.status)}
                      onQuickSell={() => { }}
                      onDuplicate={() => duplicateProduct(p)}
                      onDelete={() => deleteProduct(p.id)}
                      onSave={async (price: string, label: string, condition: string, description: string) => {
                        await apiFetch(`/api/products/${p.id}`, { method: "PATCH", body: JSON.stringify({ price: price ? parseInt(price) : null, priceLabel: label || null, condition, description }) });
                        showMsg("Saved ✓"); load();
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── AdminRow ──────────────────────────────────────────────────────────────────
function AdminRow({ product: p, uploading, bulkMode, bulkSelected, onBulkToggle, onMainImg, onExtraImg, onRemoveImg, onToggle, onQuickSell, onDuplicate, onDelete, onSave }: any) {
  const [price, setPrice] = useState(p.price?.toString() || "");
  const [label, setLabel] = useState(p.priceLabel || "");
  const [condition, setCondition] = useState(p.condition || "Good");
  const [desc, setDesc] = useState(p.description || "");
  const [expanded, setExpanded] = useState(false);

  const allImgs = [p.imageUrl, ...(p.images || [])].filter(Boolean);

  return (
    <div className={`bg-zinc-900 border rounded-2xl overflow-hidden transition-colors ${bulkSelected ? "border-zinc-200" : p.status === "sold" ? "border-zinc-800" : "border-zinc-800 hover:border-zinc-200/20"}`}>
      <div className="flex gap-3 p-4 items-center">
        {bulkMode && (
          <button onClick={onBulkToggle}
            className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${bulkSelected ? "bg-zinc-800 border-zinc-200" : "border-zinc-600 hover:border-orange-400"}`}>
            {bulkSelected && <span className="text-white text-xs font-black">✓</span>}
          </button>
        )}
        <div className="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-zinc-800">
          {allImgs[0] ? <img src={allImgs[0]} className="w-full h-full object-cover" alt="" />
            : <div className="w-full h-full flex items-center justify-center text-2xl">{p.emoji}</div>}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate">{p.name}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {p.tag && <span className="text-xs text-zinc-500">{p.tag}</span>}
            {p.size && <span className="text-xs text-zinc-600">{p.size}</span>}
            {p.price && (
              <span className="text-xs text-zinc-100 font-bold">
                {p.price} <span className="text-[0.65em] font-sans font-bold tracking-wider text-zinc-500 ml-0.5">EGP</span>
              </span>
            )}
            {p.condition && <span className="text-xs text-zinc-600">{p.condition}</span>}
            <span className="text-xs text-zinc-700">{allImgs.length} img{allImgs.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
        {!bulkMode && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {p.status === "available" && (
              <button onClick={onQuickSell}
                className="text-xs px-3 py-1.5 rounded-lg bg-red-900/40 border border-red-800 text-red-400 hover:bg-red-900/70 font-bold transition-colors">SOLD</button>
            )}
            {p.status === "sold" && (
              <button onClick={onToggle}
                className="text-xs px-3 py-1.5 rounded-lg border border-zinc-600 text-zinc-400 hover:bg-zinc-800 font-bold transition-colors">Restore</button>
            )}
            <button onClick={() => setExpanded(e => !e)}
              className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:border-zinc-200 hover:text-zinc-100 transition-colors">
              {expanded ? "Close" : "Edit"}
            </button>
            <button onClick={onDuplicate} title="Duplicate"
              className="text-xs px-2 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:border-zinc-200 hover:text-zinc-100 transition-colors">📋</button>
            <button onClick={onDelete}
              className="text-xs px-2 py-1.5 rounded-lg border border-red-900/50 text-red-600 hover:bg-red-900/30 hover:text-red-400 transition-colors">✕</button>
          </div>
        )}
      </div>

      {expanded && !bulkMode && (
        <div className="border-t border-zinc-800 p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Price (EGP)" value={price} type="number"
              onChange={e => setPrice(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-zinc-200 placeholder-zinc-600" />
            <select value={condition} onChange={e => setCondition(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-zinc-200">
              {["Deadstock", "Excellent", "Good", "Fair"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <textarea placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-zinc-200 placeholder-zinc-600 h-16 resize-none" />
          <button onClick={() => onSave(price, label, condition, desc)}
            className="bg-zinc-800 hover:bg-orange-400 active:scale-95 text-white text-sm font-bold px-5 py-2 rounded-xl transition-all">
            Save Changes ✓
          </button>

          <div>
            <p className="text-zinc-500 text-xs tracking-widest mb-3">IMAGES</p>
            <div className="flex gap-2 flex-wrap">
              {allImgs.map((img: string, i: number) => (
                <div key={i} className="relative group">
                  <img src={img} className="w-16 h-16 object-cover rounded-xl border border-zinc-700" alt="" />
                  {i === 0 && <span className="absolute bottom-1 left-1 text-[9px] bg-zinc-800 text-white px-1 rounded font-bold">MAIN</span>}
                  {i > 0 && (
                    <button onClick={() => onRemoveImg(i - 1)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">✕</button>
                  )}
                </div>
              ))}
              <label className="w-16 h-16 border-2 border-dashed border-zinc-700 hover:border-zinc-200 rounded-xl flex items-center justify-center cursor-pointer transition-colors text-zinc-500 hover:text-zinc-100">
                {uploading === p.id || uploading === p.id + "-extra" ? <span className="text-xs">...</span> : "+"}
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => { if (!allImgs[0]) onMainImg(e); else onExtraImg(e); }} />
              </label>
            </div>
            <label className="text-xs text-zinc-500 hover:text-zinc-100 cursor-pointer transition-colors mt-2 inline-block">
              Replace main →
              <input type="file" accept="image/*" className="hidden" onChange={onMainImg} />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

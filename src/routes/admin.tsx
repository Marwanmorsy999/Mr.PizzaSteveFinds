import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";

const API = import.meta.env.VITE_API_URL || "https://pizzasteve-api.m-2396.workers.dev";
const CLOUD_NAME = "dnggmrgmu";
const UPLOAD_PRESET = "pizzasteve4";

interface Product {
  id: string; name: string; size?: string; price?: number; priceLabel?: string;
  status: string; emoji?: string; tag?: string; imageUrl?: string;
  images?: string[]; condition?: string; description?: string; sortOrder?: number;
}

export const Route = createFileRoute("/admin")({ component: AdminPage });

function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"ok" | "err">("ok");
  const [uploading, setUploading] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [savedAnnouncement, setSavedAnnouncement] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [whatsappInput, setWhatsappInput] = useState("");
  const [savedWhatsapp, setSavedWhatsapp] = useState("");
  const [activeTab, setActiveTab] = useState<"products" | "orders" | "settings">("products");
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set());
  const [reorderMode, setReorderMode] = useState(false);
  const [dragOrder, setDragOrder] = useState<Product[]>([]);
  const [form, setForm] = useState({
    name: "", size: "", price: "", tag: "TEE", emoji: "🍕",
    status: "available", condition: "Good", description: "", imageUrl: "", images: [] as string[]
  });
  const [addMode, setAddMode] = useState<"single" | "bulk">("single");
  const [bulkItems, setBulkItems] = useState<any[]>([{ id: 1, name: "", size: "", price: "", tag: "TEE", condition: "Good", imageUrl: "" }]);
  const [uploadingBulk, setUploadingBulk] = useState<Record<number, boolean>>({});
  const [bulkPublishing, setBulkPublishing] = useState(false);

  function addBulkItemRow() {
    setBulkItems(prev => [...prev, { id: Date.now(), name: "", size: "", price: "", tag: "TEE", condition: "Good", imageUrl: "" }]);
  }

  function removeBulkItem(id: number) {
    setBulkItems(prev => prev.filter(i => i.id !== id));
  }

  function updateBulkItem(id: number, patch: any) {
    setBulkItems(prev => prev.map(item => item.id === id ? { ...item, ...patch } : item));
  }

  async function handleBulkImgUpload(e: React.ChangeEvent<HTMLInputElement>, itemId: number) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploadingBulk(prev => ({ ...prev, [itemId]: true }));
    try {
      const url = await uploadImg(file);
      updateBulkItem(itemId, { imageUrl: url });
      showMsg("Image uploaded successfully");
    } catch {
      showMsg("Upload failed", "err");
    }
    setUploadingBulk(prev => ({ ...prev, [itemId]: false }));
  }

  async function publishBulkDrop() {
    const valid = bulkItems.filter(i => i.name.trim() !== "");
    if (valid.length === 0) return showMsg("At least one item with a name is required", "err");
    setBulkPublishing(true);
    try {
      const res = await fetch(`${API}/api/products/bulk`, {
        method: "POST", headers,
        body: JSON.stringify(valid)
      });
      if (res.ok) {
        showMsg(`✓ Drop published: ${valid.length} items live`);
        setBulkItems([{ id: Date.now(), name: "", size: "", price: "", tag: "TEE", condition: "Good", imageUrl: "" }]);
        load();
      } else {
        showMsg("Publish failed", "err");
      }
    } catch {
      showMsg("Publish failed", "err");
    }
    setBulkPublishing(false);
  }

  const headers = { "Content-Type": "application/json", "X-Admin-Key": "pizzasteve2024" };

  function showMsg(text: string, type: "ok" | "err" = "ok") {
    setMsg(text); setMsgType(type);
    setTimeout(() => setMsg(""), 3000);
  }

  async function load() {
    const res = await fetch(`${API}/api/products`);
    const data = await res.json();
    setProducts(data);
    setDragOrder(data.filter((p: Product) => p.status === "available"));
    try {
      const a = await fetch(`${API}/api/announcement`);
      if (a.ok) { const d = await a.json(); setAnnouncement(d.text || ""); setSavedAnnouncement(d.text || ""); }
    } catch {}
    try {
      const oRes = await fetch(`${API}/api/orders`, { headers });
      if (oRes.ok) { const oData = await oRes.json(); setOrders(oData); }
    } catch {}
    try {
      const sRes = await fetch(`${API}/api/settings`);
      if (sRes.ok) {
        const sData = await sRes.json();
        setWhatsappInput(sData.whatsapp || "");
        setSavedWhatsapp(sData.whatsapp || "");
      }
    } catch {}
  }

  async function saveWhatsapp() {
    await fetch(`${API}/api/settings`, {
      method: "POST", headers,
      body: JSON.stringify({ key: "whatsapp", value: whatsappInput })
    });
    setSavedWhatsapp(whatsappInput); showMsg("WhatsApp number saved");
  }

  async function updateOrderStatus(orderId: string, nextStatus: string) {
    const r = await fetch(`${API}/api/orders/${orderId}`, {
      method: "PATCH", headers,
      body: JSON.stringify({ status: nextStatus })
    });
    if (r.ok) {
      showMsg(`Order status updated to ${nextStatus}`);
      load();
    } else {
      showMsg("Failed to update order", "err");
    }
  }

  async function deleteOrder(orderId: string) {
    if (!confirm("Delete this order completely?")) return;
    const r = await fetch(`${API}/api/orders/${orderId}`, { method: "DELETE", headers });
    if (r.ok) {
      showMsg("Order deleted");
      load();
    } else {
      showMsg("Failed to delete order", "err");
    }
  }

  async function uploadImg(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", UPLOAD_PRESET);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: "POST", body: fd });
    return (await res.json()).secure_url;
  }

  async function handleMainImg(e: React.ChangeEvent<HTMLInputElement>, productId?: string) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(productId || "new-main");
    try {
      const url = await uploadImg(file);
      if (productId) {
        await fetch(`${API}/api/products/${productId}`, { method: "PATCH", headers, body: JSON.stringify({ imageUrl: url }) });
        load(); showMsg("Main image updated");
      } else {
        setForm(f => ({ ...f, imageUrl: url }));
      }
    } catch { showMsg("Upload failed", "err"); }
    setUploading(null);
  }

  async function handleExtraImg(e: React.ChangeEvent<HTMLInputElement>, productId: string, existingImages: string[]) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(productId + "-extra");
    try {
      const url = await uploadImg(file);
      await fetch(`${API}/api/products/${productId}`, { method: "PATCH", headers, body: JSON.stringify({ images: [...existingImages, url] }) });
      load(); showMsg("Extra image added");
    } catch { showMsg("Upload failed", "err"); }
    setUploading(null);
  }

  async function removeExtraImg(productId: string, existingImages: string[], indexToRemove: number) {
    const updated = existingImages.filter((_, i) => i !== indexToRemove);
    await fetch(`${API}/api/products/${productId}`, { method: "PATCH", headers, body: JSON.stringify({ images: updated }) });
    load(); showMsg("Image removed");
  }

  async function addProduct() {
    if (!form.name) return showMsg("Name required", "err");
    await fetch(`${API}/api/products`, {
      method: "POST", headers,
      body: JSON.stringify({ ...form, price: form.price ? parseInt(form.price) : null })
    });
    setForm({ name: "", size: "", price: "", tag: "TEE", emoji: "🍕", status: "available", condition: "Good", description: "", imageUrl: "", images: [] });
    showMsg("✓ Product added — it's live"); load();
  }

  async function quickSell(id: string) {
    await fetch(`${API}/api/products/${id}`, { method: "PATCH", headers, body: JSON.stringify({ status: "sold" }) });
    showMsg("Marked sold"); load();
  }

  async function toggleStatus(id: string, current: string) {
    const next = current === "available" ? "sold" : "available";
    await fetch(`${API}/api/products/${id}`, { method: "PATCH", headers, body: JSON.stringify({ status: next }) });
    load();
  }

  async function deleteProduct(id: string) {
    if (!confirm("Delete this product?")) return;
    await fetch(`${API}/api/products/${id}`, { method: "DELETE", headers });
    showMsg("Deleted"); load();
  }

  async function saveAnnouncement() {
    await fetch(`${API}/api/announcement`, { method: "POST", headers, body: JSON.stringify({ text: announcement }) });
    setSavedAnnouncement(announcement); showMsg("Banner saved");
  }

  async function bulkMarkSold() {
    if (bulkSelected.size === 0) return;
    await fetch(`${API}/api/products/bulk-sold`, {
      method: "POST", headers,
      body: JSON.stringify({ ids: Array.from(bulkSelected) })
    });
    showMsg(`✓ ${bulkSelected.size} item${bulkSelected.size > 1 ? "s" : ""} marked sold`);
    setBulkSelected(new Set());
    setBulkMode(false);
    load();
  }

  async function saveReorder() {
    await fetch(`${API}/api/products/reorder`, {
      method: "POST", headers,
      body: JSON.stringify({ order: dragOrder.map(p => p.id) })
    });
    showMsg("Order saved"); setReorderMode(false); load();
  }

  // Drag to reorder
  const dragItem = useRef<number | null>(null);
  const dragOver = useRef<number | null>(null);

  function onDragStart(i: number) { dragItem.current = i; }
  function onDragEnter(i: number) {
    dragOver.current = i;
    const copy = [...dragOrder];
    const dragged = copy.splice(dragItem.current!, 1)[0];
    copy.splice(i, 0, dragged);
    dragItem.current = i;
    setDragOrder(copy);
  }
  function onDragEnd() { dragItem.current = null; dragOver.current = null; }

  function toggleBulkSelect(id: string) {
    setBulkSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function login() {
    if (pass === "pizzasteve2024") { setAuthed(true); load(); }
    else showMsg("Wrong password", "err");
  }

  if (!authed) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-sm">
        <div className="text-4xl mb-6 text-center">🍕</div>
        <input type="password" placeholder="Password" value={pass}
          onChange={e => setPass(e.target.value)}
          onKeyDown={e => e.key === "Enter" && login()}
          className="w-full bg-zinc-800 text-white border border-zinc-700 rounded-xl px-4 py-3 mb-4 outline-none focus:border-zinc-200 placeholder-zinc-500" />
        {msg && <p className="text-red-400 text-sm mb-3 text-center">{msg}</p>}
        <button onClick={login} className="w-full bg-zinc-800 hover:bg-orange-400 text-white font-bold py-3 rounded-xl transition-colors">Enter</button>
      </div>
    </div>
  );

  const available = products.filter(p => p.status === "available");
  const sold = products.filter(p => p.status === "sold");

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black tracking-widest">🍕 ADMIN</h1>
          {msg && (
            <span className={`text-sm px-3 py-1 rounded-full border ${msgType === "ok" ? "text-zinc-100 bg-zinc-800/10 border-zinc-200/20" : "text-red-400 bg-red-500/10 border-red-500/20"}`}>
              {msg}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "TOTAL", value: products.length },
            { label: "LIVE", value: available.length, color: "text-emerald-400" },
            { label: "SOLD", value: sold.length, color: "text-zinc-500" },
          ].map(s => (
            <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
              <div className={`text-xl font-black ${s.color || "text-zinc-100"}`}>{s.value}</div>
              <div className="text-zinc-500 text-xs tracking-widest">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {(["products", "orders", "settings"] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`text-xs font-bold tracking-widest px-4 py-2 rounded-full border transition-colors ${activeTab === t ? "bg-zinc-800 border-zinc-200 text-white" : "border-zinc-700 text-zinc-400 hover:border-zinc-200"}`}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-zinc-100 font-bold tracking-widest text-sm">CUSTOMER RESERVATIONS ({orders.length})</span>
            </div>
            
            <div className="space-y-4">
              {orders.map((order: any) => {
                const itemNames = order.items.map((i: any) => `${i.name}${i.size ? ` (${i.size})` : ""}`).join(", ");
                const waChatMsg = encodeURIComponent(`Hi ${order.customerName}! This is Steve from Mr. Pizza Steve Finds. Confirming your reservation #${order.id} for: ${itemNames}.`);
                const customerWaLink = `https://wa.me/${order.customerPhone.startsWith("0") ? `2${order.customerPhone}` : order.customerPhone}?text=${waChatMsg}`;

                return (
                  <div key={order.id} className={`bg-zinc-900 border rounded-2xl p-6 space-y-4 transition-colors ${
                    order.status === "completed" ? "border-zinc-800 bg-zinc-900/40 opacity-75" : 
                    order.status === "cancelled" ? "border-red-950/40 bg-zinc-900/20 opacity-50" : 
                    "border-zinc-200/35 shadow-lg shadow-orange-500/5"
                  }`}>
                    {/* Header */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-zinc-100 font-black text-sm">{order.id}</span>
                        <span className="text-zinc-500 text-xs">{new Date(order.createdAt).toLocaleString()}</span>
                      </div>
                      <span className={`text-xs font-black tracking-widest px-3 py-1 rounded-full border ${
                        order.status === "completed" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
                        order.status === "cancelled" ? "text-red-400 bg-red-500/10 border-red-500/20" :
                        "text-zinc-100 bg-zinc-800/10 border-zinc-200/20"
                      }`}>
                        {order.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Customer details */}
                    <div className="grid md:grid-cols-2 gap-4 bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/60 text-sm">
                      <div>
                        <p className="text-zinc-500 text-xs tracking-wider uppercase mb-1">CUSTOMER DETAILS</p>
                        <p className="font-bold text-white text-base">{order.customerName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <a href={`tel:${order.customerPhone}`} className="text-zinc-400 hover:text-white underline">{order.customerPhone}</a>
                          <a href={customerWaLink} target="_blank" rel="noreferrer" className="text-emerald-400 hover:text-emerald-300 font-bold text-xs bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1 transition-colors">
                            💬 Message
                          </a>
                        </div>
                      </div>
                      <div>
                        <p className="text-zinc-500 text-xs tracking-wider uppercase mb-1">FULFILLMENT</p>
                        <p className="text-zinc-300">{order.pickup ? "📍 Zamalek Pickup" : `🚚 Delivery: ${order.address}`}</p>
                        {order.notes && (
                          <p className="text-zinc-400 text-xs italic mt-1.5"><span className="text-zinc-500 not-italic">Notes:</span> "{order.notes}"</p>
                        )}
                      </div>
                    </div>

                    {/* Items */}
                    <div>
                      <p className="text-zinc-500 text-xs tracking-wider uppercase mb-2">RESERVED ITEMS</p>
                      <div className="divide-y divide-zinc-800 bg-zinc-950/30 rounded-xl border border-zinc-800/40 overflow-hidden">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center px-4 py-3 text-sm">
                            <div>
                              <p className="font-bold text-zinc-100">{item.name}</p>
                              {item.size && <p className="text-zinc-500 text-xs">Size: {item.size}</p>}
                            </div>
                            <span className="text-zinc-100 font-mono font-bold">
                              {item.price ? `${item.price} EGP` : item.priceLabel || "DM price"}
                            </span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center px-4 py-3 bg-zinc-950/70 border-t border-zinc-800">
                          <span className="text-zinc-400 font-bold">Total</span>
                          <span className="text-zinc-100 font-black text-base font-mono">
                            {order.total > 0 ? `${order.total} EGP` : "TBC"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap justify-between items-center border-t border-zinc-800 pt-4">
                      <div className="flex gap-2">
                        {order.status === "pending" && (
                          <>
                            <button onClick={() => updateOrderStatus(order.id, "completed")}
                              className="text-xs px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors">
                              ✓ Completed
                            </button>
                            <button onClick={() => updateOrderStatus(order.id, "cancelled")}
                              className="text-xs px-4 py-2 border border-red-900/60 text-red-400 hover:bg-red-950/20 font-bold rounded-lg transition-colors">
                              ✕ Cancel Reservation
                            </button>
                          </>
                        )}
                        {order.status === "completed" && (
                          <>
                            <button onClick={() => updateOrderStatus(order.id, "pending")}
                              className="text-xs px-4 py-2 border border-zinc-700 text-zinc-400 hover:bg-zinc-800 font-bold rounded-lg transition-colors">
                              Restore to Pending
                            </button>
                            <button onClick={() => updateOrderStatus(order.id, "cancelled")}
                              className="text-xs px-4 py-2 border border-red-900/60 text-red-400 hover:bg-red-950/20 font-bold rounded-lg transition-colors">
                              ✕ Cancel Reservation
                            </button>
                          </>
                        )}
                        {order.status === "cancelled" && (
                          <button onClick={() => updateOrderStatus(order.id, "pending")}
                            className="text-xs px-4 py-2 bg-zinc-800 hover:bg-zinc-800 text-white font-bold rounded-lg transition-colors">
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
              
              {orders.length === 0 && (
                <p className="text-zinc-600 text-sm text-center py-12">No reservations placed yet.</p>
              )}
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <div className="space-y-6 mb-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-zinc-100 font-bold tracking-widest mb-1">ANNOUNCEMENT BANNER</h2>
              <p className="text-zinc-500 text-xs mb-4">Shows at the top of the homepage. Leave empty to hide.</p>
              <input value={announcement} onChange={e => setAnnouncement(e.target.value)}
                placeholder="e.g. New drop this Friday — come through!"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:border-zinc-200 placeholder-zinc-500 mb-3" />
              {savedAnnouncement && (
                <p className="text-zinc-600 text-xs mb-3">Live: "{savedAnnouncement}"</p>
              )}
              <div className="flex gap-3">
                <button onClick={saveAnnouncement} className="bg-zinc-800 hover:bg-orange-400 text-white font-bold px-6 py-2 rounded-xl transition-colors">Save Banner</button>
                {savedAnnouncement && (
                  <button onClick={() => { setAnnouncement(""); saveAnnouncement(); }}
                    className="border border-zinc-700 hover:border-red-700 text-zinc-400 hover:text-red-400 font-bold px-4 py-2 rounded-xl transition-colors text-sm">
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-zinc-100 font-bold tracking-widest mb-1">WHATSAPP RECEIVER NUMBER</h2>
              <p className="text-zinc-500 text-xs mb-4">The WhatsApp number (including country code, e.g. 201012345678) where reservation notifications will be sent.</p>
              <input value={whatsappInput} onChange={e => setWhatsappInput(e.target.value)}
                placeholder="e.g. 201012345678"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:border-zinc-200 placeholder-zinc-500 mb-3" />
              {savedWhatsapp && (
                <p className="text-zinc-600 text-xs mb-3">Currently active: {savedWhatsapp}</p>
              )}
              <button onClick={saveWhatsapp} className="bg-zinc-800 hover:bg-orange-400 text-white font-bold px-6 py-2 rounded-xl transition-colors">Save Number</button>
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === "products" && (
          <>
            {/* Add product form */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-zinc-100 font-bold tracking-widest uppercase text-sm">ADD PRODUCT</h2>
                <div className="flex bg-zinc-800 rounded-lg p-0.5 border border-zinc-700">
                  <button onClick={() => setAddMode("single")}
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-md transition-colors tracking-wider ${addMode === "single" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"}`}>
                    SINGLE ITEM
                  </button>
                  <button onClick={() => setAddMode("bulk")}
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-md transition-colors tracking-wider ${addMode === "bulk" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"}`}>
                    BULK DROP
                  </button>
                </div>
              </div>

              {addMode === "single" ? (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input placeholder="Name *" value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      onKeyDown={e => e.key === "Enter" && addProduct()}
                      className="col-span-2 bg-zinc-805 border border-zinc-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-zinc-200 placeholder-zinc-500 text-sm" />
                    <input placeholder="Size (e.g. L, XL, OS)" value={form.size}
                      onChange={e => setForm(f => ({ ...f, size: e.target.value }))}
                      className="bg-zinc-805 border border-zinc-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-zinc-200 placeholder-zinc-500 text-sm" />
                    <input placeholder="Price (EGP)" value={form.price} type="number"
                      onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                      className="bg-zinc-805 border border-zinc-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-zinc-200 placeholder-zinc-500 text-sm" />
                    <select value={form.tag} onChange={e => setForm(f => ({ ...f, tag: e.target.value }))}
                      className="bg-zinc-805 border border-zinc-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-zinc-200 text-sm">
                      {["TEE","JORTS","ACCESSORIES","DROP","GRAIL","OUTERWEAR","PANTS","SHIRT"].map(t => <option key={t}>{t}</option>)}
                    </select>
                    <select value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}
                      className="bg-zinc-805 border border-zinc-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-zinc-200 text-sm">
                      {["Deadstock","Excellent","Good","Fair"].map(c => <option key={c}>{c}</option>)}
                    </select>
                    <textarea placeholder="Description (optional)" value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      className="col-span-2 bg-zinc-805 border border-zinc-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-zinc-200 placeholder-zinc-500 text-sm h-16 resize-none" />
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <label className="cursor-pointer bg-zinc-805 border border-dashed border-zinc-600 hover:border-zinc-200 rounded-xl px-4 py-2.5 text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
                      {uploading === "new-main" ? "Uploading..." : form.imageUrl ? "✓ Change image" : "Upload main image"}
                      <input type="file" accept="image/*" className="hidden" onChange={e => handleMainImg(e)} />
                    </label>
                    {form.imageUrl && <img src={form.imageUrl} className="w-14 h-14 object-cover rounded-xl border border-zinc-700" alt="" />}
                  </div>
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
                        {/* Remove button */}
                        {bulkItems.length > 1 && (
                          <button onClick={() => removeBulkItem(item.id)}
                            className="absolute -top-1.5 -right-1.5 md:static w-6 h-6 rounded-full border border-red-900/60 bg-red-950/20 text-red-500 hover:bg-red-900 hover:text-white transition-colors flex items-center justify-center text-xs font-bold flex-shrink-0">
                            ✕
                          </button>
                        )}

                        {/* Thumbnail & Upload */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <label className="cursor-pointer w-11 h-11 border border-dashed border-zinc-700 hover:border-zinc-200 rounded-lg flex items-center justify-center transition-colors text-zinc-500 hover:text-zinc-100 relative overflow-hidden bg-zinc-900">
                            {uploadingBulk[item.id] ? (
                              <span className="text-[10px]">...</span>
                            ) : item.imageUrl ? (
                              <img src={item.imageUrl} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <span className="text-xl font-light">+</span>
                            )}
                            <input type="file" accept="image/*" className="hidden"
                              onChange={e => handleBulkImgUpload(e, item.id)} />
                          </label>
                        </div>

                        {/* Name */}
                        <input placeholder="Item Name *" value={item.name}
                          onChange={e => updateBulkItem(item.id, { name: e.target.value })}
                          className="w-full md:flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-white outline-none focus:border-zinc-200 placeholder-zinc-600 text-xs" />

                        {/* Size */}
                        <input placeholder="Size" value={item.size}
                          onChange={e => updateBulkItem(item.id, { size: e.target.value })}
                          className="w-full md:w-20 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-white outline-none focus:border-zinc-200 placeholder-zinc-600 text-xs" />

                        {/* Price */}
                        <input placeholder="Price" value={item.price} type="number"
                          onChange={e => updateBulkItem(item.id, { price: e.target.value })}
                          className="w-full md:w-24 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-white outline-none focus:border-zinc-200 placeholder-zinc-650 text-xs" />

                        {/* Tag */}
                        <select value={item.tag} onChange={e => updateBulkItem(item.id, { tag: e.target.value })}
                          className="w-full md:w-28 bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-zinc-200 text-xs">
                          {["TEE","JORTS","ACCESSORIES","DROP","GRAIL","OUTERWEAR","PANTS","SHIRT"].map(t => <option key={t}>{t}</option>)}
                        </select>

                        {/* Condition */}
                        <select value={item.condition} onChange={e => updateBulkItem(item.id, { condition: e.target.value })}
                          className="w-full md:w-24 bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-zinc-200 text-xs">
                          {["Deadstock","Excellent","Good","Fair"].map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3 mt-4 items-center justify-between">
                    <button onClick={addBulkItemRow}
                      className="text-xs font-bold text-zinc-100 hover:text-zinc-100 border border-zinc-200/30 hover:border-zinc-200 px-4 py-2 rounded-xl transition-colors">
                      + ADD ANOTHER ITEM
                    </button>
                    <button onClick={publishBulkDrop} disabled={bulkPublishing}
                      className="bg-zinc-800 hover:bg-orange-400 active:scale-95 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-bold px-6 py-2.5 rounded-xl transition-all text-xs tracking-wider uppercase">
                      {bulkPublishing ? "Publishing Drop..." : `Publish Drop (${bulkItems.filter(i => i.name.trim() !== "").length} Items) ✓`}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap gap-2 mb-4 items-center">
              <span className="text-zinc-100 font-bold tracking-widest text-sm mr-1">AVAILABLE ({available.length})</span>
              <button onClick={() => { setBulkMode(b => !b); setBulkSelected(new Set()); }}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${bulkMode ? "bg-zinc-800/20 border-zinc-200 text-zinc-100" : "border-zinc-700 text-zinc-400 hover:border-zinc-200 hover:text-zinc-100"}`}>
                {bulkMode ? "✕ Cancel bulk" : "Bulk sold"}
              </button>
              <button onClick={() => { setReorderMode(r => !r); setDragOrder(available); }}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${reorderMode ? "bg-blue-500/20 border-blue-500 text-blue-400" : "border-zinc-700 text-zinc-400 hover:border-blue-500 hover:text-blue-400"}`}>
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
                  <div key={p.id}
                    draggable
                    onDragStart={() => onDragStart(i)}
                    onDragEnter={() => onDragEnter(i)}
                    onDragEnd={onDragEnd}
                    onDragOver={e => e.preventDefault()}
                    className="flex items-center gap-3 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 cursor-grab active:cursor-grabbing active:border-blue-500 active:bg-zinc-800 transition-colors select-none">
                    <span className="text-zinc-600 text-lg">⠿</span>
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                      {p.imageUrl
                        ? <img src={p.imageUrl} className="w-full h-full object-cover" alt="" />
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

            {/* Normal product list */}
            {!reorderMode && (
              <div className="space-y-3 mb-8">
                {available.map(p => (
                  <AdminRow key={p.id} product={p} uploading={uploading}
                    bulkMode={bulkMode}
                    bulkSelected={bulkSelected.has(p.id)}
                    onBulkToggle={() => toggleBulkSelect(p.id)}
                    onMainImg={e => handleMainImg(e, p.id)}
                    onExtraImg={e => handleExtraImg(e, p.id, p.images || [])}
                    onRemoveImg={i => removeExtraImg(p.id, p.images || [], i)}
                    onToggle={() => toggleStatus(p.id, p.status)}
                    onQuickSell={() => quickSell(p.id)}
                    onDelete={() => deleteProduct(p.id)}
                    onSave={async (price: string, label: string, condition: string, description: string) => {
                      await fetch(`${API}/api/products/${p.id}`, { method: "PATCH", headers, body: JSON.stringify({ price: price ? parseInt(price) : null, priceLabel: label || null, condition, description }) });
                      showMsg("Saved ✓"); load();
                    }}
                  />
                ))}
                {available.length === 0 && (
                  <p className="text-zinc-600 text-sm text-center py-8">No available products. Add one above.</p>
                )}
              </div>
            )}

            {/* Sold section */}
            {sold.length > 0 && !reorderMode && (
              <>
                <h2 className="text-zinc-600 font-bold tracking-widest text-sm mb-3">SOLD ({sold.length})</h2>
                <div className="space-y-3 opacity-60">
                  {sold.map(p => (
                    <AdminRow key={p.id} product={p} uploading={uploading}
                      bulkMode={false} bulkSelected={false}
                      onBulkToggle={() => {}}
                      onMainImg={e => handleMainImg(e, p.id)}
                      onExtraImg={e => handleExtraImg(e, p.id, p.images || [])}
                      onRemoveImg={i => removeExtraImg(p.id, p.images || [], i)}
                      onToggle={() => toggleStatus(p.id, p.status)}
                      onQuickSell={() => {}}
                      onDelete={() => deleteProduct(p.id)}
                      onSave={async (price: string, label: string, condition: string, description: string) => {
                        await fetch(`${API}/api/products/${p.id}`, { method: "PATCH", headers, body: JSON.stringify({ price: price ? parseInt(price) : null, priceLabel: label || null, condition, description }) });
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

function AdminRow({ product: p, uploading, bulkMode, bulkSelected, onBulkToggle, onMainImg, onExtraImg, onRemoveImg, onToggle, onQuickSell, onDelete, onSave }: any) {
  const [price, setPrice] = useState(p.price?.toString() || "");
  const [label, setLabel] = useState(p.priceLabel || "");
  const [condition, setCondition] = useState(p.condition || "Good");
  const [desc, setDesc] = useState(p.description || "");
  const [expanded, setExpanded] = useState(false);

  const allImgs = [p.imageUrl, ...(p.images || [])].filter(Boolean);

  return (
    <div className={`bg-zinc-900 border rounded-2xl overflow-hidden transition-colors ${bulkSelected ? "border-zinc-200" : p.status === "sold" ? "border-zinc-800" : "border-zinc-800 hover:border-zinc-700"}`}>
      <div className="flex gap-3 p-4 items-center">

        {/* Bulk checkbox */}
        {bulkMode && (
          <button onClick={onBulkToggle}
            className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${bulkSelected ? "bg-zinc-800 border-zinc-200" : "border-zinc-600 hover:border-orange-400"}`}>
            {bulkSelected && <span className="text-white text-xs font-black">✓</span>}
          </button>
        )}

        {/* Thumbnail */}
        <div className="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-zinc-800">
          {allImgs[0]
            ? <img src={allImgs[0]} className="w-full h-full object-cover" alt="" />
            : <div className="w-full h-full flex items-center justify-center text-2xl">{p.emoji}</div>}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate">{p.name}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-zinc-500">{p.tag}</span>
            {p.size && <span className="text-xs text-zinc-600">{p.size}</span>}
            {p.price && <span className="text-xs text-zinc-100 font-bold">{p.price} EGP</span>}
            <span className="text-xs text-zinc-700">{allImgs.length} img{allImgs.length !== 1 ? "s" : ""}</span>
          </div>
        </div>

        {/* Actions */}
        {!bulkMode && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Quick sell — only for available */}
            {p.status === "available" && (
              <button onClick={onQuickSell}
                className="text-xs px-3 py-1.5 rounded-lg bg-red-900/40 border border-red-800 text-red-400 hover:bg-red-900/70 font-bold transition-colors">
                SOLD
              </button>
            )}
            {/* Restore if sold */}
            {p.status === "sold" && (
              <button onClick={onToggle}
                className="text-xs px-3 py-1.5 rounded-lg border border-zinc-600 text-zinc-400 hover:bg-zinc-800 font-bold transition-colors">
                Restore
              </button>
            )}
            <button onClick={() => setExpanded(e => !e)}
              className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:border-zinc-200 hover:text-zinc-100 transition-colors">
              {expanded ? "Close" : "Edit"}
            </button>
            <button onClick={onDelete}
              className="text-xs px-2 py-1.5 rounded-lg border border-red-900/50 text-red-600 hover:bg-red-900/30 hover:text-red-400 transition-colors">
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Expanded edit panel */}
      {expanded && !bulkMode && (
        <div className="border-t border-zinc-800 p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Price (EGP)" value={price} type="number"
              onChange={e => setPrice(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-zinc-200 placeholder-zinc-600" />
            <select value={condition} onChange={e => setCondition(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-zinc-200">
              {["Deadstock","Excellent","Good","Fair"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <textarea placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-zinc-200 placeholder-zinc-600 h-16 resize-none" />
          <button onClick={() => onSave(price, label, condition, desc)}
            className="bg-zinc-800 hover:bg-orange-400 active:scale-95 text-white text-sm font-bold px-5 py-2 rounded-xl transition-all">
            Save Changes ✓
          </button>

          {/* Images */}
          <div>
            <p className="text-zinc-500 text-xs tracking-widest mb-3">IMAGES</p>
            <div className="flex gap-2 flex-wrap">
              {allImgs.map((img: string, i: number) => (
                <div key={i} className="relative group">
                  <img src={img} className="w-16 h-16 object-cover rounded-xl border border-zinc-700" alt="" />
                  {i === 0 && <span className="absolute bottom-1 left-1 text-[9px] bg-zinc-800 text-white px-1 rounded font-bold">MAIN</span>}
                  {i > 0 && (
                    <button onClick={() => onRemoveImg(i - 1)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold">
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <label className="w-16 h-16 border-2 border-dashed border-zinc-700 hover:border-zinc-200 rounded-xl flex items-center justify-center cursor-pointer transition-colors text-zinc-500 hover:text-zinc-100 text-2xl">
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


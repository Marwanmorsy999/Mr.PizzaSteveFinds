import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "https://pizzasteve-api.m-2396.workers.dev";
const CLOUD_NAME = "dnggmrgmu";
const UPLOAD_PRESET = "pizzasteve4";

interface Product {
  id: string; name: string; size?: string; price?: number; priceLabel?: string;
  status: string; emoji?: string; tag?: string; imageUrl?: string;
  images?: string[]; condition?: string; description?: string;
}

export const Route = createFileRoute("/admin")({ component: AdminPage });

function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [msg, setMsg] = useState("");
  const [uploading, setUploading] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [savedAnnouncement, setSavedAnnouncement] = useState("");
  const [activeTab, setActiveTab] = useState<"products" | "settings">("products");
  const [form, setForm] = useState({
    name: "", size: "", price: "", tag: "TEE", emoji: "🍕",
    status: "available", condition: "Good", description: "", imageUrl: "", images: [] as string[]
  });

  const headers = { "Content-Type": "application/json", "X-Admin-Key": "pizzasteve2024" };

  function showMsg(text: string) {
    setMsg(text);
    setTimeout(() => setMsg(""), 3000);
  }

  async function load() {
    const res = await fetch(`${API}/api/products`);
    setProducts(await res.json());
    try {
      const a = await fetch(`${API}/api/announcement`);
      if (a.ok) { const d = await a.json(); setAnnouncement(d.text || ""); setSavedAnnouncement(d.text || ""); }
    } catch {}
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
    } catch { showMsg("Upload failed"); }
    setUploading(null);
  }

  async function handleExtraImg(e: React.ChangeEvent<HTMLInputElement>, productId: string, existingImages: string[]) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(productId + "-extra");
    try {
      const url = await uploadImg(file);
      await fetch(`${API}/api/products/${productId}`, { method: "PATCH", headers, body: JSON.stringify({ images: [...existingImages, url] }) });
      load(); showMsg("Extra image added");
    } catch { showMsg("Upload failed"); }
    setUploading(null);
  }

  async function removeExtraImg(productId: string, existingImages: string[], indexToRemove: number) {
    const updated = existingImages.filter((_, i) => i !== indexToRemove);
    await fetch(`${API}/api/products/${productId}`, { method: "PATCH", headers, body: JSON.stringify({ images: updated }) });
    load(); showMsg("Image removed");
  }

  async function addProduct() {
    if (!form.name) return showMsg("Name required");
    await fetch(`${API}/api/products`, {
      method: "POST", headers,
      body: JSON.stringify({ ...form, price: form.price ? parseInt(form.price) : null })
    });
    setForm({ name: "", size: "", price: "", tag: "TEE", emoji: "🍕", status: "available", condition: "Good", description: "", imageUrl: "", images: [] });
    showMsg("Product added"); load();
  }

  async function toggleStatus(id: string, current: string) {
    await fetch(`${API}/api/products/${id}`, { method: "PATCH", headers, body: JSON.stringify({ status: current === "available" ? "sold" : "available" }) });
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

  function login() {
    if (pass === "pizzasteve2024") { setAuthed(true); load(); }
    else showMsg("Wrong password");
  }

  if (!authed) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-sm">
        <div className="text-4xl mb-6 text-center">🍕</div>
        <input type="password" placeholder="Password" value={pass}
          onChange={e => setPass(e.target.value)}
          onKeyDown={e => e.key === "Enter" && login()}
          className="w-full bg-zinc-800 text-white border border-zinc-700 rounded-xl px-4 py-3 mb-4 outline-none focus:border-orange-500 placeholder-zinc-500" />
        {msg && <p className="text-red-400 text-sm mb-3 text-center">{msg}</p>}
        <button onClick={login} className="w-full bg-orange-500 hover:bg-orange-400 text-white font-bold py-3 rounded-xl transition-colors">Enter</button>
      </div>
    </div>
  );

  const available = products.filter(p => p.status === "available");
  const sold = products.filter(p => p.status === "sold");

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black tracking-widest">🍕 ADMIN</h1>
          {msg && (
            <span className="text-orange-400 text-sm bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">
              {msg}
            </span>
          )}
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "TOTAL", value: products.length },
            { label: "AVAILABLE", value: available.length },
            { label: "SOLD", value: sold.length },
          ].map(s => (
            <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
              <div className="text-xl font-black text-orange-400">{s.value}</div>
              <div className="text-zinc-500 text-xs tracking-widest">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {(["products", "settings"] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`text-xs font-bold tracking-widest px-4 py-2 rounded-full border transition-colors ${activeTab === t ? "bg-orange-500 border-orange-500 text-white" : "border-zinc-700 text-zinc-400 hover:border-orange-500"}`}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {activeTab === "settings" && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
            <h2 className="text-orange-400 font-bold tracking-widest mb-1">ANNOUNCEMENT BANNER</h2>
            <p className="text-zinc-500 text-xs mb-4">Shows at the top of the homepage. Leave empty to hide.</p>
            <input value={announcement} onChange={e => setAnnouncement(e.target.value)}
              placeholder="e.g. New drop this Friday — come through!"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500 placeholder-zinc-500 mb-3" />
            {savedAnnouncement && (
              <p className="text-zinc-600 text-xs mb-3">Live: "{savedAnnouncement}"</p>
            )}
            <div className="flex gap-3">
              <button onClick={saveAnnouncement} className="bg-orange-500 hover:bg-orange-400 text-white font-bold px-6 py-2 rounded-xl transition-colors">Save Banner</button>
              {savedAnnouncement && (
                <button onClick={() => { setAnnouncement(""); saveAnnouncement(); }} className="border border-zinc-700 hover:border-red-700 text-zinc-400 hover:text-red-400 font-bold px-4 py-2 rounded-xl transition-colors text-sm">Clear</button>
              )}
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <>
            {/* Add form */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
              <h2 className="text-orange-400 font-bold tracking-widest mb-4">ADD PRODUCT</h2>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input placeholder="Name *" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="col-span-2 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-orange-500 placeholder-zinc-500 text-sm" />
                <input placeholder="Size (e.g. L, XL, OS)" value={form.size}
                  onChange={e => setForm(f => ({ ...f, size: e.target.value }))}
                  className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-orange-500 placeholder-zinc-500 text-sm" />
                <input placeholder="Price (EGP)" value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-orange-500 placeholder-zinc-500 text-sm" />
                <select value={form.tag} onChange={e => setForm(f => ({ ...f, tag: e.target.value }))}
                  className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-orange-500 text-sm">
                  {["TEE","JORTS","ACCESSORIES","DROP","GRAIL","OUTERWEAR","PANTS","SHIRT"].map(t => <option key={t}>{t}</option>)}
                </select>
                <select value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}
                  className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-orange-500 text-sm">
                  {["Deadstock","Excellent","Good","Fair"].map(c => <option key={c}>{c}</option>)}
                </select>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="col-span-2 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-orange-500 text-sm">
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                </select>
                <textarea placeholder="Description (optional)" value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="col-span-2 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-orange-500 placeholder-zinc-500 text-sm h-20 resize-none" />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <label className="cursor-pointer bg-zinc-800 border border-dashed border-zinc-600 hover:border-orange-500 rounded-xl px-4 py-2.5 text-sm text-zinc-400 hover:text-orange-400 transition-colors">
                  {uploading === "new-main" ? "Uploading..." : form.imageUrl ? "✓ Change image" : "Upload main image"}
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleMainImg(e)} />
                </label>
                {form.imageUrl && <img src={form.imageUrl} className="w-14 h-14 object-cover rounded-xl border border-zinc-700" />}
              </div>
              <button onClick={addProduct}
                className="bg-orange-500 hover:bg-orange-400 text-white font-bold px-6 py-2.5 rounded-xl transition-colors">
                Add Product
              </button>
            </div>

            {/* Available */}
            <div className="mb-2 flex items-center gap-3">
              <h2 className="text-orange-400 font-bold tracking-widest text-sm">AVAILABLE ({available.length})</h2>
            </div>
            <div className="space-y-3 mb-8">
              {available.map(p => (
                <AdminRow key={p.id} product={p} uploading={uploading}
                  onMainImg={e => handleMainImg(e, p.id)}
                  onExtraImg={e => handleExtraImg(e, p.id, p.images || [])}
                  onRemoveImg={(i) => removeExtraImg(p.id, p.images || [], i)}
                  onToggle={() => toggleStatus(p.id, p.status)}
                  onDelete={() => deleteProduct(p.id)}
                  onSave={async (price, label, condition, description) => {
                    await fetch(`${API}/api/products/${p.id}`, { method: "PATCH", headers, body: JSON.stringify({ price: price ? parseInt(price) : null, priceLabel: label || null, condition, description }) });
                    showMsg("Saved"); load();
                  }}
                />
              ))}
            </div>

            {/* Sold */}
            {sold.length > 0 && (
              <>
                <h2 className="text-zinc-600 font-bold tracking-widest text-sm mb-3">SOLD ({sold.length})</h2>
                <div className="space-y-3 opacity-60">
                  {sold.map(p => (
                    <AdminRow key={p.id} product={p} uploading={uploading}
                      onMainImg={e => handleMainImg(e, p.id)}
                      onExtraImg={e => handleExtraImg(e, p.id, p.images || [])}
                      onRemoveImg={(i) => removeExtraImg(p.id, p.images || [], i)}
                      onToggle={() => toggleStatus(p.id, p.status)}
                      onDelete={() => deleteProduct(p.id)}
                      onSave={async (price, label, condition, description) => {
                        await fetch(`${API}/api/products/${p.id}`, { method: "PATCH", headers, body: JSON.stringify({ price: price ? parseInt(price) : null, priceLabel: label || null, condition, description }) });
                        showMsg("Saved"); load();
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

function AdminRow({ product: p, uploading, onMainImg, onExtraImg, onRemoveImg, onToggle, onDelete, onSave }: any) {
  const [price, setPrice] = useState(p.price?.toString() || "");
  const [label, setLabel] = useState(p.priceLabel || "");
  const [condition, setCondition] = useState(p.condition || "Good");
  const [desc, setDesc] = useState(p.description || "");
  const [expanded, setExpanded] = useState(false);

  const allImgs = [p.imageUrl, ...(p.images || [])].filter(Boolean);
  const extraImgs: string[] = p.images || [];

  return (
    <div className={`bg-zinc-900 border rounded-2xl overflow-hidden ${p.status === "sold" ? "border-zinc-800" : "border-zinc-800 hover:border-zinc-700"} transition-colors`}>
      {/* Header row */}
      <div className="flex gap-3 p-4 items-center">
        <div className="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-zinc-800">
          {allImgs[0]
            ? <img src={allImgs[0]} className="w-full h-full object-cover" alt="" />
            : <div className="w-full h-full flex items-center justify-center text-2xl">{p.emoji}</div>}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate">{p.name}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-zinc-500">{p.tag}</span>
            {p.size && <span className="text-xs text-zinc-600">{p.size}</span>}
            {p.price && <span className="text-xs text-orange-400">{p.price} EGP</span>}
            <span className="text-xs text-zinc-600">{allImgs.length} img{allImgs.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={onToggle}
            className={`text-xs px-3 py-1.5 rounded-lg border font-bold transition-colors ${p.status === "available" ? "border-green-700 text-green-400 hover:bg-green-900/30" : "border-zinc-600 text-zinc-400 hover:bg-zinc-800"}`}>
            {p.status === "available" ? "Live" : "Sold"}
          </button>
          <button onClick={() => setExpanded(e => !e)}
            className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:border-orange-500 hover:text-orange-400 transition-colors">
            {expanded ? "Close" : "Edit"}
          </button>
          <button onClick={onDelete}
            className="text-xs px-2 py-1.5 rounded-lg border border-red-900 text-red-500 hover:bg-red-900/30 transition-colors">
            ✕
          </button>
        </div>
      </div>

      {/* Expanded edit panel */}
      {expanded && (
        <div className="border-t border-zinc-800 p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Price (EGP)" value={price} onChange={e => setPrice(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-orange-500 placeholder-zinc-600" />
            <select value={condition} onChange={e => setCondition(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-orange-500">
              {["Deadstock","Excellent","Good","Fair"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <textarea placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-orange-500 placeholder-zinc-600 h-16 resize-none" />
          <button onClick={() => onSave(price, label, condition, desc)}
            className="bg-orange-500 hover:bg-orange-400 text-white text-sm font-bold px-5 py-2 rounded-xl transition-colors">
            Save Changes
          </button>

          {/* Images section */}
          <div>
            <p className="text-zinc-500 text-xs tracking-widest mb-3">IMAGES</p>
            <div className="flex gap-2 flex-wrap">
              {allImgs.map((img: string, i: number) => (
                <div key={i} className="relative group">
                  <img src={img} className="w-16 h-16 object-cover rounded-xl border border-zinc-700" alt="" />
                  {i === 0 && <span className="absolute bottom-1 left-1 text-[9px] bg-orange-500 text-white px-1 rounded font-bold">MAIN</span>}
                  {i > 0 && (
                    <button onClick={() => onRemoveImg(i - 1)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold">
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <label className="w-16 h-16 border-2 border-dashed border-zinc-700 hover:border-orange-500 rounded-xl flex items-center justify-center cursor-pointer transition-colors text-zinc-500 hover:text-orange-400 text-2xl">
                {uploading === p.id || uploading === p.id + "-extra" ? <span className="text-xs">...</span> : "+"}
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => {
                    if (allImgs.length === 0 || !allImgs[0]) onMainImg(e);
                    else onExtraImg(e);
                  }} />
              </label>
            </div>
            <div className="flex gap-2 mt-2">
              <label className="text-xs text-zinc-500 hover:text-orange-400 cursor-pointer transition-colors">
                Replace main image
                <input type="file" accept="image/*" className="hidden" onChange={onMainImg} />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

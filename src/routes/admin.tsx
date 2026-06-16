import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "https://pizzasteve-api.m-2396.workers.dev";
const CLOUD_NAME = "dnggmrgmu";
const UPLOAD_PRESET = "pizzasteve4";

interface Product { id: string; name: string; size?: string; price?: number; priceLabel?: string; status: string; emoji?: string; tag?: string; imageUrl?: string; images?: string[]; condition?: string; description?: string; }

export const Route = createFileRoute("/admin")({ component: AdminPage });

function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [msg, setMsg] = useState("");
  const [uploading, setUploading] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", size: "", price: "", tag: "TEE", emoji: "👕", status: "available", condition: "Good", description: "", imageUrl: "", images: [] as string[] });

  const headers = { "Content-Type": "application/json", "X-Admin-Key": "pizzasteve2024" };

  async function load() { const res = await fetch(`${API}/api/products`); setProducts(await res.json()); }

  async function uploadImg(file: File): Promise<string> {
    const fd = new FormData(); fd.append("file", file); fd.append("upload_preset", UPLOAD_PRESET);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: "POST", body: fd });
    return (await res.json()).secure_url;
  }

  async function handleMainImg(e: React.ChangeEvent<HTMLInputElement>, productId?: string) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(productId || "new-main");
    const url = await uploadImg(file);
    if (productId) { await fetch(`${API}/api/products/${productId}`, { method: "PATCH", headers, body: JSON.stringify({ imageUrl: url }) }); load(); setMsg("Main image updated"); }
    else setForm(f => ({ ...f, imageUrl: url }));
    setUploading(null);
  }

  async function handleExtraImg(e: React.ChangeEvent<HTMLInputElement>, productId: string, existingImages: string[]) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(productId + "-extra");
    const url = await uploadImg(file);
    const newImages = [...existingImages, url];
    await fetch(`${API}/api/products/${productId}`, { method: "PATCH", headers, body: JSON.stringify({ images: newImages }) });
    load(); setMsg("Image added"); setUploading(null);
  }

  async function addProduct() {
    if (!form.name) return setMsg("Name required");
    await fetch(`${API}/api/products`, { method: "POST", headers, body: JSON.stringify({ ...form, price: form.price ? parseInt(form.price) : null }) });
    setForm({ name: "", size: "", price: "", tag: "TEE", emoji: "👕", status: "available", condition: "Good", description: "", imageUrl: "", images: [] });
    setMsg("Added"); load();
  }

  async function toggleStatus(id: string, current: string) {
    await fetch(`${API}/api/products/${id}`, { method: "PATCH", headers, body: JSON.stringify({ status: current === "available" ? "sold" : "available" }) }); load();
  }

  async function deleteProduct(id: string) {
    if (!confirm("Delete?")) return;
    await fetch(`${API}/api/products/${id}`, { method: "DELETE", headers }); setMsg("Deleted"); load();
  }

  if (!authed) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 w-full max-w-sm">
        <div className="text-3xl mb-4 text-center">🍕</div>
        <input type="password" placeholder="Password" value={pass} onChange={e => setPass(e.target.value)}
          onKeyDown={e => e.key === "Enter" && (pass === "pizzasteve2024" ? (setAuthed(true), load()) : setMsg("Wrong password"))}
          className="w-full bg-zinc-800 text-white border border-zinc-700 rounded-lg px-4 py-3 mb-4 outline-none focus:border-orange-500" />
        {msg && <p className="text-red-400 text-sm mb-3 text-center">{msg}</p>}
        <button onClick={() => pass === "pizzasteve2024" ? (setAuthed(true), load()) : setMsg("Wrong password")}
          className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg">Enter</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-black tracking-widest">🍕 ADMIN</h1>
          {msg && <span className="text-orange-400 text-sm">{msg}</span>}
        </div>

        {/* Add form */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
          <h2 className="text-orange-400 font-bold tracking-widest mb-4">ADD PRODUCT</h2>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input placeholder="Name *" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="col-span-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white outline-none focus:border-orange-500 placeholder-zinc-500" />
            <input placeholder="Size" value={form.size} onChange={e => setForm(f => ({...f, size: e.target.value}))} className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white outline-none focus:border-orange-500 placeholder-zinc-500" />
            <input placeholder="Price (EGP)" value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white outline-none focus:border-orange-500 placeholder-zinc-500" />
            <input placeholder="Emoji" value={form.emoji} onChange={e => setForm(f => ({...f, emoji: e.target.value}))} className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white outline-none focus:border-orange-500 placeholder-zinc-500" />
            <select value={form.tag} onChange={e => setForm(f => ({...f, tag: e.target.value}))} className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white outline-none focus:border-orange-500">
              {["TEE","JORTS","ACCESSORIES","DROP","GRAIL","OUTERWEAR","PANTS","SHIRT"].map(t => <option key={t}>{t}</option>)}
            </select>
            <select value={form.condition} onChange={e => setForm(f => ({...f, condition: e.target.value}))} className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white outline-none focus:border-orange-500">
              {["Deadstock","Excellent","Good","Fair"].map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))} className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white outline-none focus:border-orange-500">
              <option value="available">Available</option><option value="sold">Sold</option>
            </select>
            <textarea placeholder="Description (optional)" value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} className="col-span-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white outline-none focus:border-orange-500 placeholder-zinc-500 h-20 resize-none" />
          </div>
          <div className="flex items-center gap-3 mb-3">
            <label className="cursor-pointer bg-zinc-800 border border-dashed border-zinc-600 hover:border-orange-500 rounded-lg px-4 py-2 text-sm text-zinc-400 hover:text-orange-400 transition-colors">
              {uploading === "new-main" ? "Uploading..." : form.imageUrl ? "Change main image" : "Upload main image"}
              <input type="file" accept="image/*" className="hidden" onChange={e => handleMainImg(e)} />
            </label>
            {form.imageUrl && <img src={form.imageUrl} className="w-12 h-12 object-cover rounded-lg" />}
          </div>
          <button onClick={addProduct} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2 rounded-lg transition-colors">Add Product</button>
        </div>

        {/* Product list */}
        <h2 className="text-orange-400 font-bold tracking-widest mb-4">ALL PRODUCTS ({products.length})</h2>
        <div className="space-y-3">
          {products.map(p => <AdminProductRow key={p.id} product={p}
            uploading={uploading}
            onMainImg={e => handleMainImg(e, p.id)}
            onExtraImg={e => handleExtraImg(e, p.id, p.images || [])}
            onToggle={() => toggleStatus(p.id, p.status)}
            onDelete={() => deleteProduct(p.id)}
            onSave={async (price, label, condition, description) => {
              await fetch(`${API}/api/products/${p.id}`, { method: "PATCH", headers, body: JSON.stringify({ price: price ? parseInt(price) : null, priceLabel: label || null, condition, description }) });
              setMsg("Saved"); load();
            }}
          />)}
        </div>
      </div>
    </div>
  );
}

function AdminProductRow({ product: p, uploading, onMainImg, onExtraImg, onToggle, onDelete, onSave }: any) {
  const [price, setPrice] = useState(p.price?.toString() || "");
  const [label, setLabel] = useState(p.priceLabel || "");
  const [condition, setCondition] = useState(p.condition || "Good");
  const [desc, setDesc] = useState(p.description || "");

  const allImgs = [p.imageUrl, ...(p.images || [])].filter(Boolean);

  return (
    <div className={`bg-zinc-900 border rounded-xl p-4 ${p.status === "sold" ? "border-zinc-800 opacity-60" : "border-zinc-800"}`}>
      <div className="flex gap-4">
        <div className="flex gap-1 flex-shrink-0">
          {allImgs.slice(0, 3).map((img: string, i: number) => (
            <img key={i} src={img} className="w-14 h-14 object-cover rounded-lg" />
          ))}
          {allImgs.length === 0 && <div className="w-14 h-14 bg-zinc-800 rounded-lg flex items-center justify-center text-2xl">{p.emoji}</div>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-bold text-sm truncate">{p.name}</span>
            <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">{p.tag}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white text-xs outline-none focus:border-orange-500 placeholder-zinc-600" />
            <select value={condition} onChange={e => setCondition(e.target.value)} className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white text-xs outline-none focus:border-orange-500">
              {["Deadstock","Excellent","Good","Fair"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <textarea placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white text-xs outline-none focus:border-orange-500 placeholder-zinc-600 h-12 resize-none mb-2" />
          <button onClick={() => onSave(price, label, condition, desc)} className="bg-zinc-700 hover:bg-orange-500 text-white text-xs px-3 py-1 rounded transition-colors">Save</button>
        </div>
        <div className="flex flex-col gap-1 flex-shrink-0">
          <label className="cursor-pointer text-xs px-2 py-1 rounded border border-zinc-600 hover:border-orange-500 text-zinc-400 hover:text-orange-400 transition-colors text-center">
            {uploading === p.id ? "..." : "Main"}
            <input type="file" accept="image/*" className="hidden" onChange={onMainImg} />
          </label>
          <label className="cursor-pointer text-xs px-2 py-1 rounded border border-zinc-600 hover:border-orange-500 text-zinc-400 hover:text-orange-400 transition-colors text-center">
            {uploading === p.id + "-extra" ? "..." : "+Img"}
            <input type="file" accept="image/*" className="hidden" onChange={onExtraImg} />
          </label>
          <button onClick={onToggle} className={`text-xs px-2 py-1 rounded border transition-colors ${p.status === "available" ? "border-green-700 text-green-400" : "border-zinc-600 text-zinc-400"}`}>
            {p.status === "available" ? "Avail" : "Sold"}
          </button>
          <button onClick={onDelete} className="text-xs px-2 py-1 rounded border border-red-900 text-red-400 hover:bg-red-900 transition-colors">Del</button>
        </div>
      </div>
    </div>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "https://pizzasteve-api.m-2396.workers.dev";
const CLOUD_NAME = "dnggmrgmu";
const UPLOAD_PRESET = "pizzasteve4";

interface Product {
  id: string;
  name: string;
  size?: string;
  price?: number;
  priceLabel?: string;
  status: string;
  emoji?: string;
  tag?: string;
  imageUrl?: string;
}

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [uploading, setUploading] = useState<string | null>(null);

  // New product form
  const [form, setForm] = useState({
    name: "", size: "", price: "", tag: "TEE", emoji: "👕", status: "available", imageUrl: "",
  });

  const headers = { "Content-Type": "application/json", "X-Admin-Key": "pizzasteve2024" };

  async function load() {
    const res = await fetch(`${API}/api/products`);
    setProducts(await res.json());
  }

  function login() {
    if (pass === "pizzasteve2024") { setAuthed(true); load(); }
    else setMsg("Wrong password");
  }

  async function uploadImage(file: File, productId?: string): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", UPLOAD_PRESET);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: "POST", body: fd,
    });
    const data = await res.json();
    return data.secure_url;
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, productId: string) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(productId);
    try {
      const url = await uploadImage(file);
      await fetch(`${API}/api/products/${productId}`, {
        method: "PATCH", headers, body: JSON.stringify({ imageUrl: url }),
      });
      setMsg("Image updated ✓");
      load();
    } catch { setMsg("Upload failed"); }
    setUploading(null);
  }

  async function handleNewImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading("new");
    try {
      const url = await uploadImage(file);
      setForm(f => ({ ...f, imageUrl: url }));
      setMsg("Image ready ✓");
    } catch { setMsg("Upload failed"); }
    setUploading(null);
  }

  async function addProduct() {
    if (!form.name) return setMsg("Name required");
    setLoading(true);
    await fetch(`${API}/api/products`, {
      method: "POST", headers,
      body: JSON.stringify({
        name: form.name, size: form.size || null,
        price: form.price ? parseInt(form.price) : null,
        tag: form.tag, emoji: form.emoji, status: form.status,
        imageUrl: form.imageUrl || null,
      }),
    });
    setForm({ name: "", size: "", price: "", tag: "TEE", emoji: "👕", status: "available", imageUrl: "" });
    setMsg("Product added ✓");
    load();
    setLoading(false);
  }

  async function updatePrice(id: string, price: string, priceLabel: string) {
    await fetch(`${API}/api/products/${id}`, {
      method: "PATCH", headers,
      body: JSON.stringify({ price: price ? parseInt(price) : null, priceLabel: priceLabel || null }),
    });
    setMsg("Updated ✓");
    load();
  }

  async function toggleStatus(id: string, current: string) {
    const next = current === "available" ? "sold" : "available";
    await fetch(`${API}/api/products/${id}`, {
      method: "PATCH", headers, body: JSON.stringify({ status: next }),
    });
    load();
  }

  async function deleteProduct(id: string) {
    if (!confirm("Delete this product?")) return;
    await fetch(`${API}/api/products/${id}`, { method: "DELETE", headers });
    setMsg("Deleted");
    load();
  }

  if (!authed) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 w-full max-w-sm">
        <div className="text-3xl mb-2 text-center">🍕</div>
        <h1 className="text-white text-xl font-bold text-center mb-6">Admin Access</h1>
        <input
          type="password" placeholder="Password" value={pass}
          onChange={e => setPass(e.target.value)}
          onKeyDown={e => e.key === "Enter" && login()}
          className="w-full bg-zinc-800 text-white border border-zinc-700 rounded-lg px-4 py-3 mb-4 outline-none focus:border-orange-500"
        />
        {msg && <p className="text-red-400 text-sm mb-3 text-center">{msg}</p>}
        <button onClick={login} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors">
          Enter
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-black tracking-widest">🍕 ADMIN PANEL</h1>
          {msg && <span className="text-orange-400 text-sm">{msg}</span>}
        </div>

        {/* Add Product */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-bold mb-4 text-orange-400 tracking-widest">ADD PRODUCT</h2>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input placeholder="Name *" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
              className="col-span-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:border-orange-500 outline-none" />
            <input placeholder="Size (e.g. M, 30/31)" value={form.size} onChange={e => setForm(f => ({...f, size: e.target.value}))}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:border-orange-500 outline-none" />
            <input placeholder="Price (EGP, numbers only)" value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:border-orange-500 outline-none" />
            <input placeholder="Emoji" value={form.emoji} onChange={e => setForm(f => ({...f, emoji: e.target.value}))}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:border-orange-500 outline-none" />
            <select value={form.tag} onChange={e => setForm(f => ({...f, tag: e.target.value}))}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-orange-500 outline-none">
              {["TEE","JORTS","ACCESSORIES","DROP","GRAIL","OUTERWEAR","PANTS","SHIRT"].map(t => <option key={t}>{t}</option>)}
            </select>
            <select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-orange-500 outline-none">
              <option value="available">Available</option>
              <option value="sold">Sold</option>
            </select>
          </div>
          {/* Image upload for new product */}
          <div className="mb-3 flex items-center gap-3">
            <label className="cursor-pointer bg-zinc-800 border border-dashed border-zinc-600 hover:border-orange-500 rounded-lg px-4 py-2 text-sm text-zinc-400 hover:text-orange-400 transition-colors">
              {uploading === "new" ? "Uploading..." : form.imageUrl ? "✓ Image ready — change?" : "📷 Upload image"}
              <input type="file" accept="image/*" className="hidden" onChange={handleNewImageUpload} disabled={uploading === "new"} />
            </label>
            {form.imageUrl && <img src={form.imageUrl} className="w-12 h-12 object-cover rounded-lg" />}
          </div>
          <button onClick={addProduct} disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold px-6 py-2 rounded-lg transition-colors">
            {loading ? "Adding..." : "Add Product"}
          </button>
        </div>

        {/* Product List */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-orange-400 tracking-widest mb-4">ALL PRODUCTS</h2>
          {products.map(p => (
            <ProductRow key={p.id} product={p}
              uploading={uploading === p.id}
              onImageUpload={e => handleImageUpload(e, p.id)}
              onToggleStatus={() => toggleStatus(p.id, p.status)}
              onUpdatePrice={(price, label) => updatePrice(p.id, price, label)}
              onDelete={() => deleteProduct(p.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductRow({ product, uploading, onImageUpload, onToggleStatus, onUpdatePrice, onDelete }: any) {
  const [price, setPrice] = useState(product.price?.toString() || "");
  const [label, setLabel] = useState(product.priceLabel || "");

  return (
    <div className={`bg-zinc-900 border rounded-xl p-4 flex gap-4 items-start ${product.status === "sold" ? "border-zinc-700 opacity-60" : "border-zinc-800"}`}>
      {/* Image */}
      <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-800 flex items-center justify-center">
        {product.imageUrl
          ? <img src={product.imageUrl} className="w-full h-full object-cover" />
          : <span className="text-2xl">{product.emoji}</span>}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold text-sm truncate">{product.name}</span>
          <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">{product.tag}</span>
          {product.size && <span className="text-xs text-zinc-500">{product.size}</span>}
        </div>
        <div className="flex gap-2 flex-wrap">
          <input placeholder="Price (EGP)" value={price} onChange={e => setPrice(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white text-xs w-32 focus:border-orange-500 outline-none placeholder-zinc-600" />
          <input placeholder='Label (e.g. "Price TBD")' value={label} onChange={e => setLabel(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white text-xs w-36 focus:border-orange-500 outline-none placeholder-zinc-600" />
          <button onClick={() => onUpdatePrice(price, label)}
            className="bg-zinc-700 hover:bg-orange-500 text-white text-xs px-3 py-1 rounded transition-colors">
            Save price
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 flex-shrink-0">
        <label className={`cursor-pointer text-xs px-3 py-1 rounded border transition-colors text-center ${uploading ? "border-zinc-600 text-zinc-500" : "border-zinc-600 hover:border-orange-500 text-zinc-400 hover:text-orange-400"}`}>
          {uploading ? "..." : "📷"}
          <input type="file" accept="image/*" className="hidden" onChange={onImageUpload} disabled={uploading} />
        </label>
        <button onClick={onToggleStatus}
          className={`text-xs px-3 py-1 rounded border transition-colors ${product.status === "available" ? "border-green-700 text-green-400 hover:bg-green-900" : "border-zinc-600 text-zinc-400 hover:bg-zinc-800"}`}>
          {product.status === "available" ? "Avail" : "Sold"}
        </button>
        <button onClick={onDelete}
          className="text-xs px-3 py-1 rounded border border-red-900 text-red-400 hover:bg-red-900 transition-colors">
          Del
        </button>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Archive, Boxes, Heart, PackageCheck, Plus, Trash2, X } from "lucide-react";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import {
  archiveProduct,
  consumeProduct,
  createProduct,
  deleteProduct,
  setProductStatus,
  toggleProductFavourite,
  updateProduct,
} from "@/lib/api/health-extended";
import type {
  PersonalProduct,
  ProductCategory,
  ProductPayload,
  ProductStatus,
  ProductType,
  ProductUnit,
} from "@/types/health-extended";

type Props = { initialProducts: PersonalProduct[] };

type FormState = {
  name: string;
  brand: string;
  category: ProductCategory;
  productType: ProductType;
  status: ProductStatus;
  initialQuantity: string;
  remainingQuantity: string;
  unit: ProductUnit;
  expiresAt: string;
  tags: string;
  notes: string;
};

const inputClass = "min-h-11 w-full rounded-[14px] border border-white/10 bg-[#080b0d] px-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#C6FF32]/50";
const categories: ProductCategory[] = ["skincare","haircare","supplement","medicine","fitness","meditation","personal_care","food","electronics","office","content_creation","clothing","footwear","home","other"];
const statuses: ProductStatus[] = ["want_to_buy","ordered","available","in_use","low","finished","expired","discontinued","replaced","not_suitable","lost","damaged"];
const types: ProductType[] = ["consumable","durable","subscription","digital"];
const units: ProductUnit[] = ["ml","litre","gram","kg","tablet","capsule","scoop","serving","piece","pack","bottle","tube","sachet","unit"];

function label(value: string) { return value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()); }
function num(value: string) { if (!value.trim()) return undefined; const parsed = Number(value); return Number.isFinite(parsed) ? parsed : undefined; }
function emptyForm(): FormState { return { name:"", brand:"", category:"other", productType:"consumable", status:"available", initialQuantity:"", remainingQuantity:"", unit:"unit", expiresAt:"", tags:"", notes:"" }; }

export function ProductsManager({ initialProducts }: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const active = useMemo(() => products.filter((p) => !["finished","discontinued","expired","lost","damaged"].includes(p.status)).length, [products]);
  const low = useMemo(() => products.filter((p) => p.status === "low").length, [products]);
  const favourites = useMemo(() => products.filter((p) => p.isFavourite).length, [products]);

  function reset() { setForm(emptyForm()); setEditingId(null); setShowForm(false); }
  function edit(product: PersonalProduct) {
    setEditingId(product._id);
    setForm({
      name: product.name,
      brand: product.brand ?? "",
      category: product.category,
      productType: product.productType,
      status: product.status,
      initialQuantity: product.usage?.initialQuantity?.toString() ?? "",
      remainingQuantity: product.usage?.remainingQuantity?.toString() ?? "",
      unit: product.usage?.unit ?? "unit",
      expiresAt: product.expiresAt?.slice(0,10) ?? "",
      tags: (product.tags ?? []).join(", "),
      notes: product.notes ?? "",
    });
    setShowForm(true);
  }

  async function save() {
    if (!form.name.trim()) return;
    setBusy(true); setError(null);
    try {
      const initialQuantity = num(form.initialQuantity);
      const remainingQuantity = num(form.remainingQuantity);
      const payload: ProductPayload = {
        name: form.name.trim(),
        ...(form.brand.trim() ? { brand: form.brand.trim() } : {}),
        category: form.category,
        productType: form.productType,
        status: form.status,
        usage: {
          ...(initialQuantity !== undefined ? { initialQuantity } : {}),
          ...(remainingQuantity !== undefined ? { remainingQuantity } : {}),
          unit: form.unit,
        },
        ...(form.expiresAt ? { expiresAt: new Date(`${form.expiresAt}T12:00:00+05:30`).toISOString() } : {}),
        tags: form.tags.split(",").map((v) => v.trim()).filter(Boolean),
        ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
      };
      const saved = editingId ? await updateProduct(editingId, payload) : await createProduct(payload);
      setProducts((current) => current.some((p) => p._id === saved._id) ? current.map((p) => p._id === saved._id ? saved : p) : [saved, ...current]);
      reset();
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to save product."); }
    finally { setBusy(false); }
  }

  async function mutate(productId: string, action: () => Promise<PersonalProduct>) {
    setBusy(true); setError(null);
    try { const saved = await action(); setProducts((current) => current.map((p) => p._id === productId ? saved : p)); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to update product."); }
    finally { setBusy(false); }
  }

  async function remove(productId: string) {
    if (!window.confirm("Delete this product?")) return;
    setBusy(true); setError(null);
    try { await deleteProduct(productId); setProducts((current) => current.filter((p) => p._id !== productId)); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to delete product."); }
    finally { setBusy(false); }
  }

  return <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-3">
      <AdminStatCard label="Tracked" value={products.length} description="Products in Personal OS." icon={Boxes} />
      <AdminStatCard label="Active" value={active} description="Available, ordered, in-use or wanted." icon={PackageCheck} />
      <AdminStatCard label="Low / favourites" value={`${low} / ${favourites}`} description="Restock and preferred products." icon={Heart} />
    </div>
    {error ? <div className="rounded-[18px] border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">{error}</div> : null}
    <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-lg font-black">Product inventory</h2><p className="mt-1 text-sm text-white/40">Track what you use, what is low, and what needs replacing.</p></div><button type="button" onClick={() => { reset(); setShowForm(true); }} className="inline-flex min-h-11 items-center gap-2 rounded-[14px] bg-[#C6FF32] px-4 text-sm font-black text-[#030608]"><Plus className="h-4 w-4"/> Add product</button></div>
      {showForm ? <div className="mt-5 rounded-[20px] border border-[#C6FF32]/15 p-4">
        <div className="flex items-center justify-between"><h3 className="font-black">{editingId ? "Edit product" : "Add product"}</h3><button onClick={reset} className="grid h-9 w-9 place-items-center rounded-xl border border-white/10"><X className="h-4 w-4"/></button></div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <input className={inputClass} placeholder="Name" value={form.name} onChange={(e)=>setForm(c=>({...c,name:e.target.value}))}/>
          <input className={inputClass} placeholder="Brand" value={form.brand} onChange={(e)=>setForm(c=>({...c,brand:e.target.value}))}/>
          <select className={inputClass} value={form.category} onChange={(e)=>setForm(c=>({...c,category:e.target.value as ProductCategory}))}>{categories.map(v=><option key={v} value={v}>{label(v)}</option>)}</select>
          <select className={inputClass} value={form.productType} onChange={(e)=>setForm(c=>({...c,productType:e.target.value as ProductType}))}>{types.map(v=><option key={v} value={v}>{label(v)}</option>)}</select>
          <select className={inputClass} value={form.status} onChange={(e)=>setForm(c=>({...c,status:e.target.value as ProductStatus}))}>{statuses.map(v=><option key={v} value={v}>{label(v)}</option>)}</select>
          <input className={inputClass} type="number" min="0" placeholder="Initial quantity" value={form.initialQuantity} onChange={(e)=>setForm(c=>({...c,initialQuantity:e.target.value}))}/>
          <input className={inputClass} type="number" min="0" placeholder="Remaining quantity" value={form.remainingQuantity} onChange={(e)=>setForm(c=>({...c,remainingQuantity:e.target.value}))}/>
          <select className={inputClass} value={form.unit} onChange={(e)=>setForm(c=>({...c,unit:e.target.value as ProductUnit}))}>{units.map(v=><option key={v} value={v}>{label(v)}</option>)}</select>
          <input className={inputClass} type="date" value={form.expiresAt} onChange={(e)=>setForm(c=>({...c,expiresAt:e.target.value}))}/>
          <input className={`${inputClass} lg:col-span-2`} placeholder="Tags, comma separated" value={form.tags} onChange={(e)=>setForm(c=>({...c,tags:e.target.value}))}/>
          <input className={`${inputClass} lg:col-span-2`} placeholder="Notes" value={form.notes} onChange={(e)=>setForm(c=>({...c,notes:e.target.value}))}/>
        </div>
        <div className="mt-4 flex gap-2"><button onClick={save} disabled={busy || !form.name.trim()} className="min-h-11 rounded-[14px] bg-[#C6FF32] px-5 text-sm font-black text-[#030608] disabled:opacity-50">{editingId ? "Save" : "Create"}</button><button onClick={reset} className="min-h-11 rounded-[14px] border border-white/10 px-5 text-sm font-bold text-white/55">Cancel</button></div>
      </div> : null}
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {products.map((product) => <article key={product._id} className="rounded-[18px] border border-white/10 bg-black/20 p-4">
          <div className="flex items-start justify-between gap-3"><div><p className="font-black">{product.name}</p><p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/35">{product.brand ? `${product.brand} · `:""}{label(product.category)} · {label(product.status)}</p></div><button onClick={()=>edit(product)} className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-white/55">Edit</button></div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/45"><span>{Math.round(product.usage?.remainingPercentage ?? 0)}% left</span>{product.expiresAt ? <span>· Expires {product.expiresAt.slice(0,10)}</span>:null}</div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button disabled={busy} onClick={()=>mutate(product._id,()=>toggleProductFavourite(product._id))} className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-white/55">{product.isFavourite ? "Unfavourite" : "Favourite"}</button>
            {product.productType === "consumable" ? <button disabled={busy} onClick={()=>mutate(product._id,()=>consumeProduct(product._id,1))} className="rounded-xl border border-[#C6FF32]/20 px-3 py-2 text-xs font-bold text-[#C6FF32]">Use 1</button>:null}
            <select aria-label="Product status" disabled={busy} value={product.status} onChange={(e)=>mutate(product._id,()=>setProductStatus(product._id,e.target.value as ProductStatus))} className="rounded-xl border border-white/10 bg-[#080b0d] px-3 py-2 text-xs font-bold text-white/55">{statuses.map(v=><option key={v} value={v}>{label(v)}</option>)}</select>
            <button disabled={busy} onClick={()=>mutate(product._id,()=>archiveProduct(product._id))} className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-white/45"><Archive className="h-4 w-4"/></button>
            <button disabled={busy} onClick={()=>remove(product._id)} className="grid h-9 w-9 place-items-center rounded-xl border border-red-400/20 text-red-300"><Trash2 className="h-4 w-4"/></button>
          </div>
        </article>)}
        {!products.length ? <div className="rounded-[18px] border border-dashed border-white/10 p-6 text-sm text-white/35">No products tracked yet.</div>:null}
      </div>
    </section>
  </div>;
}

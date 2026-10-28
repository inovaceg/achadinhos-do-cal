import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadMedia } from "@/lib/media";
import { getAdminSiteContent, saveAdminCollection, deleteAdminCollection, saveAdminPromo, deleteAdminPromo, saveAdminContacts } from "@/lib/site-content.functions";
import { collectionSchema, contactsSchema, imageFileSchema, promoSchema } from "@/lib/site-content.schemas";
import type { Product } from "@/lib/queries";

type ContactValues = { instagram: string; tiktok: string; whatsapp: string; contact_email: string };
const emptyCollection = () => ({ title: "", cover_url: "", video_url: "", active: true, sort_order: 0, product_ids: [] as string[] });
const emptyPromo = () => ({ title: "", image_url: "", category_id: "", collection_id: "", active: true, sort_order: 0 });
const emptyContacts: ContactValues = { instagram: "", tiktok: "", whatsapp: "", contact_email: "" };
const contactLabels = { instagram: "Instagram", tiktok: "TikTok", whatsapp: "WhatsApp", contact_email: "E-mail de contato" };

export function SiteContentAdmin({ userId, categories, products }: { userId: string; categories: { id: string; name: string }[]; products: Product[] }) {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["admin", userId, "site-content"], queryFn: () => getAdminSiteContent() });
  const [collection, setCollection] = useState(emptyCollection);
  const [collectionId, setCollectionId] = useState<string>();
  const [promo, setPromo] = useState(emptyPromo);
  const [promoId, setPromoId] = useState<string>();
  const [contacts, setContacts] = useState(emptyContacts);
  const [contactError, setContactError] = useState("");
  const [contactSuccess, setContactSuccess] = useState(false);
  const [uploadState, setUploadState] = useState<{ key: "cover_url" | "image_url"; pending: boolean; error: string } | null>(null);
  const token = useRef(0);
  const mounted = useRef(true);
  const contactsInitialized = useRef(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; ++token.current; }; }, []);
  const uploadPending = uploadState?.pending ?? false;
  useEffect(() => {
    if (!query.data || contactsInitialized.current) return;
    const settings = query.data.settings as Record<string, unknown>;
    setContacts(Object.fromEntries(Object.keys(emptyContacts).map((key) => [key, typeof settings[key] === "string" ? settings[key] : ""])) as ContactValues);
    contactsInitialized.current = true;
  }, [query.data]);
  const refresh = async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: ["admin", userId] }),
      client.invalidateQueries({ queryKey: ["video-collections"] }), client.invalidateQueries({ queryKey: ["video-collection"] }),
      client.invalidateQueries({ queryKey: ["promotional-banners"] }), client.invalidateQueries({ queryKey: ["products"] }),
      client.invalidateQueries({ queryKey: ["settings"] }), client.invalidateQueries({ queryKey: ["category-count"] }),
    ]);
  };
  const collectionSave = useMutation({ mutationFn: () => saveAdminCollection({ data: collectionSchema.parse({ ...collection, ...(collectionId ? { id: collectionId } : {}) }) }), onSuccess: async () => { await refresh(); setCollection(emptyCollection()); setCollectionId(undefined); } });
  const collectionDelete = useMutation({ mutationFn: (id: string) => deleteAdminCollection({ data: { id } }), onSuccess: refresh });
  const promoSave = useMutation({ mutationFn: () => saveAdminPromo({ data: promoSchema.parse({ ...promo, ...(promoId ? { id: promoId } : {}), category_id: promo.category_id || null, collection_id: promo.collection_id || null }) }), onSuccess: async () => { await refresh(); setPromo(emptyPromo()); setPromoId(undefined); } });
  const promoDelete = useMutation({ mutationFn: (id: string) => deleteAdminPromo({ data: { id } }), onSuccess: refresh });
  const settingsSave = useMutation({ mutationFn: () => saveAdminContacts({ data: contactsSchema.parse(contacts) }), onSuccess: async () => { setContactError(""); setContactSuccess(true); await refresh(); } });
  const resetCollection = () => { ++token.current; setUploadState(null); setCollection(emptyCollection()); setCollectionId(undefined); collectionSave.reset(); };
  const resetPromo = () => { ++token.current; setUploadState(null); setPromo(emptyPromo()); setPromoId(undefined); promoSave.reset(); };
  const upload = async (file: File, key: "cover_url" | "image_url") => {
    const current = ++token.current;
    setUploadState({ key, pending: true, error: "" });
    try {
      const parsed = imageFileSchema.safeParse(file);
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Arquivo inválido.");
      const url = await uploadMedia(file);
      if (!mounted.current || token.current !== current) return;
      if (key === "cover_url") setCollection((v) => ({ ...v, cover_url: url })); else setPromo((v) => ({ ...v, image_url: url }));
      setUploadState(null);
    } catch (error) {
      if (mounted.current && token.current === current) setUploadState({ key, pending: false, error: error instanceof Error ? error.message : "Falha ao enviar a imagem." });
    }
  };
  if (query.isPending) return <p>Carregando conteúdo do site…</p>;
  if (query.isError) return <p role="alert">Não foi possível carregar o conteúdo administrativo.</p>;
  const busy = uploadPending || collectionSave.isPending || promoSave.isPending || collectionDelete.isPending || promoDelete.isPending || settingsSave.isPending;
  return <section className="space-y-6 rounded-2xl border bg-card p-5"><h2 className="text-xl font-bold">Conteúdo do site</h2><fieldset disabled={busy} className="grid min-w-0 gap-6 xl:grid-cols-[repeat(3,minmax(0,1fr))]">
    <div className="space-y-3"><form className="space-y-3" onSubmit={(e) => { e.preventDefault(); collectionSave.mutate(); }}><h3 className="font-semibold">{collectionId ? "Editar coleção" : "Nova coleção de vídeos"}</h3>
      <Input aria-label="Título" placeholder="Título" required value={collection.title} onChange={(e) => setCollection({ ...collection, title: e.target.value })}/><Input aria-label="Link do vídeo" placeholder="Link externo Instagram, TikTok ou YouTube" type="url" required value={collection.video_url} onChange={(e) => setCollection({ ...collection, video_url: e.target.value })}/>
      <label className="block text-sm">Imagem de capa (JPEG, PNG, WebP ou AVIF; até 5 MB)<input type="file" disabled={uploadPending || collectionSave.isPending || promoSave.isPending} accept="image/jpeg,image/png,image/webp,image/avif" onChange={(e) => { const input = e.currentTarget; const file = input.files?.[0]; input.value = ""; if (file) void upload(file, "cover_url"); }}/></label>
      {collection.cover_url && <img src={collection.cover_url} className="h-20 rounded object-cover" alt="Prévia da capa"/>}{uploadState?.key === "cover_url" && (uploadState.pending ? <p>Enviando imagem…</p> : <p role="alert">{uploadState.error}</p>)}
      <label className="block space-y-1 text-sm">Produtos da coleção<select multiple className="h-40 w-full rounded-md border bg-background p-2" value={collection.product_ids} onChange={(e) => setCollection({ ...collection, product_ids: Array.from(e.currentTarget.selectedOptions, (o) => o.value) })}>{products.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.store} · {p.active ? "Ativo" : "Inativo"}</option>)}</select><span className="text-xs text-muted-foreground">Use Ctrl para selecionar vários produtos no computador.</span></label>
      <Input aria-label="Ordem" type="number" min="0" value={collection.sort_order} onChange={(e) => setCollection({ ...collection, sort_order: Number(e.target.value) })}/><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={collection.active} onChange={(e) => setCollection({ ...collection, active: e.target.checked })}/>Ativa</label>
      <Button disabled={collectionSave.isPending || uploadPending || promoSave.isPending}>{collectionSave.isPending ? "Salvando…" : collectionId ? "Salvar alterações" : "Criar coleção"}</Button>{collectionId && <Button type="button" variant="outline" disabled={collectionSave.isPending || promoSave.isPending || uploadPending} onClick={resetCollection}>Cancelar edição</Button>}{collectionSave.error && <p role="alert">{collectionSave.error.message}</p>}
      {collectionSave.isSuccess && <p role="status">Coleção salva.</p>}
    </form><ul className="space-y-2">{query.data.collections.map((row) => <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 text-sm"><span>{row.title} {row.active ? "· Ativa" : "· Inativa"}</span><span className="flex gap-2"><Button type="button" size="sm" variant="outline" onClick={() => { resetCollection(); setCollectionId(row.id); setCollection({ title: row.title, cover_url: row.cover_url, video_url: row.video_url, active: row.active, sort_order: row.sort_order, product_ids: row.video_collection_products.map((p: { product_id: string }) => p.product_id) }); }}>Editar</Button><Button type="button" size="sm" variant="destructive" disabled={collectionDelete.isPending} onClick={() => { if (window.confirm(`Excluir a coleção “${row.title}” e seus banners vinculados? Os produtos serão preservados.`)) collectionDelete.mutate(row.id); }}>Excluir</Button></span></li>)}</ul>{collectionDelete.error && <p role="alert">{collectionDelete.error.message}</p>}</div>
    <div className="space-y-3"><form className="space-y-3" onSubmit={(e) => { e.preventDefault(); promoSave.mutate(); }}><h3 className="font-semibold">{promoId ? "Editar banner promocional" : "Novo banner promocional"}</h3><Input placeholder="Título" required value={promo.title} onChange={(e) => setPromo({ ...promo, title: e.target.value })}/>
      <label className="block space-y-1 text-sm">Destino<select required className="h-10 w-full rounded-md border bg-background px-3" value={promo.category_id ? `category:${promo.category_id}` : promo.collection_id ? `collection:${promo.collection_id}` : ""} onChange={(e) => { const [kind, id = ""] = e.target.value.split(":"); setPromo({ ...promo, category_id: kind === "category" ? id : "", collection_id: kind === "collection" ? id : "" }); }}><option value="">Escolha categoria ou coleção</option><optgroup label="Categorias">{categories.map((c) => <option key={c.id} value={`category:${c.id}`}>{c.name}</option>)}</optgroup><optgroup label="Coleções">{query.data.collections.map((c) => <option key={c.id} value={`collection:${c.id}`}>{c.title}</option>)}</optgroup></select></label>
      <label className="block text-sm">Imagem do banner (JPEG, PNG, WebP ou AVIF; até 5 MB)<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(e) => { const input=e.currentTarget; const file=input.files?.[0]; input.value=""; if(file) void upload(file,"image_url"); }}/></label>{promo.image_url && <img src={promo.image_url} className="h-20 rounded object-cover" alt="Prévia do banner"/>}{uploadState?.key === "image_url" && (uploadState.pending ? <p>Enviando imagem…</p> : <p role="alert">{uploadState.error}</p>)}
      <Input aria-label="Ordem" type="number" min="0" value={promo.sort_order} onChange={(e) => setPromo({ ...promo, sort_order: Number(e.target.value) })}/><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={promo.active} onChange={(e) => setPromo({ ...promo, active: e.target.checked })}/>Ativo</label><Button disabled={promoSave.isPending || uploadState?.key === "image_url" && uploadState.pending}>{promoSave.isPending ? "Salvando…" : promoId ? "Salvar alterações" : "Criar banner"}</Button>{promoId && <Button type="button" variant="outline" onClick={resetPromo}>Cancelar edição</Button>}{promoSave.error && <p role="alert">{promoSave.error.message}</p>}{promoSave.isSuccess && <p role="status">Banner salvo.</p>}
    </form><ul className="space-y-2">{query.data.banners.map((row) => <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 text-sm"><span>{row.title} {row.active ? "· Ativo" : "· Inativo"}</span><span className="flex gap-2"><Button type="button" size="sm" variant="outline" onClick={() => { resetPromo(); setPromoId(row.id); setPromo({ title: row.title, image_url: row.image_url, category_id: row.category_id ?? "", collection_id: row.collection_id ?? "", active: row.active, sort_order: row.sort_order }); }}>Editar</Button><Button type="button" size="sm" variant="destructive" disabled={promoDelete.isPending} onClick={() => { if (window.confirm(`Excluir o banner “${row.title}”?`)) promoDelete.mutate(row.id); }}>Excluir</Button></span></li>)}</ul>{promoDelete.error && <p role="alert">{promoDelete.error.message}</p>}</div>
    <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); setContactError(""); setContactSuccess(false); const parsed = contactsSchema.safeParse(contacts); if (!parsed.success) { setContactError(parsed.error.issues[0]?.message ?? "Confira os contatos informados."); return; } settingsSave.mutate(); }}><h3 className="font-semibold">Contatos sociais</h3>{(Object.keys(contactLabels) as (keyof ContactValues)[]).map((key) => <label key={key} className="block text-sm">{contactLabels[key]}<Input type={key === "contact_email" ? "email" : "text"} value={contacts[key]} onChange={(e) => { setContacts({ ...contacts, [key]: e.target.value }); setContactSuccess(false); }}/></label>)}<Button disabled={settingsSave.isPending}>{settingsSave.isPending ? "Salvando…" : "Salvar contatos"}</Button>{contactError && <p role="alert">{contactError}</p>}{settingsSave.error && <p role="alert">{settingsSave.error.message}</p>}{contactSuccess && <p role="status">Contatos salvos.</p>}</form>
  </fieldset></section>;
}

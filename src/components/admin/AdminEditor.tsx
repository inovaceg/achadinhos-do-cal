import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Category, Product } from "@/lib/queries";
import { categoryFormSchema, productFormSchema, type CategoryForm, type ProductForm } from "@/lib/admin.schemas";
import { deleteAdminCategory, deleteAdminProduct, saveAdminCategory, saveAdminProduct } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { ProductMediaUpload } from "@/components/admin/ProductMediaUpload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

type AdminData = { products: Product[]; categories: Category[] };

export function AdminEditor({ data, userId }: { data: AdminData; userId: string }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Product | null>(null);
  const [categoryEditing, setCategoryEditing] = useState<Category | null>(null);
  const [uploading, setUploading] = useState(false);
  const [mediaRevision, setMediaRevision] = useState(0);
  const productForm = useForm<ProductForm>({ resolver: zodResolver(productFormSchema), defaultValues: { name: "", category_id: "", main_image: "", images: [], videos: [], promo_price: 0, affiliate_url: "", description: "", store: "", active: true, featured: false } });
  const categoryForm = useForm<CategoryForm>({ resolver: zodResolver(categoryFormSchema), defaultValues: { name: "", description: "", active: true } });
  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin", userId] });
    await queryClient.invalidateQueries({ queryKey: ["products"] });
    await queryClient.invalidateQueries({ queryKey: ["categories"] });
    await queryClient.invalidateQueries({ queryKey: ["category-count"] });
    await queryClient.invalidateQueries({ queryKey: ["video-collections"] });
    await queryClient.invalidateQueries({ queryKey: ["promotional-banners"] });
  };
  const saveProduct = useMutation({ mutationFn: (value: ProductForm) => saveAdminProduct({ data: { ...value, id: editing?.id, slug: editing?.slug, category_id: value.category_id, original_price: value.original_price ?? null } }), onSuccess: async () => { await refresh(); resetProduct(); } });
  const saveCategory = useMutation({ mutationFn: (value: CategoryForm) => saveAdminCategory({ data: { ...value, id: categoryEditing?.id, slug: categoryEditing?.slug } }), onSuccess: async () => { await refresh(); setCategoryEditing(null); categoryForm.reset(); } });
  const removeProduct = useMutation({ mutationFn: (id: string) => deleteAdminProduct({ data: { id } }), onSuccess: refresh });
  const removeCategory = useMutation({ mutationFn: (id: string) => deleteAdminCategory({ data: { id } }), onSuccess: refresh });

  function resetProduct() {
    setMediaRevision(value => value + 1);
    setEditing(null);
    setUploading(false);
    productForm.reset();
  }
  function editProduct(product: Product) {
    if (saveProduct.isPending) return;
    setMediaRevision(value => value + 1);
    setUploading(false);
    setEditing(product);
    const main = product.main_image ?? "";
    productForm.reset({ name: product.name, category_id: product.category_id ?? "", main_image: main, images: (product.images ?? []).filter(url => url !== main), videos: product.videos ?? [], promo_price: Number(product.promo_price), affiliate_url: product.affiliate_url, description: product.description ?? "", store: product.store ?? "", original_price: product.original_price == null ? undefined : Number(product.original_price), active: product.active, featured: product.featured });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <section className="min-w-0 space-y-6">
        <div className="rounded-2xl border bg-card p-5 sm:p-6">
          <h2 className="mb-4 text-xl font-bold">{editing ? "Editar produto" : "Cadastrar produto"}</h2>
          <form className="space-y-4" onSubmit={productForm.handleSubmit((value) => saveProduct.mutate(value))}>
            <Field label="Nome" error={productForm.formState.errors.name?.message}><Input {...productForm.register("name")} /></Field>
            <Field label="Categoria" error={productForm.formState.errors.category_id?.message}><select className="h-10 w-full rounded-md border bg-background px-3" {...productForm.register("category_id")}><option value="">Selecione uma categoria</option>{data.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></Field>
            <ProductMediaUpload key={`${mediaRevision}`} form={productForm} disabled={uploading || saveProduct.isPending} onUploading={setUploading} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field className="min-w-0" label="Preço de venda (R$)" error={productForm.formState.errors.promo_price?.message}><Input type="number" min="0.01" step="0.01" {...productForm.register("promo_price", { valueAsNumber: true })} /></Field>
              <Field className="min-w-0" label="Preço original (opcional)" error={productForm.formState.errors.original_price?.message}><Input type="number" min="0.01" step="0.01" {...productForm.register("original_price", { setValueAs: (value) => value === "" ? undefined : Number(value) })} /></Field>
            </div>
            <Field label="Link de afiliado (HTTP/HTTPS)" error={productForm.formState.errors.affiliate_url?.message}><Input type="url" placeholder="https://…" {...productForm.register("affiliate_url")} /></Field>
            <Field label="Loja"><Input {...productForm.register("store")} /></Field>
            <Field label="Descrição"><Textarea {...productForm.register("description")} /></Field>
            <ToggleField label="Produto ativo" checked={productForm.watch("active")} onChange={(value) => productForm.setValue("active", value)} />
            <ToggleField label="Destacar oferta" checked={productForm.watch("featured")} onChange={(value) => productForm.setValue("featured", value)} />
            {saveProduct.error && <p role="alert" className="text-sm text-destructive">{saveProduct.error.message}</p>}
            <div className="flex flex-wrap gap-2"><Button disabled={saveProduct.isPending || uploading}>{uploading ? "Enviando mídia…" : saveProduct.isPending ? "Salvando…" : "Salvar produto"}</Button>{editing && <Button type="button" variant="outline" disabled={saveProduct.isPending} onClick={resetProduct}>Cancelar</Button>}</div>
          </form>
        </div>
        <div className="rounded-2xl border bg-card p-5 sm:p-6">
          <h2 className="mb-4 text-xl font-bold">Categorias</h2>
          <form className="space-y-3" onSubmit={categoryForm.handleSubmit((value) => saveCategory.mutate(value))}>
            <Field label="Nome" error={categoryForm.formState.errors.name?.message}><Input {...categoryForm.register("name")} /></Field><Field label="Descrição"><Textarea {...categoryForm.register("description")} /></Field><ToggleField label="Categoria ativa" checked={categoryForm.watch("active")} onChange={(value) => categoryForm.setValue("active", value)} />
            {saveCategory.error && <p role="alert" className="text-sm text-destructive">{saveCategory.error.message}</p>}<div className="flex gap-2"><Button disabled={saveCategory.isPending}>{categoryEditing ? "Salvar categoria" : "Criar categoria"}</Button>{categoryEditing && <Button type="button" variant="outline" disabled={saveCategory.isPending} onClick={() => { setCategoryEditing(null); categoryForm.reset(); }}>Cancelar</Button>}</div>
          </form>
          <ul className="mt-5 divide-y">{data.categories.map((category) => <li key={category.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><span>{category.name}{!category.active && " (inativa)"}</span><span className="flex gap-2"><Button size="sm" variant="outline" disabled={saveCategory.isPending} onClick={() => { setCategoryEditing(category); categoryForm.reset({ name: category.name, description: category.description ?? "", active: category.active }); }}>Editar</Button><Button size="sm" variant="destructive" disabled={removeCategory.isPending || saveCategory.isPending} onClick={() => { if (confirm("Excluir categoria? Os produtos vinculados ficarão sem categoria (não serão excluídos).")) removeCategory.mutate(category.id); }}>Excluir</Button></span></li>)}</ul>
          {removeCategory.error && <p role="alert" className="text-sm text-destructive">{removeCategory.error.message}</p>}
        </div>
      </section>
      <section className="min-w-0 self-start rounded-2xl border bg-card p-5"><h2 className="mb-4 text-xl font-bold">Produtos cadastrados ({data.products.length})</h2>{!data.products.length ? <p className="text-sm text-muted-foreground">Nenhum produto cadastrado.</p> : <div className="space-y-3">{data.products.map((product) => <article key={product.id} className="flex gap-3 rounded-xl border p-3"><img src={product.main_image ?? ""} alt="" className="h-16 w-16 shrink-0 rounded-lg object-contain" /><div className="min-w-0 flex-1"><p className="truncate font-semibold">{product.name}</p><p className="text-sm text-muted-foreground">R$ {Number(product.promo_price).toFixed(2)} · {product.active ? "Ativo" : "Inativo"}</p><div className="mt-2 flex gap-2"><Button size="sm" variant="outline" disabled={saveProduct.isPending} onClick={() => editProduct(product)}>Editar</Button><Button size="sm" variant="destructive" disabled={removeProduct.isPending || saveProduct.isPending} onClick={() => { if (confirm(`Excluir “${product.name}”?`)) removeProduct.mutate(product.id); }}>Excluir</Button></div></div></article>)}</div>}{removeProduct.error && <p role="alert" className="mt-3 text-sm text-destructive">{removeProduct.error.message}</p>}</section>
    </div>
  );
}
function Field({ label, error, children, className }: { label: string; error?: string | undefined; children: React.ReactNode; className?: string }) { return <label className={`block space-y-1 text-sm font-medium ${className ?? ""}`}>{label}{children}{error && <span role="alert" className="block text-xs text-destructive">{error}</span>}</label>; }
function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) { return <div className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"><span>{label}</span><Switch checked={checked} onCheckedChange={onChange} /></div>; }

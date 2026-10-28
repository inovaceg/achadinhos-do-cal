import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Category, Product } from "@/lib/queries";
import { categoryFormSchema, productFormSchema, type CategoryForm, type ProductForm } from "@/lib/admin.schemas";
import { deleteAdminCategory, deleteAdminProduct, saveAdminCategory, saveAdminProduct } from "@/lib/admin.functions";
import { uploadImage } from "@/lib/media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

type AdminData = { products: Product[]; categories: Category[] };
const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export function AdminEditor({ data, userId }: { data: AdminData; userId: string }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Product | null>(null);
  const [categoryEditing, setCategoryEditing] = useState<Category | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const uploadToken = useRef(0);
  const productForm = useForm<ProductForm>({
    resolver: zodResolver(productFormSchema),
    defaultValues: { name: "", category_id: "", main_image: "", promo_price: 0, affiliate_url: "", description: "", store: "", active: true, featured: false },
  });
  const categoryForm = useForm<CategoryForm>({ resolver: zodResolver(categoryFormSchema), defaultValues: { name: "", description: "", active: true } });
  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin", userId] });
    await queryClient.invalidateQueries({ queryKey: ["products"] });
    await queryClient.invalidateQueries({ queryKey: ["categories"] });
  };
  const saveProduct = useMutation({
    mutationFn: (value: ProductForm) => saveAdminProduct({ data: { ...value, id: editing?.id, slug: editing?.slug, category_id: value.category_id, original_price: value.original_price ?? null } }),
    onSuccess: async () => { await refresh(); resetProduct(); },
  });
  const saveCategory = useMutation({
    mutationFn: (value: CategoryForm) => saveAdminCategory({ data: { ...value, id: categoryEditing?.id, slug: categoryEditing?.slug } }),
    onSuccess: async () => { await refresh(); setCategoryEditing(null); categoryForm.reset(); },
  });
  const removeProduct = useMutation({ mutationFn: (id: string) => deleteAdminProduct({ data: { id } }), onSuccess: refresh });
  const removeCategory = useMutation({ mutationFn: (id: string) => deleteAdminCategory({ data: { id } }), onSuccess: refresh });

  function resetProduct() {
    uploadToken.current += 1;
    setEditing(null);
    setUploadError("");
    setUploading(false);
    productForm.reset();
  }
  function editProduct(product: Product) {
    if (saveProduct.isPending) return;
    uploadToken.current += 1;
    setUploadError("");
    setUploading(false);
    setEditing(product);
    productForm.reset({ name: product.name, category_id: product.category_id ?? "", main_image: product.main_image ?? "", promo_price: Number(product.promo_price), affiliate_url: product.affiliate_url, description: product.description ?? "", store: product.store ?? "", original_price: product.original_price == null ? undefined : Number(product.original_price), active: product.active, featured: product.featured });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!imageTypes.includes(file.type) || file.size > 5 * 1024 * 1024) { setUploadError("Use imagem JPEG, PNG, WebP ou AVIF de até 5MB."); return; }
    const token = ++uploadToken.current;
    setUploading(true);
    setUploadError("");
    try {
      const url = await uploadImage(file, "products");
      if (token === uploadToken.current) productForm.setValue("main_image", url, { shouldValidate: true });
    } catch {
      if (token === uploadToken.current) setUploadError("Falha no envio da imagem. Verifique sua permissão e tente novamente.");
    } finally {
      if (token === uploadToken.current) setUploading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
      <section className="space-y-6">
        <div className="rounded-2xl border bg-card p-5">
          <h2 className="mb-4 text-xl font-bold">{editing ? "Editar produto" : "Cadastrar produto"}</h2>
          <form className="space-y-3" onSubmit={productForm.handleSubmit((value) => saveProduct.mutate(value))}>
            <Field label="Nome" error={productForm.formState.errors.name?.message}><Input {...productForm.register("name")} /></Field>
            <Field label="Categoria" error={productForm.formState.errors.category_id?.message}>
              <select className="h-10 w-full rounded-md border bg-background px-3" {...productForm.register("category_id")}>
                <option value="">Selecione uma categoria</option>
                {data.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </Field>
            <Field label="Foto do produto" error={uploadError || productForm.formState.errors.main_image?.message}>
              <input type="hidden" {...productForm.register("main_image")} />
              <input
                aria-label="Escolher foto do produto"
                aria-describedby="product-photo-help"
                disabled={uploading || saveProduct.isPending}
                className="block w-full cursor-pointer rounded-md border bg-background text-sm file:mr-3 file:cursor-pointer file:border-0 file:bg-primary file:px-4 file:py-2 file:font-medium file:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={handleUpload}
              />
              <p id="product-photo-help" className="text-xs text-muted-foreground">{productForm.watch("main_image") ? "Trocar foto" : "Escolher foto"} · JPEG, PNG, WebP ou AVIF · até 5MB</p>
              {uploading && <p role="status">Enviando imagem…</p>}
              {productForm.watch("main_image") && <img src={productForm.watch("main_image")} alt="Prévia da foto do produto" className="mt-2 h-32 w-32 rounded-lg border object-cover" onError={() => setUploadError("Não foi possível carregar a prévia da imagem.")} />}
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Preço de venda (R$)" error={productForm.formState.errors.promo_price?.message}><Input type="number" min="0.01" step="0.01" {...productForm.register("promo_price", { valueAsNumber: true })} /></Field>
              <Field label="Preço original (opcional)" error={productForm.formState.errors.original_price?.message}><Input type="number" min="0.01" step="0.01" {...productForm.register("original_price", { setValueAs: (value) => value === "" ? undefined : Number(value) })} /></Field>
            </div>
            <Field label="Link de afiliado (HTTP/HTTPS)" error={productForm.formState.errors.affiliate_url?.message}><Input type="url" placeholder="https://…" {...productForm.register("affiliate_url")} /></Field>
            <Field label="Loja"><Input {...productForm.register("store")} /></Field>
            <Field label="Descrição"><Textarea {...productForm.register("description")} /></Field>
            <ToggleField label="Produto ativo" checked={productForm.watch("active")} onChange={(value) => productForm.setValue("active", value)} />
            <ToggleField label="Destacar oferta" checked={productForm.watch("featured")} onChange={(value) => productForm.setValue("featured", value)} />
            {saveProduct.error && <p role="alert" className="text-sm text-destructive">{saveProduct.error.message}</p>}
            <div className="flex gap-2">
              <Button disabled={saveProduct.isPending || uploading || !!uploadError}>{uploading ? "Enviando imagem…" : saveProduct.isPending ? "Salvando…" : "Salvar produto"}</Button>
              {editing && <Button type="button" variant="outline" disabled={saveProduct.isPending} onClick={resetProduct}>Cancelar</Button>}
            </div>
          </form>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <h2 className="mb-4 text-xl font-bold">Categorias</h2>
          <form className="space-y-3" onSubmit={categoryForm.handleSubmit((value) => saveCategory.mutate(value))}>
            <Field label="Nome" error={categoryForm.formState.errors.name?.message}><Input {...categoryForm.register("name")} /></Field>
            <Field label="Descrição"><Textarea {...categoryForm.register("description")} /></Field>
            <ToggleField label="Categoria ativa" checked={categoryForm.watch("active")} onChange={(value) => categoryForm.setValue("active", value)} />
            {saveCategory.error && <p role="alert" className="text-sm text-destructive">{saveCategory.error.message}</p>}
            <div className="flex gap-2">
              <Button disabled={saveCategory.isPending}>{categoryEditing ? "Salvar categoria" : "Criar categoria"}</Button>
              {categoryEditing && <Button type="button" variant="outline" disabled={saveCategory.isPending} onClick={() => { setCategoryEditing(null); categoryForm.reset(); }}>Cancelar</Button>}
            </div>
          </form>
          <ul className="mt-5 divide-y">
            {data.categories.map((category) => (
              <li key={category.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span>{category.name}{!category.active && " (inativa)"}</span>
                <span className="flex gap-2">
                  <Button size="sm" variant="outline" disabled={saveCategory.isPending} onClick={() => { setCategoryEditing(category); categoryForm.reset({ name: category.name, description: category.description ?? "", active: category.active }); }}>Editar</Button>
                  <Button size="sm" variant="destructive" disabled={removeCategory.isPending || saveCategory.isPending} onClick={() => { if (confirm("Excluir categoria? Os produtos vinculados ficarão sem categoria (não serão excluídos).")) removeCategory.mutate(category.id); }}>Excluir</Button>
                </span>
              </li>
            ))}
          </ul>
          {removeCategory.error && <p role="alert" className="text-sm text-destructive">{removeCategory.error.message}</p>}
        </div>
      </section>
      <section className="rounded-2xl border bg-card p-5">
        <h2 className="mb-4 text-xl font-bold">Produtos cadastrados ({data.products.length})</h2>
        {!data.products.length ? <p className="text-sm text-muted-foreground">Nenhum produto cadastrado.</p> : (
          <div className="space-y-3">
            {data.products.map((product) => (
              <article key={product.id} className="flex gap-3 rounded-xl border p-3">
                <img src={product.main_image ?? ""} alt="" className="h-16 w-16 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{product.name}</p>
                  <p className="text-sm text-muted-foreground">R$ {Number(product.promo_price).toFixed(2)} · {product.active ? "Ativo" : "Inativo"}</p>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="outline" disabled={saveProduct.isPending} onClick={() => editProduct(product)}>Editar</Button>
                    <Button size="sm" variant="destructive" disabled={removeProduct.isPending || saveProduct.isPending} onClick={() => { if (confirm(`Excluir “${product.name}”?`)) removeProduct.mutate(product.id); }}>Excluir</Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
        {removeProduct.error && <p role="alert" className="mt-3 text-sm text-destructive">{removeProduct.error.message}</p>}
      </section>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string | undefined; children: React.ReactNode }) {
  return <label className="block space-y-1 text-sm font-medium">{label}{children}{error && <span role="alert" className="block text-xs text-destructive">{error}</span>}</label>;
}
function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <div className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"><span>{label}</span><Switch checked={checked} onCheckedChange={onChange} /></div>;
}

import { createFileRoute } from "@tanstack/react-router";
import { siteUrl } from "@/lib/seo";

export const Route = createFileRoute("/_site/termos")({
  head: () => ({
    meta: [
      { title: "Termos de uso — Achadinhos do Cal" },
      { name: "description", content: "Termos de uso do Achadinhos do Cal, site de curadoria de ofertas com links de afiliados." },
      { property: "og:title", content: "Termos de uso — Achadinhos do Cal" },
      { property: "og:description", content: "Termos de uso do site de curadoria de ofertas Achadinhos do Cal." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: siteUrl("/termos") },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: siteUrl("/termos") }],
  }),
  component: () => (
    <article className="mx-auto max-w-3xl space-y-4 px-4 py-10 text-sm leading-relaxed [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-bold">
      <h1 className="text-3xl font-extrabold">Termos de uso</h1>
      <h2>Sobre o site</h2>
      <p>O Achadinhos do Cal é um site de curadoria e divulgação de ofertas. Não vendemos produtos, não temos carrinho, checkout ou estoque. Toda compra é concluída exclusivamente no site da loja de destino.</p>
      <h2>Links de afiliados</h2>
      <p>Alguns links são de programas de afiliados. Podemos receber uma comissão quando você compra por eles, sem nenhum custo adicional para você.</p>
      <h2>Preços e disponibilidade</h2>
      <p>Os preços exibidos são os registrados na última atualização e podem mudar sem aviso. A disponibilidade, entrega, garantia e atendimento são de responsabilidade da loja.</p>
      <h2>Pagamentos</h2>
      <p>O Achadinhos do Cal não processa pagamentos nem armazena dados financeiros.</p>
    </article>
  ),
});

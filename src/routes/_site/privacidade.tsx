import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_site/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de privacidade — Achadinhos do Cal" },
      { name: "description", content: "Como o Achadinhos do Cal trata dados de navegação e métricas, conforme a LGPD." },
      { property: "og:title", content: "Política de privacidade — Achadinhos do Cal" },
      { property: "og:description", content: "Como tratamos dados de navegação e métricas, conforme a LGPD." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <article className="mx-auto max-w-3xl space-y-4 px-4 py-10 text-sm leading-relaxed [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-bold">
      <h1 className="text-3xl font-extrabold">Política de privacidade</h1>
      <p>O Achadinhos do Cal respeita sua privacidade e segue a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).</p>
      <h2>Quais dados coletamos</h2>
      <p>Não pedimos cadastro de visitantes. Registramos apenas métricas anônimas: visualizações de páginas de produtos e cliques nos botões de oferta e banners, associados a um identificador aleatório gerado no seu navegador. Não coletamos nome, e-mail, CPF ou dados de pagamento.</p>
      <h2>Para que usamos</h2>
      <p>Para entender quais ofertas interessam mais, exibir seções como “Mais procurados” e “Mais clicados” e evitar contagens artificiais.</p>
      <h2>Favoritos</h2>
      <p>Seus favoritos ficam salvos somente no armazenamento local do seu navegador e não são enviados para nossos servidores.</p>
      <h2>Lojas externas</h2>
      <p>Ao clicar em “Ver oferta”, você é levado ao site da loja, que possui sua própria política de privacidade e pode usar cookies de afiliados.</p>
      <h2>Seus direitos</h2>
      <p>Você pode limpar os dados do site no seu navegador a qualquer momento. Para dúvidas, utilize o contato informado no rodapé.</p>
    </article>
  ),
});

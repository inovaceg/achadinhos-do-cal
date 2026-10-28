import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Instagram, Mail, MessageCircle, Music2 } from "lucide-react";
import { settingsQuery } from "@/lib/queries";
import { Logo } from "./Logo";

function waLink(n: string) {
  return `https://wa.me/${n.replace(/\D/g, "")}`;
}
function social(handleOrUrl: string, base: string) {
  return /^https?:\/\//.test(handleOrUrl) ? handleOrUrl : base + handleOrUrl.replace(/^@/, "");
}

export function SiteFooter() {
  const { data: s } = useQuery(settingsQuery);
  return (
    <footer className="mt-16 bg-secondary text-secondary-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="[&_span]:text-secondary-foreground"><Logo size={56} /></div>
          <p className="max-w-sm text-sm opacity-80">Achadinhos para facilitar sua vida e cuidar do seu bolso.</p>
          <div className="flex gap-2">
            {s?.instagram && (
              <a href={social(s.instagram, "https://instagram.com/")} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid h-11 w-11 place-items-center rounded-full bg-sidebar-accent hover:bg-primary">
                <Instagram className="h-4 w-4" />
              </a>
            )}
            {s?.tiktok && (
              <a href={social(s.tiktok, "https://tiktok.com/@")} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="grid h-11 w-11 place-items-center rounded-full bg-sidebar-accent hover:bg-primary">
                <Music2 className="h-4 w-4" />
              </a>
            )}
            {s?.whatsapp && (
              <a href={waLink(s.whatsapp)} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="grid h-11 w-11 place-items-center rounded-full bg-sidebar-accent hover:bg-primary">
                <MessageCircle className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
        <div className="space-y-3 text-sm">
          <h3 className="font-semibold">Navegação</h3>
          <ul className="space-y-2 opacity-80">
            <li><Link to="/ofertas" className="hover:text-primary">Todas as ofertas</Link></li>
            <li><Link to="/favoritos" className="hover:text-primary">Favoritos</Link></li>
            <li><Link to="/privacidade" className="hover:text-primary">Política de privacidade</Link></li>
            <li><Link to="/termos" className="hover:text-primary">Termos de uso</Link></li>
            <li><Link to="/admin" className="opacity-60 hover:text-primary">Administração</Link></li>
          </ul>
        </div>
        {s?.contact_email && <div className="space-y-3 text-sm">
          <h3 className="font-semibold">Contato</h3>
          <a href={`mailto:${s.contact_email}`} className="flex min-h-11 items-center gap-2 break-all opacity-80 hover:text-primary">
            <Mail className="h-4 w-4" /> {s.contact_email}
          </a>
        </div>}
      </div>
      <div className="border-t border-sidebar-border">
        <div className="mx-auto max-w-7xl space-y-2 px-4 py-6 text-xs opacity-70">
          {s?.affiliate_notice && <p><strong>Aviso de afiliados:</strong> {s.affiliate_notice}</p>}
          <p>
            Os preços exibidos são os registrados na última atualização e podem mudar sem aviso. A disponibilidade é
            responsabilidade de cada loja. As compras são realizadas em sites externos — o Achadinhos do Cal não
            processa pagamentos.
          </p>
          <p>© {new Date().getFullYear()} {s?.site_name ?? "Achadinhos do Cal"}</p>
        </div>
      </div>
    </footer>
  );
}

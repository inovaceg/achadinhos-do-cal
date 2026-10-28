import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getAdminData } from "@/lib/admin.functions";
import { AdminEditor } from "@/components/admin/AdminEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin")({ component: AdminPage });

function AdminPage() {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [authError, setAuthError] = useState("");
  const [loginPending, setLoginPending] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);
  const previousUserId = useRef<string | null>(null);

  useEffect(() => {
    let alive = true;
    let receivedAuthEvent = false;
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      receivedAuthEvent = true;
      const nextUserId = next?.user.id ?? null;
      if (previousUserId.current !== nextUserId) {
        previousUserId.current = nextUserId;
        void queryClient.cancelQueries({ queryKey: ["admin"] });
        queryClient.removeQueries({ queryKey: ["admin"] });
        queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== "admin" });
      }
      setSession(next);
    });
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!alive || receivedAuthEvent) return;
      if (error) {
        setAuthError("Não foi possível verificar a sessão. Tente novamente.");
        setSession(null);
        return;
      }
      const current = data.session;
      previousUserId.current = current?.user.id ?? null;
      setSession(current);
    }).catch(() => {
      if (alive && !receivedAuthEvent) {
        setAuthError("Não foi possível verificar a sessão. Tente novamente.");
        setSession(null);
      }
    });
    return () => {
      alive = false;
      listener.subscription.unsubscribe();
    };
  }, [queryClient]);

  const dataQuery = useQuery({
    queryKey: ["admin", session?.user.id],
    queryFn: () => getAdminData(),
    enabled: !!session?.user.id,
    retry: false,
  });

  const login = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError("");
    setLoginPending(true);
    const form = new FormData(event.currentTarget);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: String(form.get("email")),
        password: String(form.get("password")),
      });
      if (error) setAuthError("Não foi possível entrar. Confira os dados ou confirme se a conta possui acesso de administrador.");
    } catch {
      setAuthError("Não foi possível entrar. Tente novamente.");
    } finally {
      setLoginPending(false);
    }
  };

  const logout = async () => {
    setAuthError("");
    setLogoutPending(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) setAuthError("Não foi possível sair. Tente novamente.");
    } catch {
      setAuthError("Não foi possível sair. Tente novamente.");
    } finally {
      setLogoutPending(false);
    }
  };

  if (session === undefined) {
    return <main className="mx-auto max-w-5xl px-4 py-16">Carregando sessão…</main>;
  }

  if (!session) {
    return (
      <main className="mx-auto max-w-md px-4 py-16">
        <section className="rounded-2xl border bg-card p-6">
          <h1 className="text-2xl font-bold">Acesso administrativo</h1>
          <p className="my-3 text-sm text-muted-foreground">Entre com uma conta existente autorizada como administradora. Não é possível criar contas nesta tela.</p>
          <form onSubmit={login} className="space-y-3">
            <label className="block space-y-1 text-sm font-medium">E-mail
              <Input name="email" type="email" autoComplete="username" required />
            </label>
            <label className="block space-y-1 text-sm font-medium">Senha
              <Input name="password" type="password" autoComplete="current-password" required />
            </label>
            <Button className="w-full" disabled={loginPending}>{loginPending ? "Entrando…" : "Entrar"}</Button>
          </form>
          {authError && <p role="alert" className="mt-3 text-sm text-destructive">{authError}</p>}
          <Link to="/" className="mt-4 inline-block text-sm underline">Voltar ao início</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">Administração</h1>
          <p className="text-sm text-muted-foreground">Produtos e categorias</p>
        </div>
        <Button variant="outline" disabled={logoutPending} onClick={logout}>{logoutPending ? "Saindo…" : "Sair"}</Button>
      </header>
      {authError && <p role="alert" className="rounded-xl border border-destructive p-3 text-sm text-destructive">{authError}</p>}
      {dataQuery.isPending ? <p>Carregando dados…</p> : dataQuery.isError ? (
        <section role="alert" className="rounded-xl border border-destructive p-4">
          <p>{dataQuery.error.message.includes("Acesso negado") ? "Esta conta não possui permissão de administrador. Solicite acesso ao responsável pelo projeto." : "Não foi possível carregar os dados administrativos. Tente novamente."}</p>
          <Button className="mt-3" variant="outline" onClick={() => dataQuery.refetch()}>Tentar novamente</Button>
        </section>
      ) : <AdminEditor key={session.user.id} data={dataQuery.data} userId={session.user.id} />}
    </main>
  );
}

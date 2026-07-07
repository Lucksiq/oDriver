import Link from "next/link";

export const metadata = {
  title: "Termos de Uso — oDriver",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <Link href="/login" className="text-sm text-primary underline">
        ← Voltar
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Termos de Uso</h1>
        <p className="mt-1 text-xs text-muted-foreground">Última atualização: julho de 2026.</p>
      </div>

      <div className="rounded-md border border-warning bg-warning/10 p-3 text-sm">
        <strong>Aviso:</strong> este documento é um modelo técnico e não substitui aconselhamento
        jurídico — recomendamos revisão por um advogado antes da publicação oficial ou de qualquer
        lançamento comercial.
      </div>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">1. Aceitação</h2>
        <p className="text-sm text-muted-foreground">
          Ao criar uma conta no oDriver, você concorda com estes Termos de Uso e com a nossa{" "}
          <Link href="/privacy" className="underline">
            Política de Privacidade
          </Link>
          . Se você não concordar, não utilize o aplicativo.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">2. O que é o oDriver</h2>
        <p className="text-sm text-muted-foreground">
          O oDriver é uma ferramenta de controle financeiro e comunidade para motoristas de
          aplicativo (Uber, 99, iFood e outras plataformas). Os cálculos e projeções exibidos no
          app (lucro real, custo por km, projeção de meta) são estimativas baseadas nos dados que
          você mesmo informa — não somos responsáveis por decisões financeiras tomadas com base
          nessas estimativas.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">3. Sua conta</h2>
        <p className="text-sm text-muted-foreground">
          Você é responsável por manter a confidencialidade da sua senha e por tudo o que acontece
          na sua conta. Informe dados verdadeiros no cadastro (incluindo telefone com DDD, que é
          obrigatório). Você deve ter pelo menos 18 anos para usar o oDriver.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">4. Conteúdo de comunidade</h2>
        <p className="text-sm text-muted-foreground">
          Ocorrências de mapa, posts do feed e áudios de voz são gerados pelos próprios usuários.
          Não garantimos a exatidão desse conteúdo — ocorrências no mapa podem ser removidas
          automaticamente quando a comunidade sinaliza que já não existem mais. É proibido publicar
          conteúdo ofensivo, ilegal ou que viole direitos de terceiros; contas que violarem essa
          regra podem ser suspensas ou excluídas por um administrador.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">5. oDriver Premium</h2>
        <p className="text-sm text-muted-foreground">
          Alguns recursos (criar grupos de ranking, criar canais de voz, áudios de voz acima de
          30 segundos) exigem uma assinatura Premium. As condições comerciais da assinatura
          (preço, cobrança, cancelamento) serão detalhadas na tela de assinatura no momento da
          contratação.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">6. Exclusão de conta</h2>
        <p className="text-sm text-muted-foreground">
          Você pode excluir sua conta a qualquer momento pela tela de Perfil. A exclusão é
          permanente e remove todos os seus dados do nosso banco — não há como desfazer essa ação.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">7. Alterações nestes termos</h2>
        <p className="text-sm text-muted-foreground">
          Podemos atualizar estes termos conforme o app evolui. Mudanças relevantes serão
          comunicadas dentro do próprio app.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">8. Lei aplicável</h2>
        <p className="text-sm text-muted-foreground">
          Estes termos são regidos pelas leis da República Federativa do Brasil.
        </p>
      </section>
    </div>
  );
}

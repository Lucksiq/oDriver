import Link from "next/link";

export const metadata = {
  title: "Política de Privacidade — oDriver",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <Link href="/login" className="text-sm text-primary underline">
        ← Voltar
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Política de Privacidade</h1>
        <p className="mt-1 text-xs text-muted-foreground">Última atualização: julho de 2026.</p>
      </div>

      <div className="rounded-md border border-warning bg-warning/10 p-3 text-sm">
        <strong>Aviso:</strong> este documento é um modelo técnico, redigido para descrever com
        precisão o que o oDriver realmente coleta e faz com os dados. Ele não substitui
        aconselhamento jurídico — recomendamos revisão por um advogado antes da publicação
        oficial ou de qualquer lançamento comercial.
      </div>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">1. Quem somos</h2>
        <p className="text-sm text-muted-foreground">
          O oDriver é um aplicativo de controle financeiro e comunidade para motoristas de
          aplicativo. Esta política explica quais dados pessoais coletamos, por quê, com quem
          compartilhamos e quais direitos você tem sobre eles, em conformidade com a Lei Geral de
          Proteção de Dados (LGPD — Lei nº 13.709/2018).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">2. Quais dados coletamos</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li><strong>Cadastro:</strong> nome, e-mail, telefone (com DDD), senha (armazenada de forma criptografada).</li>
          <li><strong>Perfil:</strong> cidade, estado, plataformas em que você trabalha (Uber, 99, iFood, outra).</li>
          <li><strong>Dados financeiros:</strong> corridas, despesas, ganhos extras e metas que você registra — são privados, só você tem acesso.</li>
          <li><strong>Localização (GPS):</strong> usada para centralizar o mapa na sua região e sugerir sua cidade/clima; você pode negar a permissão do navegador a qualquer momento.</li>
          <li><strong>Ocorrências de mapa:</strong> tipo, localização e descrição de ocorrências que você reportar (acidente, bloqueio, radar etc.) — são públicas para a comunidade, como no Waze.</li>
          <li><strong>Áudios de voz:</strong> gravações que você envia nos canais de voz, guardadas por até 12 horas e depois apagadas automaticamente.</li>
          <li><strong>Conteúdo de comunidade:</strong> posts, reações e participação em grupos de ranking que você criar ou usar.</li>
          <li><strong>Notificações push:</strong> se você ativar, guardamos um identificador técnico do seu navegador (endpoint de push) para poder te avisar sobre metas batidas.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">3. Para que usamos esses dados</h2>
        <p className="text-sm text-muted-foreground">
          Para viabilizar as funcionalidades do próprio app: calcular seu lucro real e custo por
          km, mostrar o mapa e o clima da sua região, permitir que você participe da comunidade e
          de rankings, enviar notificações que você mesmo ativou, e dar suporte à sua conta. Não
          vendemos seus dados pessoais a terceiros.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">4. Com quem compartilhamos</h2>
        <p className="text-sm text-muted-foreground">
          Usamos os seguintes prestadores de serviço, cada um recebendo apenas o dado estritamente
          necessário à sua função:
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li><strong>Supabase</strong> — hospedagem do banco de dados e autenticação.</li>
          <li><strong>Vercel</strong> — hospedagem da aplicação web.</li>
          <li><strong>TomTom</strong> — exibição do mapa e cálculo de localização por cidade.</li>
          <li><strong>OpenWeather</strong> — dados de clima da sua região.</li>
          <li><strong>Google</strong> — apenas se você optar por entrar com sua conta Google.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">5. Por quanto tempo guardamos</h2>
        <p className="text-sm text-muted-foreground">
          Seus dados ficam guardados enquanto sua conta existir. Áudios de voz são a exceção:
          expiram e são apagados automaticamente 12 horas após o envio. Se você excluir sua conta,
          todos os seus dados são apagados permanentemente (veja a seção 7).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">6. Seus direitos (LGPD, Art. 18)</h2>
        <p className="text-sm text-muted-foreground">Você tem direito a:</p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Confirmar se tratamos seus dados e acessá-los;</li>
          <li>Corrigir dados incompletos, inexatos ou desatualizados;</li>
          <li>Solicitar a portabilidade dos seus dados a outro fornecedor;</li>
          <li>Eliminar seus dados pessoais (excluindo sua conta);</li>
          <li>Revogar o consentimento a qualquer momento.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">7. Como exercer esses direitos</h2>
        <p className="text-sm text-muted-foreground">
          Direto no app, sem precisar entrar em contato: na tela de <strong>Perfil</strong>, use{" "}
          <strong>&quot;Editar perfil&quot;</strong> para corrigir dados, <strong>&quot;Baixar meus
          dados&quot;</strong> para exportar tudo que temos sobre você, ou{" "}
          <strong>&quot;Excluir minha conta&quot;</strong> para apagar tudo permanentemente. Para
          qualquer outra dúvida sobre seus dados, envie um e-mail para{" "}
          <a href="mailto:privacidade@odriver.app" className="underline">
            privacidade@odriver.app
          </a>
          .
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">8. Segurança</h2>
        <p className="text-sm text-muted-foreground">
          Seus dados financeiros e de perfil são protegidos por controle de acesso a nível de
          linha no banco de dados (RLS) — só você (e, quando estritamente necessário para
          moderação, um administrador) consegue ler ou alterar suas informações privadas.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">9. Alterações nesta política</h2>
        <p className="text-sm text-muted-foreground">
          Podemos atualizar esta política conforme o app evolui. Mudanças relevantes serão
          comunicadas dentro do próprio app.
        </p>
      </section>
    </div>
  );
}

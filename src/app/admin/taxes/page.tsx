"use client";

import { useState } from "react";
import {
  Building2, DollarSign, Calendar, MapPin, Receipt, Car,
  Users, FileText, PiggyBank, Clock, ChevronDown, AlertTriangle,
  CheckCircle, Info
} from "lucide-react";

interface Section {
  id: string;
  icon: React.ElementType;
  title: string;
  color: string;
  content: React.ReactNode;
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 flex gap-3 my-4">
      <Info size={18} className="text-accent shrink-0 mt-0.5" />
      <p className="text-sm text-accent/90">{children}</p>
    </div>
  );
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-error/10 border border-error/30 rounded-xl p-4 flex gap-3 my-4">
      <AlertTriangle size={18} className="text-error shrink-0 mt-0.5" />
      <p className="text-sm text-error/90">{children}</p>
    </div>
  );
}

function Example({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-4 my-4">
      <p className="text-sm text-secondary/90">{children}</p>
    </div>
  );
}

function Item({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 mb-2">
      <CheckCircle size={14} className="text-success shrink-0 mt-1" />
      <span className="text-text-secondary text-sm">{children}</span>
    </div>
  );
}

const sections: Section[] = [
  {
    id: "como-funciona",
    icon: Building2,
    title: "Como Funciona o Imposto da Sua Empresa",
    color: "from-primary to-secondary",
    content: (
      <div>
        <p className="text-text-secondary text-sm mb-4">
          Sua empresa (LLC) nao paga imposto separado. O lucro da empresa entra na sua declaracao pessoal de imposto de renda. Voce e a empresa sao a mesma coisa para o governo.
        </p>
        <p className="text-text-secondary text-sm mb-4">
          Todo ano, voce declara quanto a empresa ganhou e quanto gastou. O governo cobra imposto so sobre o <strong className="text-accent">LUCRO</strong> — ou seja, o que sobrou depois de pagar todas as despesas.
        </p>
        <Example>
          Exemplo: Sua empresa de piso ganhou $100,000 no ano. Voce gastou $60,000 com materiais, ferramentas, gasolina, seguro, etc. O governo cobra imposto so sobre os $40,000 que sobraram.
        </Example>
        <p className="text-text-secondary text-sm mb-4">
          Por isso e tao importante anotar TODOS os gastos do negocio — quanto mais gasto registrado, menos imposto voce paga.
        </p>
        <Tip>
          Prazo para declarar: todo ano ate 15 de Abril. Use um contador para preparar sua declaracao — o valor que ele cobra tambem pode ser abatido!
        </Tip>
      </div>
    ),
  },
  {
    id: "quanto-paga",
    icon: DollarSign,
    title: "Quanto Voce Paga de Imposto",
    color: "from-error to-warning",
    content: (
      <div>
        <p className="text-text-secondary text-sm mb-4">
          Quem trabalha por conta propria paga 3 tipos de imposto:
        </p>
        <div className="grid gap-3 mb-4">
          <div className="bg-card rounded-xl p-4 border border-border">
            <p className="text-accent font-bold text-sm">1. Imposto de Autonomo — ~15%</p>
            <p className="text-text-muted text-xs mt-1">Cobre aposentadoria (Social Security) e saude (Medicare). Todo mundo que trabalha por conta paga isso.</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <p className="text-accent font-bold text-sm">2. Imposto de Renda Federal — 10% a 37%</p>
            <p className="text-text-muted text-xs mt-1">Quanto mais ganha, maior a porcentagem. Para a maioria dos contractors de piso fica entre 12% e 22%.</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <p className="text-accent font-bold text-sm">3. Imposto da Georgia — 5.19%</p>
            <p className="text-text-muted text-xs mt-1">Imposto estadual. Paga uma vez por ano junto com o federal.</p>
          </div>
        </div>
        <Warning>
          Na pratica: separe pelo menos 25-30% de todo lucro para impostos. Se lucrou $40,000 no ano, reserve uns $10,000 a $12,000.
        </Warning>
        <Tip>
          Abra uma conta poupanca so para impostos. Toda vez que receber um pagamento, transfira 30% para essa conta. Assim quando chegar a hora de pagar, o dinheiro ja esta la.
        </Tip>
      </div>
    ),
  },
  {
    id: "trimestral",
    icon: Calendar,
    title: "Pagamentos a Cada 3 Meses",
    color: "from-warning to-accent",
    content: (
      <div>
        <p className="text-text-secondary text-sm mb-4">
          O governo nao espera ate abril para receber. Ele quer que voce pague aos poucos, 4 vezes por ano. Se nao pagar, leva multa.
        </p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { date: "15 de Abril", period: "Janeiro a Marco" },
            { date: "15 de Junho", period: "Abril a Junho" },
            { date: "15 de Setembro", period: "Julho a Setembro" },
            { date: "15 de Janeiro", period: "Outubro a Dezembro" },
          ].map((q) => (
            <div key={q.date} className="bg-card rounded-xl p-4 border border-border text-center">
              <p className="text-accent font-bold text-sm">{q.date}</p>
              <p className="text-text-muted text-xs mt-1">{q.period}</p>
            </div>
          ))}
        </div>
        <p className="text-text-secondary text-sm mb-4">
          <strong className="text-text">Como calcular:</strong> Pegue quanto voce acha que vai lucrar no ano, multiplique por 30%, e divida por 4. Esse e o valor de cada pagamento.
        </p>
        <Example>
          Exemplo: Voce acha que vai lucrar $60,000 no ano. $60,000 x 30% = $18,000 de imposto. $18,000 / 4 = $4,500 por trimestre.
        </Example>
        <Tip>
          Coloque lembretes no modulo "Lembretes" aqui no admin para nao esquecer as datas!
        </Tip>
      </div>
    ),
  },
  {
    id: "georgia",
    icon: MapPin,
    title: "Regras da Georgia",
    color: "from-success to-secondary",
    content: (
      <div>
        <p className="text-text-secondary text-sm mb-4">
          Alem dos impostos, sua empresa precisa renovar o registro na Georgia todo ano. E simples mas nao pode esquecer.
        </p>
        <div className="bg-card rounded-xl p-4 border border-border mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-text-muted text-xs">Prazo</p>
              <p className="text-accent font-bold">1 de Abril</p>
            </div>
            <div>
              <p className="text-text-muted text-xs">Custo</p>
              <p className="text-accent font-bold">$60 por ano</p>
            </div>
            <div>
              <p className="text-text-muted text-xs">Multa por atraso</p>
              <p className="text-error font-bold">$25</p>
            </div>
            <div>
              <p className="text-text-muted text-xs">Se nao renovar</p>
              <p className="text-error font-bold">Empresa fechada em 60 dias</p>
            </div>
          </div>
        </div>
        <p className="text-text-secondary text-sm mb-4">
          Faca pelo site <strong className="text-secondary">georgia.gov</strong> — e rapido e aceita cartao.
        </p>
        <p className="text-text-secondary text-sm mb-4">
          O imposto estadual da Georgia e <strong className="text-accent">5.19%</strong> sobre o lucro. Voce declara isso junto com o imposto federal.
        </p>
        <Warning>
          Se nao renovar ate 1 de Abril e nao pagar em 60 dias, o estado FECHA sua empresa automaticamente. Depois para reabrir custa mais caro e da trabalho.
        </Warning>
      </div>
    ),
  },
  {
    id: "deducoes",
    icon: Receipt,
    title: "Gastos que Reduzem Seu Imposto (Para Flooring)",
    color: "from-accent to-legendary",
    content: (
      <div>
        <p className="text-text-secondary text-sm mb-4">
          Tudo que voce gasta PARA o negocio reduz o valor que paga de imposto. E como se o governo dissesse: &ldquo;se gastou com o trabalho, nao precisa pagar imposto sobre isso.&rdquo;
        </p>
        <p className="text-text font-bold text-sm mb-3">Exemplos REAIS de um instalador de pisos:</p>
        <div className="grid sm:grid-cols-2 gap-2 mb-4">
          {[
            "Serra, lixadeira, nivelador, espatulas",
            "Martelo de borracha, nivel a laser",
            "Madeira, porcelanato, rejunte, argamassa",
            "Cola, rodape, perfis de acabamento",
            "Gasolina ou milhas para ir aos jobs",
            "Seguro da empresa e do carro",
            "Telefone celular (parte comercial)",
            "Instagram ads, cartoes de visita, site",
            "Aluguel de van ou trailer",
            "Uniforme, botas, luvas, oculos",
            "Contador e advogado",
            "Aluguel de equipamento pesado",
            "Cursos e treinamentos de flooring",
            "Programas e apps do negocio",
          ].map((item) => (
            <Item key={item}>{item}</Item>
          ))}
        </div>
        <Warning>
          GUARDE TODOS OS RECIBOS! Sem recibo, nao pode abater. Tire foto pelo celular assim que comprar — vale como comprovante.
        </Warning>
        <Tip>
          Use o modulo &ldquo;Financeiro&rdquo; aqui no admin para registrar cada gasto. No final do ano, exporte o relatorio e entregue ao seu contador.
        </Tip>
      </div>
    ),
  },
  {
    id: "milhas",
    icon: Car,
    title: "Abatimento por Quilometragem (Muito Importante!)",
    color: "from-secondary to-primary",
    content: (
      <div>
        <p className="text-text-secondary text-sm mb-4">
          Como instalador de piso, voce dirige MUITO — e isso vale dinheiro no imposto! Cada milha que voce dirige a trabalho da um desconto.
        </p>
        <div className="bg-accent/10 border border-accent/30 rounded-xl p-5 text-center mb-4">
          <p className="text-text-muted text-xs">Valor por milha em 2026</p>
          <p className="text-accent font-[family-name:var(--font-display)] text-3xl font-black">$0.725</p>
        </div>
        <p className="text-text font-bold text-sm mb-2">O que conta como milha de trabalho:</p>
        <div className="mb-4">
          <Item>Ir para a casa do cliente instalar piso</Item>
          <Item>Ir na Home Depot comprar material</Item>
          <Item>Ir no banco depositar cheque</Item>
          <Item>Ir ver um orcamento na casa do cliente</Item>
          <Item>Ir buscar equipamento alugado</Item>
        </div>
        <p className="text-text font-bold text-sm mb-2">O que NAO conta:</p>
        <div className="mb-4">
          {["Ir ao mercado", "Levar filho na escola", "Viagem pessoal", "Ir pra academia"].map((item) => (
            <div key={item} className="flex items-start gap-2 mb-2">
              <span className="text-error text-sm">✕</span>
              <span className="text-text-secondary text-sm">{item}</span>
            </div>
          ))}
        </div>
        <Example>
          Exemplo: Voce rodou 12,000 milhas a trabalho no ano. 12,000 x $0.725 = $8,700 de desconto no imposto! Isso pode economizar mais de $2,000 no que voce paga.
        </Example>
        <Tip>
          Use o modulo &ldquo;Quilometragem&rdquo; aqui no admin para anotar cada viagem. E rapido e no final do ano voce tem tudo pronto pro contador.
        </Tip>
      </div>
    ),
  },
  {
    id: "ajudantes",
    icon: Users,
    title: "Quando Voce Contrata Ajudante no Flooring",
    color: "from-epic to-primary",
    content: (
      <div>
        <p className="text-text-secondary text-sm mb-4">
          Se voce pagou mais de $600 no ano para um ajudante (helper), precisa enviar um papel ao governo chamado 1099.
        </p>
        <div className="bg-card rounded-xl p-4 border border-border mb-4">
          <p className="text-text font-bold text-sm mb-2">Passo a passo:</p>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">1</span>
              <span className="text-text-secondary text-sm">ANTES de pagar, peca o W-9 do ajudante (papel com nome e numero de identificacao)</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">2</span>
              <span className="text-text-secondary text-sm">Anote todos os pagamentos feitos durante o ano</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">3</span>
              <span className="text-text-secondary text-sm">Ate 31 de Janeiro, envie o 1099 para o ajudante e para o governo</span>
            </div>
          </div>
        </div>
        <Warning>
          CUIDADO: ajudante (contractor) e diferente de empregado (employee). Se o governo achar que seu &ldquo;ajudante&rdquo; era na verdade empregado, a multa e PESADA.
        </Warning>
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <div className="bg-success/10 border border-success/30 rounded-xl p-4">
            <p className="text-success font-bold text-sm mb-2">Ajudante (OK)</p>
            <p className="text-text-muted text-xs">Trabalha quando quer</p>
            <p className="text-text-muted text-xs">Usa ferramentas dele</p>
            <p className="text-text-muted text-xs">Voce nao controla horario</p>
            <p className="text-text-muted text-xs">Trabalha pra outras pessoas tambem</p>
          </div>
          <div className="bg-error/10 border border-error/30 rounded-xl p-4">
            <p className="text-error font-bold text-sm mb-2">Empregado (Cuidado)</p>
            <p className="text-text-muted text-xs">Voce controla horario</p>
            <p className="text-text-muted text-xs">Voce da as ferramentas</p>
            <p className="text-text-muted text-xs">Paga por hora fixa</p>
            <p className="text-text-muted text-xs">Trabalha so pra voce</p>
          </div>
        </div>
        <Tip>
          Use o modulo &ldquo;Ajudantes&rdquo; aqui no admin para controlar pagamentos e status do W-9 de cada pessoa.
        </Tip>
      </div>
    ),
  },
  {
    id: "schedule-c",
    icon: FileText,
    title: "Schedule C — Onde Cada Gasto Vai",
    color: "from-secondary to-success",
    content: (
      <div>
        <p className="text-text-secondary text-sm mb-4">
          O Schedule C e o formulario onde voce declara o lucro da empresa. Ele tem linhas numeradas — cada tipo de gasto vai em uma linha especifica. Seu contador preenche isso, mas e bom saber onde cada coisa vai.
        </p>
        <div className="space-y-2 mb-4">
          {[
            { line: "Linha 8", name: "Propaganda", example: "Cartoes de visita, Instagram ads, Google ads, site" },
            { line: "Linha 9", name: "Carro", example: "Milhas rodadas a trabalho OU gastos reais do carro" },
            { line: "Linha 10", name: "Comissoes", example: "Se paga alguem para trazer clientes" },
            { line: "Linha 11", name: "Ajudantes", example: "O que pagou a helpers/subcontratados" },
            { line: "Linha 15", name: "Seguro", example: "Seguro da empresa, do carro (parte comercial)" },
            { line: "Linha 17", name: "Contador/Advogado", example: "Honorarios profissionais" },
            { line: "Linha 18", name: "Home Office", example: "Se usa espaco da casa para o negocio" },
            { line: "Linha 22", name: "Materiais", example: "Madeira, porcelanato, rejunte, cola, tudo dos jobs" },
            { line: "Linha 24a", name: "Viagem", example: "Hotel quando viaja a trabalho" },
            { line: "Linha 24b", name: "Refeicoes", example: "Almoco com cliente (metade do valor)" },
            { line: "Linha 25", name: "Telefone/Internet", example: "A parte que usa para o negocio" },
          ].map((item) => (
            <div key={item.line} className="bg-card rounded-xl p-3 border border-border flex items-start gap-3">
              <span className="bg-primary/20 text-primary-light text-xs font-bold px-2 py-1 rounded-lg shrink-0">{item.line}</span>
              <div>
                <p className="text-text text-sm font-semibold">{item.name}</p>
                <p className="text-text-muted text-xs">{item.example}</p>
              </div>
            </div>
          ))}
        </div>
        <Tip>
          Voce nao precisa decorar isso — seu contador cuida. Mas se voce organizar seus gastos por categoria no modulo &ldquo;Financeiro&rdquo;, fica muito mais facil e rapido pro contador.
        </Tip>
      </div>
    ),
  },
  {
    id: "organizacao",
    icon: PiggyBank,
    title: "Dicas de Organizacao do Dinheiro",
    color: "from-accent to-success",
    content: (
      <div>
        <div className="space-y-3 mb-4">
          {[
            { rule: "NUNCA misture dinheiro pessoal com dinheiro da empresa", desc: "Tenha uma conta bancaria separada so para a empresa. Tudo que entra e sai do negocio passa por essa conta." },
            { rule: "Guarde TODOS os recibos", desc: "Foto no celular vale como comprovante. Tire foto assim que comprar e salve." },
            { rule: "Anote tudo que entra e sai", desc: "Use o modulo Financeiro aqui no admin. Cada pagamento recebido e cada gasto." },
            { rule: "No final do mes, faca o resumo", desc: "Some quanto entrou e quanto saiu. Lucro = o que entrou menos o que saiu." },
            { rule: "Guarde documentos por 7 anos", desc: "O governo pode pedir para ver seus documentos de ate 7 anos atras." },
            { rule: "Pague-se um salario fixo", desc: "Defina quanto voce tira da empresa por mes para despesas pessoais. O resto fica na conta da empresa." },
          ].map((item) => (
            <div key={item.rule} className="bg-card rounded-xl p-4 border border-border">
              <p className="text-accent font-bold text-sm mb-1">{item.rule}</p>
              <p className="text-text-muted text-xs">{item.desc}</p>
            </div>
          ))}
        </div>
        <Warning>
          Se o governo fizer uma auditoria e voce nao tiver os recibos, voce perde o direito de abater aquele gasto e paga mais imposto. Organize-se!
        </Warning>
      </div>
    ),
  },
  {
    id: "datas",
    icon: Clock,
    title: "Datas Importantes do Ano",
    color: "from-error to-primary",
    content: (
      <div>
        <p className="text-text-secondary text-sm mb-4">
          Marque essas datas no calendario. Perder qualquer uma delas significa multa.
        </p>
        <div className="space-y-3">
          {[
            { date: "15 de Janeiro", what: "Pagar imposto trimestral", detail: "Referente a outubro-dezembro do ano anterior", icon: "💰" },
            { date: "31 de Janeiro", what: "Enviar 1099 para ajudantes", detail: "Para todos que receberam mais de $600 no ano", icon: "📄" },
            { date: "1 de Abril", what: "Renovar empresa na Georgia", detail: "Custa $60. Faca pelo site georgia.gov", icon: "🏛️" },
            { date: "15 de Abril", what: "Declarar imposto + pagar trimestral", detail: "Declaracao do ano anterior + pagamento de janeiro-marco", icon: "📋" },
            { date: "15 de Junho", what: "Pagar imposto trimestral", detail: "Referente a abril-junho", icon: "💰" },
            { date: "15 de Setembro", what: "Pagar imposto trimestral", detail: "Referente a julho-setembro", icon: "💰" },
          ].map((item) => (
            <div key={item.date} className="bg-card rounded-xl p-4 border border-border flex items-start gap-4">
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-accent font-bold text-sm">{item.date}</p>
                </div>
                <p className="text-text text-sm font-semibold">{item.what}</p>
                <p className="text-text-muted text-xs mt-0.5">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
        <Tip>
          Crie lembretes para cada uma dessas datas no modulo &ldquo;Lembretes&rdquo; do admin. Assim voce nunca esquece!
        </Tip>
      </div>
    ),
  },
];

export default function TaxesPage() {
  const [openSection, setOpenSection] = useState<string | null>("como-funciona");

  const toggle = (id: string) => {
    setOpenSection(openSection === id ? null : id);
  };

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-black text-accent mb-2">IMPOSTOS E CONTABILIDADE</h1>
      <p className="text-text-muted text-sm mb-8">
        Guia completo para entender seus impostos como dono de empresa de flooring na Georgia.
        Linguagem simples, sem complicacao.
      </p>

      <div className="space-y-3">
        {sections.map((section) => (
          <div key={section.id} className="bg-surface border border-border rounded-2xl overflow-hidden">
            <button
              onClick={() => toggle(section.id)}
              className="w-full flex items-center gap-4 p-5 hover:bg-card/50 transition text-left"
            >
              <div className={`w-10 h-10 bg-gradient-to-br ${section.color} rounded-xl flex items-center justify-center shrink-0`}>
                <section.icon size={18} className="text-white" />
              </div>
              <span className="text-text font-bold text-sm flex-1">{section.title}</span>
              <ChevronDown
                size={18}
                className={`text-text-muted transition-transform ${openSection === section.id ? "rotate-180" : ""}`}
              />
            </button>
            {openSection === section.id && (
              <div className="px-5 pb-5 pt-2 border-t border-border">
                {section.content}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Glossario */}
      <div className="mt-10 bg-surface border border-border rounded-2xl p-6">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-black text-accent mb-2">GLOSSARIO</h2>
        <p className="text-text-muted text-sm mb-6">Palavras em ingles que voce vai ouvir e precisa saber o que significam.</p>
        <div className="space-y-2">
          {[
            { word: "LLC (Limited Liability Company)", meaning: "Empresa de responsabilidade limitada. Protege seus bens pessoais se a empresa tiver problemas." },
            { word: "Single Member", meaning: "Dono unico. Significa que a empresa tem apenas um dono (voce)." },
            { word: "EIN (Employer Identification Number)", meaning: "O CPF da empresa. Numero que o governo usa para identificar sua empresa." },
            { word: "Schedule C", meaning: "Formulario onde voce declara quanto a empresa ganhou e gastou. Vai junto com sua declaracao pessoal." },
            { word: "Tax Return", meaning: "Declaracao de imposto de renda. O papel que voce envia pro governo todo ano ate 15 de abril." },
            { word: "Self-Employment Tax", meaning: "Imposto de autonomo. Os 15% que paga para aposentadoria e saude por ser dono do proprio negocio." },
            { word: "Estimated Tax", meaning: "Imposto trimestral. Pagamento adiantado que voce faz a cada 3 meses." },
            { word: "Deduction / Write-Off", meaning: "Abatimento. Gasto do negocio que reduz o valor do imposto que voce paga." },
            { word: "Gross Income", meaning: "Receita bruta. Tudo que entrou de dinheiro antes de descontar os gastos." },
            { word: "Net Income / Profit", meaning: "Lucro liquido. O que sobrou depois de pagar todas as despesas. E sobre isso que paga imposto." },
            { word: "Expense", meaning: "Despesa/gasto. Qualquer dinheiro que saiu para manter o negocio funcionando." },
            { word: "Revenue / Income", meaning: "Receita. Dinheiro que entrou na empresa (pagamentos dos clientes)." },
            { word: "Invoice", meaning: "Fatura/nota. O papel que voce envia ao cliente cobrando pelo servico." },
            { word: "Estimate / Quote", meaning: "Orcamento. O valor que voce passa pro cliente antes de fazer o trabalho." },
            { word: "Contractor / Subcontractor", meaning: "Ajudante/subcontratado. Pessoa que voce contrata para ajudar num job mas nao e seu empregado." },
            { word: "Employee", meaning: "Empregado. Pessoa que trabalha pra voce com horario fixo e voce controla como trabalha." },
            { word: "W-9", meaning: "Formulario que voce pede ao ajudante ANTES de pagar. Tem o nome e numero de identificacao dele." },
            { word: "1099-NEC", meaning: "Formulario que voce envia ao governo dizendo quanto pagou a cada ajudante no ano." },
            { word: "W-2", meaning: "Formulario de empregado. Se voce tem empregados (nao ajudantes), envia isso em vez do 1099." },
            { word: "IRS (Internal Revenue Service)", meaning: "Receita Federal americana. O orgao do governo que cuida dos impostos." },
            { word: "Mileage", meaning: "Quilometragem. As milhas que voce roda a trabalho e pode abater no imposto." },
            { word: "Standard Mileage Rate", meaning: "Valor por milha que o governo permite abater. Em 2026 e $0.725 por milha." },
            { word: "Depreciation", meaning: "Depreciacao. Quando voce compra algo caro (van, equipamento), pode abater aos poucos ao longo dos anos." },
            { word: "Section 179", meaning: "Regra que permite abater o valor total de um equipamento no ano que comprou, em vez de aos poucos." },
            { word: "Audit", meaning: "Auditoria. Quando o governo pede para ver seus documentos e verificar se esta tudo certo." },
            { word: "Fiscal Year / Tax Year", meaning: "Ano fiscal. O periodo de janeiro a dezembro que voce declara. Para a maioria e o ano normal." },
            { word: "Quarterly", meaning: "Trimestral. A cada 3 meses. Os impostos sao pagos quarterly." },
            { word: "Filing", meaning: "Declarar/enviar. Quando dizem file your taxes, significa enviar sua declaracao." },
            { word: "Due Date / Deadline", meaning: "Prazo. A data limite para pagar ou enviar algo." },
            { word: "Penalty", meaning: "Multa. O que voce paga se atrasar um prazo." },
            { word: "Withholding", meaning: "Retencao. Quando alguem desconta o imposto antes de te pagar (nao se aplica a contractor, so a employee)." },
            { word: "Business License", meaning: "Licenca comercial. Permissao da cidade ou condado para operar seu negocio." },
            { word: "Liability Insurance", meaning: "Seguro de responsabilidade. Protege voce se algo der errado num job (estragar o piso do cliente, etc)." },
            { word: "Workers Compensation", meaning: "Seguro de acidentes de trabalho. Obrigatorio se tiver empregados." },
            { word: "Accounts Receivable", meaning: "Contas a receber. Dinheiro que clientes ainda te devem." },
            { word: "Accounts Payable", meaning: "Contas a pagar. Dinheiro que voce deve a fornecedores ou ajudantes." },
            { word: "Cash Flow", meaning: "Fluxo de caixa. O movimento de dinheiro entrando e saindo da empresa." },
            { word: "Break Even", meaning: "Ponto de equilibrio. Quando a receita cobre exatamente os gastos, sem lucro nem prejuizo." },
            { word: "Overhead", meaning: "Custos fixos. Gastos que voce tem todo mes mesmo sem trabalhar (seguro, telefone, van)." },
            { word: "Markup", meaning: "Margem. Quanto voce adiciona ao custo do material para cobrar do cliente." },
          ].map((item) => (
            <div key={item.word} className="bg-card rounded-xl p-4 border border-border">
              <p className="text-secondary font-bold text-sm">{item.word}</p>
              <p className="text-text-secondary text-sm mt-1">{item.meaning}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 bg-card rounded-2xl p-6 border border-border text-center">
        <p className="text-text-muted text-xs">
          Este guia e apenas informativo e nao substitui a orientacao de um contador profissional.
          As regras de impostos mudam todo ano — consulte seu contador para informacoes atualizadas.
        </p>
      </div>
    </div>
  );
}

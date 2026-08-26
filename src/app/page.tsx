import {
  ArrowUpRight,
  AtSign,
  Braces,
  Database,
  ExternalLink,
  Server,
} from "lucide-react";

const skills = [
  { name: "JavaScript", detail: "Interfaces e aplicações web", icon: Braces },
  { name: "TypeScript", detail: "Código previsível e sustentável", icon: Braces },
  { name: "React", detail: "Experiências rápidas e acessíveis", icon: Braces },
  { name: "Node.js", detail: "Serviços e integrações", icon: Server },
  { name: "PostgreSQL", detail: "Dados consistentes e bem modelados", icon: Database },
  { name: "HTML & CSS", detail: "Web sem perder o essencial", icon: Braces },
];

const links = [
  { label: "GitHub", href: "https://github.com/willianstsousa", icon: ExternalLink },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/willians-torres-0b136094/",
    icon: ExternalLink,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/willianstsousa/",
    icon: ExternalLink,
  },
  { label: "E-mail", href: "mailto:willianstsousa@gmail.com", icon: AtSign },
];

export default function PortfolioPage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -right-48 -top-56 size-[36rem] rounded-full bg-[#d9eee6] blur-3xl" />
        <div className="absolute -bottom-64 -left-48 size-[34rem] rounded-full bg-[#ece5ce] blur-3xl" />
      </div>

      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 sm:px-8 lg:px-10">
        <a className="text-sm font-semibold tracking-tight" href="#inicio">
          WT<span className="text-[var(--brand)]">.</span>
        </a>
        <div className="flex items-center gap-5 text-sm text-[var(--muted)]">
          <a className="transition-colors hover:text-[var(--foreground)]" href="#sobre">Sobre</a>
          <a className="transition-colors hover:text-[var(--foreground)]" href="#contato">Contato</a>
        </div>
      </nav>

      <section
        className="mx-auto grid min-h-[72vh] w-full max-w-6xl items-center gap-14 px-5 py-16 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-10"
        id="inicio"
      >
        <div className="rise-in max-w-3xl">
          <p className="mb-5 flex items-center gap-2 text-sm font-medium text-[var(--brand)]">
            <span className="size-2 rounded-full bg-[var(--brand)]" />
            Desenvolvedor de software
          </p>
          <h1 className="text-balance text-5xl font-semibold leading-[1.04] tracking-[-0.045em] sm:text-7xl">
            Produtos digitais que funcionam com clareza.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--muted)] sm:text-xl">
            Olá, sou Willians Torres. Desenvolvo aplicações web com JavaScript,
            TypeScript, React e Node.js, transformando necessidades reais em software
            confiável e fácil de usar.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a
              className="portfolio-button-primary inline-flex min-h-11 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-transform hover:-translate-y-0.5"
              href="mailto:willianstsousa@gmail.com"
            >
              Vamos conversar <ArrowUpRight aria-hidden="true" size={16} />
            </a>
            <a
              className="portfolio-button-secondary inline-flex min-h-11 items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors"
              href="https://github.com/willianstsousa"
              rel="noopener noreferrer"
              target="_blank"
            >
              Ver GitHub <ExternalLink aria-hidden="true" size={16} />
            </a>
          </div>
        </div>

        <div className="rise-in relative mx-auto aspect-square w-full max-w-sm [animation-delay:120ms]">
          <div className="absolute inset-0 rotate-3 rounded-[2.5rem] border border-[#cbd8d2] bg-white/60" />
          <div className="absolute inset-5 -rotate-2 rounded-[2rem] bg-[var(--foreground)] p-8 text-white shadow-2xl shadow-[#17352b]/15">
            <div className="flex h-full flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.2em] text-white/55">Perfil</span>
                <span className="size-2 rounded-full bg-[#78d3b3]" />
              </div>
              <div>
                <p className="font-mono text-sm leading-7 text-white/55">const profissional = {'{'}</p>
                <p className="pl-5 font-mono text-sm leading-7 text-[#a7ead2]">foco: &quot;produto&quot;,</p>
                <p className="pl-5 font-mono text-sm leading-7 text-[#a7ead2]">método: &quot;clareza&quot;,</p>
                <p className="pl-5 font-mono text-sm leading-7 text-[#a7ead2]">entrega: &quot;confiável&quot;</p>
                <p className="font-mono text-sm leading-7 text-white/55">{'}'};</p>
              </div>
              <p className="text-2xl font-medium tracking-tight">Willians Torres</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 lg:px-10" id="sobre">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">Ferramentas do ofício</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Tecnologia a serviço de boas decisões.</h2>
        </div>
        <div className="grid gap-px overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-3">
          {skills.map(({ name, detail, icon: Icon }) => (
            <article className="bg-[var(--surface)] p-7" key={name}>
              <Icon aria-hidden="true" className="text-[var(--brand)]" size={22} />
              <h3 className="mt-8 font-semibold">{name}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pb-10 pt-16 sm:px-8 lg:px-10" id="contato">
        <div className="rounded-[2rem] bg-[var(--brand)] px-6 py-12 text-white sm:px-10 sm:py-14">
          <p className="text-sm font-medium text-white/70">Disponível para conversar</p>
          <div className="mt-4 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">Tem um problema interessante para resolver?</h2>
            <a
              className="portfolio-button-contact inline-flex min-h-11 w-fit items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-transform hover:-translate-y-0.5"
              href="mailto:willianstsousa@gmail.com"
            >
              Enviar mensagem <ArrowUpRight aria-hidden="true" size={16} />
            </a>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-5 py-10 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
        <p>© {new Date().getFullYear()} Willians Torres.</p>
        <div className="flex flex-wrap gap-4">
          {links.map(({ label, href, icon: Icon }) => (
            <a
              aria-label={label}
              className="inline-flex items-center gap-1.5 transition-colors hover:text-[var(--foreground)]"
              href={href}
              key={label}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              target={href.startsWith("http") ? "_blank" : undefined}
            >
              <Icon aria-hidden="true" size={15} /> {label}
            </a>
          ))}
        </div>
      </footer>
    </main>
  );
}

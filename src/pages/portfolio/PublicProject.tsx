import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ExternalLink, Globe, Github } from "lucide-react";
import { usePortfolioStore } from "@/store/portfolioStore";
import { inr } from "@/lib/mockData";

export default function PortfolioPublicProject() {
  const { slug = "" } = useParams();
  const projects = usePortfolioStore((s) => s.projects);
  const project = useMemo(() => projects.find((p) => p.slug === slug && p.isPublic), [projects, slug]);

  if (!project) {
    return (
      <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-semibold">Project not available</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-md">This portfolio entry is private or does not exist. If you believe this is an error, contact the project owner.</p>
        <Link to="/portfolio/projects" className="text-primary hover:underline mt-6 text-sm">← Back to portfolio</Link>
      </main>
    );
  }

  const title = `${project.title} · Case Study`;
  if (typeof document !== "undefined") {
    document.title = title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", project.shortDescription.slice(0, 155));
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* SEO JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: project.title,
        about: project.domain,
        description: project.shortDescription,
        keywords: project.tags.join(", "),
        url: typeof window !== "undefined" ? window.location.href : "",
      }) }} />

      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{project.domain} · Case Study</p>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mt-3">{project.title}</h1>
          <p className="text-base text-muted-foreground mt-4 max-w-2xl leading-relaxed">{project.shortDescription}</p>
          <div className="flex flex-wrap gap-2 mt-6">
            {project.tags.map((t) => <span key={t} className="text-xs px-2 py-0.5 bg-muted rounded-sm">#{t}</span>)}
          </div>
        </div>
      </header>

      <article className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <Section title="The Problem">{project.problemStatement}</Section>
        <Section title="Our Solution">{project.solutionProvided}</Section>
        <Section title="Project Overview">{project.detailedDescription}</Section>

        <section>
          <h2 className="text-lg font-semibold mb-4">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {project.features.map((f) => (
              <div key={f.id} className="border-l-2 border-primary/60 pl-4 py-1">
                <h3 className="text-sm font-semibold flex items-center gap-2"><span>{f.icon}</span>{f.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">By the Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Metric label="Performance" value={project.metrics.performanceScore?.toString() ?? "—"} />
            <Metric label="Users" value={project.metrics.users?.toLocaleString("en-IN") ?? "—"} />
            <Metric label="CSAT" value={project.metrics.satisfactionScore ? `${project.metrics.satisfactionScore}/5` : "—"} />
            <Metric label="Revenue" value={project.revenue ? inr(project.revenue) : "—"} />
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">Tech Stack</h2>
          <div className="flex flex-wrap gap-2">
            {project.techStack.map((t) => <span key={t} className="text-sm px-2 py-1 bg-primary/10 text-primary rounded-sm border border-primary/20">{t}</span>)}
          </div>
          <p className="text-sm text-muted-foreground mt-3">Architecture: {project.architecture} · Database: {project.database} · Hosted on {project.hostingProvider}</p>
        </section>

        {(project.productionUrl || project.repoUrl) && (
          <section className="border-t border-border pt-8">
            <h2 className="text-lg font-semibold mb-4">Explore</h2>
            <div className="flex flex-wrap gap-3">
              {project.productionUrl && <a href={project.productionUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm px-3 py-1.5 border border-border rounded-sm hover:bg-surface-hover"><Globe className="w-4 h-4" /> Live site <ExternalLink className="w-3 h-3" /></a>}
              {project.repoUrl && <a href={project.repoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm px-3 py-1.5 border border-border rounded-sm hover:bg-surface-hover"><Github className="w-4 h-4" /> Repository <ExternalLink className="w-3 h-3" /></a>}
            </div>
          </section>
        )}
      </article>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} · Case study published from our portfolio CRM
      </footer>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <p className="text-base leading-relaxed text-foreground/80 whitespace-pre-wrap">{children}</p>
    </section>
  );
}
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border rounded-sm p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold mt-1 font-mono">{value}</div>
    </div>
  );
}

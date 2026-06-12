import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  AppWindow,
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleGauge,
  ExternalLink,
  LayoutDashboard,
  Plus,
  Rocket,
  Search,
} from "lucide-react";

type Severity = "critical" | "high" | "medium" | "positive";
type RiskLevel = "low" | "medium" | "high";

type Finding = {
  id: string;
  title: string;
  severity: Severity;
  category: string;
  confidence: number;
  evidence?: {
    axeRuleId?: string;
    impact?: string;
    selector?: string;
    snippet?: string;
  };
  technicalDescription?: string;
  humanImpact: string;
  recommendation: string;
};

type Report = {
  reportVersionId: string;
  generatedAt: string;
  provider: string;
  model: string;
  page: {
    id: string;
    name: string;
    path: string;
    viewport: string;
  };
  summary: {
    score: number;
    riskLevel: RiskLevel;
    executiveSummary: string;
  };
  insight: {
    title: string;
    description: string;
  };
  findings: Finding[];
  positiveFindings: Array<{
    title: string;
    description: string;
    impact: string;
  }>;
  recommendationSummary: {
    estimatedScoreAfterFixes: {
      min: number;
      max: number;
    };
    priorityActions: string[];
  };
  experienceAssessment: Record<
    "cognitiveLoad" | "discoverability" | "nonVisualExperience",
    {
      rating: "good" | "needs_attention" | "poor";
      reason: string;
    }
  >;
};

type DeployAnalysis = {
  id: string;
  version: string;
  environment: string;
  commit: string;
  author: string;
  createdAt: string;
  status: "passed" | "attention" | "failed";
  score: number;
  pages: Report[];
};

type Application = {
  id: string;
  name: string;
  description: string;
  repository: string;
  productionUrl: string;
  owner: string;
  stack: string;
  status: "active" | "paused";
  analyses: DeployAnalysis[];
};

type Page = "dashboard" | "applications" | "analyses";

const reportBase: Report = {
  reportVersionId: "1780890504928-2026-06-08T03-48-24-932Z",
  generatedAt: "2026-06-08T03:48:24.932Z",
  provider: "openai",
  model: "gpt-5.5-2026-04-23",
  page: {
    id: "home",
    name: "Home",
    path: "/",
    viewport: "1440x900",
  },
  summary: {
    score: 64,
    riskLevel: "high",
    executiveSummary:
      "The home page has a clear layout, valid language metadata, a document title, and landmark structure, but it has one critical issue: all album cover images lack alternative text. It also has serious contrast failures for secondary text and moderate heading-order problems.",
  },
  insight: {
    title: "Argus Insight",
    description:
      "The main accessibility risk is not the overall page layout, which is reasonably simple, but the mismatch between visual presentation and semantic/accessibility information.",
  },
  findings: [
    {
      id: "finding-image-alt-album-covers",
      title: "Album cover images are missing alternative text",
      severity: "critical",
      category: "accessibility",
      confidence: 0.98,
      evidence: {
        axeRuleId: "image-alt",
        impact: "critical",
        selector: "article:nth-child(1) > .aspect-square.bg-slate-100 > img",
        snippet:
          '<img class="h-full w-full object-cover" src="/album-covers/album-2109614.jpg">',
      },
      humanImpact:
        "Screen reader users may not understand what the album artwork represents, or may hear an unhelpful image filename instead of meaningful content.",
      recommendation:
        'Add an alt attribute to each album cover image, or use alt="" if the image is decorative because the album title is already provided nearby.',
      technicalDescription:
        "The axe image-alt rule failed for 8 img elements. Each image lacks alt, aria-label, aria-labelledby, title, and a presentational role.",
    },
    {
      id: "finding-color-contrast-secondary-text",
      title: "Secondary text has insufficient color contrast",
      severity: "high",
      category: "visual",
      confidence: 0.99,
      evidence: {
        axeRuleId: "color-contrast",
        impact: "serious",
        selector: ".mb-2",
        snippet:
          '<p class="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-300">Music operations</p>',
      },
      humanImpact:
        "Low-vision users, users with reduced contrast sensitivity, and people viewing the page in bright environments may struggle to read section labels and helper text.",
      recommendation:
        "Increase contrast of secondary text colors against their backgrounds to at least 4.5:1 for normal-sized text.",
      technicalDescription:
        "The axe color-contrast rule failed for multiple text elements using very light slate colors on white or light backgrounds.",
    },
    {
      id: "finding-heading-order-skipped-levels",
      title: "Heading levels skip in the page outline",
      severity: "medium",
      category: "semantics",
      confidence: 0.96,
      evidence: {
        axeRuleId: "heading-order",
        impact: "moderate",
        selector: ".mt-2",
        snippet:
          '<h4 class="mt-2 text-base font-medium text-slate-400">Catalogo interno para demonstracao</h4>',
      },
      humanImpact:
        "Users who navigate by headings may get a confusing page outline because the subtitle jumps from h1 to h4, and album card headings jump from h2 to h4.",
      recommendation:
        "Use heading levels that reflect the document outline. Change the header subtitle to a paragraph and album titles to h3 under the album list section.",
      technicalDescription:
        "The DOM shows a sequence of h1, h4, h2, then h4 album titles, which skips expected intermediate heading levels.",
    },
  ],
  positiveFindings: [
    {
      title: "Document title and language are present",
      description:
        'The document has a non-empty title, and the root html element uses a valid lang="pt-BR" value.',
      impact:
        "This helps assistive technologies announce the page and language correctly.",
    },
    {
      title: "Main landmark structure is present",
      description:
        "The page contains a single main landmark, and axe reports that content is contained within landmarks.",
      impact:
        "Keyboard and screen reader users have a clearer high-level navigation structure.",
    },
    {
      title: "Links have accessible names",
      description:
        'Primary links such as "Adicionar Album" and "Ver musicas do album" have discernible visible text.',
      impact:
        "Users can identify navigation actions without relying on visual context alone.",
    },
  ],
  recommendationSummary: {
    estimatedScoreAfterFixes: {
      min: 94,
      max: 98,
    },
    priorityActions: [
      'Add appropriate alt text or decorative alt="" treatment to all album cover images.',
      "Increase contrast for all secondary text currently using very light slate colors.",
      "Correct the heading hierarchy by using a paragraph for the subtitle and h3 headings for album titles.",
    ],
  },
  experienceAssessment: {
    cognitiveLoad: {
      rating: "needs_attention",
      reason:
        "The page has a clear card-based album layout, but skipped heading levels make the structure harder to scan with assistive technology.",
    },
    discoverability: {
      rating: "needs_attention",
      reason:
        "Primary actions and links have discernible text, but missing alternative text on album cover images reduces discoverability for non-visual users.",
    },
    nonVisualExperience: {
      rating: "poor",
      reason:
        "Eight album cover images have no accessible text or presentational role, so screen reader users may receive unhelpful file/path announcements.",
    },
  },
};

const buildReport = (
  page: Report["page"],
  score: number,
  riskLevel: RiskLevel,
  findingShift = 0,
): Report => ({
  ...reportBase,
  reportVersionId: `${reportBase.reportVersionId}-${page.id}`,
  page,
  summary: {
    ...reportBase.summary,
    score,
    riskLevel,
  },
  findings: reportBase.findings.slice(0, Math.max(1, 3 - findingShift)),
});

const initialApplications: Application[] = [
  {
    id: "argus-music-registry",
    name: "Argus Music Registry",
    description:
      "Catalogo interno de albuns usado para validar o fluxo de analise de experiencia humana do Argus.",
    repository: "github.com/vagnerleite/argus-music-registry",
    productionUrl: "https://music.argus.local",
    owner: "Design Systems",
    stack: "React + Tailwind + Vite",
    status: "active",
    analyses: [
      {
        id: "deploy-2026-06-08",
        version: "deploy-1780890504928",
        environment: "production",
        commit: "a18f9c4",
        author: "Vagner Leite",
        createdAt: "2026-06-08T03:48:24.932Z",
        status: "attention",
        score: 64,
        pages: [
          buildReport({ id: "home", name: "Home", path: "/", viewport: "1440x900" }, 64, "high"),
          buildReport(
            { id: "album-details", name: "Album Details", path: "/albums/2109614", viewport: "1440x900" },
            78,
            "medium",
            1,
          ),
          buildReport(
            { id: "new-album", name: "New Album", path: "/albums/new", viewport: "390x844" },
            86,
            "low",
            2,
          ),
        ],
      },
      {
        id: "deploy-2026-06-07",
        version: "deploy-1780804101120",
        environment: "staging",
        commit: "b75e21d",
        author: "Vagner Leite",
        createdAt: "2026-06-07T20:12:08.000Z",
        status: "passed",
        score: 91,
        pages: [
          buildReport({ id: "home", name: "Home", path: "/", viewport: "1440x900" }, 91, "low", 2),
        ],
      },
    ],
  },
];

const severityLabels: Record<Severity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  positive: "Positive",
};

const statusLabels = {
  active: "Ativa",
  paused: "Pausada",
  passed: "Aprovado",
  attention: "Atenção",
  failed: "Falhou",
};

function App() {
  const [applications, setApplications] = useState(initialApplications);
  const [selectedAppId, setSelectedAppId] = useState(initialApplications[0].id);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState(initialApplications[0].analyses[0].id);
  const [selectedPageId, setSelectedPageId] = useState(initialApplications[0].analyses[0].pages[0].page.id);
  const [query, setQuery] = useState("");
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const [analysisBrowserAppId, setAnalysisBrowserAppId] = useState("");
  const [analysisStatusFilter, setAnalysisStatusFilter] = useState("all");
  const [analysisEnvironmentFilter, setAnalysisEnvironmentFilter] = useState("all");

  const selectedApp = applications.find((app) => app.id === selectedAppId) ?? applications[0];
  const selectedAnalysis =
    selectedApp.analyses.find((analysis) => analysis.id === selectedAnalysisId) ?? selectedApp.analyses[0];
  const selectedReport =
    selectedAnalysis.pages.find((report) => report.page.id === selectedPageId) ?? selectedAnalysis.pages[0];

  const filteredApplications = useMemo(() => {
    return applications.filter((application) =>
      [application.name, application.owner, application.repository].join(" ").toLowerCase().includes(query.toLowerCase()),
    );
  }, [applications, query]);

  function handleCreateApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const repository = String(form.get("repository") ?? "").trim();
    const productionUrl = String(form.get("productionUrl") ?? "").trim();
    const owner = String(form.get("owner") ?? "").trim();

    if (!name || !repository || !productionUrl || !owner) return;

    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const newApp: Application = {
      id: `${id}-${applications.length + 1}`,
      name,
      description: "Aplicacao cadastrada no dashboard. As analises aparecerao aqui quando o endpoint estiver conectado.",
      repository,
      productionUrl,
      owner,
      stack: "A definir",
      status: "active",
      analyses: [
        {
          id: `deploy-empty-${Date.now()}`,
          version: "aguardando-primeira-analise",
          environment: "production",
          commit: "pending",
          author: owner,
          createdAt: new Date().toISOString(),
          status: "attention",
          score: 0,
          pages: [buildReport({ id: "home", name: "Home", path: "/", viewport: "1440x900" }, 0, "medium", 2)],
        },
      ],
    };

    setApplications((current) => [newApp, ...current]);
    setSelectedAppId(newApp.id);
    setSelectedAnalysisId(newApp.analyses[0].id);
    setSelectedPageId(newApp.analyses[0].pages[0].page.id);
    event.currentTarget.reset();
  }

  function selectApp(application: Application) {
    setSelectedAppId(application.id);
    setSelectedAnalysisId(application.analyses[0].id);
    setSelectedPageId(application.analyses[0].pages[0].page.id);
  }

  function selectAnalysis(analysis: DeployAnalysis) {
    setSelectedAnalysisId(analysis.id);
    setSelectedPageId(analysis.pages[0].page.id);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">argus</div>
        <nav className="menu" aria-label="Menu principal">
          <button
            className={`menu-item ${activePage === "dashboard" ? "active" : ""}`}
            type="button"
            onClick={() => setActivePage("dashboard")}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>
          <button
            className={`menu-item ${activePage === "applications" ? "active" : ""}`}
            type="button"
            onClick={() => setActivePage("applications")}
          >
            <AppWindow size={18} />
            Aplicações
          </button>
          <button
            className={`menu-item ${activePage === "analyses" ? "active" : ""}`}
            type="button"
            onClick={() => setActivePage("analyses")}
          >
            <Activity size={18} />
            Análises
          </button>
        </nav>
        <div className="sidebar-foot">
          <span>Runtime-first assessment</span>
          <strong>{applications.length} aplicações</strong>
        </div>
      </aside>

      <main className="workspace">
        <section className="topbar" id="dashboard">
          <div>
            <p className="eyebrow">Argus Experience Dashboard</p>
            <h1>{getPageTitle(activePage)}</h1>
          </div>
          <button className="primary-button" type="button" onClick={() => setActivePage("applications")}>
            <Plus size={18} />
            Nova aplicação
          </button>
        </section>

        {activePage === "dashboard" && (
          <DashboardPage
            applications={applications}
            selectedApp={selectedApp}
            selectedAnalysis={selectedAnalysis}
            selectedReport={selectedReport}
            onSelectApp={selectApp}
            onSelectAnalysis={selectAnalysis}
            onSelectReport={(report) => setSelectedPageId(report.page.id)}
          />
        )}

        {activePage === "applications" && (
          <ApplicationsPage
            applications={applications}
            filteredApplications={filteredApplications}
            query={query}
            selectedApp={selectedApp}
            onQueryChange={setQuery}
            onCreateApplication={handleCreateApplication}
            onSelectApp={selectApp}
          />
        )}

        {activePage === "analyses" && (
          <AnalysesPage
            applications={applications}
            selectedApplicationId={analysisBrowserAppId}
            statusFilter={analysisStatusFilter}
            environmentFilter={analysisEnvironmentFilter}
            onSelectApplication={setAnalysisBrowserAppId}
            onStatusFilterChange={setAnalysisStatusFilter}
            onEnvironmentFilterChange={setAnalysisEnvironmentFilter}
            onOpenAnalysis={(application, analysis) => {
              selectApp(application);
              selectAnalysis(analysis);
              setActivePage("dashboard");
            }}
          />
        )}
      </main>
    </div>
  );
}

function DashboardPage({
  applications,
  selectedApp,
  selectedAnalysis,
  selectedReport,
  onSelectApp,
  onSelectAnalysis,
  onSelectReport,
}: {
  applications: Application[];
  selectedApp: Application;
  selectedAnalysis: DeployAnalysis;
  selectedReport: Report;
  onSelectApp: (application: Application) => void;
  onSelectAnalysis: (analysis: DeployAnalysis) => void;
  onSelectReport: (report: Report) => void;
}) {
  return (
    <section className="dashboard-grid">
      <ApplicationListCard
        applications={applications}
        selectedApp={selectedApp}
        onSelectApp={onSelectApp}
        title="Aplicações"
        description="Aplicações monitoradas e prontas para inspeção no dashboard."
        compact
      />

      <ApplicationDetails
        application={selectedApp}
        analysis={selectedAnalysis}
        report={selectedReport}
        onSelectAnalysis={onSelectAnalysis}
        onSelectReport={onSelectReport}
      />
    </section>
  );
}

function ApplicationsPage({
  applications,
  filteredApplications,
  query,
  selectedApp,
  onQueryChange,
  onCreateApplication,
  onSelectApp,
}: {
  applications: Application[];
  filteredApplications: Application[];
  query: string;
  selectedApp: Application;
  onQueryChange: (query: string) => void;
  onCreateApplication: (event: FormEvent<HTMLFormElement>) => void;
  onSelectApp: (application: Application) => void;
}) {
  return (
    <section className="page-stack">
      <div className="panel application-panel">
        <div className="panel-heading">
          <div>
            <h2>Cadastrar aplicação</h2>
            <p>Registro rápido para conectar o dashboard aos endpoints reais quando estiverem prontos.</p>
          </div>
        </div>

        <form className="create-form standalone" id="new-app" onSubmit={onCreateApplication}>
          <div className="form-grid">
            <label>
              Nome
              <input name="name" placeholder="Ex: Checkout Web" />
            </label>
            <label>
              Dono
              <input name="owner" placeholder="Ex: Growth" />
            </label>
            <label>
              Repositório
              <input name="repository" placeholder="github.com/time/app" />
            </label>
            <label>
              URL
              <input name="productionUrl" placeholder="https://app.exemplo.com" />
            </label>
          </div>
          <button className="secondary-button" type="submit">
            <Plus size={17} />
            Cadastrar
          </button>
        </form>
      </div>

      <ApplicationListCard
        applications={filteredApplications}
        selectedApp={selectedApp}
        onSelectApp={onSelectApp}
        title="Aplicações cadastradas"
        description={`${applications.length} aplicações no mock atual.`}
        query={query}
        onQueryChange={onQueryChange}
        scrollable
      />
    </section>
  );
}

function AnalysesPage({
  applications,
  selectedApplicationId,
  statusFilter,
  environmentFilter,
  onSelectApplication,
  onStatusFilterChange,
  onEnvironmentFilterChange,
  onOpenAnalysis,
}: {
  applications: Application[];
  selectedApplicationId: string;
  statusFilter: string;
  environmentFilter: string;
  onSelectApplication: (id: string) => void;
  onStatusFilterChange: (status: string) => void;
  onEnvironmentFilterChange: (environment: string) => void;
  onOpenAnalysis: (application: Application, analysis: DeployAnalysis) => void;
}) {
  const selectedApplication = applications.find((application) => application.id === selectedApplicationId);
  const analyses = selectedApplication
    ? selectedApplication.analyses.filter((analysis) => {
        const matchesStatus = statusFilter === "all" || analysis.status === statusFilter;
        const matchesEnvironment = environmentFilter === "all" || analysis.environment === environmentFilter;
        return matchesStatus && matchesEnvironment;
      })
    : [];

  return (
    <section className="page-stack">
      <div className="panel">
        <div className="panel-heading">
          <div>
            <h2>Explorar análises</h2>
            <p>Browse de análises por aplicação, ambiente e status.</p>
          </div>
        </div>

        <div className="filters-grid">
          <label>
            Aplicação
            <select value={selectedApplicationId} onChange={(event) => onSelectApplication(event.target.value)}>
              <option value="">Selecione uma aplicação</option>
              {applications.map((application) => (
                <option key={application.id} value={application.id}>
                  {application.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value)}>
              <option value="all">Todos</option>
              <option value="passed">Aprovado</option>
              <option value="attention">Atenção</option>
              <option value="failed">Falhou</option>
            </select>
          </label>
          <label>
            Ambiente
            <select value={environmentFilter} onChange={(event) => onEnvironmentFilterChange(event.target.value)}>
              <option value="all">Todos</option>
              <option value="production">Production</option>
              <option value="staging">Staging</option>
            </select>
          </label>
        </div>
      </div>

      <div className="panel">
        {!selectedApplication ? (
          <EmptyState
            title="Selecione uma aplicação"
            description="As análises de deploy aparecem aqui depois que uma aplicação for escolhida."
          />
        ) : analyses.length === 0 ? (
          <EmptyState
            title="Nenhuma análise encontrada"
            description="Ajuste os filtros ou escolha outra aplicação para visualizar o histórico."
          />
        ) : (
          <div className="deploy-list scrollable-list">
            {analyses.map((analysis) => (
              <button
                className="deploy-row"
                key={analysis.id}
                type="button"
                onClick={() => onOpenAnalysis(selectedApplication, analysis)}
              >
                <span className={`deploy-dot ${analysis.status}`} />
                <span>
                  <strong>{analysis.version}</strong>
                  <small>
                    {analysis.environment} · {analysis.commit} · {formatDate(analysis.createdAt)}
                  </small>
                </span>
                <span className="score-chip">{analysis.score}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ApplicationListCard({
  applications,
  selectedApp,
  onSelectApp,
  title,
  description,
  query,
  onQueryChange,
  compact = false,
  scrollable = false,
}: {
  applications: Application[];
  selectedApp: Application;
  onSelectApp: (application: Application) => void;
  title: string;
  description: string;
  query?: string;
  onQueryChange?: (query: string) => void;
  compact?: boolean;
  scrollable?: boolean;
}) {
  return (
    <div className="panel application-panel" id="applications">
      <div className="panel-heading">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        {onQueryChange && (
          <div className="search-box">
            <Search size={17} />
            <input
              aria-label="Buscar aplicação"
              value={query ?? ""}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Buscar"
            />
          </div>
        )}
      </div>

      <div className={`application-list ${compact ? "compact-list" : ""} ${scrollable ? "scrollable-list" : ""}`}>
        {applications.map((application) => (
          <button
            className={`application-row ${application.id === selectedApp.id ? "selected" : ""}`}
            key={application.id}
            type="button"
            onClick={() => onSelectApp(application)}
          >
            <span className="app-icon">
              <AppWindow size={20} />
            </span>
            <span>
              <strong>{application.name}</strong>
              <small>{application.repository}</small>
            </span>
            <span className={`status-pill ${application.status}`}>{statusLabels[application.status]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="empty-state">
      <Activity size={24} />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function ApplicationDetails({
  application,
  analysis,
  report,
  onSelectAnalysis,
  onSelectReport,
}: {
  application: Application;
  analysis: DeployAnalysis;
  report: Report;
  onSelectAnalysis: (analysis: DeployAnalysis) => void;
  onSelectReport: (report: Report) => void;
}) {
  const stickyGroupRef = useRef<HTMLDivElement>(null);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    let frameId = 0;

    function updateCompactMode() {
      if (!stickyGroupRef.current) return;
      const topOffset = 24;
      const triggerPoint = stickyGroupRef.current.offsetTop - topOffset - 8;
      setIsCompact(window.scrollY > triggerPoint);
    }

    function handleScroll() {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateCompactMode);
    }

    updateCompactMode();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <div className="details-column">
      <div className={`details-summary-grid ${isCompact ? "is-compact" : ""}`} ref={stickyGroupRef}>
        <section className="hero-panel">
          <div>
            <p className="eyebrow">Detalhes da aplicação</p>
            <h2>{application.name}</h2>
            <p className="application-description">{application.description}</p>
          </div>
          <div className="hero-actions">
            <a className="icon-link" href={application.productionUrl}>
              <ExternalLink size={17} />
              Produção
            </a>
            <span className={`risk-badge ${report.summary.riskLevel}`}>{report.summary.riskLevel}</span>
          </div>
          <div className="metric-grid">
            <Metric label="Score atual" value={`${report.summary.score}/100`} icon={<CircleGauge size={18} />} />
            <Metric label="Deploys analisados" value={application.analyses.length} icon={<Rocket size={18} />} />
            <Metric label="Issues críticas" value={report.findings.filter((finding) => finding.severity === "critical").length} icon={<AlertTriangle size={18} />} />
            <Metric label="Páginas" value={analysis.pages.length} icon={<BarChart3 size={18} />} />
          </div>
        </section>

        <section className="panel deploy-panel" id="analyses">
          <div className="panel-heading">
            <div>
              <h2>Análises de deploy</h2>
              <p>Histórico de avaliações associadas à aplicação selecionada.</p>
            </div>
          </div>
          <div className="deploy-list">
            {application.analyses.map((item) => (
              <button
                className={`deploy-row ${item.id === analysis.id ? "selected" : ""}`}
                key={item.id}
                type="button"
                onClick={() => onSelectAnalysis(item)}
              >
                <span className={`deploy-dot ${item.status}`} />
                <span>
                  <strong>{item.version}</strong>
                  <small>
                    {item.environment} · {item.commit} · {formatDate(item.createdAt)}
                  </small>
                </span>
                <span className="score-chip">{item.score}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      <ReportDetails analysis={analysis} report={report} onSelectReport={onSelectReport} />
    </div>
  );
}

function ReportDetails({
  analysis,
  report,
  onSelectReport,
}: {
  analysis: DeployAnalysis;
  report: Report;
  onSelectReport: (report: Report) => void;
}) {
  return (
    <section className="report-section">
      <header className="report-header">
        <div>
          <p className="eyebrow">Report selecionado</p>
          <h2>{report.page.name}</h2>
          <p>
            {report.page.path} · {report.page.viewport} · gerado em {formatDate(report.generatedAt)}
          </p>
        </div>
        <span className={`score-ring ${report.summary.riskLevel}`}>{report.summary.score}</span>
      </header>

      <PageCarousel analysis={analysis} selectedPageId={report.page.id} onSelectReport={onSelectReport} />

      <div className="executive-grid">
        <article className="summary-card">
          <h3>Resumo executivo</h3>
          <p>{report.summary.executiveSummary}</p>
        </article>
        <article className="insight-card">
          <h3>{report.insight.title}</h3>
          <p>{report.insight.description}</p>
        </article>
      </div>

      <div className="findings-list">
        <div className="section-title">
          <h3>Findings principais</h3>
          <span>{report.findings.length} achados</span>
        </div>
        {report.findings.map((finding, index) => (
          <article className="finding-card" key={finding.id}>
            <div className="finding-head">
              <strong>
                {index + 1}. {finding.title}
              </strong>
              <span className={`severity ${finding.severity}`}>{severityLabels[finding.severity]}</span>
            </div>
            <div className="finding-body">
              {finding.evidence?.snippet && (
                <div>
                  <p className="label">Evidência técnica</p>
                  <pre>{finding.evidence.snippet}</pre>
                </div>
              )}
              <div>
                <p className="label">Impacto humano</p>
                <p>{finding.humanImpact}</p>
              </div>
              <div>
                <p className="label">Recomendação</p>
                <p>{finding.recommendation}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="ux-grid">
        {Object.entries(report.experienceAssessment).map(([key, assessment]) => (
          <article className="ux-card" key={key}>
            <span className={`severity ${assessment.rating === "good" ? "positive" : assessment.rating === "poor" ? "high" : "medium"}`}>
              {formatAssessment(key)}
            </span>
            <p>{assessment.reason}</p>
          </article>
        ))}
      </div>

      <article className="recommendation-card">
        <div>
          <h3>Prioridades de correção</h3>
          <p>
            Score estimado após correções: {report.recommendationSummary.estimatedScoreAfterFixes.min}-
            {report.recommendationSummary.estimatedScoreAfterFixes.max}
          </p>
        </div>
        <ul>
          {report.recommendationSummary.priorityActions.map((action) => (
            <li key={action}>
              <CheckCircle2 size={17} />
              {action}
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}

function PageCarousel({
  analysis,
  selectedPageId,
  onSelectReport,
}: {
  analysis: DeployAnalysis;
  selectedPageId: string;
  onSelectReport: (report: Report) => void;
}) {
  return (
    <div className="carousel-wrap">
      <button className="carousel-control" type="button" aria-label="Página anterior">
        <ChevronLeft size={18} />
      </button>
      <div className="page-carousel" aria-label="Páginas analisadas">
        {analysis.pages.map((pageReport) => (
          <button
            className={`thumbnail-card ${pageReport.page.id === selectedPageId ? "selected" : ""}`}
            key={pageReport.page.id}
            type="button"
            onClick={() => onSelectReport(pageReport)}
          >
            <div className={`thumbnail-preview risk-${pageReport.summary.riskLevel}`}>
              <span />
              <span />
              <span />
              <strong>{pageReport.summary.score}</strong>
            </div>
            <div>
              <strong>{pageReport.page.name}</strong>
              <small>{pageReport.page.path}</small>
            </div>
          </button>
        ))}
      </div>
      <button className="carousel-control" type="button" aria-label="Próxima página">
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

function Metric({ label, value, icon }: { label: string; value: string | number; icon: ReactNode }) {
  return (
    <article className="metric-card">
      <span>{icon}</span>
      <small>{label}</small>
      <strong>{value}</strong>
    </article>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatAssessment(value: string) {
  const labels: Record<string, string> = {
    cognitiveLoad: "Carga cognitiva",
    discoverability: "Descoberta",
    nonVisualExperience: "Experiência não visual",
  };
  return labels[value] ?? value;
}

function getPageTitle(page: Page) {
  const titles: Record<Page, string> = {
    dashboard: "Aplicações monitoradas",
    applications: "Aplicações",
    analyses: "Análises",
  };
  return titles[page];
}

export default App;

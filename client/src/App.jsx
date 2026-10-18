
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Users,
  BriefcaseBusiness,
  CalendarDays,
  Search,
  Bell,
  Plus,
  ArrowUpRight,
  MoreHorizontal,
  Clock3,
  CheckCircle2,
  Menu,
  X,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import {
  getCandidates,
  createCandidate,
  updateCandidate,
  removeCandidate,
} from "./api";

import "./App.css";

const STAGES = [
  "Applied",
  "Screening",
  "Interview",
  "Selected",
  "Rejected",
];

const STAGE_COLORS = [
  "#dbeafe",
  "#fce7f3",
  "#d1fae5",
  "#ede9fe",
  "#ffedd5",
  "#cffafe",
];

const EMPTY_FORM = {
  name: "",
  email: "",
  role: "",
  stage: "Applied",
};

function formatDate(date) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function normalizeCandidate(candidate, index = 0) {
  const name = candidate.name || "Unknown candidate";

  return {
    ...candidate,
    id: candidate._id || candidate.id,
    initials: name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    color: STAGE_COLORS[index % STAGE_COLORS.length],
    date: formatDate(candidate.createdAt || candidate.date),
  };
}

function App() {
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All stages");
  const [page, setPage] = useState("Dashboard");
  const [modal, setModal] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadCandidates = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getCandidates();

      setCandidates(
        data.map((candidate, index) =>
          normalizeCandidate(candidate, index)
        )
      );
    } catch (err) {
      setError(
        `${err.message}. Check that the backend is running on port 5000.`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  const stats = useMemo(
    () => [
      {
        label: "Total candidates",
        value: candidates.length,
        icon: Users,
        color: "blue",
        note: "All applicants",
      },
      {
        label: "In screening",
        value: candidates.filter((c) => c.stage === "Screening").length,
        icon: Clock3,
        color: "purple",
        note: "Under review",
      },
      {
        label: "Interviews",
        value: candidates.filter((c) => c.stage === "Interview").length,
        icon: CalendarDays,
        color: "orange",
        note: "Interview stage",
      },
      {
        label: "Selected",
        value: candidates.filter((c) => c.stage === "Selected").length,
        icon: CheckCircle2,
        color: "green",
        note: "Successfully hired",
      },
    ],
    [candidates]
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return candidates.filter((candidate) => {
      const matchesSearch = [
        candidate.name,
        candidate.email,
        candidate.role,
      ].some((value) => (value || "").toLowerCase().includes(query));

      const matchesStage =
        filter === "All stages" || candidate.stage === filter;

      return matchesSearch && matchesStage;
    });
  }, [candidates, search, filter]);

  function showSuccess(message) {
    setSuccess(message);
    setError("");
  }

  async function addCandidate(event) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const saved = await createCandidate({
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role.trim(),
        stage: form.stage,
      });

      setCandidates((previous) => [
        normalizeCandidate(saved, previous.length),
        ...previous,
      ]);

      setForm(EMPTY_FORM);
      setModal(false);
      showSuccess("Candidate added successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function changeStage(id, stage) {
    const previousCandidate = candidates.find((c) => c.id === id);

    if (!previousCandidate || previousCandidate.stage === stage) return;

    setError("");
    setSuccess("");

    // Optimistic update for a responsive interface.
    setCandidates((previous) =>
      previous.map((candidate) =>
        candidate.id === id ? { ...candidate, stage } : candidate
      )
    );

    try {
      await updateCandidate(id, { stage });
      showSuccess("Hiring stage updated.");
    } catch (err) {
      setCandidates((previous) =>
        previous.map((candidate) =>
          candidate.id === id
            ? { ...candidate, stage: previousCandidate.stage }
            : candidate
        )
      );

      setError(err.message);
    }
  }

  async function deleteCandidate(id) {
    const candidate = candidates.find((c) => c.id === id);

    if (!candidate) return;

    if (!window.confirm(`Delete ${candidate.name}? This cannot be undone.`)) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await removeCandidate(id);

      setCandidates((previous) =>
        previous.filter((item) => item.id !== id)
      );

      showSuccess("Candidate deleted successfully.");
    } catch (err) {
      setError(err.message);
    }
  }

  function exportCSV() {
    const headers = ["Name", "Email", "Job Title", "Stage", "Applied Date"];

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = filtered.map((candidate) =>
      [
        candidate.name,
        candidate.email,
        candidate.role,
        candidate.stage,
        candidate.date,
      ]
        .map(escapeCSV)
        .join(",")
    );

    const csv = [headers.map(escapeCSV).join(","), ...rows].join("\r\n");
    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "hireflow-candidates.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
  }

  function openAddModal() {
    setForm(EMPTY_FORM);
    setError("");
    setModal(true);
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <BriefcaseBusiness size={22} />
          </div>

          <span>
            Hire<span className="brand-accent">Flow</span>
            <small>RECRUITMENT WORKSPACE</small>
          </span>

          <button
            className="mobile-close"
            onClick={() => setMobileMenu(false)}
            aria-label="Close navigation"
          >
            <X />
          </button>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <nav className="nav-list">
          {[
            [LayoutDashboard, "Dashboard"],
            [Users, "Candidates"],
            [BriefcaseBusiness, "Jobs"],
            [CalendarDays, "Interviews"],
          ].map(([Icon, label]) => (
            <button
              key={label}
              className={`nav-item ${page === label ? "active" : ""}`}
              onClick={() => {
                setPage(label);
                setMobileMenu(false);
              }}
            >
              <Icon size={19} />
              <span>{label}</span>

              {label === "Candidates" && (
                <span className="nav-count">{candidates.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <div className="upgrade-icon">✦</div>
            <strong>Build your dream team</strong>
            <p>Great people make great products.</p>
          </div>

          <div className="profile">
            <div className="profile-avatar">SK</div>
            <div className="profile-info">
              <strong>Recruiter</strong>
              <span>Workspace admin</span>
            </div>
            <MoreHorizontal size={20} />
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setMobileMenu(true)}
            aria-label="Open navigation"
          >
            <Menu />
          </button>

          <div className="breadcrumb">
            Workspace <span>/</span> <strong>{page}</strong>
          </div>

          <div className="topbar-actions">
            <span className="today-label">
              <span className="online-dot" /> Recruitment workspace
            </span>

            <button className="icon-button" aria-label="Notifications">
              <Bell size={19} />
            </button>

            <div className="top-avatar">SK</div>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div>
              <div className="eyebrow">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }).toUpperCase()}
              </div>

              <h1>
                {page === "Dashboard" ? "Good morning, Recruiter" : page}
              </h1>

              <p className="page-subtitle">
                {page === "Dashboard"
                  ? "Here's what's happening with your hiring pipeline."
                  : `Manage your ${page.toLowerCase()} in one place.`}
              </p>
            </div>

            <button className="primary-button" onClick={openAddModal}>
              <Plus size={18} /> Add candidate
            </button>
          </section>

          {error && (
            <div
              role="alert"
              style={{
                background: "#fff0f0",
                color: "#b42332",
                padding: "12px 15px",
                borderRadius: 8,
                marginBottom: 16,
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 9,
              }}
            >
              <AlertCircle size={17} />
              <span>{error}</span>
              <button
                className="light-button"
                style={{ marginLeft: "auto" }}
                onClick={loadCandidates}
              >
                Retry
              </button>
            </div>
          )}

          {success && (
            <div
              role="status"
              style={{
                background: "#e8f8ef",
                color: "#14764c",
                padding: "11px 14px",
                borderRadius: 8,
                marginBottom: 16,
                fontSize: 12,
              }}
            >
              {success}
              <button
                onClick={() => setSuccess("")}
                style={{
                  float: "right",
                  border: 0,
                  background: "transparent",
                  cursor: "pointer",
                  color: "inherit",
                }}
                aria-label="Dismiss message"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {page === "Dashboard" && (
            <>
              <section className="stats-grid">
                {stats.map(({ label, value, icon: Icon, color, note }) => (
                  <article className="stat-card" key={label}>
                    <div className="stat-top">
                      <div className={`stat-icon ${color}`}>
                        <Icon size={20} />
                      </div>
                      <span className="stat-note">{note}</span>
                    </div>

                    <div className="stat-value">{value}</div>
                    <div className="stat-label">{label}</div>
                  </article>
                ))}
              </section>

              <section className="content-grid">
                <article className="panel pipeline-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Hiring pipeline</h2>
                      <p>Candidate distribution by stage</p>
                    </div>

                    <button
                      className="light-button"
                      onClick={() => setPage("Candidates")}
                    >
                      View all <ArrowUpRight size={15} />
                    </button>
                  </div>

                  <div className="pipeline-list">
                    {STAGES.map((stage, index) => {
                      const count = candidates.filter(
                        (candidate) => candidate.stage === stage
                      ).length;

                      const percent = candidates.length
                        ? (count / candidates.length) * 100
                        : 0;

                      return (
                        <div className="pipeline-row" key={stage}>
                          <div className={`stage-dot stage-${index}`} />
                          <div className="pipeline-name">{stage}</div>

                          <div className="pipeline-track">
                            <div
                              className={`pipeline-fill fill-${index}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>

                          <strong>{count}</strong>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pipeline-footer">
                    <span>{candidates.length} total candidates</span>
                    <span>{loading ? "Refreshing..." : "Database synced"}</span>
                  </div>
                </article>

                <article className="panel quick-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Quick overview</h2>
                      <p>Your hiring at a glance</p>
                    </div>
                  </div>

                  <div className="overview-item">
                    <div className="overview-icon purple">
                      <Clock3 size={18} />
                    </div>
                    <div>
                      <strong>
                        {candidates.filter((c) => c.stage === "Screening").length}{" "}
                        candidates
                      </strong>
                      <span>Awaiting screening</span>
                    </div>
                  </div>

                  <div className="overview-item">
                    <div className="overview-icon orange">
                      <CalendarDays size={18} />
                    </div>
                    <div>
                      <strong>
                        {candidates.filter((c) => c.stage === "Interview").length}{" "}
                        candidates
                      </strong>
                      <span>In interview stage</span>
                    </div>
                  </div>

                  <div className="overview-item">
                    <div className="overview-icon green">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <strong>
                        {candidates.filter((c) => c.stage === "Selected").length}{" "}
                        candidates
                      </strong>
                      <span>Selected for hiring</span>
                    </div>
                  </div>

                  <button
                    className="secondary-button full-button"
                    onClick={() => setPage("Candidates")}
                  >
                    Manage candidates <ArrowUpRight size={16} />
                  </button>
                </article>
              </section>
            </>
          )}

          <section className="panel candidates-panel">
            <div className="panel-heading candidates-heading">
              <div>
                <h2>
                  {page === "Dashboard"
                    ? "Recent candidates"
                    : page === "Candidates"
                      ? "All candidates"
                      : `${page} overview`}
                </h2>
                <p>
                  {page === "Dashboard"
                    ? "Track your latest applicants"
                    : "Search, filter and manage applicants"}
                </p>
              </div>

              <button className="light-button export-button" onClick={exportCSV}>
                <Download size={16} /> Export CSV
              </button>
            </div>

            <div className="table-toolbar">
              <label className="search-box">
                <Search size={18} />
                <input
                  placeholder="Search name, email or role..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>

              <label className="filter-box">
                <Filter size={16} />
                <select
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                >
                  <option>All stages</option>
                  {STAGES.map((stage) => (
                    <option key={stage}>{stage}</option>
                  ))}
                </select>
              </label>

              <button
                className="light-button"
                onClick={loadCandidates}
                disabled={loading}
                title="Refresh candidates"
              >
                <RefreshCw size={15} />
              </button>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Job title</th>
                    <th>Applied date</th>
                    <th>Stage</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="empty-state">
                        Loading candidates from MongoDB...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="empty-state">
                        {candidates.length === 0
                          ? "No candidates yet. Click Add candidate to get started."
                          : "No candidates match your search or filter."}
                      </td>
                    </tr>
                  ) : (
                    filtered
                      .slice(0, page === "Dashboard" ? 5 : undefined)
                      .map((candidate) => (
                        <tr key={candidate.id}>
                          <td>
                            <div className="candidate-cell">
                              <div
                                className="candidate-avatar"
                                style={{ background: candidate.color }}
                              >
                                {candidate.initials}
                              </div>

                              <div>
                                <strong>{candidate.name}</strong>
                                <span>{candidate.email}</span>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="role-name">
                              {candidate.role}
                            </span>
                          </td>

                          <td className="date-cell">{candidate.date}</td>

                          <td>
                            <select
                              aria-label={`Stage for ${candidate.name}`}
                              className={`stage-select status-${candidate.stage.toLowerCase()}`}
                              value={candidate.stage}
                              onChange={(event) =>
                                changeStage(candidate.id, event.target.value)
                              }
                            >
                              {STAGES.map((stage) => (
                                <option key={stage}>{stage}</option>
                              ))}
                            </select>
                          </td>

                          <td>
                            <button
                              className="row-action"
                              title={`Delete ${candidate.name}`}
                              aria-label={`Delete ${candidate.name}`}
                              onClick={() => deleteCandidate(candidate.id)}
                            >
                              <MoreHorizontal size={19} />
                            </button>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="table-footer">
              <span>
                Showing{" "}
                {Math.min(
                  filtered.length,
                  page === "Dashboard" ? 5 : filtered.length
                )}{" "}
                of {filtered.length} candidates
              </span>

              <span className="footer-live">
                <span className="online-dot" />{" "}
                {loading ? "Syncing..." : "API connected"}
              </span>
            </div>
          </section>

          <footer className="footer">
            <span>© 2026 HireFlow ATS</span>
            <span>
              Built for better hiring <span className="footer-heart">♥</span>
            </span>
          </footer>
        </div>
      </main>

      {modal && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setModal(false);
            }
          }}
        >
          <form className="candidate-modal" onSubmit={addCandidate}>
            <div className="modal-heading">
              <div>
                <h2>Add candidate</h2>
                <p>Add a new applicant to your hiring pipeline.</p>
              </div>

              <button
                type="button"
                className="icon-button"
                onClick={() => setModal(false)}
                disabled={saving}
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <label>
              Full name
              <input
                required
                minLength={2}
                maxLength={100}
                placeholder="e.g. Rahul Sharma"
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
              />
            </label>

            <label>
              Email address
              <input
                required
                type="email"
                maxLength={254}
                placeholder="rahul@example.com"
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
              />
            </label>

            <label>
              Job title
              <input
                required
                minLength={2}
                maxLength={100}
                placeholder="e.g. Full Stack Developer"
                value={form.role}
                onChange={(event) =>
                  setForm({ ...form, role: event.target.value })
                }
              />
            </label>

            <label>
              Hiring stage
              <select
                value={form.stage}
                onChange={(event) =>
                  setForm({ ...form, stage: event.target.value })
                }
              >
                {STAGES.map((stage) => (
                  <option key={stage}>{stage}</option>
                ))}
              </select>
            </label>

            <div className="modal-actions">
              <button
                type="button"
                className="light-button"
                onClick={() => setModal(false)}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                className="primary-button"
                type="submit"
                disabled={saving}
              >
                <Plus size={17} />
                {saving ? "Saving..." : "Add candidate"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;

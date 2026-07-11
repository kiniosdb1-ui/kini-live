import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Eye,
  FileText,
  Inbox,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  Mail,
  Menu,
  MessageSquareText,
  Phone,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { services } from "../data";

const API_URL = import.meta.env.VITE_API_URL || "";
let adminCsrfToken = window.sessionStorage.getItem("kini_admin_csrf_token") || "";
let adminSessionToken = window.sessionStorage.getItem("kini_admin_session_token") || "";

const statusOptions = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

const emptyStats = {
  total: 0,
  new: 0,
  contacted: 0,
  inProgress: 0,
  completed: 0,
  recent: 0,
};

function readCsrfToken() {
  const entries = document.cookie.split(";").map((item) => item.trim());
  for (const name of ["__Host-kini_admin_csrf", "kini_admin_csrf"]) {
    const match = entries.find((entry) => entry.startsWith(`${name}=`));
    if (match) return decodeURIComponent(match.slice(name.length + 1));
  }
  return "";
}

async function adminRequest(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body) headers["Content-Type"] = "application/json";
  if (adminSessionToken) headers.Authorization = `Bearer ${adminSessionToken}`;
  if (options.method && options.method !== "GET") {
    const csrfToken = adminCsrfToken || readCsrfToken();
    if (csrfToken) headers["X-CSRF-Token"] = csrfToken;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "Request failed.");
    error.status = response.status;
    throw error;
  }
  if (data.csrfToken) {
    adminCsrfToken = data.csrfToken;
    window.sessionStorage.setItem("kini_admin_csrf_token", data.csrfToken);
  }
  if (data.sessionToken) {
    adminSessionToken = data.sessionToken;
    window.sessionStorage.setItem("kini_admin_session_token", data.sessionToken);
  }
  return data;
}

function clearAdminSessionStorage() {
  adminCsrfToken = "";
  adminSessionToken = "";
  window.sessionStorage.removeItem("kini_admin_csrf_token");
  window.sessionStorage.removeItem("kini_admin_session_token");
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function StatusBadge({ status }) {
  const label = statusOptions.find((item) => item.value === status)?.label || status;
  return <span className={`admin-status status-${status}`}>{label}</span>;
}

function AdminLogin({ onAuthenticated }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await adminRequest("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const verified = await adminRequest("/api/admin/me");
      onAuthenticated({ ...result, ...verified });
    } catch (requestError) {
      clearAdminSessionStorage();
      setError(
        requestError.status === 401
          ? "Login accepted, but admin session could not be verified. Redeploy the backend and frontend, then try again."
          : requestError.message,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-login-page">
      <a className="admin-back-home" href="/">
        <ArrowLeft size={17} /> Return to website
      </a>
      <motion.section
        className="admin-login-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <img src="/kini-logo.jpeg" alt="KINi Outsourcing Services" />
        <div className="admin-login-heading">
          <span><ShieldCheck size={16} /> Protected owner access</span>
          <h1>Admin panel</h1>
          <p>Sign in to securely review verified consultation requests and manage follow-ups.</p>
        </div>
        <form onSubmit={submit}>
          <label>
            Admin email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              maxLength="256"
              required
            />
          </label>
          {error && <p className="admin-error">{error}</p>}
          <button className="admin-primary-action" type="submit" disabled={loading}>
            {loading ? <><LoaderCircle className="spin" size={18} /> Signing in</> : <><LockKeyhole size={18} /> Secure sign in</>}
          </button>
        </form>
        <p className="admin-security-note">
          Login attempts are rate-limited. Sessions use secure HttpOnly cookies and automatically expire.
        </p>
      </motion.section>
    </main>
  );
}

function LeadDrawer({ lead, onClose, onSaved }) {
  const [status, setStatus] = useState(lead.status);
  const [notes, setNotes] = useState(lead.adminNotes || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setStatus(lead.status);
    setNotes(lead.adminNotes || "");
    setMessage("");
  }, [lead._id]);

  const save = async () => {
    setSaving(true);
    setMessage("");
    try {
      const updated = await adminRequest(`/api/admin/consultations/${lead._id}`, {
        method: "PATCH",
        body: JSON.stringify({ status, adminNotes: notes }),
      });
      onSaved(updated);
      setMessage("Changes saved securely.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.aside
      className="lead-drawer"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      aria-label="Consultation details"
    >
      <div className="lead-drawer-header">
        <div>
          <p>Verified consultation</p>
          <h2>{lead.name}</h2>
        </div>
        <button type="button" onClick={onClose} aria-label="Close details"><X size={20} /></button>
      </div>

      <div className="lead-drawer-content">
        <div className="lead-overview">
          <StatusBadge status={lead.status} />
          <span>{formatDate(lead.createdAt)}</span>
        </div>

        <section className="lead-detail-section">
          <p className="lead-detail-label">Service requested</p>
          <h3>{lead.service}</h3>
        </section>

        <section className="lead-contact-grid">
          <a href={`mailto:${lead.email}`}><Mail size={17} /><span>Email<strong>{lead.email}</strong></span><ExternalLink size={14} /></a>
          <a href={`tel:${lead.phone}`}><Phone size={17} /><span>Phone<strong>{lead.phone}</strong></span><ExternalLink size={14} /></a>
        </section>

        <section className="lead-detail-section">
          <p className="lead-detail-label">Client message</p>
          <p className="lead-message">{lead.message}</p>
        </section>

        <section className="lead-management">
          <label>
            Follow-up status
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              {statusOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label>
            Private admin notes
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength="2000"
              rows="7"
              placeholder="Add call notes, documents requested, or next steps..."
            />
            <span>{notes.length} / 2000</span>
          </label>
          {message && <p className="lead-save-message">{message}</p>}
          <button className="admin-primary-action" type="button" onClick={save} disabled={saving}>
            {saving ? <><LoaderCircle className="spin" size={17} /> Saving</> : <><Save size={17} /> Save follow-up</>}
          </button>
        </section>
      </div>
    </motion.aside>
  );
}

function AdminDashboard({ admin, onLoggedOut }) {
  const [stats, setStats] = useState(emptyStats);
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({ search: "", status: "all", service: "all", page: 1 });
  const [selectedLead, setSelectedLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const authFailedRef = useRef(false);

  const queryString = useMemo(() => {
    const params = new URLSearchParams({
      page: String(filters.page),
      limit: "20",
      status: filters.status,
      service: filters.service,
      search: filters.search,
    });
    return params.toString();
  }, [filters]);

  const handleAuthError = useCallback((requestError) => {
    if (requestError.status === 401) {
      if (!authFailedRef.current) {
        authFailedRef.current = true;
        clearAdminSessionStorage();
        onLoggedOut();
      }
      return;
    }
    setError(requestError.message);
  }, [onLoggedOut]);

  const loadStats = useCallback(async () => {
    try {
      setStats(await adminRequest("/api/admin/stats"));
    } catch (requestError) {
      handleAuthError(requestError);
    }
  }, [handleAuthError]);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await adminRequest(`/api/admin/consultations?${queryString}`);
      setLeads(result.items);
      setPagination(result.pagination);
    } catch (requestError) {
      handleAuthError(requestError);
    } finally {
      setLoading(false);
    }
  }, [handleAuthError, queryString]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    const timeout = window.setTimeout(loadLeads, 250);
    return () => window.clearTimeout(timeout);
  }, [loadLeads]);

  const logout = async () => {
    try {
      await adminRequest("/api/admin/logout", { method: "POST" });
    } finally {
      clearAdminSessionStorage();
      onLoggedOut();
    }
  };

  const updateFilter = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value, page: name === "page" ? value : 1 }));
  };

  const handleSaved = (updated) => {
    setSelectedLead(updated);
    setLeads((current) => current.map((lead) => lead._id === updated._id ? updated : lead));
    loadStats();
  };

  const statCards = [
    { label: "Total leads", value: stats.total, icon: Inbox },
    { label: "New requests", value: stats.new, icon: MessageSquareText },
    { label: "In progress", value: stats.inProgress, icon: Clock3 },
    { label: "Completed", value: stats.completed, icon: CheckCircle2 },
  ];

  return (
    <div className="admin-dashboard">
      <aside className={sidebarOpen ? "admin-sidebar open" : "admin-sidebar"}>
        <div className="admin-sidebar-brand">
          <img src="/kini-logo.jpeg" alt="" />
          <span><strong>KINi</strong><small>Secure admin</small></span>
          <button type="button" onClick={() => setSidebarOpen(false)} aria-label="Close navigation"><X size={18} /></button>
        </div>
        <nav>
          <a className="active" href="#leads"><Inbox size={18} /> Consultation leads</a>
          <a href="/"><ExternalLink size={18} /> View public website</a>
        </nav>
        <div className="admin-sidebar-user">
          <UserRound size={18} />
          <span><small>Signed in as</small>{admin.email}</span>
          <button type="button" onClick={logout} aria-label="Sign out"><LogOut size={17} /></button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <button className="admin-mobile-menu" type="button" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Menu size={20} /></button>
          <div>
            <p>Owner workspace</p>
            <h1>Consultation leads</h1>
          </div>
          <button className="admin-refresh" type="button" onClick={() => { loadStats(); loadLeads(); }}><RefreshCw size={17} /> Refresh</button>
        </header>

        <section className="admin-stats" aria-label="Lead statistics">
          {statCards.map(({ label, value, icon: Icon }) => (
            <article key={label}>
              <div><Icon size={18} /><span>{label}</span></div>
              <strong>{value}</strong>
            </article>
          ))}
        </section>

        <section className="admin-leads" id="leads">
          <div className="admin-leads-heading">
            <div>
              <p>Verified requests</p>
              <h2>Clients needing services</h2>
            </div>
            <span>{pagination.total} result{pagination.total === 1 ? "" : "s"}</span>
          </div>

          <div className="admin-filters">
            <label className="admin-search">
              <Search size={17} />
              <input
                value={filters.search}
                onChange={(event) => updateFilter("search", event.target.value)}
                placeholder="Search name, email, phone or service"
                maxLength="80"
              />
            </label>
            <select value={filters.status} onChange={(event) => updateFilter("status", event.target.value)} aria-label="Filter by status">
              <option value="all">All statuses</option>
              {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <select value={filters.service} onChange={(event) => updateFilter("service", event.target.value)} aria-label="Filter by service">
              <option value="all">All services</option>
              {services.map((service) => <option key={service.name}>{service.name}</option>)}
              <option>General Enquiry</option>
            </select>
          </div>

          {error && <p className="admin-error admin-list-error">{error}</p>}

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Service</th>
                  <th>Received</th>
                  <th>Status</th>
                  <th><span className="sr-only">View</span></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr className="admin-empty-row"><td colSpan="5"><div className="admin-empty"><LoaderCircle className="spin" size={23} /> Loading secure leads...</div></td></tr>
                ) : leads.length === 0 ? (
                  <tr className="admin-empty-row"><td colSpan="5"><div className="admin-empty"><FileText size={24} /> No consultation requests match these filters.</div></td></tr>
                ) : leads.map((lead) => (
                  <tr key={lead._id}>
                    <td><strong>{lead.name}</strong><span>{lead.email}</span></td>
                    <td data-label="Service">{lead.service}</td>
                    <td data-label="Received">{formatDate(lead.createdAt)}</td>
                    <td data-label="Status"><StatusBadge status={lead.status} /></td>
                    <td><button type="button" onClick={() => setSelectedLead(lead)} aria-label={`View ${lead.name}'s request`}><Eye size={18} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-pagination">
            <button type="button" disabled={pagination.page <= 1} onClick={() => updateFilter("page", pagination.page - 1)}><ArrowLeft size={16} /> Previous</button>
            <span>Page {pagination.page} of {pagination.pages}</span>
            <button type="button" disabled={pagination.page >= pagination.pages} onClick={() => updateFilter("page", pagination.page + 1)}>Next <ArrowRight size={16} /></button>
          </div>
        </section>
      </main>

      <AnimatePresence>
        {selectedLead && (
          <>
            <motion.button
              className="lead-drawer-backdrop"
              type="button"
              aria-label="Close details"
              onClick={() => setSelectedLead(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <LeadDrawer lead={selectedLead} onClose={() => setSelectedLead(null)} onSaved={handleSaved} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function AdminPortal() {
  const [authState, setAuthState] = useState("checking");
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    document.title = "Secure Admin | KINi Outsourcing Services";
    let robotsMeta = document.querySelector('meta[name="robots"]');
    const previousRobotsContent = robotsMeta?.content;
    const createdRobotsMeta = !robotsMeta;
    if (!robotsMeta) {
      robotsMeta = document.createElement("meta");
      robotsMeta.name = "robots";
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.content = "noindex, nofollow, noarchive";

    adminRequest("/api/admin/me")
      .then((result) => {
        setAdmin(result);
        setAuthState("authenticated");
      })
      .catch(() => {
        clearAdminSessionStorage();
        setAuthState("anonymous");
      });
    return () => {
      document.title = "KINi Outsourcing Services | Tax Consultant";
      if (createdRobotsMeta) robotsMeta.remove();
      else robotsMeta.content = previousRobotsContent;
    };
  }, []);

  if (authState === "checking") {
    return <div className="admin-checking"><LoaderCircle className="spin" size={28} /><span>Checking secure session...</span></div>;
  }

  if (authState === "anonymous") {
    return <AdminLogin onAuthenticated={(result) => { setAdmin(result); setAuthState("authenticated"); }} />;
  }

  return <AdminDashboard admin={admin} onLoggedOut={() => { clearAdminSessionStorage(); setAdmin(null); setAuthState("anonymous"); }} />;
}

export default AdminPortal;

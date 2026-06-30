import { useState, useEffect, createContext, useContext } from "react";

// ============================================================
// SUPABASE CLIENT
// ============================================================
const SUPABASE_URL = "https://fzjpeofvvubsmrlxrwme.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6anBlb2Z2dnVic21ybHhyd21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNDA3MDEsImV4cCI6MjA5NDkxNjcwMX0.tfWhpyFW6IPEK1P7-dKGmqUQ_o_YWHoZ5UfL7bsZu-8";

async function supabase(method, path, body = null, token = null) {
  const headers = {
    "Content-Type": "application/json",
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${token || SUPABASE_ANON_KEY}`,
    Prefer: method === "POST" ? "return=representation" : "",
  };
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Erreur Supabase");
  }
  return res.status === 204 ? null : res.json();
}

// ============================================================
// CONTEXT AUTH
// ============================================================
const AuthContext = createContext(null);
function useAuth() { return useContext(AuthContext); }

// ============================================================
// COULEURS & STYLES
// ============================================================
const C = {
  bg: "#0F1117",
  surface: "#1A1D27",
  card: "#22263A",
  border: "#2E3450",
  gold: "#F5C842",
  goldLight: "#FFE07A",
  goldDim: "#A8882E",
  text: "#F0F0F0",
  textMuted: "#8A8FA8",
  green: "#2ECC71",
  orange: "#F39C12",
  red: "#E74C3C",
  blue: "#3498DB",
};

const s = {
  app: { minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Segoe UI', sans-serif" },
  card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 },
  input: {
    width: "100%", padding: "10px 14px", background: C.surface,
    border: `1px solid ${C.border}`, borderRadius: 8, color: C.text,
    fontSize: 14, outline: "none", boxSizing: "border-box",
  },
  btn: (color = C.gold) => ({
    padding: "10px 20px", background: color, color: color === C.gold ? "#0F1117" : C.text,
    border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700,
    fontSize: 14, transition: "opacity .2s",
  }),
  btnSm: (color = C.gold) => ({
    padding: "6px 12px", background: color, color: color === C.gold ? "#0F1117" : C.text,
    border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600,
    fontSize: 12,
  }),
  label: { fontSize: 12, color: C.textMuted, marginBottom: 4, display: "block" },
  badge: (color) => ({
    display: "inline-block", padding: "2px 10px", borderRadius: 20,
    background: color + "22", color: color, fontSize: 11, fontWeight: 700,
  }),
};

// ============================================================
// UTILS
// ============================================================
function fmt(n) { return new Intl.NumberFormat("fr-FR").format(n) + " FCFA"; }
function fmtDate(d) { return d ? new Date(d).toLocaleDateString("fr-FR") : "—"; }
function expiryStatus(date) {
  if (!date) return null;
  const diff = (new Date(date) - new Date()) / 86400000;
  if (diff < 0) return "expired";
  if (diff <= 7) return "soon";
  return "ok";
}
function expiryBadge(date) {
  const st = expiryStatus(date);
  if (!st) return null;
  const map = { expired: [C.red, "PÉRIMÉ"], soon: [C.orange, "Expire bientôt"], ok: [C.green, "OK"] };
  const [color, label] = map[st];
  return <span style={s.badge(color)}>{label}</span>;
}
function roleBadge(role) {
  const map = { admin: [C.gold, "Admin"], gerant: [C.blue, "Gérant"], vendeur: [C.green, "Vendeur"] };
  const [color, label] = map[role] || [C.textMuted, role];
  return <span style={s.badge(color)}>{label}</span>;
}// ============================================================
// LOGIN PAGE
// ============================================================
function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!username || !password) return setError("Remplis tous les champs.");
    setLoading(true); setError("");
    try {
      const users = await supabase("GET", `vp_users?username=eq.${encodeURIComponent(username)}&select=*`);
      if (!users || users.length === 0) return setError("Utilisateur introuvable.");
      const user = users[0];
      if (user.password !== password) return setError("Mot de passe incorrect.");
      if (!user.actif) return setError("Compte désactivé. Contactez l'administrateur.");
      onLogin(user);
    } catch (e) {
      setError(e.message);
    } finally { setLoading(false); }
  }

  return (
    <div style={{ ...s.app, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🏪</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: C.gold, letterSpacing: 2 }}>VENDOPRO</div>
          <div style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>Gestion commerciale intelligente</div>
        </div>

        <div style={s.card}>
          <div style={{ marginBottom: 20, fontSize: 18, fontWeight: 700 }}>Connexion</div>

          <div style={{ marginBottom: 14 }}>
            <label style={s.label}>Nom d'utilisateur</label>
            <input style={s.input} value={username} onChange={e => setUsername(e.target.value)}
              placeholder="Votre nom d'utilisateur" onKeyDown={e => e.key === "Enter" && handleLogin()} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={s.label}>Mot de passe</label>
            <input style={s.input} type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleLogin()} />
          </div>

          {error && <div style={{ color: C.red, fontSize: 13, marginBottom: 14, padding: "8px 12px", background: C.red + "11", borderRadius: 6 }}>{error}</div>}

          <button style={{ ...s.btn(), width: "100%" }} onClick={handleLogin} disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: C.textMuted }}>
          Accès réservé aux utilisateurs autorisés
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SIDEBAR
// ============================================================
function Sidebar({ active, setActive, user, onLogout }) {
  const menu = [
    { id: "dashboard", icon: "📊", label: "Tableau de bord" },
    { id: "ventes", icon: "💰", label: "Ventes" },
    { id: "produits", icon: "📦", label: "Produits & Stock" },
    { id: "clients", icon: "👥", label: "Clients" },
    { id: "depenses", icon: "💸", label: "Dépenses" },
    { id: "rapports", icon: "📈", label: "Rapports" },
    ...(user.role === "admin" ? [{ id: "utilisateurs", icon: "🔐", label: "Utilisateurs" }] : []),
  ];

  return (
    <div style={{ width: 220, background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <div style={{ padding: "24px 20px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: C.gold }}>VENDOPRO</div>
        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>v2.0</div>
      </div>

      <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{user.username}</div>
        {roleBadge(user.role)}
      </div>

      <nav style={{ flex: 1, padding: "12px 0" }}>
        {menu.map(m => (
          <div key={m.id}
            onClick={() => setActive(m.id)}
            style={{
              padding: "11px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
              background: active === m.id ? C.gold + "18" : "transparent",
              borderLeft: active === m.id ? `3px solid ${C.gold}` : "3px solid transparent",
              color: active === m.id ? C.gold : C.textMuted,
              fontSize: 14, fontWeight: active === m.id ? 700 : 400,
              transition: "all .15s",
            }}>
            <span>{m.icon}</span><span>{m.label}</span>
          </div>
        ))}
      </nav>

      <div style={{ padding: 16, borderTop: `1px solid ${C.border}` }}>
        <button style={{ ...s.btn(C.border), width: "100%", color: C.textMuted }} onClick={onLogout}>
          🚪 Déconnexion
        </button>
      </div>
    </div>
  );// ============================================================
// DASHBOARD
// ============================================================
function Dashboard({ user }) {
  const [stats, setStats] = useState({ ventes: 0, produits: 0, clients: 0, alertes: 0, chiffreAffaires: 0 });
  const [expiring, setExpiring] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const [ventes, produits, clients, depenses] = await Promise.all([
          supabase("GET", "vp_ventes?select=montant_total"),
          supabase("GET", "vp_produits?select=*"),
          supabase("GET", "vp_clients?select=id"),
          supabase("GET", "vp_depenses?select=montant"),
        ]);
        const ca = (ventes || []).reduce((s, v) => s + (v.montant_total || 0), 0);
        const exp = (produits || []).filter(p => p.date_peremption && expiryStatus(p.date_peremption) !== "ok");
        const low = (produits || []).filter(p => p.stock <= (p.stock_min || 5));
        setStats({
          ventes: (ventes || []).length,
          produits: (produits || []).length,
          clients: (clients || []).length,
          alertes: exp.length + low.length,
          chiffreAffaires: ca,
        });
        setExpiring(exp);
        setLowStock(low);
      } catch (e) { console.error(e); }
    }
    load();
  }, []);

  const cards = [
    { label: "Chiffre d'affaires", value: fmt(stats.chiffreAffaires), icon: "💵", color: C.gold },
    { label: "Ventes enregistrées", value: stats.ventes, icon: "🧾", color: C.blue },
    { label: "Produits en stock", value: stats.produits, icon: "📦", color: C.green },
    { label: "Clients", value: stats.clients, icon: "👥", color: C.orange },
  ];

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 800 }}>Bonjour, {user.username} 👋</div>
        <div style={{ color: C.textMuted, fontSize: 14, marginTop: 4 }}>
          {new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
        {cards.map(c => (
          <div key={c.label} style={{ ...s.card, borderTop: `3px solid ${c.color}` }}>
            <div style={{ fontSize: 28 }}>{c.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: c.color, marginTop: 8 }}>{c.value}</div>
            <div style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {(expiring.length > 0 || lowStock.length > 0) && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {expiring.length > 0 && (
            <div style={s.card}>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.red, marginBottom: 14 }}>⚠️ Produits périmés / expirant</div>
              {expiring.map(p => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 14 }}>{p.nom}</span>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: C.textMuted }}>{fmtDate(p.date_peremption)}</span>
                    {expiryBadge(p.date_peremption)}
                  </div>
                </div>
              ))}
            </div>
          )}
          {lowStock.length > 0 && (
            <div style={s.card}>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.orange, marginBottom: 14 }}>📉 Stock bas</div>
              {lowStock.map(p => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 14 }}>{p.nom}</span>
                  <span style={s.badge(C.orange)}>Stock: {p.stock}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// PRODUITS
// ============================================================
function Produits({ user }) {
  const [produits, setProduits] = useState([]);
  const [form, setForm] = useState({ nom: "", categorie: "", prix_achat: "", prix_vente: "", stock: "", stock_min: "", date_peremption: "", unite: "" });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");

  async function load() {
    const data = await supabase("GET", "vp_produits?select=*&order=nom.asc");
    setProduits(data || []);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    const body = {
      ...form,
      prix_achat: parseFloat(form.prix_achat) || 0,
      prix_vente: parseFloat(form.prix_vente) || 0,
      stock: parseInt(form.stock) || 0,
      stock_min: parseInt(form.stock_min) || 5,
      date_peremption: form.date_peremption || null,
      cree_par: user.username,
      modifie_par: user.username,
    };
    if (editing) {
      await supabase("PATCH", `vp_produits?id=eq.${editing}`, body);
    } else {
      await supabase("POST", "vp_produits", body);
    }
    setForm({ nom: "", categorie: "", prix_achat: "", prix_vente: "", stock: "", stock_min: "", date_peremption: "", unite: "" });
    setShowForm(false); setEditing(null);
    load();
  }

  async function del(id) {
    if (!confirm("Supprimer ce produit ?")) return;
    await supabase("DELETE", `vp_produits?id=eq.${id}`);
    load();
  }

  function edit(p) {
    setForm({ nom: p.nom, categorie: p.categorie || "", prix_achat: p.prix_achat, prix_vente: p.prix_vente, stock: p.stock, stock_min: p.stock_min || 5, date_peremption: p.date_peremption || "", unite: p.unite || "" });
    setEditing(p.id); setShowForm(true);
  }

  const filtered = produits.filter(p => p.nom?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800 }}>📦 Produits & Stock</div>
        <button style={s.btn()} onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ nom: "", categorie: "", prix_achat: "", prix_vente: "", stock: "", stock_min: "", date_peremption: "", unite: "" }); }}>
          + Nouveau produit
        </button>
      </div>

      {showForm && (
        <div style={{ ...s.card, marginBottom: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>{editing ? "Modifier le produit" : "Nouveau produit"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            {[["nom", "Nom du produit *"], ["categorie", "Catégorie"], ["unite", "Unité (ex: kg, L, pièce)"]].map(([k, l]) => (
              <div key={k}>
                <label style={s.label}>{l}</label>
                <input style={s.input} value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} />
              </div>
            ))}
            {[["prix_achat", "Prix d'achat (FCFA)"], ["prix_vente", "Prix de vente (FCFA)"], ["stock", "Quantité en stock"], ["stock_min", "Stock minimum alerte"]].map(([k, l]) => (
              <div key={k}>
                <label style={s.label}>{l}</label>
                <input style={s.input} type="number" value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} />
              </div>
            ))}
            <div>
              <label style={s.label}>Date de péremption (optionnel)</label>
              <input style={s.input} type="date" value={form.date_peremption} onChange={e => setForm({ ...form, date_peremption: e.target.value })} />
            </div>
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <button style={s.btn()} onClick={save}>💾 Enregistrer</button>
            <button style={s.btn(C.border)} onClick={() => { setShowForm(false); setEditing(null); }}>Annuler</button>
          </div>
        </div>
      )}

      <input style={{ ...s.input, marginBottom: 16, maxWidth: 300 }} placeholder="🔍 Rechercher un produit..." value={search} onChange={e => setSearch(e.target.value)} />

      <div style={{ ...s.card, padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: C.surface }}>
              {["Produit", "Catégorie", "Prix achat", "Prix vente", "Stock", "Péremption", "Ajouté par", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, color: C.textMuted, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.id} style={{ borderTop: `1px solid ${C.border}`, background: i % 2 === 0 ? "transparent" : C.surface + "44" }}>
                <td style={{ padding: "12px 16px", fontWeight: 600 }}>{p.nom}</td>
                <td style={{ padding: "12px 16px", color: C.textMuted, fontSize: 13 }}>{p.categorie || "—"}</td>
                <td style={{ padding: "12px 16px", fontSize: 13 }}>{fmt(p.prix_achat)}</td>
                <td style={{ padding: "12px 16px", color: C.gold, fontWeight: 700 }}>{fmt(p.prix_vente)}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={s.badge(p.stock <= (p.stock_min || 5) ? C.red : C.green)}>{p.stock} {p.unite || ""}</span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  {p.date_peremption ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={{ fontSize: 12, color: C.textMuted }}>{fmtDate(p.date_peremption)}</span>
                      {expiryBadge(p.date_peremption)}
                    </div>
                  ) : <span style={{ color: C.textMuted, fontSize: 12 }}>—</span>}
                </td>
                <td style={{ padding: "12px 16px", fontSize: 12, color: C.textMuted }}>{p.cree_par || "—"}</td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button style={s.btnSm(C.blue)} onClick={() => edit(p)}>✏️</button>
                    {user.role === "admin" && <button style={s.btnSm(C.red)} onClick={() => del(p.id)}>🗑️</button>}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ padding: 32, textAlign: "center", color: C.textMuted }}>Aucun produit trouvé</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
  }// ============================================================
// CLIENTS
// ============================================================
function Clients({ user }) {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({ nom: "", telephone: "", adresse: "", email: "" });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  async function load() {
    const data = await supabase("GET", "vp_clients?select=*&order=nom.asc");
    setClients(data || []);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    const body = { ...form, cree_par: user.username };
    if (editing) await supabase("PATCH", `vp_clients?id=eq.${editing}`, body);
    else await supabase("POST", "vp_clients", body);
    setForm({ nom: "", telephone: "", adresse: "", email: "" });
    setShowForm(false); setEditing(null); load();
  }

  async function del(id) {
    if (!confirm("Supprimer ce client ?")) return;
    await supabase("DELETE", `vp_clients?id=eq.${id}`);
    load();
  }

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800 }}>👥 Clients</div>
        <button style={s.btn()} onClick={() => { setShowForm(!showForm); setEditing(null); }}>+ Nouveau client</button>
      </div>

      {showForm && (
        <div style={{ ...s.card, marginBottom: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>{editing ? "Modifier" : "Nouveau client"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[["nom", "Nom complet *"], ["telephone", "Téléphone"], ["email", "Email"], ["adresse", "Adresse"]].map(([k, l]) => (
              <div key={k}>
                <label style={s.label}>{l}</label>
                <input style={s.input} value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <button style={s.btn()} onClick={save}>💾 Enregistrer</button>
            <button style={s.btn(C.border)} onClick={() => setShowForm(false)}>Annuler</button>
          </div>
        </div>
      )}

      <div style={{ ...s.card, padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: C.surface }}>
              {["Nom", "Téléphone", "Email", "Adresse", "Ajouté par", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, color: C.textMuted, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clients.map((c, i) => (
              <tr key={c.id} style={{ borderTop: `1px solid ${C.border}`, background: i % 2 === 0 ? "transparent" : C.surface + "44" }}>
                <td style={{ padding: "12px 16px", fontWeight: 600 }}>{c.nom}</td>
                <td style={{ padding: "12px 16px", color: C.textMuted }}>{c.telephone || "—"}</td>
                <td style={{ padding: "12px 16px", color: C.textMuted }}>{c.email || "—"}</td>
                <td style={{ padding: "12px 16px", color: C.textMuted }}>{c.adresse || "—"}</td>
                <td style={{ padding: "12px 16px", fontSize: 12, color: C.textMuted }}>{c.cree_par || "—"}</td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button style={s.btnSm(C.blue)} onClick={() => { setForm({ nom: c.nom, telephone: c.telephone || "", adresse: c.adresse || "", email: c.email || "" }); setEditing(c.id); setShowForm(true); }}>✏️</button>
                    {user.role === "admin" && <button style={s.btnSm(C.red)} onClick={() => del(c.id)}>🗑️</button>}
                  </div>
                </td>
              </tr>
            ))}
            {clients.length === 0 && <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: C.textMuted }}>Aucun client</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================
// VENTES
// ============================================================
function Ventes({ user }) {
  const [ventes, setVentes] = useState([]);
  const [produits, setProduits] = useState([]);
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [lignes, setLignes] = useState([{ produit_id: "", quantite: 1, prix_unitaire: 0 }]);
  const [clientId, setClientId] = useState("");
  const [note, setNote] = useState("");
  const [printVente, setPrintVente] = useState(null);

  async function load() {
    const [v, p, c] = await Promise.all([
      supabase("GET", "vp_ventes?select=*&order=created_at.desc"),
      supabase("GET", "vp_produits?select=*"),
      supabase("GET", "vp_clients?select=*"),
    ]);
    setVentes(v || []); setProduits(p || []); setClients(c || []);
  }
  useEffect(() => { load(); }, []);

  function updateLigne(i, field, val) {
    const nl = [...lignes];
    nl[i][field] = val;
    if (field === "produit_id") {
      const p = produits.find(x => x.id === val);
      if (p) nl[i].prix_unitaire = p.prix_vente;
    }
    setLignes(nl);
  }

  const total = lignes.reduce((s, l) => s + (parseFloat(l.quantite) || 0) * (parseFloat(l.prix_unitaire) || 0), 0);

  async function enregistrerVente() {
    if (!lignes[0].produit_id) return alert("Sélectionne au moins un produit.");
    const body = {
      client_id: clientId || null,
      lignes: JSON.stringify(lignes),
      montant_total: total,
      note,
      vendeur: user.username,
      created_at: new Date().toISOString(),
    };
    await supabase("POST", "vp_ventes", body);
    for (const l of lignes) {
      if (l.produit_id && l.quantite) {
        const p = produits.find(x => x.id === l.produit_id);
        if (p) await supabase("PATCH", `vp_produits?id=eq.${l.produit_id}`, { stock: Math.max(0, p.stock - parseInt(l.quantite)) });
      }
    }
    setLignes([{ produit_id: "", quantite: 1, prix_unitaire: 0 }]);
    setClientId(""); setNote(""); setShowForm(false);
    load();
  }

  function printFacture(v) { setPrintVente(v); setTimeout(() => window.print(), 300); }

  return (
    <div style={{ padding: 28 }}>
      {printVente && (
        <div id="print-area" style={{ display: "none" }}>
          <div style={{ fontFamily: "Arial", padding: 40, maxWidth: 600, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 30 }}>
              <div style={{ fontSize: 28, fontWeight: 900 }}>VENDOPRO</div>
              <div style={{ fontSize: 14, color: "#666" }}>FACTURE</div>
              <div style={{ fontSize: 12, color: "#999", marginTop: 6 }}>
                N° {printVente.id?.slice(0, 8).toUpperCase()} — {fmtDate(printVente.created_at)}
              </div>
            </div>
            <div style={{ marginBottom: 20, fontSize: 13 }}>
              <strong>Vendeur :</strong> {printVente.vendeur}<br />
              <strong>Client :</strong> {clients.find(c => c.id === printVente.client_id)?.nom || "Client au comptoir"}
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
              <thead>
                <tr style={{ background: "#f5f5f5" }}>
                  <th style={{ padding: 8, textAlign: "left", border: "1px solid #ddd" }}>Produit</th>
                  <th style={{ padding: 8, textAlign: "center", border: "1px solid #ddd" }}>Qté</th>
                  <th style={{ padding: 8, textAlign: "right", border: "1px solid #ddd" }}>Prix unit.</th>
                  <th style={{ padding: 8, textAlign: "right", border: "1px solid #ddd" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {(JSON.parse(printVente.lignes || "[]")).map((l, i) => {
                  const p = produits.find(x => x.id === l.produit_id);
                  return (
                    <tr key={i}>
                      <td style={{ padding: 8, border: "1px solid #ddd" }}>{p?.nom || "—"}</td>
                      <td style={{ padding: 8, textAlign: "center", border: "1px solid #ddd" }}>{l.quantite}</td>
                      <td style={{ padding: 8, textAlign: "right", border: "1px solid #ddd" }}>{fmt(l.prix_unitaire)}</td>
                      <td style={{ padding: 8, textAlign: "right", border: "1px solid #ddd" }}>{fmt(l.quantite * l.prix_unitaire)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ textAlign: "right", fontSize: 18, fontWeight: 900 }}>TOTAL : {fmt(printVente.montant_total)}</div>
            <div style={{ marginTop: 30, fontSize: 12, color: "#999", textAlign: "center" }}>
              Merci de votre confiance — Document généré par VendoPro 2.0
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800 }}>💰 Ventes</div>
        <button style={s.btn()} onClick={() => setShowForm(!showForm)}>+ Nouvelle vente</button>
      </div>

      {showForm && (
        <div style={{ ...s.card, marginBottom: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Nouvelle vente</div>

          <div style={{ marginBottom: 14 }}>
            <label style={s.label}>Client (optionnel)</label>
            <select style={s.input} value={clientId} onChange={e => setClientId(e.target.value)}>
              <option value="">Client au comptoir</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </div>

          {lignes.map((l, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 10, marginBottom: 10, alignItems: "end" }}>
              <div>
                {i === 0 && <label style={s.label}>Produit</label>}
                <select style={s.input} value={l.produit_id} onChange={e => updateLigne(i, "produit_id", e.target.value)}>
                  <option value="">Sélectionner...</option>
                  {produits.map(p => <option key={p.id} value={p.id}>{p.nom} (stock: {p.stock})</option>)}
                </select>
              </div>
              <div>
                {i === 0 && <label style={s.label}>Quantité</label>}
                <input style={s.input} type="number" min="1" value={l.quantite} onChange={e => updateLigne(i, "quantite", e.target.value)} />
              </div>
              <div>
                {i === 0 && <label style={s.label}>Prix unit. (FCFA)</label>}
                <input style={s.input} type="number" value={l.prix_unitaire} onChange={e => updateLigne(i, "prix_unitaire", e.target.value)} />
              </div>
              <button style={{ ...s.btnSm(C.red), marginBottom: 1 }} onClick={() => setLignes(lignes.filter((_, j) => j !== i))}>✕</button>
            </div>
          ))}

          <button style={{ ...s.btnSm(C.border), marginBottom: 16, color: C.text }} onClick={() => setLignes([...lignes, { produit_id: "", quantite: 1, prix_unitaire: 0 }])}>
            + Ajouter un produit
          </button>

          <div style={{ marginBottom: 14 }}>
            <label style={s.label}>Note</label>
            <input style={s.input} value={note} onChange={e => setNote(e.target.value)} placeholder="Note optionnelle..." />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: C.gold }}>TOTAL : {fmt(total)}</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={s.btn()} onClick={enregistrerVente}>💾 Enregistrer</button>
              <button style={s.btn(C.border)} onClick={() => setShowForm(false)}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ ...s.card, padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: C.surface }}>
              {["Date", "Client", "Montant", "Vendeur", "Note", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, color: C.textMuted, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ventes.map((v, i) => (
              <tr key={v.id} style={{ borderTop: `1px solid ${C.border}`, background: i % 2 === 0 ? "transparent" : C.surface + "44" }}>
                <td style={{ padding: "12px 16px", fontSize: 13 }}>{fmtDate(v.created_at)}</td>
                <td style={{ padding: "12px 16px", fontSize: 13 }}>{clients.find(c => c.id === v.client_id)?.nom || "Comptoir"}</td>
                <td style={{ padding: "12px 16px", color: C.gold, fontWeight: 700 }}>{fmt(v.montant_total)}</td>
                <td style={{ padding: "12px 16px" }}><span style={s.badge(C.blue)}>{v.vendeur}</span></td>
                <td style={{ padding: "12px 16px", fontSize: 12, color: C.textMuted }}>{v.note || "—"}</td>
                <td style={{ padding: "12px 16px" }}>
                  <button style={s.btnSm(C.green)} onClick={() => printFacture(v)}>🖨️ Facture</button>
                </td>
              </tr>
            ))}
            {ventes.length === 0 && <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: C.textMuted }}>Aucune vente</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
// ============================================================
// DÉPENSES
// ============================================================
function Depenses({ user }) {
  const [depenses, setDepenses] = useState([]);
  const [form, setForm] = useState({ description: "", montant: "", categorie: "", date: new Date().toISOString().split("T")[0] });
  const [showForm, setShowForm] = useState(false);

  async function load() {
    const data = await supabase("GET", "vp_depenses?select=*&order=date.desc");
    setDepenses(data || []);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.description || !form.montant) return alert("Remplis la description et le montant.");
    await supabase("POST", "vp_depenses", { ...form, montant: parseFloat(form.montant), enregistre_par: user.username });
    setForm({ description: "", montant: "", categorie: "", date: new Date().toISOString().split("T")[0] });
    setShowForm(false); load();
  }

  const total = depenses.reduce((s, d) => s + (d.montant || 0), 0);

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800 }}>💸 Dépenses</div>
        <button style={s.btn()} onClick={() => setShowForm(!showForm)}>+ Nouvelle dépense</button>
      </div>

      <div style={{ ...s.card, marginBottom: 24, borderLeft: `4px solid ${C.red}` }}>
        <div style={{ fontSize: 13, color: C.textMuted }}>Total dépenses</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: C.red }}>{fmt(total)}</div>
      </div>

      {showForm && (
        <div style={{ ...s.card, marginBottom: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 14 }}>
            <div>
              <label style={s.label}>Description *</label>
              <input style={s.input} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label style={s.label}>Montant (FCFA) *</label>
              <input style={s.input} type="number" value={form.montant} onChange={e => setForm({ ...form, montant: e.target.value })} />
            </div>
            <div>
              <label style={s.label}>Catégorie</label>
              <input style={s.input} value={form.categorie} onChange={e => setForm({ ...form, categorie: e.target.value })} placeholder="Ex: Loyer, Transport..." />
            </div>
            <div>
              <label style={s.label}>Date</label>
              <input style={s.input} type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
            <button style={s.btn()} onClick={save}>💾 Enregistrer</button>
            <button style={s.btn(C.border)} onClick={() => setShowForm(false)}>Annuler</button>
          </div>
        </div>
      )}

      <div style={{ ...s.card, padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: C.surface }}>
              {["Date", "Description", "Catégorie", "Montant", "Enregistré par"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, color: C.textMuted, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {depenses.map((d, i) => (
              <tr key={d.id} style={{ borderTop: `1px solid ${C.border}`, background: i % 2 === 0 ? "transparent" : C.surface + "44" }}>
                <td style={{ padding: "12px 16px", fontSize: 13 }}>{fmtDate(d.date)}</td>
                <td style={{ padding: "12px 16px" }}>{d.description}</td>
                <td style={{ padding: "12px 16px", color: C.textMuted, fontSize: 13 }}>{d.categorie || "—"}</td>
                <td style={{ padding: "12px 16px", color: C.red, fontWeight: 700 }}>{fmt(d.montant)}</td>
                <td style={{ padding: "12px 16px" }}><span style={s.badge(C.blue)}>{d.enregistre_par}</span></td>
              </tr>
            ))}
            {depenses.length === 0 && <tr><td colSpan={5} style={{ padding: 32, textAlign: "center", color: C.textMuted }}>Aucune dépense</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================
// RAPPORTS
// ============================================================
function Rapports({ user }) {
  const [ventes, setVentes] = useState([]);
  const [depenses, setDepenses] = useState([]);
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");

  async function load() {
    let qv = "vp_ventes?select=*&order=created_at.desc";
    let qd = "vp_depenses?select=*&order=date.desc";
    const [v, d] = await Promise.all([supabase("GET", qv), supabase("GET", qd)]);
    setVentes(v || []); setDepenses(d || []);
  }
  useEffect(() => { load(); }, []);

  const fv = ventes.filter(v => {
    if (dateDebut && v.created_at < dateDebut) return false;
    if (dateFin && v.created_at > dateFin + "T23:59:59") return false;
    return true;
  });
  const fd = depenses.filter(d => {
    if (dateDebut && d.date < dateDebut) return false;
    if (dateFin && d.date > dateFin) return false;
    return true;
  });

  const totalVentes = fv.reduce((s, v) => s + (v.montant_total || 0), 0);
  const totalDepenses = fd.reduce((s, d) => s + (d.montant || 0), 0);
  const benefice = totalVentes - totalDepenses;

  function printRapport() { window.print(); }

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800 }}>📈 Rapports</div>
        <button style={s.btn(C.green)} onClick={printRapport}>🖨️ Imprimer le rapport</button>
      </div>

      <div style={{ ...s.card, marginBottom: 24, display: "flex", gap: 20, alignItems: "flex-end" }}>
        <div>
          <label style={s.label}>Du</label>
          <input style={{ ...s.input, width: 180 }} type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} />
        </div>
        <div>
          <label style={s.label}>Au</label>
          <input style={{ ...s.input, width: 180 }} type="date" value={dateFin} onChange={e => setDateFin(e.target.value)} />
        </div>
        <button style={s.btn(C.border)} onClick={() => { setDateDebut(""); setDateFin(""); }}>Tout afficher</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Total ventes", value: fmt(totalVentes), color: C.gold },
          { label: "Total dépenses", value: fmt(totalDepenses), color: C.red },
          { label: "Bénéfice net", value: fmt(benefice), color: benefice >= 0 ? C.green : C.red },
        ].map(c => (
          <div key={c.label} style={{ ...s.card, borderTop: `3px solid ${c.color}` }}>
            <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 6 }}>{c.label}</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div style={{ ...s.card, marginBottom: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: C.gold }}>Détail des ventes ({fv.length})</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Date", "Montant", "Vendeur", "Note"].map(h => (
                <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 12, color: C.textMuted, borderBottom: `1px solid ${C.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fv.map(v => (
              <tr key={v.id}>
                <td style={{ padding: "8px 12px", fontSize: 13 }}>{fmtDate(v.created_at)}</td>
                <td style={{ padding: "8px 12px", color: C.gold, fontWeight: 700 }}>{fmt(v.montant_total)}</td>
                <td style={{ padding: "8px 12px" }}><span style={s.badge(C.blue)}>{v.vendeur}</span></td>
                <td style={{ padding: "8px 12px", fontSize: 12, color: C.textMuted }}>{v.note || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================
// GESTION UTILISATEURS (Admin only)
// ============================================================
function Utilisateurs({ user }) {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: "", password: "", role: "vendeur" });
  const [showForm, setShowForm] = useState(false);

  async function load() {
    const data = await supabase("GET", "vp_users?select=*&order=username.asc");
    setUsers(data || []);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.username || !form.password) return alert("Username et mot de passe requis.");
    await supabase("POST", "vp_users", { ...form, actif: true, cree_par: user.username });
    setForm({ username: "", password: "", role: "vendeur" });
    setShowForm(false); load();
  }

  async function toggleActif(u) {
    await supabase("PATCH", `vp_users?id=eq.${u.id}`, { actif: !u.actif });
    load();
  }

  async function del(id) {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    await supabase("DELETE", `vp_users?id=eq.${id}`);
    load();
  }

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800 }}>🔐 Gestion des utilisateurs</div>
        <button style={s.btn()} onClick={() => setShowForm(!showForm)}>+ Créer un compte</button>
      </div>

      {showForm && (
        <div style={{ ...s.card, marginBottom: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Nouveau compte</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <div>
              <label style={s.label}>Nom d'utilisateur *</label>
              <input style={s.input} value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
            </div>
            <div>
              <label style={s.label}>Mot de passe *</label>
              <input style={s.input} type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <div>
              <label style={s.label}>Rôle</label>
              <select style={s.input} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="admin">Admin</option>
                <option value="gerant">Gérant</option>
                <option value="vendeur">Vendeur</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <button style={s.btn()} onClick={save}>💾 Créer le compte</button>
            <button style={s.btn(C.border)} onClick={() => setShowForm(false)}>Annuler</button>
          </div>
        </div>
      )}

      <div style={{ ...s.card, padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: C.surface }}>
              {["Utilisateur", "Rôle", "Statut", "Créé par", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, color: C.textMuted, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id} style={{ borderTop: `1px solid ${C.border}`, background: i % 2 === 0 ? "transparent" : C.surface + "44" }}>
                <td style={{ padding: "12px 16px", fontWeight: 700 }}>{u.username}</td>
                <td style={{ padding: "12px 16px" }}>{roleBadge(u.role)}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={s.badge(u.actif ? C.green : C.red)}>{u.actif ? "Actif" : "Désactivé"}</span>
                </td>
                <td style={{ padding: "12px 16px", fontSize: 12, color: C.textMuted }}>{u.cree_par || "—"}</td>
                <td style={{ padding: "12px 16px" }}>
                  {u.id !== user.id && (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button style={s.btnSm(u.actif ? C.orange : C.green)} onClick={() => toggleActif(u)}>
                        {u.actif ? "Désactiver" : "Activer"}
                      </button>
                      <button style={s.btnSm(C.red)} onClick={() => del(u.id)}>🗑️</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================
// APP PRINCIPALE
// ============================================================
export default function App() {
  const [user, setUser] = useState(null);
  const [active, setActive] = useState("dashboard");

  const pages = {
    dashboard: <Dashboard user={user} />,
    ventes: <Ventes user={user} />,
    produits: <Produits user={user} />,
    clients: <Clients user={user} />,
    depenses: <Depenses user={user} />,
    rapports: <Rapports user={user} />,
    utilisateurs: <Utilisateurs user={user} />,
  };

  if (!user) return <LoginPage onLogin={setUser} />;

  return (
    <div style={{ ...s.app, display: "flex" }}>
      <style>{`@media print { .no-print { display: none !important; } #print-area { display: block !important; } }`}</style>
      <div className="no-print">
        <Sidebar active={active} setActive={setActive} user={user} onLogout={() => setUser(null)} />
      </div>
      <main style={{ flex: 1, overflow: "auto" }}>
        {pages[active]}
      </main>
    </div>
  );
}                                                   }

import { NavLink, Outlet, useNavigate } from "react-router-dom";
import type { UserDTO } from "../types/auth";
import { useLang } from "../i18n/LanguageContext";

interface Props {
  user: UserDTO;
  onLogout: () => void;
}

const PRIMARY = "#1a3d5c";
const PRIMARY_LIGHT = "#e8eef4";

const navLinkStyle = (isActive: boolean): React.CSSProperties => ({
  padding: "0.5rem 1rem",
  textDecoration: "none",
  color: isActive ? "#fff" : PRIMARY,
  fontWeight: isActive ? 600 : 400,
  background: isActive ? PRIMARY : "transparent",
  borderRadius: 4,
  fontSize: "0.9rem",
});

export default function AppLayout({ user, onLogout }: Props) {
  const navigate = useNavigate();
  const isAdmin = user.roles.includes("ADMIN");
  const { lang, t, toggleLang } = useLang();

  const handleLogout = async () => {
    await onLogout();
    navigate("/login");
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif", maxWidth: 1500, margin: "0 auto", padding: "0 1rem" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `2px solid ${PRIMARY}`,
          padding: "0.75rem 0",
          marginBottom: "0.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <h1 style={{ margin: 0, fontSize: "1.3rem", color: PRIMARY, fontWeight: 700, letterSpacing: "0.05em" }}>
            MediCert
          </h1>
          <nav style={{ display: "flex", gap: "0.25rem" }}>
            <NavLink to="/app" end style={({ isActive }) => navLinkStyle(isActive)}>
              {t.nav.home}
            </NavLink>
            <NavLink to="/app/solicitudes" style={({ isActive }) => navLinkStyle(isActive)}>
              {t.nav.requests}
            </NavLink>
            <NavLink to="/app/promotores" style={({ isActive }) => navLinkStyle(isActive)}>
              {t.nav.promoters}
            </NavLink>
            {isAdmin && (
              <>
                <NavLink to="/app/usuarios" style={({ isActive }) => navLinkStyle(isActive)}>
                  {t.nav.users}
                </NavLink>
                <NavLink to="/app/reportes-admin" style={({ isActive }) => navLinkStyle(isActive)}>
                  {t.nav.reports}
                </NavLink>
              </>
            )}
          </nav>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            onClick={toggleLang}
            style={{
              padding: "0.3rem 0.6rem",
              cursor: "pointer",
              border: `1px solid ${PRIMARY}`,
              borderRadius: 4,
              background: PRIMARY_LIGHT,
              color: PRIMARY,
              fontWeight: 600,
              fontSize: "0.75rem",
              letterSpacing: "0.03em",
            }}
          >
            {lang === "en" ? "ES" : "EN"}
          </button>
          <span
            style={{
              padding: "0.3rem 0.6rem",
              background: PRIMARY_LIGHT,
              borderRadius: 4,
              fontSize: "0.8rem",
              color: PRIMARY,
              fontWeight: 500,
            }}
          >
            {user.display_name} — {user.roles.join(", ")}
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: "0.4rem 0.8rem",
              cursor: "pointer",
              border: `1px solid ${PRIMARY}`,
              borderRadius: 4,
              background: "#fff",
              color: PRIMARY,
              fontWeight: 500,
              fontSize: "0.85rem",
            }}
          >
            {t.nav.logout}
          </button>
        </div>
      </header>

      <main style={{ padding: "1rem 0" }}>
        <Outlet />
      </main>
    </div>
  );
}

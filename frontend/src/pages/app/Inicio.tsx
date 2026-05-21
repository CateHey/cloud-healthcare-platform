import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { api } from "../../services/api";
import { useLang } from "../../i18n/LanguageContext";
import type { SolicitudListItemDTO, EstadoOperativo } from "../../types/solicitud";

const PRIMARY = "#1a3d5c";

const estadoColor: Record<EstadoOperativo, string> = {
  REGISTRADO: "#6c757d",
  ASIGNADO_GESTOR: "#0d6efd",
  PAGADO: "#198754",
  ASIGNADO_MEDICO: "#6f42c1",
  CERRADO: "#0d9488",
  CANCELADO: "#6c757d",
};

interface QuickAction {
  labelKey: "register" | "viewRequests" | "manageUsers";
  path: string;
}

const ROLE_ACTIONS: Record<string, QuickAction[]> = {
  OPERADOR: [
    { labelKey: "register", path: "/app/solicitudes/nueva" },
    { labelKey: "viewRequests", path: "/app/solicitudes" },
  ],
  GESTOR: [
    { labelKey: "viewRequests", path: "/app/solicitudes" },
  ],
  MEDICO: [
    { labelKey: "viewRequests", path: "/app/solicitudes" },
  ],
  ADMIN: [
    { labelKey: "viewRequests", path: "/app/solicitudes" },
    { labelKey: "register", path: "/app/solicitudes/nueva" },
    { labelKey: "manageUsers", path: "/app/usuarios" },
  ],
};

export default function Inicio() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLang();
  const [solicitudes, setSolicitudes] = useState<SolicitudListItemDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMine = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{
        ok: boolean;
        data: { items: SolicitudListItemDTO[] };
      }>("/solicitudes?mine=true&page_size=10");
      setSolicitudes(res.data.items);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMine();
  }, [fetchMine]);

  if (!user) return null;

  const seenPaths = new Set<string>();
  const quickActions: QuickAction[] = [];
  for (const role of user.roles) {
    for (const action of ROLE_ACTIONS[role] ?? []) {
      if (!seenPaths.has(action.path)) {
        seenPaths.add(action.path);
        quickActions.push(action);
      }
    }
  }

  const descriptions = user.roles
    .map((r) => (t.inicio.roleDescriptions as Record<string, string>)[r])
    .filter(Boolean);

  const tableHeaders = [t.common.code, t.common.client, t.common.status, t.common.date];

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <div
        style={{
          background: `linear-gradient(135deg, ${PRIMARY}, #2a5f8f)`,
          color: "#fff",
          borderRadius: 8,
          padding: "1.5rem 2rem",
          marginBottom: "1.5rem",
        }}
      >
        <h2 style={{ margin: "0 0 0.5rem 0", fontSize: "1.4rem" }}>
          {t.inicio.welcome} {user.display_name}
        </h2>
        <p style={{ margin: 0, opacity: 0.9, fontSize: "0.95rem", lineHeight: 1.5 }}>
          {t.inicio.subtitle}
        </p>
      </div>

      {descriptions.length > 0 && (
        <div
          style={{
            background: "#f8f9fa",
            border: "1px solid #e9ecef",
            borderRadius: 6,
            padding: "1rem 1.25rem",
            marginBottom: "1.5rem",
            fontSize: "0.9rem",
            color: "#495057",
            lineHeight: 1.6,
          }}
        >
          {descriptions.map((desc, i) => (
            <p key={i} style={{ margin: i < descriptions.length - 1 ? "0 0 0.5rem 0" : 0 }}>
              {desc}
            </p>
          ))}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "0.75rem",
          marginBottom: "2rem",
        }}
      >
        {quickActions.map((action) => (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            style={{
              background: "#fff",
              border: `2px solid ${PRIMARY}`,
              color: PRIMARY,
              borderRadius: 6,
              padding: "1rem",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.9rem",
              textAlign: "center",
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = PRIMARY;
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.color = PRIMARY;
            }}
          >
            {t.inicio.roleActions[action.labelKey]}
          </button>
        ))}
      </div>

      <h3 style={{ color: PRIMARY, margin: "0 0 0.75rem 0", fontSize: "1.1rem" }}>
        {t.inicio.recentRequests}
      </h3>

      {loading ? (
        <p style={{ color: "#666" }}>{t.common.loading}</p>
      ) : solicitudes.length === 0 ? (
        <p style={{ color: "#666", fontStyle: "italic" }}>
          {t.inicio.noRequests}
        </p>
      ) : (
        <>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.9rem",
              }}
            >
              <thead>
                <tr>
                  {tableHeaders.map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "0.6rem 0.5rem",
                        borderBottom: `2px solid ${PRIMARY}`,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {solicitudes.map((s) => (
                  <tr
                    key={s.solicitud_id}
                    style={{ borderBottom: "1px solid #e9ecef", cursor: "pointer" }}
                    onClick={() => navigate(`/app/solicitudes/${s.solicitud_id}`)}
                  >
                    <td style={{ padding: "0.5rem", color: PRIMARY, fontWeight: 600 }}>
                      {s.codigo ?? `#${s.solicitud_id}`}
                    </td>
                    <td style={{ padding: "0.5rem" }}>
                      {s.cliente?.nombre ?? "—"}
                    </td>
                    <td style={{ padding: "0.5rem" }}>
                      <span
                        style={{
                          display: "inline-block",
                          background: estadoColor[s.estado_operativo] ?? "#6c757d",
                          color: "#fff",
                          padding: "0.15rem 0.5rem",
                          borderRadius: 4,
                          fontSize: "0.8rem",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {s.estado_operativo}
                      </span>
                    </td>
                    <td style={{ padding: "0.5rem", whiteSpace: "nowrap" }}>
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: "0.75rem" }}>
            <button
              onClick={() => navigate("/app/solicitudes")}
              style={{
                background: "none",
                border: "none",
                color: PRIMARY,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.9rem",
                padding: 0,
                textDecoration: "underline",
              }}
            >
              {t.inicio.viewAll}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

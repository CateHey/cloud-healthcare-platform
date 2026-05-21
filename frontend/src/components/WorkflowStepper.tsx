/**
 * Stepper visual del flujo de una solicitud CMEP.
 * Muestra la progresion: REGISTRADO → ASIGNADO_GESTOR → PAGADO → ASIGNADO_MEDICO → CERRADO
 * con mini-descripciones por fase. CANCELADO se muestra como banner aparte.
 */

import type { EstadoOperativo } from "../types/solicitud";
import { useLang } from "../i18n/LanguageContext";

interface WorkflowStepperProps {
  estadoActual: EstadoOperativo;
}

type PhaseStatus = "completed" | "current" | "pending";

function getPhaseIndex(key: string, phases: { key: string }[]) {
  return phases.findIndex((p) => p.key === key);
}

function getPhaseStatus(phaseKey: string, estadoActual: EstadoOperativo, phases: { key: string }[]): PhaseStatus {
  if (estadoActual === "CANCELADO") return "pending";
  const phaseIndex = getPhaseIndex(phaseKey, phases);
  const currentIndex = getPhaseIndex(estadoActual, phases);
  if (phaseIndex < currentIndex) return "completed";
  if (phaseIndex === currentIndex) return "current";
  return "pending";
}

const COLORS = {
  completed: "#198754",
  current: "#0d6efd",
  pending: "#adb5bd",
};

export default function WorkflowStepper({ estadoActual }: WorkflowStepperProps) {
  const { t } = useLang();

  const PHASES: { key: EstadoOperativo; label: string; description: string }[] = [
    { key: "REGISTRADO", label: t.workflow.registered, description: t.workflow.registeredDesc },
    { key: "ASIGNADO_GESTOR", label: t.workflow.managerAssigned, description: t.workflow.managerAssignedDesc },
    { key: "PAGADO", label: t.workflow.paid, description: t.workflow.paidDesc },
    { key: "ASIGNADO_MEDICO", label: t.workflow.doctorAssigned, description: t.workflow.doctorAssignedDesc },
    { key: "CERRADO", label: t.workflow.closed, description: t.workflow.closedDesc },
  ];

  return (
    <div style={{ marginBottom: "1rem" }}>
      {/* Stepper row */}
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        {PHASES.map((phase, index) => {
          const status = getPhaseStatus(phase.key, estadoActual, PHASES);
          const prevPhase = index > 0 ? PHASES[index - 1]! : undefined;
          const prevStatus = prevPhase ? getPhaseStatus(prevPhase.key, estadoActual, PHASES) : null;

          return (
            <div key={phase.key} style={{ display: "contents" }}>
              {/* Connector line */}
              {index > 0 && (
                <div
                  style={{
                    flex: 1,
                    height: 3,
                    background: prevStatus === "completed" ? COLORS.completed : COLORS.pending,
                    marginTop: 15,
                    minWidth: 12,
                  }}
                />
              )}

              {/* Step node */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  minWidth: 100,
                  maxWidth: 140,
                }}
              >
                {/* Circle */}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    color: "#fff",
                    background: COLORS[status],
                    boxShadow: status === "current" ? "0 0 0 4px rgba(13,110,253,0.2)" : "none",
                    transform: status === "current" ? "scale(1.15)" : "none",
                    transition: "transform 0.2s ease",
                    flexShrink: 0,
                  }}
                >
                  {status === "completed" ? "✓" : index + 1}
                </div>

                {/* Label */}
                <div
                  style={{
                    marginTop: "0.35rem",
                    fontSize: "0.75rem",
                    fontWeight: status === "current" ? 700 : 500,
                    color: status === "pending" ? "#999" : "#333",
                    textAlign: "center",
                    lineHeight: "1.2",
                  }}
                >
                  {phase.label}
                </div>

                {/* Description */}
                <div
                  style={{
                    marginTop: "0.15rem",
                    fontSize: "0.65rem",
                    color: status === "current" ? COLORS.current : "#888",
                    textAlign: "center",
                    lineHeight: "1.3",
                    fontWeight: status === "current" ? 600 : 400,
                  }}
                >
                  {phase.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CANCELADO banner */}
      {estadoActual === "CANCELADO" && (
        <div
          style={{
            marginTop: "0.75rem",
            padding: "0.5rem 1rem",
            background: "#f8f9fa",
            border: "1px solid #6c757d",
            borderRadius: 4,
            color: "#6c757d",
            fontWeight: 600,
            fontSize: "0.85rem",
            textAlign: "center",
          }}
        >
          {t.workflow.cancelledBanner}
        </div>
      )}
    </div>
  );
}

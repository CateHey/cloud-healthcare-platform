/**
 * Detalle de solicitud — orquestador.
 * Ref: docs/source/06_ui_paginas_y_contratos.md — Solicitudes Detalle
 *
 * Regla UI: mostrar TODOS los bloques siempre. Botones siempre presentes
 * (habilitados o deshabilitados con texto explicativo).
 * Frontend NO calcula permisos — usa acciones_permitidas del backend.
 * Post-accion: siempre reconsultar GET /solicitudes/{id}.
 */

import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import type { ApiResponse } from "../../types/auth";
import type { SolicitudDetailDTO, EditSolicitudRequest, EstadoOperativo } from "../../types/solicitud";
import { useAuth } from "../../hooks/useAuth";
import { useLang } from "../../i18n/LanguageContext";
import WorkflowStepper from "../../components/WorkflowStepper";
import BlockGestion from "./solicitud/BlockGestion";
import BlockPago from "./solicitud/BlockPago";
import BlockEvaluacion from "./solicitud/BlockEvaluacion";
import {
  PRIMARY, estadoColor, neutralSectionStyle,
  labelStyle, valueStyle, inputStyle,
  actionBtnStyle, cancelBtnStyle,
  tableStyle, thStyle, tdStyle, trStyle,
} from "./solicitud/detailStyles";

type ActionModal =
  | null
  | "asignar_gestor" | "cambiar_gestor"
  | "registrar_pago"
  | "asignar_medico" | "cambiar_medico"
  | "cerrar" | "cancelar";

export default function SolicitudDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLang();
  const isAdmin = user?.roles.includes("ADMIN") ?? false;

  const [detail, setDetail] = useState<SolicitudDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<EditSolicitudRequest>({});
  const [saving, setSaving] = useState(false);

  // Action modal state
  const [activeModal, setActiveModal] = useState<ActionModal>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Employee lists for assignment dropdowns
  const [gestores, setGestores] = useState<{ persona_id: number; nombre: string }[]>([]);
  const [medicos, setMedicos] = useState<{ persona_id: number; nombre: string }[]>([]);

  // Form fields for actions
  const [personaId, setPersonaId] = useState("");
  const [pagoCanal, setPagoCanal] = useState("YAPE");
  const [pagoFecha, setPagoFecha] = useState(new Date().toISOString().slice(0, 10));
  const [pagoMonto, setPagoMonto] = useState("");
  const [pagoMoneda, setPagoMoneda] = useState("PEN");
  const [pagoRef, setPagoRef] = useState("");
  const [pagoComentario, setPagoComentario] = useState("");
  const [actionComentario, setActionComentario] = useState("");

  // File upload state (M4)
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTipo, setUploadTipo] = useState("DOCUMENTO");
  const [uploading, setUploading] = useState(false);

  const [uploadError, setUploadError] = useState<string | null>(null);



  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiResponse<SolicitudDetailDTO>>(`/solicitudes/${id}`);
      setDetail(res.data);
    } catch (err: unknown) {
      const e = err as { status?: number; detail?: string };
      if (e.status === 404) {
        setError(t.solicitudDetalle.notFound);
      } else {
        setError(e.detail ?? t.solicitudDetalle.errorLoading);
      }
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  // ── EDITAR_DATOS ──
  const startEdit = () => {
    if (!detail) return;
    setEditData({
      comentario: detail.comentario ?? "",
      tipo_atencion: detail.tipo_atencion ?? "",
      lugar_atencion: detail.lugar_atencion ?? "",
      cliente_nombres: "",
      cliente_apellidos: "",
      cliente_celular: detail.cliente.celular ?? "",
      cliente_email: "",
      cliente_fecha_nacimiento: detail.cliente.fecha_nacimiento ?? "",
      cliente_direccion: detail.cliente.direccion ?? "",
      apoderado_nombres: "",
      apoderado_apellidos: "",
      apoderado_celular: detail.apoderado?.celular_1 ?? "",
      apoderado_email: detail.apoderado?.email ?? "",
      apoderado_fecha_nacimiento: detail.apoderado?.fecha_nacimiento ?? "",
      apoderado_direccion: detail.apoderado?.direccion ?? "",
    });
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditData({});
  };

  const saveEdit = async () => {
    if (!id) return;
    setSaving(true);
    setError(null);
    try {
      const payload: EditSolicitudRequest = {};
      if (editData.comentario !== undefined && editData.comentario !== (detail?.comentario ?? "")) {
        payload.comentario = editData.comentario || undefined;
      }
      if (editData.tipo_atencion !== undefined && editData.tipo_atencion !== (detail?.tipo_atencion ?? "")) {
        payload.tipo_atencion = editData.tipo_atencion || undefined;
      }
      if (editData.lugar_atencion !== undefined && editData.lugar_atencion !== (detail?.lugar_atencion ?? "")) {
        payload.lugar_atencion = editData.lugar_atencion || undefined;
      }
      if (editData.cliente_nombres) {
        payload.cliente_nombres = editData.cliente_nombres;
      }
      if (editData.cliente_apellidos) {
        payload.cliente_apellidos = editData.cliente_apellidos;
      }
      if (editData.cliente_celular !== undefined && editData.cliente_celular !== (detail?.cliente.celular ?? "")) {
        payload.cliente_celular = editData.cliente_celular || undefined;
      }
      if (editData.cliente_email) {
        payload.cliente_email = editData.cliente_email;
      }
      if (editData.cliente_fecha_nacimiento !== undefined && editData.cliente_fecha_nacimiento !== (detail?.cliente.fecha_nacimiento ?? "")) {
        payload.cliente_fecha_nacimiento = editData.cliente_fecha_nacimiento || undefined;
      }
      if (editData.cliente_direccion !== undefined && editData.cliente_direccion !== (detail?.cliente.direccion ?? "")) {
        payload.cliente_direccion = editData.cliente_direccion || undefined;
      }
      // Apoderado fields
      if (editData.apoderado_nombres) {
        payload.apoderado_nombres = editData.apoderado_nombres;
      }
      if (editData.apoderado_apellidos) {
        payload.apoderado_apellidos = editData.apoderado_apellidos;
      }
      if (editData.apoderado_celular !== undefined && editData.apoderado_celular !== (detail?.apoderado?.celular_1 ?? "")) {
        payload.apoderado_celular = editData.apoderado_celular || undefined;
      }
      if (editData.apoderado_email !== undefined && editData.apoderado_email !== (detail?.apoderado?.email ?? "")) {
        payload.apoderado_email = editData.apoderado_email || undefined;
      }
      if (editData.apoderado_fecha_nacimiento !== undefined && editData.apoderado_fecha_nacimiento !== (detail?.apoderado?.fecha_nacimiento ?? "")) {
        payload.apoderado_fecha_nacimiento = editData.apoderado_fecha_nacimiento || undefined;
      }
      if (editData.apoderado_direccion !== undefined && editData.apoderado_direccion !== (detail?.apoderado?.direccion ?? "")) {
        payload.apoderado_direccion = editData.apoderado_direccion || undefined;
      }

      const res = await api.patch<ApiResponse<SolicitudDetailDTO>>(`/solicitudes/${id}`, payload);
      setDetail(res.data);
      setEditing(false);
    } catch (err: unknown) {
      handleActionError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTipoLugar = async (tipo_atencion: string, lugar_atencion: string) => {
    if (!id) return;
    setError(null);
    try {
      const payload: EditSolicitudRequest = {};
      if (tipo_atencion !== (detail?.tipo_atencion ?? "")) {
        payload.tipo_atencion = tipo_atencion || undefined;
      }
      if (lugar_atencion !== (detail?.lugar_atencion ?? "")) {
        payload.lugar_atencion = lugar_atencion || undefined;
      }
      if (Object.keys(payload).length > 0) {
        const res = await api.patch<ApiResponse<SolicitudDetailDTO>>(`/solicitudes/${id}`, payload);
        setDetail(res.data);
      }
    } catch (err: unknown) {
      handleActionError(err);
    }
  };

  // ── Workflow action handler ──
  const handleActionError = (err: unknown) => {
  const e = err as { status?: number; detail?: string; code?: string };

  if (e.status === 403) {
    setError(t.solicitudDetalle.unauthorized);
  } else if (e.status === 409) {
    setError(t.solicitudDetalle.requestChanged);
    fetchDetail();
  } else if (e.status === 422) {
    setError(e.detail ?? t.solicitudDetalle.invalidData);
  } else if (e.status === 504) {
    setError(e.detail ?? t.solicitudDetalle.uploadTimeout);
  } else if (e.status === 502) {
    setError(e.detail ?? t.solicitudDetalle.storageError);
  } else {
    setError(e.detail ?? t.solicitudDetalle.actionError);
  }
};


  const executeAction = async (endpoint: string, payload: unknown) => {
    if (!id) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await api.post<ApiResponse<SolicitudDetailDTO>>(
        `/solicitudes/${id}/${endpoint}`,
        payload
      );
      setDetail(res.data);
      setActiveModal(null);
      resetActionForms();
    } catch (err: unknown) {
      handleActionError(err);
    } finally {
      setActionLoading(false);
    }
  };

  const resetActionForms = () => {
    setPersonaId("");
    setPagoCanal("YAPE");
    setPagoFecha(new Date().toISOString().slice(0, 10));
    setPagoMonto("");
    setPagoMoneda("PEN");
    setPagoRef("");
    setPagoComentario("");
    setActionComentario("");
  };

  const fetchEmpleados = async (rol: string) => {
    try {
      const res = await api.get<{ ok: boolean; data: { persona_id: number; nombre: string }[] }>(
        `/empleados?rol=${rol}`
      );
      return res.data;
    } catch {
      return [];
    }
  };

  const openModal = async (modal: ActionModal) => {
    resetActionForms();
    setActiveModal(modal);
    if (modal === "asignar_gestor" || modal === "cambiar_gestor") {
      const list = await fetchEmpleados("GESTOR");
      setGestores(list);
    } else if (modal === "asignar_medico" || modal === "cambiar_medico") {
      const list = await fetchEmpleados("MEDICO");
      setMedicos(list);
    }
  };

  const can = (action: string): boolean => {
    return detail?.acciones_permitidas.includes(action) ?? false;
  };

  // ── Save estado_certificado via PATCH ──
  const handleSaveEstadoCertificado = async (value: string) => {
    if (!id) return;
    setError(null);
    try {
      const res = await api.patch<ApiResponse<SolicitudDetailDTO>>(`/solicitudes/${id}`, {
        estado_certificado: value,
      });
      setDetail(res.data);
    } catch (err: unknown) {
      handleActionError(err);
    }
  };

  // ── File upload/delete (M4) ──
  const handleUploadFile = async () => {
    if (!id || !uploadFile) return;
    setUploading(true);
    setUploadError(null); // solo upload
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("tipo_archivo", uploadTipo);
      await api.upload<{ ok: boolean }>(`/solicitudes/${id}/archivos`, formData);
      setUploadFile(null);
      setUploadTipo("DOCUMENTO");
      fetchDetail();
    } catch (err: unknown) {
      const e = err as { status?: number; detail?: string; code?: string };
      setUploadError(e.detail ?? t.solicitudDetalle.uploadFailed);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (archivoId: number) => {
    if (!confirm(t.solicitudDetalle.deleteFileConfirm)) return;
    setError(null);
    try {
      await api.delete<{ ok: boolean }>(`/archivos/${archivoId}`);
      fetchDetail();
    } catch (err: unknown) {
      handleActionError(err);
    }
  };

  const handleDownloadFile = (archivoId: number, nombre: string | null) => {
    const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
    const link = document.createElement("a");
    link.href = `${apiUrl}/archivos/${archivoId}`;
    link.download = nombre ?? "archivo";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Eliminar solicitud (admin) ──
  const [deleting, setDeleting] = useState(false);
  const handleDeleteSolicitud = async () => {
    if (!id) return;
    if (!confirm(t.solicitudDetalle.deleteConfirm)) return;
    setDeleting(true);
    setError(null);
    try {
      await api.delete<{ ok: boolean }>(`/solicitudes/${id}`);
      navigate("/app/solicitudes");
    } catch (err: unknown) {
      handleActionError(err);
    } finally {
      setDeleting(false);
    }
  };

  // ── Early returns ──

  if (loading) {
    return <p style={{ color: "#666" }}>{t.solicitudDetalle.loading}</p>;
  }

  if (error && !detail) {
    return (
      <div>
        <div style={{ padding: "0.75rem", background: "#f8d7da", color: "#721c24", borderRadius: 4, marginBottom: "1rem" }}>
          {error}
        </div>
        <button onClick={() => navigate("/app/solicitudes")} style={{ cursor: "pointer" }}>
          {t.solicitudDetalle.backToList}
        </button>
      </div>
    );
  }

if (!detail) {
  return (
    <div>
      <div
        style={{
          padding: "0.75rem",
          background: "#fff3cd",
          color: "#856404",
          borderRadius: 4,
          marginBottom: "1rem",
        }}
      >
        {t.solicitudDetalle.loadError}
        {error ? ` Detalle: ${error}` : ""}
      </div>

      <button onClick={() => fetchDetail()} style={{ cursor: "pointer", marginRight: "0.5rem" }}>
        {t.solicitudDetalle.retry}
      </button>

      <button onClick={() => navigate("/app/solicitudes")} style={{ cursor: "pointer" }}>
        {t.solicitudDetalle.backToList}
      </button>
    </div>
  );
}

  const estado = detail.estado_operativo as EstadoOperativo;

  // ── Render ──
  return (
    <div
    style={{
      width: "100%"
    }}
  >

      {/* ─── Header compacto ─── */}
      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => navigate("/app/solicitudes")}
          style={{ background: "none", border: "none", color: PRIMARY, cursor: "pointer", padding: 0, marginBottom: "0.5rem", fontSize: "0.9rem" }}
        >
          &larr; {t.solicitudDetalle.backToList}
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <h2 style={{ margin: 0, color: PRIMARY }}>
            {detail.codigo ?? `Solicitud #${detail.solicitud_id}`}
          </h2>
          <span style={{
            display: "inline-block",
            padding: "0.25rem 0.6rem",
            borderRadius: 4,
            color: "#fff",
            background: estadoColor[estado] ?? "#6c757d",
            fontWeight: 700,
            fontSize: "0.85rem",
          }}>
            {estado.replace(/_/g, " ")}
          </span>
          <span style={{ fontSize: "0.85rem", color: "#555" }}>
            {detail.cliente.nombre}
            {detail.cliente.doc ? ` (${detail.cliente.doc})` : ""}
          </span>
          {detail.promotor && (
            <span style={{ fontSize: "0.85rem", color: "#888" }}>
              | Promotor: {detail.promotor.nombre}
            </span>
          )}
          <span style={{ fontSize: "0.82rem", color: "#999", marginLeft: "auto" }}>
            {new Date(detail.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* ─── Workflow Stepper ─── */}
      <WorkflowStepper estadoActual={estado} />

      {/* ─── Error / Cancelation alerts ─── */}
      {error && (
        <div style={{ padding: "0.75rem", background: "#f8d7da", color: "#721c24", borderRadius: 4, marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      {detail.estado_operativo === "CANCELADO" && detail.motivo_cancelacion && (
        <div style={{
          padding: "0.75rem 1rem",
          background: "#fff3cd",
          color: "#856404",
          border: "1px solid #ffc107",
          borderRadius: 4,
          marginBottom: "1rem",
        }}>
          <strong>{t.solicitudDetalle.cancelledDate.replace(":", "")}</strong> {detail.motivo_cancelacion}
        </div>
      )}

      {/* ─── Cancelar / Eliminar solicitud (botones sueltos) ─── */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
        {can("CANCELAR") && activeModal !== "cancelar" && (
          <button onClick={() => openModal("cancelar")} style={actionBtnStyle("#b81414")}>
            {t.solicitudDetalle.cancelRequest}
          </button>
        )}
        {isAdmin && (
          <button onClick={handleDeleteSolicitud} disabled={deleting}
            style={actionBtnStyle(deleting ? "#6c757d" : "#dc3545")}>
            {deleting ? t.solicitudDetalle.deleting : t.solicitudDetalle.deleteRequest}
          </button>
        )}
      </div>

      {/* ─── Cancelar form (aparece debajo del boton) ─── */}
      {activeModal === "cancelar" && (
        <div style={{
          border: "1px solid #dee2e6",
          borderRadius: 8,
          padding: "1rem 1.25rem",
          marginBottom: "1rem",
          background: "#f8f9fa",
        }}>
          <h3 style={{ margin: "0 0 0.75rem", color: "#6c757d" }}>{t.solicitudDetalle.cancelRequest}</h3>
          <p style={{ color: "#6c757d", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
            {t.solicitudDetalle.cancelWarning}
          </p>
          <div style={{ marginBottom: "0.75rem" }}>
            <label style={labelStyle}>{t.solicitudDetalle.cancelReason}</label>
            <input value={actionComentario} onChange={(e) => setActionComentario(e.target.value)}
              placeholder={t.solicitudDetalle.cancelPlaceholder} style={{ ...inputStyle, maxWidth: 400 }} />
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button disabled={actionLoading}
              onClick={() => executeAction("cancelar", { comentario: actionComentario || undefined })}
              style={actionBtnStyle(actionLoading ? "#6c757d" : "#dc3545")}>
              {actionLoading ? t.common.processing : t.solicitudDetalle.confirmCancel}
            </button>
            <button onClick={() => setActiveModal(null)} style={cancelBtnStyle}>{t.common.cancel}</button>
          </div>
        </div>
      )}

      {/* ─── Datos del cliente + promotor + info solicitud ─── */}
      <div style={{
      border: "1px solid #d1c4e9",
      borderRadius: 8,
      padding: "1rem 1.25rem",
      marginBottom: "1rem",
      background: "#f3eef8",
      width: "100%",
      boxSizing: "border-box",
      overflowX: "auto",
      WebkitOverflowScrolling: "touch",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "0.75rem",
        gap: "0.5rem",
      }}
    >
      <h3 style={{ margin: 0, color: PRIMARY }}>{t.solicitudDetalle.clientData}</h3>

      {can("EDITAR_DATOS") && !editing ? (
        <button onClick={startEdit} style={actionBtnStyle("#6c757d")}>
          {t.solicitudDetalle.editData}
        </button>
      ) : !editing ? (
        <span style={{ fontSize: "0.78rem", color: "#6c757d", fontStyle: "italic" }}>
          {detail.estado_operativo === "CANCELADO" || detail.estado_operativo === "CERRADO"
            ? t.solicitudDetalle.requestCompleted
            : ""}
        </span>
      ) : null}
    </div>

    {/* CLIENTE (max 3 columnas) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "0.5rem",
        }}
      >
      <div>
        <span style={labelStyle}>{t.solicitudDetalle.docType} </span>
        <span style={valueStyle}>{detail.cliente.tipo_documento ?? "-"}</span>
      </div>
      <div>
        <span style={labelStyle}>{t.solicitudDetalle.docNumber} </span>
        <span style={valueStyle}>{detail.cliente.numero_documento ?? "-"}</span>
      </div>
      <div>
        <span style={labelStyle}>{t.solicitudDetalle.fullName} </span>
        <span style={valueStyle}>{detail.cliente.nombre}</span>
      </div>

      <div>
        <span style={labelStyle}>{t.solicitudDetalle.phone} </span>
        <span style={valueStyle}>{detail.cliente.celular ?? "-"}</span>
      </div>
      <div>
        <span style={labelStyle}>{t.solicitudDetalle.email} </span>
        <span style={valueStyle}>{detail.cliente.email ?? "-"}</span>
      </div>
      <div>
        <span style={labelStyle}>{t.solicitudDetalle.birthDate} </span>
        <span style={valueStyle}>{detail.cliente.fecha_nacimiento ?? "-"}</span>
      </div>

      <div style={{ gridColumn: "1 / -1" }}>
        <span style={labelStyle}>{t.solicitudDetalle.address} </span>
        <span style={valueStyle}>{detail.cliente.direccion ?? "-"}</span>
      </div>
    </div>

    {/* APODERADO (max 3 columnas) */}
    {detail.apoderado && (
      <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid #d1c4e9" }}>

        <h3 style={{ margin: 0, color: PRIMARY }}>{t.solicitudDetalle.representativeData}</h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "0.5rem",
            marginTop: "0.25rem",
            marginBottom: "0.25rem",

          }}
        >
          <div>
            <span style={labelStyle}>{t.solicitudDetalle.docType} </span>
            <span style={valueStyle}>
              {detail.apoderado.tipo_documento}
            </span>
          </div>
          <div>
            <span style={labelStyle}>{t.solicitudDetalle.docNumber} </span>
            <span style={valueStyle}>
              {detail.apoderado.numero_documento}
            </span>
          </div>
          <div>
            <span style={labelStyle}>{t.solicitudDetalle.fullName} </span>
            <span style={valueStyle}>
              {detail.apoderado.nombres} {detail.apoderado.apellidos}
            </span>
          </div>
          <div>
            <span style={labelStyle}>{t.solicitudDetalle.phone} </span>
            <span style={valueStyle}>{detail.apoderado.celular_1 ?? "-"}</span>
          </div>

          <div>
            <span style={labelStyle}>{t.solicitudDetalle.email} </span>
            <span style={valueStyle}>{detail.apoderado.email ?? "-"}</span>
          </div>
          <div>
            <span style={labelStyle}>{t.solicitudDetalle.birthDate} </span>
            <span style={valueStyle}>{detail.apoderado.fecha_nacimiento ?? "-"}</span>
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <span style={labelStyle}>{t.solicitudDetalle.address} </span>
            <span style={valueStyle}>{detail.apoderado.direccion ?? "-"}</span>
          </div>
        </div>
      </div>
    )}

    {/* PROMOTOR (ya estaba en 3 columnas, lo dejamos igual) */}
    {detail.promotor && (
      <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid #d1c4e9" }}>
        <h3 style={{ margin: 0, color: PRIMARY }}>{t.solicitudDetalle.promoterData}</h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "0.5rem",
            marginTop: "0.25rem",
            marginBottom: "0.25rem",

          }}
        >
          <div>
            <span style={labelStyle}>Tipo: </span>
            <span style={valueStyle}>{detail.promotor.tipo_promotor}</span>
          </div>
          <div>
            <span style={labelStyle}>{t.solicitudDetalle.fullName} </span>
            <span style={valueStyle}>{detail.promotor.nombre}</span>
          </div>
          <div>
            <span style={labelStyle}>RUC: </span>
            <span style={valueStyle}>{detail.promotor.ruc ?? "-"}</span>
          </div>

          <div>
            <span style={labelStyle}>{t.solicitudDetalle.email} </span>
            <span style={valueStyle}>{detail.promotor.email ?? "-"}</span>
          </div>
          <div>
            <span style={labelStyle}>{t.solicitudDetalle.phone} </span>
            <span style={valueStyle}>{detail.promotor.celular ?? "-"}</span>
          </div>
          <div>
            <span style={labelStyle}>Fuente: </span>
            <span style={valueStyle}>{detail.promotor.fuente_promotor ?? "-"}</span>
          </div>
        </div>
      </div>
    )}

    {/* FOOTER FECHAS/COMENTARIOS (max 3 columnas) */}
    <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid #d1c4e9" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "0.5rem" }}>
        <div>
          <span style={labelStyle}>{t.solicitudDetalle.created} </span>
          <span style={valueStyle}>{new Date(detail.created_at).toLocaleString()}</span>
        </div>

        {detail.fecha_cierre && (
          <div>
            <span style={labelStyle}>{t.solicitudDetalle.closedDate} </span>
            <span style={valueStyle}>{new Date(detail.fecha_cierre).toLocaleString()}</span>
          </div>
        )}

        {detail.fecha_cancelacion && (
          <div>
            <span style={labelStyle}>{t.solicitudDetalle.cancelledDate} </span>
            <span style={valueStyle}>{new Date(detail.fecha_cancelacion).toLocaleString()}</span>
          </div>
        )}
      </div>

      {detail.comentario && (
        <div style={{ marginTop: "0.5rem" }}>
          <span style={labelStyle}>{t.solicitudDetalle.comment} </span>
          <span style={valueStyle}>{detail.comentario}</span>
        </div>
      )}

      {detail.comentario_admin && (
        <div style={{ marginTop: "0.5rem" }}>
          <span style={labelStyle}>{t.solicitudDetalle.adminComment} </span>
          <span style={valueStyle}>{detail.comentario_admin}</span>
        </div>
      )}
    </div>
  </div>

      {/* ─── Edit form (inline, solicitud-level fields) ─── */}
      {editing && (
        <div style={{
          ...neutralSectionStyle,
          background: "#f8f9fa",
        }}>
          <h3 style={{ margin: "0 0 0.75rem", color: PRIMARY }}>{t.solicitudDetalle.editData}</h3>
          <p style={{ fontSize: "0.82rem", color: "#6c757d", margin: "0 0 0.75rem" }}>
            {t.solicitudDetalle.editHint}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div>
              <label style={labelStyle}>{t.solicitudDetalle.clientFirstName}</label>
              <input value={editData.cliente_nombres ?? ""} onChange={(e) => setEditData({ ...editData, cliente_nombres: e.target.value })}
                placeholder={detail.cliente.nombre ?? "Nombres"} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t.solicitudDetalle.clientLastName}</label>
              <input value={editData.cliente_apellidos ?? ""} onChange={(e) => setEditData({ ...editData, cliente_apellidos: e.target.value })}
                placeholder="Apellidos" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t.solicitudDetalle.clientPhone}</label>
              <input value={editData.cliente_celular ?? ""} onChange={(e) => setEditData({ ...editData, cliente_celular: e.target.value })}
                placeholder="Celular" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t.solicitudDetalle.clientEmail}</label>
              <input value={editData.cliente_email ?? ""} onChange={(e) => setEditData({ ...editData, cliente_email: e.target.value })}
                placeholder="correo@ejemplo.com" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t.solicitudDetalle.clientBirthDate}</label>
              <input type="date" placeholder="dd-mm-aaaa" value={editData.cliente_fecha_nacimiento ?? ""} onChange={(e) => setEditData({ ...editData, cliente_fecha_nacimiento: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t.solicitudDetalle.clientAddress}</label>
              <input value={editData.cliente_direccion ?? ""} onChange={(e) => setEditData({ ...editData, cliente_direccion: e.target.value })}
                placeholder="Direccion" style={inputStyle} />
            </div>
          </div>

          {/* Apoderado fields */}
          {detail.apoderado && (
            <>
              <h4 style={{ margin: "0.75rem 0 0.5rem", color: PRIMARY, fontSize: "0.9rem" }}>{t.solicitudDetalle.representative}</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={labelStyle}>{t.solicitudDetalle.repFirstName}</label>
                  <input value={editData.apoderado_nombres || ""} onChange={(e) => setEditData({ ...editData, apoderado_nombres: e.target.value })}
                    placeholder={detail.apoderado?.nombres || "Nombres"} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{t.solicitudDetalle.repLastName}</label>
                  <input value={editData.apoderado_apellidos || ""} onChange={(e) => setEditData({ ...editData, apoderado_apellidos: e.target.value })}
                    placeholder={detail.apoderado?.apellidos ||"Apellidos"} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{t.solicitudDetalle.repPhone}</label>
                  <input value={editData.apoderado_celular ?? ""} onChange={(e) => setEditData({ ...editData, apoderado_celular: e.target.value })}
                    placeholder="Celular" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{t.solicitudDetalle.repEmail}</label>
                  <input value={editData.apoderado_email ?? ""} onChange={(e) => setEditData({ ...editData, apoderado_email: e.target.value })}
                    placeholder="correo@ejemplo.com" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{t.solicitudDetalle.repBirthDate}</label>
                  <input type="date" placeholder="dd-mm-aaaa" value={editData.apoderado_fecha_nacimiento ?? ""} onChange={(e) => setEditData({ ...editData, apoderado_fecha_nacimiento: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{t.solicitudDetalle.repAddress}</label>
                  <input value={editData.apoderado_direccion ?? ""} onChange={(e) => setEditData({ ...editData, apoderado_direccion: e.target.value })}
                    placeholder="Direccion" style={inputStyle} />
                </div>
              </div>
            </>
          )}

          <div style={{ marginTop: "0.75rem" }}>
            <label style={labelStyle}>{t.solicitudDetalle.comment}</label>
            <textarea value={editData.comentario ?? ""} onChange={(e) => setEditData({ ...editData, comentario: e.target.value })}
              rows={3} style={{ ...inputStyle, resize: "vertical" }} />
          </div>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
            <button onClick={saveEdit} disabled={saving} style={actionBtnStyle(saving ? "#6c757d" : "#198754")}>
              {saving ? t.common.saving : t.common.save}
            </button>
            <button onClick={cancelEdit} style={cancelBtnStyle}>{t.common.cancel}</button>
          </div>
        </div>
      )}

      {/* ─── Block A: Gestion administrativa ─── */}
      <BlockGestion
        detail={detail}
        can={can}
        activeModal={activeModal}
        gestores={gestores}
        personaId={personaId}
        onPersonaIdChange={setPersonaId}
        actionLoading={actionLoading}
        onOpenModal={(m) => openModal(m)}
        onCloseModal={() => setActiveModal(null)}
        onExecuteAction={executeAction}
        onSaveTipoLugar={handleSaveTipoLugar}
      />

      {/* ─── Block B: Pago ─── */}
      <BlockPago
        detail={detail}
        can={can}
        activeModal={activeModal}
        onOpenModal={(m) => openModal(m)}
        onCloseModal={() => setActiveModal(null)}
        pagoCanal={pagoCanal} onPagoCanalChange={setPagoCanal}
        pagoFecha={pagoFecha} onPagoFechaChange={setPagoFecha}
        pagoMonto={pagoMonto} onPagoMontoChange={setPagoMonto}
        pagoMoneda={pagoMoneda} onPagoMonedaChange={setPagoMoneda}
        pagoRef={pagoRef} onPagoRefChange={setPagoRef}
        pagoComentario={pagoComentario} onPagoComentarioChange={setPagoComentario}
        actionLoading={actionLoading}
        onExecuteAction={executeAction}
      />

      {/* ─── Block C: Evaluacion medica ─── */}
      <BlockEvaluacion
        detail={detail}
        can={can}
        activeModal={activeModal}
        medicos={medicos}
        personaId={personaId}
        onPersonaIdChange={setPersonaId}
        actionComentario={actionComentario}
        onActionComentarioChange={setActionComentario}
        actionLoading={actionLoading}
        onOpenModal={(m) => openModal(m)}
        onCloseModal={() => setActiveModal(null)}
        onExecuteAction={executeAction}
        onSaveEstadoCertificado={handleSaveEstadoCertificado}
      />

      {/* ─── Archivos (siempre visible) ─── */}
      <div style={neutralSectionStyle}>
        <h3 style={{ margin: "0 0 0.75rem", color: PRIMARY }}>{t.solicitudDetalle.files}</h3>

        {/* Upload form */}
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap", marginBottom: "0.75rem" }}>
          <input
            type="file"
            onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
            style={{ fontSize: "0.85rem" }}
          />
          <select value={uploadTipo} onChange={(e) => setUploadTipo(e.target.value)}
            style={{ ...inputStyle, width: "auto" }}>
            <option value="DOCUMENTO">{t.solicitudDetalle.fileDocument}</option>
            <option value="EVIDENCIA_PAGO">{t.solicitudDetalle.filePaymentEvidence}</option>
            <option value="OTROS">{t.solicitudDetalle.fileOther}</option>
          </select>
          <button
            disabled={!uploadFile || uploading}
            onClick={handleUploadFile}
            style={actionBtnStyle(uploading || !uploadFile ? "#6c757d" : "#0d6efd")}
          >
            {uploading ? t.solicitudDetalle.uploading : t.solicitudDetalle.uploadFile}
          </button>
        </div>

        {uploadError && (
          <div
            style={{
              padding: "0.5rem 0.75rem",
              background: "#f8d7da",
              color: "#721c24",
              borderRadius: 4,
              marginBottom: "0.75rem",
              fontSize: "0.85rem"
            }}
          >
            {uploadError}
          </div>
        )}

        {/* File list */}
        {detail.archivos.length > 0 ? (
          <div style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>{t.solicitudDetalle.fileName}</th>
                <th style={thStyle}>{t.common.type}</th>
                <th style={thStyle}>{t.common.size}</th>
                <th style={thStyle}>{t.common.actions}</th>
              </tr>
            </thead>
            <tbody>
              {detail.archivos.map((a) => (
                <tr key={a.id} style={trStyle}>
                  <td style={tdStyle}>{a.nombre ?? "archivo"}</td>
                  <td style={tdStyle}>{a.tipo ?? "-"}</td>
                  <td style={tdStyle}>
                    {a.tamano_bytes != null
                      ? a.tamano_bytes > 1024 * 1024
                        ? `${(a.tamano_bytes / (1024 * 1024)).toFixed(1)} MB`
                        : `${(a.tamano_bytes / 1024).toFixed(1)} KB`
                      : "-"}
                  </td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => handleDownloadFile(a.archivo_id, a.nombre)}
                      style={{ ...actionBtnStyle("#0d6efd"), padding: "0.2rem 0.5rem", fontSize: "0.8rem", marginRight: "0.3rem" }}
                    >
                      {t.common.download}
                    </button>
                    <button
                      onClick={() => handleDeleteFile(a.archivo_id)}
                      style={{ ...actionBtnStyle("#dc3545"), padding: "0.2rem 0.5rem", fontSize: "0.8rem" }}
                    >
                      {t.common.delete}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        ) : (
          <p style={{ color: "#999", fontSize: "0.85rem", margin: 0 }}>{t.solicitudDetalle.noFiles}</p>
        )}
      </div>

      {/* ─── Historial de cambios (siempre visible) ─── */}
      <div style={neutralSectionStyle}>
        <h3 style={{ margin: "0 0 0.75rem", color: PRIMARY }}>{t.solicitudDetalle.changeHistory}</h3>
        {detail.historial.length > 0 ? (
            <div style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>{t.common.date}</th>
                <th style={thStyle}>{t.solicitudDetalle.field}</th>
                <th style={thStyle}>{t.solicitudDetalle.previous}</th>
                <th style={thStyle}>{t.solicitudDetalle.newValue}</th>
                <th style={thStyle}>{t.solicitudDetalle.user}</th>
                <th style={thStyle}>{t.solicitudDetalle.comment}</th>
              </tr>
            </thead>
            <tbody>
              {detail.historial.map((h) => (
                <tr key={h.historial_id} style={trStyle}>
                  <td style={{ ...tdStyle, color: "#666" }}>{new Date(h.cambiado_en).toLocaleString()}</td>
                  <td style={tdStyle}>{h.campo}</td>
                  <td style={tdStyle}>{h.valor_anterior ?? "-"}</td>
                  <td style={tdStyle}>{h.valor_nuevo ?? "-"}</td>
                  <td style={tdStyle}>{h.usuario_nombre ?? "-"}</td>
                  <td style={tdStyle}>{h.comentario ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        ) : (
          <p style={{ color: "#999", fontSize: "0.85rem", margin: 0 }}>{t.solicitudDetalle.noChanges}</p>
        )}
      </div>
    </div>
  );
}

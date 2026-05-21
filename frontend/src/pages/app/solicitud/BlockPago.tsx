import type { SolicitudDetailDTO } from "../../../types/solicitud";
import { getPagoState, getPagoBlockedText, isTerminal } from "./detailHelpers";
import {
  blockStyle, blockTitleStyle, statusDotStyle, labelStyle, valueStyle,
  inputStyle, actionBtnStyle, disabledBtnStyle, cancelBtnStyle, helperTextStyle,
  tableStyle, thStyle, tdStyle, trStyle, emptyTextStyle,
} from "./detailStyles";
import { useLang } from "../../../i18n/LanguageContext";

type ActionModal = string | null;

interface BlockPagoProps {
  detail: SolicitudDetailDTO;
  can: (action: string) => boolean;
  activeModal: ActionModal;
  onOpenModal: (modal: "registrar_pago") => void;
  onCloseModal: () => void;
  pagoCanal: string; onPagoCanalChange: (v: string) => void;
  pagoFecha: string; onPagoFechaChange: (v: string) => void;
  pagoMonto: string; onPagoMontoChange: (v: string) => void;
  pagoMoneda: string; onPagoMonedaChange: (v: string) => void;
  pagoRef: string; onPagoRefChange: (v: string) => void;
  pagoComentario: string; onPagoComentarioChange: (v: string) => void;
  actionLoading: boolean;
  onExecuteAction: (endpoint: string, payload: unknown) => void;
}

export default function BlockPago({
  detail, can, activeModal, onOpenModal, onCloseModal,
  pagoCanal, onPagoCanalChange, pagoFecha, onPagoFechaChange,
  pagoMonto, onPagoMontoChange, pagoMoneda, onPagoMonedaChange,
  pagoRef, onPagoRefChange, pagoComentario, onPagoComentarioChange,
  actionLoading, onExecuteAction,
}: BlockPagoProps) {
  const { t } = useLang();
  const state = getPagoState(detail);
  const blockedText = getPagoBlockedText(detail);
  const terminal = isTerminal(detail);

  return (
    <div style={blockStyle(state)}>
      <div style={blockTitleStyle}>
        <span style={statusDotStyle(state)} />
        {t.pago.title}
      </div>

      {/* Info row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem", marginBottom: "0.75rem" }}>
        <div>
          <span style={labelStyle}>{t.pago.paymentStatus} </span>
          <span style={valueStyle}>{detail.estado_pago}</span>
        </div>
        <div>
          <span style={labelStyle}>{t.pago.regularFee} </span>
          <span style={valueStyle}>
            {detail.tarifa_monto ? `${detail.tarifa_moneda} ${detail.tarifa_monto}` : "-"}
          </span>
        </div>
        <div>
          <span style={labelStyle}>{t.pago.registeredPayments} </span>
          <span style={valueStyle}>{detail.pagos.length}</span>
        </div>
      </div>

      {/* Pagos table (always visible) */}
      {detail.pagos.length > 0 ? (
        <div style={{ overflowX: "auto", marginBottom: "0.75rem" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>{t.pago.channel}</th>
                <th style={thStyle}>{t.pago.date}</th>
                <th style={thStyle}>{t.pago.amount}</th>
                <th style={thStyle}>{t.pago.reference}</th>
                <th style={thStyle}>{t.common.comment}</th>
                <th style={thStyle}>{t.pago.validated}</th>
              </tr>
            </thead>
            <tbody>
              {detail.pagos.map((p) => (
                <tr key={p.pago_id} style={trStyle}>
                  <td style={tdStyle}>{p.canal_pago ?? "-"}</td>
                  <td style={tdStyle}>{p.fecha_pago ?? "-"}</td>
                  <td style={tdStyle}>{p.moneda} {p.monto}</td>
                  <td style={tdStyle}>{p.referencia_transaccion ?? "-"}</td>
                  <td style={tdStyle}>{p.comentario ?? "-"}</td>
                  <td style={tdStyle}>{p.validated_at ? new Date(p.validated_at).toLocaleString() : t.pago.pending}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={emptyTextStyle}>{t.pago.noPayments}</p>
      )}

      {/* Action: Registrar pago */}
      {can("REGISTRAR_PAGO") ? (
        <button onClick={() => onOpenModal("registrar_pago")} style={actionBtnStyle("#198754")}>
          {t.pago.registerPayment}
        </button>
      ) : (
        <div>
          <button disabled style={disabledBtnStyle()}>{t.pago.registerPayment}</button>
          <div style={helperTextStyle}>
            {blockedText
              ?? (detail.estado_pago === "PAGADO" ? t.pago.alreadyPaid : terminal ? t.gestion.requestCompleted : t.gestion.notAvailable)}
          </div>
        </div>
      )}

      {/* Inline modal: Registrar pago */}
      {activeModal === "registrar_pago" && (
        <div style={{
          marginTop: "0.75rem", padding: "0.75rem",
          background: "rgba(255,255,255,0.7)", borderRadius: 6, border: "1px solid #a3cfbb",
        }}>
          <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.9rem" }}>{t.pago.registerPayment}</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div>
              <label style={labelStyle}>{t.pago.paymentChannel}</label>
              <select value={pagoCanal} onChange={(e) => onPagoCanalChange(e.target.value)} style={inputStyle}>
                <option value="YAPE">YAPE</option>
                <option value="PLIN">PLIN</option>
                <option value="TRANSFERENCIA">TRANSFERENCIA</option>
                <option value="EFECTIVO">EFECTIVO</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>{t.pago.paymentDate}</label>
              <input type="date" placeholder="dd-mm-aaaa" value={pagoFecha} onChange={(e) => onPagoFechaChange(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t.pago.paymentAmount}</label>
              <input type="number" step="0.01" value={pagoMonto} onChange={(e) => onPagoMontoChange(e.target.value)}
                placeholder="200.00" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t.pago.currency}</label>
              <select value={pagoMoneda} onChange={(e) => onPagoMonedaChange(e.target.value)} style={inputStyle}>
                <option value="PEN">PEN</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: "0.75rem" }}>
            <label style={labelStyle}>{t.pago.transactionRef}</label>
            <input value={pagoRef} onChange={(e) => onPagoRefChange(e.target.value)}
              placeholder={t.pago.refPlaceholder} style={{ ...inputStyle, maxWidth: 400 }} />
          </div>
          <div style={{ marginTop: "0.75rem" }}>
            <label style={labelStyle}>{t.common.comment}</label>
            <input value={pagoComentario} onChange={(e) => onPagoComentarioChange(e.target.value)}
              placeholder={t.pago.commentPlaceholder} style={{ ...inputStyle, maxWidth: 400 }} />
          </div>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
            <button disabled={actionLoading || !pagoMonto || !pagoFecha}
              onClick={() => onExecuteAction("registrar-pago", {
                canal_pago: pagoCanal,
                fecha_pago: pagoFecha,
                monto: parseFloat(pagoMonto),
                moneda: pagoMoneda,
                referencia_transaccion: pagoRef || undefined,
                comentario: pagoComentario || undefined,
              })}
              style={actionBtnStyle(actionLoading ? "#6c757d" : "#198754")}>
              {actionLoading ? t.common.processing : t.pago.registerPayment}
            </button>
            <button onClick={onCloseModal} style={cancelBtnStyle}>{t.common.cancel}</button>
          </div>
        </div>
      )}
    </div>
  );
}

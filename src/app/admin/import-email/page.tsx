"use client";

import { useState, useEffect, useCallback } from "react";
import { Mail, Download, CheckCircle, AlertCircle, Loader2, FileText, RefreshCw, Import } from "lucide-react";

interface Attachment {
  filename: string;
  attachmentId: string;
  size: number;
}

interface Email {
  id: string;
  subject: string;
  date: string;
  from: string;
  attachments: Attachment[];
}

export default function ImportEmailPage() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [emails, setEmails] = useState<Email[]>([]);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/gmail/emails");
      if (res.status === 401) {
        setConnected(false);
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setConnected(true);
        setEmails(data.emails || []);
      }
    } catch {
      setError("Erro ao buscar emails");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  const handleConnect = () => {
    window.location.href = "/api/gmail/auth";
  };

  const handleDownload = async (email: Email, att: Attachment) => {
    const key = `${email.id}_${att.attachmentId}`;
    setDownloading(key);
    setError(null);

    try {
      const res = await fetch("/api/gmail/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId: email.id,
          attachmentId: att.attachmentId,
          filename: att.filename,
          subject: email.subject,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setDownloaded((prev) => new Set(prev).add(key));
      } else {
        setError(data.error || "Erro ao importar arquivo");
      }
    } catch {
      setError("Erro ao importar arquivo");
    }

    setDownloading(null);
  };

  const handleImportAll = async (email: Email) => {
    for (const att of email.attachments) {
      await handleDownload(email, att);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const allDownloaded = (email: Email) =>
    email.attachments.every((att) => downloaded.has(`${email.id}_${att.attachmentId}`));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-black text-accent">IMPORTAR DO EMAIL</h1>
          <p className="text-text-muted text-sm mt-1">Busca Install Packages do email araujocompanyllc@gmail.com</p>
        </div>
        {connected && (
          <button
            onClick={fetchEmails}
            className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-text-secondary hover:text-text hover:border-primary/30 transition"
          >
            <RefreshCw size={16} />
            Atualizar
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-error/10 border border-error/30 rounded-xl p-4 mb-6">
          <AlertCircle size={18} className="text-error" />
          <p className="text-error text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="text-primary animate-spin" />
        </div>
      ) : !connected ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
            <Mail size={40} className="text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2">Conectar Gmail</h2>
          <p className="text-text-muted text-sm text-center max-w-md mb-8">
            Conecte o email <span className="text-secondary font-semibold">araujocompanyllc@gmail.com</span> para
            importar automaticamente os Install Packages da USIG/Home Depot.
          </p>
          <button
            onClick={handleConnect}
            className="flex items-center gap-3 bg-gradient-to-r from-primary to-secondary text-white font-bold py-4 px-8 rounded-xl hover:scale-[1.02] transition-transform"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Conectar com Google
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2.5 h-2.5 bg-success rounded-full animate-pulse" />
            <span className="text-success text-sm font-semibold">Gmail conectado</span>
            <span className="text-text-muted text-sm">— araujocompanyllc@gmail.com</span>
          </div>

          {emails.length === 0 ? (
            <div className="text-center py-16 bg-surface border border-border rounded-2xl">
              <Mail size={48} className="text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">Nenhum Install Package encontrado</h3>
              <p className="text-text-muted text-sm">Nao encontramos emails da USIG com PDFs anexados.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {emails.map((email) => (
                <div key={email.id} className="bg-surface border border-border rounded-2xl p-5 card-glow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-text">{email.subject}</h3>
                      <p className="text-text-muted text-xs mt-1">
                        {email.from} • {formatDate(email.date)}
                      </p>
                    </div>

                    {/* Main Import Button */}
                    {email.attachments.length > 0 && !allDownloaded(email) ? (
                      <button
                        onClick={() => handleImportAll(email)}
                        disabled={downloading !== null}
                        className="flex items-center gap-2 bg-gradient-to-r from-accent to-legendary text-bg font-bold py-3 px-6 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-50 shrink-0"
                      >
                        {downloading ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Import size={18} />
                        )}
                        {downloading ? "Importando..." : "Importar"}
                      </button>
                    ) : allDownloaded(email) ? (
                      <div className="flex items-center gap-2 text-success font-bold py-3 px-6 bg-success/10 rounded-xl shrink-0">
                        <CheckCircle size={18} />
                        Importado
                      </div>
                    ) : (
                      <span className="text-text-muted text-xs py-3 px-4 bg-card rounded-xl shrink-0">
                        Sem PDF anexado
                      </span>
                    )}
                  </div>

                  {/* Attachment Details */}
                  {email.attachments.length > 0 && (
                    <div className="space-y-2 mt-4 pt-3 border-t border-border">
                      {email.attachments.map((att) => {
                        const key = `${email.id}_${att.attachmentId}`;
                        const isDownloaded = downloaded.has(key);
                        const isDownloading = downloading === key;

                        return (
                          <div key={att.attachmentId} className="flex items-center justify-between bg-card rounded-xl p-3">
                            <div className="flex items-center gap-3">
                              <FileText size={18} className={isDownloaded ? "text-success" : "text-error"} />
                              <div>
                                <p className="text-sm font-medium text-text">{att.filename}</p>
                                <p className="text-xs text-text-muted">{formatSize(att.size)}</p>
                              </div>
                            </div>

                            {isDownloaded ? (
                              <div className="flex items-center gap-1.5 text-success text-xs font-semibold">
                                <CheckCircle size={14} />
                                Salvo
                              </div>
                            ) : (
                              <button
                                onClick={() => handleDownload(email, att)}
                                disabled={isDownloading}
                                className="flex items-center gap-1.5 text-accent text-xs font-semibold hover:text-legendary transition disabled:opacity-50"
                              >
                                {isDownloading ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <Download size={14} />
                                )}
                                {isDownloading ? "Salvando..." : "Salvar"}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

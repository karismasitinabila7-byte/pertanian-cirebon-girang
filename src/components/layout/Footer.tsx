import React from "react";

export function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "var(--bg-surface)",
        borderTop: "1px solid var(--border-color)",
        marginTop: "4rem",
        padding: "2.5rem 0",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1.5rem",
        }}
      >
        <div>
          <div
            style={{
              fontWeight: 700,
              fontSize: "0.95rem",
              color: "var(--primary-900)",
            }}
          >
            Platform Pertanian Padi Desa Cirebon Girang
          </div>
          <div
            style={{
              fontSize: "0.8125rem",
              color: "var(--text-muted)",
              marginTop: "0.25rem",
            }}
          >
            Sistem Informasi Pertanian & Manajemen Budidaya Padi Berbasis Web
          </div>
        </div>

        <div
          style={{
            fontSize: "0.8125rem",
            color: "var(--text-subtle)",
            textAlign: "right",
          }}
        >
          <div>Pemerintah Desa Cirebon Girang & Kelompok Tani</div>
          <div style={{ marginTop: "0.25rem" }}>
            Tahap 1: Arsitektur Scalable & Database Schema Siap
          </div>
        </div>
      </div>
    </footer>
  );
}

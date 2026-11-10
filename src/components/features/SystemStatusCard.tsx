import React from "react";
import { SystemOverviewStats } from "@/types";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";

interface SystemStatusCardProps {
  stats: SystemOverviewStats;
}

export function SystemStatusCard({ stats }: SystemStatusCardProps) {
  const isConnected = stats.databaseStatus === "CONNECTED";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "1.25rem",
        marginBottom: "2rem",
      }}
    >
      {/* 1. Status Database */}
      <Card
        style={{
          borderLeft: `4px solid ${isConnected ? "var(--primary-500)" : "#ef4444"}`,
        }}
      >
        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase" }}>
          Koneksi Database
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginTop: "0.5rem",
            fontSize: "1.25rem",
            fontWeight: 800,
            color: "var(--primary-900)",
          }}
        >
          <div className="status-dot" />
          <span>{isConnected ? "Prisma SQLite Terhubung" : "Menghubungkan..."}</span>
        </div>
        <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
          Schema relasional lengkap & terintegrasi
        </div>
      </Card>

      {/* 2. Total Petani & Kelompok */}
      <Card>
        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase" }}>
          Digitalisasi Petani
        </div>
        <div
          style={{
            fontSize: "1.75rem",
            fontWeight: 800,
            color: "var(--primary-700)",
            marginTop: "0.25rem",
          }}
        >
          {stats.totalFarmers}{" "}
          <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-muted)" }}>
            Petani Terdata
          </span>
        </div>
        <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
          Dari {stats.totalFarmerGroups} Kelompok Tani Desa
        </div>
      </Card>

      {/* 3. Luas Lahan Terdata */}
      <Card>
        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase" }}>
          Total Luas Lahan Sawah
        </div>
        <div
          style={{
            fontSize: "1.75rem",
            fontWeight: 800,
            color: "var(--harvest-600)",
            marginTop: "0.25rem",
          }}
        >
          {stats.totalFarmlandAreaHectares}{" "}
          <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-muted)" }}>
            Hektar
          </span>
        </div>
        <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
          Koordinat & irigasi terpetakan
        </div>
      </Card>

      {/* 4. Siklus Tanam Aktif */}
      <Card>
        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase" }}>
          Siklus Musim Tanam
        </div>
        <div
          style={{
            fontSize: "1.75rem",
            fontWeight: 800,
            color: "var(--primary-800)",
            marginTop: "0.25rem",
          }}
        >
          {stats.activeCropCycles}{" "}
          <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-muted)" }}>
            Petak Aktif
          </span>
        </div>
        <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
          Musim Rendeng MT1 2026/2027
        </div>
      </Card>
    </div>
  );
}

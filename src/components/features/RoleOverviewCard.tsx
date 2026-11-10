import React from "react";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { UserRole } from "@/types";

interface RoleCardData {
  role: UserRole;
  badgeLabel: string;
  badgeVariant: "green" | "gold" | "blue" | "purple";
  title: string;
  icon: string;
  description: string;
  capabilities: string[];
}

const ROLES_DATA: RoleCardData[] = [
  {
    role: "ADMIN",
    badgeLabel: "Role Administrator",
    badgeVariant: "purple",
    title: "Admin Sistem",
    icon: "⚙️",
    description:
      "Pengelolaan menyeluruh platform, manajemen akun, master data varietas padi, hak akses, dan audit log sistem.",
    capabilities: [
      "Manajemen Akun & Autentikasi Pengguna",
      "Konfigurasi Wilayah & Blok Pertanian Desa",
      "Master Data Varietas Benih & Standar Pupuk",
      "Audit Trail & Keamanan Akses Platform",
    ],
  },
  {
    role: "VILLAGE_OFFICER",
    badgeLabel: "Role Perangkat Desa",
    badgeVariant: "blue",
    title: "Perangkat Desa",
    icon: "🏛️",
    description:
      "Monitoring komprehensif pertanian desa, verifikasi lahan kelompok tani, pemantauan masa tanam, dan publikasi pengumuman/irigasi.",
    capabilities: [
      "Dashboard Monitoring Pertanian Desa Cirebon Girang",
      "Rekapitulasi Luas Lahan & Produktivitas Sawah",
      "Penyebaran Jadwal Irigasi & Himbauan Hama",
      "Verifikasi Keanggotaan Kelompok Tani",
    ],
  },
  {
    role: "FARMER",
    badgeLabel: "Role Petani Anggota",
    badgeVariant: "green",
    title: "Petani Kelompok Tani",
    icon: "🌾",
    description:
      "Pencatatan petak lahan, jadwal musim tanam, jurnal harian aktivitas budidaya, serta konsultasi cerdas dengan AI Assistant.",
    capabilities: [
      "Digitalisasi Petak Sawah & Status Irigasi",
      "Pencatatan Aktivitas (Tanam, Pupuk, Semprot, Panen)",
      "Estimasi Tanggal & Hasil Panen Gabah",
      "Konsultasi Hama & Nutrisi via AI Assistant",
    ],
  },
];

export function RoleOverviewCards() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "1.5rem",
      }}
    >
      {ROLES_DATA.map((item) => (
        <Card
          key={item.role}
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-color)",
            backgroundColor: "var(--bg-surface)",
            padding: "1.5rem",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--bg-muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                }}
              >
                {item.icon}
              </div>
              <Badge variant={item.badgeVariant}>{item.badgeLabel}</Badge>
            </div>

            <h3
              style={{
                fontSize: "1.2rem",
                marginBottom: "0.5rem",
                color: "var(--primary-900)",
              }}
            >
              {item.title}
            </h3>

            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--text-muted)",
                lineHeight: "1.55",
                marginBottom: "1.25rem",
              }}
            >
              {item.description}
            </p>

            <div
              style={{
                borderTop: "1px solid var(--border-subtle)",
                paddingTop: "1rem",
              }}
            >
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--text-subtle)",
                  letterSpacing: "0.05em",
                  marginBottom: "0.625rem",
                }}
              >
                Cakupan Kemampuan Modul:
              </div>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.4rem",
                }}
              >
                {item.capabilities.map((cap, idx) => (
                  <li
                    key={idx}
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--text-main)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span style={{ color: "var(--primary-500)", fontWeight: 700 }}>✓</span>
                    <span>{cap}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

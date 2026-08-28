import React from 'react';

// === OUTLINE ICONS UNTUK SIDEBAR & HEADER ===
export const IconDashboard = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
  </svg>
);

export const IconKlaimBaru = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="12" y1="12" x2="12" y2="18" />
    <line x1="9" y1="15" x2="15" y2="15" />
  </svg>
);

export const IconRiwayatKlaim = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export const IconArtikelTersimpan = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

export const IconPengaturan = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

export const IconLogout = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export const IconNotifikasi = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

export const IconProfil = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

// === IKON KARTU STATISTIK ===
export const IconTotalKlaim = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

export const IconVerifikasi = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export const IconTinjauanCardReviewer = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.25 0H8.125L13 4.875V12.25C13 13.2165 12.2165 14 11.25 14H3.25C2.2835 14 1.5 13.2165 1.5 12.25V1.75C1.5 0.7835 2.2835 0 3.25 0Z" fill="currentColor" fillOpacity="0.1"/>
    <path d="M8.125 0V4.875H13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4.0625 7.4375H8.9375" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M4.0625 10.0625H7.3125" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

// === INI IKON YANG HILANG (DITAMBAHKAN) ===
export const IconTinjauan = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

// === IKON STATUS KLAIM ===
export const IconTinjauanStatus = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.65 7.35L7.35 6.65L5.5 4.8V2.5H4.5V5.2L6.65 7.35ZM5 10C4.30833 10 3.65833 9.86875 3.05 9.60625C2.44167 9.34375 1.9125 8.9875 1.4625 8.5375C1.0125 8.0875 0.65625 7.55833 0.39375 6.95C0.13125 6.34167 0 5.69167 0 5C0 4.30833 0.13125 3.65833 0.39375 3.05C0.65625 2.44167 1.0125 1.9125 1.4625 1.4625C1.9125 1.0125 2.44167 0.65625 3.05 0.39375C3.65833 0.13125 4.30833 0 5 0C5.69167 0 6.34167 0.13125 6.95 0.39375C7.55833 0.65625 8.0875 1.0125 8.5375 1.4625C8.9875 1.9125 9.34375 2.44167 9.60625 3.05C9.86875 3.65833 10 4.30833 10 5C10 5.69167 9.86875 6.34167 9.60625 6.95C9.34375 7.55833 8.9875 8.0875 8.5375 8.5375C8.0875 8.9875 7.55833 9.34375 6.95 9.60625C6.34167 9.86875 5.69167 10 5 10ZM5 9C6.10833 9 7.05208 8.61042 7.83125 7.83125C8.61042 7.05208 9 6.10833 9 5C9 3.89167 8.61042 2.94792 7.83125 2.16875C7.05208 1.38958 6.10833 1 5 1C3.89167 1 2.94792 1.38958 2.16875 2.16875C1.38958 2.94792 1 3.89167 1 5C1 6.10833 1.38958 7.05208 2.16875 7.83125C2.94792 8.61042 3.89167 9 5 9Z" fill="currentColor"/>
  </svg>
);

export const IconTervalidasiStatus = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.06667 14L3.8 11.8667L1.4 11.3333L1.63333 8.86667L0 7L1.63333 5.13333L1.4 2.66667L3.8 2.13333L5.06667 0L7.33333 0.966667L9.6 0L10.8667 2.13333L13.2667 2.66667L13.0333 5.13333L14.6667 7L13.0333 8.86667L13.2667 11.3333L10.8667 11.8667L9.6 14L7.33333 13.0333L5.06667 14ZM5.63333 12.3L7.33333 11.5667L9.06667 12.3L10 10.7L11.8333 10.2667L11.6667 8.4L12.9 7L11.6667 5.56667L11.8333 3.7L10 3.3L9.03333 1.7L7.33333 2.43333L5.6 1.7L4.66667 3.3L2.83333 3.7L3 5.56667L1.76667 7L3 8.4L2.83333 10.3L4.66667 10.7L5.63333 12.3ZM6.63333 9.36667L10.4 5.6L9.46667 4.63333L6.63333 7.46667L5.2 6.06667L4.26667 7L6.63333 9.36667Z" fill="currentColor"/>
  </svg>
);

export const IconKeliruStatus = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_195_580)">
      <path fillRule="evenodd" clipRule="evenodd" d="M16.5 9C16.5 13.1423 13.1423 16.5 9 16.5C4.85775 16.5 1.5 13.1423 1.5 9C1.5 4.85775 4.85775 1.5 9 1.5C13.1423 1.5 16.5 4.85775 16.5 9ZM9 15C10.5913 15 12.1174 14.3679 13.2426 13.2426C14.3679 12.1174 15 10.5913 15 9C15 7.4087 14.3679 5.88258 13.2426 4.75736C12.1174 3.63214 10.5913 3 9 3C7.4087 3 5.88258 3.63214 4.75736 4.75736C3.63214 5.88258 3 7.4087 3 9C3 10.5913 3.63214 12.1174 4.75736 13.2426C5.88258 14.3679 7.4087 15 9 15Z" fill="currentColor"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M6.21983 6.21983C6.36048 6.07923 6.55121 6.00024 6.75008 6.00024C6.94896 6.00024 7.13969 6.07923 7.28033 6.21983L11.7803 10.7198C11.852 10.789 11.9091 10.8718 11.9484 10.9633C11.9877 11.0548 12.0084 11.1532 12.0093 11.2528C12.0101 11.3524 11.9912 11.4511 11.9535 11.5433C11.9157 11.6355 11.86 11.7192 11.7896 11.7896C11.7192 11.86 11.6355 11.9157 11.5433 11.9535C11.4511 11.9912 11.3524 12.0101 11.2528 12.0093C11.1532 12.0084 11.0548 11.9877 10.9633 11.9484C10.8718 11.9091 10.789 11.852 10.7198 11.7803L6.21983 7.28033C6.07923 7.13969 6.00024 6.94896 6.00024 6.75008C6.00024 6.55121 6.07923 6.36048 6.21983 6.21983Z" fill="currentColor"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M11.7803 6.21983C11.9209 6.36048 11.9999 6.55121 11.9999 6.75008C11.9999 6.94896 11.9209 7.13969 11.7803 7.28033L7.28031 11.7803C7.13886 11.917 6.94941 11.9925 6.75276 11.9908C6.55611 11.9891 6.368 11.9103 6.22895 11.7712C6.08989 11.6321 6.01101 11.444 6.00931 11.2474C6.0076 11.0507 6.08319 10.8613 6.21981 10.7198L10.7198 6.21983C10.8605 6.07923 11.0512 6.00024 11.2501 6.00024C11.4489 6.00024 11.6397 6.07923 11.7803 6.21983Z" fill="currentColor"/>
    </g>
    <defs>
      <clipPath id="clip0_195_580">
        <rect width="18" height="18" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

// === IKON KHUSUS HALAMAN VERIFIKASI ===
export const IconPetir = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 20L5 13H0L9 0H11L10 8H16L6 20H4V20" fill="currentColor"/>
  </svg>
);

export const IconDokumenInfo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 16H12V14H4V16ZM4 12H12V10H4V12ZM2 20C1.45 20 0.979167 19.8042 0.5875 19.4125C0.195833 19.0208 0 18.55 0 18V2C0 1.45 0.195833 0.979167 0.5875 0.5875C0.979167 0.195833 1.45 0 2 0H10L16 6V18C16 18.55 15.8042 19.0208 15.4125 19.4125C15.0208 19.8042 14.55 20 14 20H2ZM9 7V2H2V18H14V7H9ZM2 2V7V2V7V18V2Z" fill="currentColor"/>
  </svg>
);

export const IconFormulir = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 19 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 20V16.925L15.525 11.425C15.675 11.275 15.8417 11.1667 16.025 11.1C16.2083 11.0333 16.3917 11 16.575 11C16.775 11 16.9667 11.0375 17.15 11.1125C17.3333 11.1875 17.5 11.3 17.65 11.45L18.575 12.375C18.7083 12.525 18.8125 12.6917 18.8875 12.875C18.9625 13.0583 19 13.2417 19 13.425C19 13.6083 18.9667 13.7958 18.9 13.9875C18.8333 14.1792 18.725 14.35 18.575 14.5L13.075 20H10ZM17.5 13.425L16.575 12.5L17.5 13.425ZM11.5 18.5H12.45L15.475 15.45L15.025 14.975L14.55 14.525L11.5 17.55V18.5ZM2 20C1.45 20 0.979167 19.8042 0.5875 19.4125C0.195833 19.0208 0 18.55 0 18V2C0 1.45 0.195833 0.979167 0.5875 0.5875C0.979167 0.195833 1.45 0 2 0H10L16 6V9H14V7H9V2H2V18H8V20H2ZM15.025 14.975L14.55 14.525L15.475 15.45L15.025 14.975Z" fill="currentColor"/>
  </svg>
);

export const IconCeklisBesar = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.4667 19.4667L20.8667 10.0667L19 8.2L11.4667 15.7333L7.66667 11.9333L5.8 13.8L11.4667 19.4667ZM13.3333 26.6667C11.4889 26.6667 9.75556 26.3167 8.13333 25.6167C6.51111 24.9167 5.1 23.9667 3.9 22.7667C2.7 21.5667 1.75 20.1556 1.05 18.5333C0.35 16.9111 0 15.1778 0 13.3333C0 11.4889 0.35 9.75556 1.05 8.13333C1.75 6.51111 2.7 5.1 3.9 3.9C5.1 2.7 6.51111 1.75 8.13333 1.05C9.75556 0.35 11.4889 0 13.3333 0C15.1778 0 16.9111 0.35 18.5333 1.05C20.1556 1.75 21.5667 2.7 22.7667 3.9C23.9667 5.1 24.9167 6.51111 25.6167 8.13333C26.3167 9.75556 26.6667 11.4889 26.6667 13.3333C26.6667 15.1778 26.3167 16.9111 25.6167 18.5333C24.9167 20.1556 23.9667 21.5667 22.7667 22.7667C21.5667 23.9667 20.1556 24.9167 18.5333 25.6167C16.9111 26.3167 15.1778 26.6667 13.3333 26.6667ZM13.3333 24C16.3111 24 18.8333 22.9667 20.9 20.9C22.9667 18.8333 24 16.3111 24 13.3333C24 10.3556 22.9667 7.83333 20.9 5.76667C18.8333 3.7 16.3111 2.66667 13.3333 2.66667C10.3556 2.66667 7.83333 3.7 5.76667 5.76667C3.7 7.83333 2.66667 10.3556 2.66667 13.3333C2.66667 16.3111 3.7 18.8333 5.76667 20.9C7.83333 22.9667 10.3556 24 13.3333 24Z" fill="currentColor"/>
  </svg>
);

export const IconInfoBesar = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 20H14.6667V12H12V20ZM13.3333 9.33333C13.7111 9.33333 14.0278 9.20555 14.2833 8.95C14.5389 8.69444 14.6667 8.37778 14.6667 8C14.6667 7.62222 14.5389 7.30556 14.2833 7.05C14.0278 6.79444 13.7111 6.66667 13.3333 6.66667C12.9556 6.66667 12.6389 6.79444 12.3833 7.05C12.1278 7.30556 12 7.62222 12 8C12 8.37778 12.1278 8.69444 12.3833 8.95C12.6389 9.20555 12.9556 9.33333 13.3333 9.33333ZM13.3333 26.6667C11.4889 26.6667 9.75556 26.3167 8.13333 25.6167C6.51111 24.9167 5.1 23.9667 3.9 22.7667C2.7 21.5667 1.75 20.1556 1.05 18.5333C0.35 16.9111 0 15.1778 0 13.3333C0 11.4889 0.35 9.75556 1.05 8.13333C1.75 6.51111 2.7 5.1 3.9 3.9C5.1 2.7 6.51111 1.75 8.13333 1.05C9.75556 0.35 11.4889 0 13.3333 0C15.1778 0 16.9111 0.35 18.5333 1.05C20.1556 1.75 21.5667 2.7 22.7667 3.9C23.9667 5.1 24.9167 6.51111 25.6167 8.13333C26.3167 9.75556 26.6667 11.4889 26.6667 13.3333C26.6667 15.1778 26.3167 16.9111 25.6167 18.5333C24.9167 20.1556 23.9667 21.5667 22.7667 22.7667C21.5667 23.9667 20.1556 24.9167 18.5333 25.6167C16.9111 26.3167 15.1778 26.6667 13.3333 26.6667ZM13.3333 24C16.3111 24 18.8333 22.9667 20.9 20.9C22.9667 18.8333 24 16.3111 24 13.3333C24 10.3556 22.9667 7.83333 20.9 5.76667C18.8333 3.7 16.3111 2.66667 13.3333 2.66667C10.3556 2.66667 7.83333 3.7 5.76667 5.76667C3.7 7.83333 2.66667 10.3556 2.66667 13.3333C2.66667 16.3111 3.7 18.8333 5.76667 20.9C7.83333 22.9667 10.3556 24 13.3333 24Z" fill="currentColor"/>
  </svg>
);

export const IconSilangBesar = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.53333 20L13.3333 15.2L18.1333 20L20 18.1333L15.2 13.3333L20 8.53333L18.1333 6.66667L13.3333 11.4667L8.53333 6.66667L6.66667 8.53333L11.4667 13.3333L6.66667 18.1333L8.53333 20ZM13.3333 26.6667C11.4889 26.6667 9.75556 26.3167 8.13333 25.6167C6.51111 24.9167 5.1 23.9667 3.9 22.7667C2.7 21.5667 1.75 20.1556 1.05 18.5333C0.35 16.9111 0 15.1778 0 13.3333C0 11.4889 0.35 9.75556 1.05 8.13333C1.75 6.51111 2.7 5.1 3.9 3.9C5.1 2.7 6.51111 1.75 8.13333 1.05C9.75556 0.35 11.4889 0 13.3333 0C15.1778 0 16.9111 0.35 18.5333 1.05C20.1556 1.75 21.5667 2.7 22.7667 3.9C23.9667 5.1 24.9167 6.51111 25.6167 8.13333C26.3167 9.75556 26.6667 11.4889 26.6667 13.3333C26.6667 15.1778 26.3167 16.9111 25.6167 18.5333C24.9167 20.1556 23.9667 21.5667 22.7667 22.7667C21.5667 23.9667 20.1556 24.9167 18.5333 25.6167C16.9111 26.3167 15.1778 26.6667 13.3333 26.6667ZM13.3333 24C16.3111 24 18.8333 22.9667 20.9 20.9C22.9667 18.8333 24 16.3111 24 13.3333C24 10.3556 22.9667 7.83333 20.9 5.76667C18.8333 3.7 16.3111 2.66667 13.3333 2.66667C10.3556 2.66667 7.83333 3.7 5.76667 5.76667C3.7 7.83333 2.66667 10.3556 2.66667 13.3333C2.66667 16.3111 3.7 18.8333 5.76667 20.9C7.83333 22.9667 10.3556 24 13.3333 24Z" fill="currentColor"/>
  </svg>
);

export const IconUpload = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.25 12V5.8875L3.3 7.8375L2.25 6.75L6 3L9.75 6.75L8.7 7.8375L6.75 5.8875V12H5.25ZM0 3.75V1.5C0 1.0875 0.146875 0.734375 0.440625 0.440625C0.734375 0.146875 1.0875 0 1.5 0H10.5C10.9125 0 11.2656 0.146875 11.5594 0.440625C11.8531 0.734375 12 1.0875 12 1.5V3.75H10.5V1.5H1.5V3.75H0Z" fill="currentColor"/>
  </svg>
);
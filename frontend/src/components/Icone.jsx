// Ícones de traço (24×24) usados na interface.
const CAMINHOS = {
  usuario: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6" />
    </>
  ),
  banco: (
    <>
      <path d="M3 10 12 4l9 6" />
      <path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8" />
      <path d="M3 20h18" />
    </>
  ),
  documento: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </>
  ),
  carro: (
    <>
      <path d="M5 17h-.5A1.5 1.5 0 0 1 3 15.5V13l2.2-5A2 2 0 0 1 7 6.8h10a2 2 0 0 1 1.8 1.2L21 13v2.5a1.5 1.5 0 0 1-1.5 1.5H19" />
      <path d="M9 17h6" />
      <path d="M3.5 12.5h17" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </>
  ),
  calendario: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  mais: <path d="M12 5v14M5 12h14" />,
  check: <path d="M5 12.5 10 17 19 7" />,
  sair: (
    <>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 16l-4-4 4-4M6 12h10" />
    </>
  ),
  lixeira: (
    <>
      <path d="M4 7h16M10 11v6M14 11v6" />
      <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
    </>
  ),
  seta: <path d="M5 12h14M13 6l6 6-6 6" />,
}

export default function Icone({ nome, tamanho = 18, espessura = 2 }) {
  return (
    <svg
      aria-hidden="true"
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={espessura}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {CAMINHOS[nome]}
    </svg>
  )
}

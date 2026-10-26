/**
 * Dados ilustrativos para as abas futuras (Perícias e Saúde).
 *
 * Só carregados quando `NEXT_PUBLIC_AFASTAMENTOS_FUTURO=true`.
 * A faixa "Visão futura: valores ilustrativos" avisa o usuário.
 */

export const PERICIAS_FIXTURE = {
  aguardando_agendamento: 12,
  agendadas_7_dias: 8,
  nao_compareceram: 3,
  a_vencer: 5,
  agenda: [
    { data: "28/10/2026", servidor: "Servidor A", status: "Agendado" },
    { data: "29/10/2026", servidor: "Servidor B", status: "Aguardando agendamento" },
    { data: "30/10/2026", servidor: "Servidor C", status: "Agendado" },
  ],
  por_status: [
    { status: "Aguardando agendamento", quantidade: 12 },
    { status: "Agendado", quantidade: 8 },
    { status: "Não compareceu", quantidade: 3 },
    { status: "Agendamento cancelado", quantidade: 1 },
    { status: "Aguardando exames complementares", quantidade: 2 },
    { status: "Finalizado", quantidade: 45 },
  ],
  a_vencer_lista: [
    { registro: "000001", nome: "Servidor X", dias: 18, tipo: "Licença saúde" },
    { registro: "000002", nome: "Servidor Y", dias: 22, tipo: "Licença saúde" },
  ],
};

export const SAUDE_FIXTURE = {
  cobertura_cid: 78.5,
  dias_por_capitulo: [
    { capitulo: "I · Doenças infecciosas", dias: 1240, episodios: 45 },
    { capitulo: "II · Neoplasias", dias: 890, episodios: 12 },
    { capitulo: "III · Sangue", dias: 320, episodios: 8 },
    { capitulo: "IV · Endócrinas", dias: 560, episodios: 22 },
    { capitulo: "V · Mentais", dias: 2100, episodios: 67 },
    { capitulo: "VI · Sistema nervoso", dias: 780, episodios: 19 },
    { capitulo: "VII · Olho", dias: 150, episodios: 5 },
    { capitulo: "VIII · Ouvido", dias: 90, episodios: 3 },
    { capitulo: "IX · Circulatório", dias: 1340, episodios: 38 },
    { capitulo: "X · Respiratório", dias: 670, episodios: 24 },
  ],
  heatmap: [
    { capitulo: "I · Doenças infecciosas", educacao: 12, saude: 8, administracao: 2, outros: 3 },
    { capitulo: "II · Neoplasias", educacao: 4, saude: 3, administracao: 1, outros: 1 },
    { capitulo: "V · Mentais", educacao: 18, saude: 12, administracao: 5, outros: 4 },
    { capitulo: "IX · Circulatório", educacao: 10, saude: 7, administracao: 3, outros: 2 },
  ],
};

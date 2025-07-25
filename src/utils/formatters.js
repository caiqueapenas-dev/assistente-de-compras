// src/utils/formatters.js

/**
 * Formata um número para uma string de moeda brasileira (R$ 1.234,56)
 * @param {number} value - O valor numérico a ser formatado.
 * @returns {string} - A string formatada como moeda.
 */
export const formatCurrency = (value) => {
  if (isNaN(value)) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

/**
 * Converte uma string de data no formato 'YYYY-MM-DD' para um objeto Date,
 * evitando problemas de fuso horário que podem alterar o dia.
 * @param {string} dateString - A data no formato 'YYYY-MM-DD'.
 * @returns {Date} - O objeto Date correspondente.
 */
export const parseDateString = (dateString) => {
  const [year, month, day] = dateString.split("-").map(Number);
  // Criar a data em UTC para evitar que o fuso horário a desloque para o dia anterior
  return new Date(Date.UTC(year, month - 1, day));
};

/**
 * Formata um objeto Date para o formato 'YYYY-MM-DD' para uso em inputs de data.
 * @param {Date} date - O objeto Date.
 * @returns {string} - A data formatada como 'YYYY-MM-DD'.
 */
export const formatDateForInput = (date) => {
  const d = new Date(date);
  // Ajusta para o fuso horário local para exibir a data correta no input
  d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

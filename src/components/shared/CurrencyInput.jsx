import { useState, useEffect } from "react";

const CurrencyInput = ({ value, onChange, ...props }) => {
  const [displayValue, setDisplayValue] = useState("");

  useEffect(() => {
    // Quando o valor externo (numérico) muda, atualiza o valor de exibição formatado
    if (value !== null && value !== undefined && !isNaN(value)) {
      const formatted = new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 2,
      }).format(value);
      setDisplayValue(formatted);
    } else {
      setDisplayValue("");
    }
  }, [value]);

  const handleChange = (e) => {
    let input = e.target.value;

    // Remove tudo que não for dígito
    input = input.replace(/\D/g, "");

    // Converte para número, dividindo por 100 para ter os centavos
    const numericValue = Number(input) / 100;

    // Formata para exibição
    const formatted = new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
    }).format(numericValue);

    setDisplayValue(formatted);

    // Chama a função onChange do pai com o valor numérico
    if (onChange) {
      onChange(numericValue);
    }
  };

  return (
    <input
      type="text"
      value={displayValue}
      onChange={handleChange}
      inputMode="decimal"
      placeholder="0,00"
      {...props}
    />
  );
};

export default CurrencyInput;

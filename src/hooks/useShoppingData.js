import { useState, useEffect, useCallback } from "react";
import DATABASE from "../database.json";

export const useShoppingData = () => {
  const [data, setData] = useState(() => {
    try {
      const localData = localStorage.getItem("marketHelperData");
      return localData ? JSON.parse(localData) : DATABASE;
    } catch (error) {
      console.error("Erro ao carregar dados do localStorage", error);
      return DATABASE;
    }
  });

  const [toast, setToast] = useState({ isVisible: false, message: "" });

  // Salva os dados no localStorage sempre que 'data' mudar
  useEffect(() => {
    try {
      localStorage.setItem("marketHelperData", JSON.stringify(data));
    } catch (error) {
      console.error("Erro ao salvar dados no localStorage", error);
    }
  }, [data]);

  // Efeito para esconder o Toast Notification
  useEffect(() => {
    if (toast.isVisible) {
      const timer = setTimeout(() => {
        setToast({ isVisible: false, message: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = useCallback((message) => {
    setToast({ isVisible: true, message });
  }, []);

  const handleDataChange = (newData, successMessage) => {
    setData(newData);
    if (successMessage) {
      showToast(successMessage);
    }
  };

  const handleExport = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `backup_compras_${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
    showToast("Backup exportado com sucesso!");
  };

  const handleImport = (event) => {
    const fileReader = new FileReader();
    fileReader.readAsText(event.target.files[0], "UTF-8");
    fileReader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (
          importedData.products &&
          importedData.stores &&
          importedData.prices &&
          importedData.purchases &&
          importedData.categories
        ) {
          handleDataChange(importedData, "Dados importados com sucesso!");
        } else {
          alert(
            "Arquivo de backup inválido. A estrutura dos dados está incorreta."
          );
        }
      } catch (error) {
        alert("Erro ao ler o arquivo. Verifique se é um JSON válido.");
        console.error("Erro ao importar JSON:", error);
      }
    };
    event.target.value = null; // Limpar o input para permitir re-importação do mesmo arquivo
  };

  // Calcula a sugestão de quantidade para um produto
  const calculateSuggestion = useCallback(
    (productId) => {
      const relevantPurchases = data.purchases
        .flatMap((p) => p.items)
        .filter((item) => item.productId === productId && item.quantity > 0);

      if (relevantPurchases.length < 2) return 1;

      const last5Purchases = relevantPurchases.slice(-5);
      const totalQuantity = last5Purchases.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      const average = totalQuantity / last5Purchases.length;

      return Math.max(1, Math.round(average));
    },
    [data.purchases]
  );

  return {
    data,
    toast,
    handleDataChange,
    handleExport,
    handleImport,
    showToast,
    calculateSuggestion,
  };
};

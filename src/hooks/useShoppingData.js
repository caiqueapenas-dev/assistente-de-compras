import { useState, useEffect } from "react";
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

  // Autosave a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        localStorage.setItem("marketHelperData", JSON.stringify(data));
      } catch (error) {
        console.error("Erro ao salvar dados no localStorage", error);
      }
    }, 30000);
    return () => clearInterval(interval);
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

  const showToast = (message) => {
    setToast({ isVisible: true, message });
  };

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
          importedData.purchases
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

  return {
    data,
    toast,
    handleDataChange,
    handleExport,
    handleImport,
  };
};

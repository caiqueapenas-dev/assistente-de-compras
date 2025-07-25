import { useState } from "react";

const AddStoreForm = ({ allData, onClose, onDataChange }) => {
  const [storeName, setStoreName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!storeName.trim()) {
      alert("Por favor, insira um nome para o mercado.");
      return;
    }

    const newStore = {
      id: `s${Date.now()}`,
      name: storeName.trim(),
    };

    const newData = {
      ...allData,
      stores: [...allData.stores, newStore],
    };

    onDataChange(newData, "Novo mercado adicionado com sucesso!");
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-semibold">Adicionar Novo Mercado</h2>
      </div>
      <div className="p-6">
        <div>
          <label className="block text-sm font-medium mb-1">
            Nome do Mercado
          </label>
          <input
            type="text"
            name="storeName"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2"
            placeholder="Ex: Supermercado Preço Bom"
            required
          />
        </div>
      </div>
      <div className="bg-gray-50 dark:bg-gray-900/50 p-4 flex justify-end gap-3 rounded-b-lg border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          Salvar Mercado
        </button>
      </div>
    </form>
  );
};

export default AddStoreForm;

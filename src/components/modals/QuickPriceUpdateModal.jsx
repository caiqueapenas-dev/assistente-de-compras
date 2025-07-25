import { useState } from "react";

const QuickPriceUpdateModal = ({
  product,
  storeId,
  allData,
  onClose,
  onDataChange,
}) => {
  const [price, setPrice] = useState("");
  const storeName = allData.stores.find((s) => s.id === storeId)?.name || "";

  const handleSubmit = (e) => {
    e.preventDefault();
    const newPrice = parseFloat(price);
    if (!newPrice || newPrice <= 0) {
      alert("Por favor, insira um preço válido.");
      return;
    }

    const newPriceEntry = {
      productId: product.id,
      storeId,
      price: newPrice,
      lastUpdated: new Date().toISOString(),
    };

    // Adiciona o novo preço, não substitui toda a lista
    const updatedPrices = [...allData.prices, newPriceEntry];

    onDataChange(
      { ...allData, prices: updatedPrices },
      "Preço registrado com sucesso!"
    );
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <h2 className="text-2xl font-semibold mb-2">Registo Rápido de Preço</h2>
      <p className="mb-4">
        Produto:{" "}
        <span className="font-bold">
          {product.name} ({product.brand})
        </span>
        <br />
        Mercado: <span className="font-bold">{storeName}</span>
      </p>
      <div>
        <label htmlFor="quick-price" className="block text-sm font-medium mb-1">
          Novo Preço (R$)
        </label>
        <input
          id="quick-price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          min="0.01"
          step="0.01"
          className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2"
          placeholder="Ex: 12.99"
          required
          autoFocus
        />
      </div>
      <div className="mt-6 flex justify-end gap-3">
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
          Salvar Preço
        </button>
      </div>
    </form>
  );
};

export default QuickPriceUpdateModal;

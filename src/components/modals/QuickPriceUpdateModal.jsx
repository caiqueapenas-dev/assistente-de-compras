import { useState, useEffect } from "react";

const QuickPriceUpdateModal = ({
  product,
  storeId,
  allData,
  onClose,
  onDataChange,
}) => {
  const [price, setPrice] = useState("");
  const storeName = allData.stores.find((s) => s.id === storeId)?.name || "";

  useEffect(() => {
    const existingPrice = allData.prices.find(
      (p) => p.productId === product.id && p.storeId === storeId
    );
    if (existingPrice) {
      setPrice(existingPrice.price.toString());
    }
  }, [product, storeId, allData.prices]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newPrice = parseFloat(price);
    if (isNaN(newPrice) || newPrice <= 0) {
      alert("Por favor, insira um preço válido.");
      return;
    }

    const priceIndex = allData.prices.findIndex(
      (p) => p.productId === product.id && p.storeId === storeId
    );

    let updatedPrices = [...allData.prices];

    if (priceIndex > -1) {
      // Atualiza o preço existente
      updatedPrices[priceIndex] = {
        ...updatedPrices[priceIndex],
        price: newPrice,
        lastUpdated: new Date().toISOString(),
      };
    } else {
      // Adiciona um novo registro de preço
      updatedPrices.push({
        productId: product.id,
        storeId: storeId,
        price: newPrice,
        lastUpdated: new Date().toISOString(),
      });
    }

    onDataChange(
      { ...allData, prices: updatedPrices },
      "Preço atualizado com sucesso!"
    );
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-semibold">Atualizar Preço</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Produto:{" "}
          <span className="font-medium">
            {product.name} ({product.brand})
          </span>
          <br />
          Mercado: <span className="font-medium">{storeName}</span>
        </p>
      </div>
      <div className="p-6">
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
      <div className="bg-gray-50 dark:bg-gray-900/50 p-4 flex justify-end gap-3 rounded-b-lg border-t border-gray-200 dark:border-gray-700">
        <button type="button" onClick={onClose} className="btn-secondary">
          Cancelar
        </button>
        <button type="submit" className="btn-primary">
          Salvar Preço
        </button>
      </div>
    </form>
  );
};

export default QuickPriceUpdateModal;

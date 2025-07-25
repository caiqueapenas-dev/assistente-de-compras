import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

const EditPurchaseForm = ({
  purchaseToEdit,
  allData,
  onClose,
  onDataChange,
}) => {
  const [purchaseDetails, setPurchaseDetails] = useState({
    storeId: purchaseToEdit.storeId,
    date: new Date(purchaseToEdit.date).toISOString().split("T")[0],
    type: purchaseToEdit.type,
  });
  const [items, setItems] = useState(purchaseToEdit.items);

  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    setPurchaseDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...items];
    newItems[index][name] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { productId: "", quantity: 1, unitPrice: "" }]);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validItems = items.filter(
      (item) => item.productId && item.quantity > 0 && item.unitPrice > 0
    );
    if (validItems.length === 0) {
      alert("A compra deve ter pelo menos um item válido.");
      return;
    }

    const updatedPurchase = {
      ...purchaseToEdit,
      date: new Date(purchaseDetails.date).toISOString(),
      storeId: purchaseDetails.storeId,
      type: purchaseDetails.type,
      items: validItems.map((item) => ({
        productId: item.productId,
        quantity: parseFloat(item.quantity),
        unitPrice: parseFloat(item.unitPrice),
      })),
    };

    const updatedPurchases = allData.purchases.map((p) =>
      p.id === purchaseToEdit.id ? updatedPurchase : p
    );

    const newData = {
      ...allData,
      purchases: updatedPurchases,
    };

    onDataChange(newData, "Compra atualizada com sucesso!");
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-semibold">Editar Compra Registrada</h2>
      </div>
      <div className="p-6 max-h-[60vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Mercado</label>
            <select
              name="storeId"
              value={purchaseDetails.storeId}
              onChange={handleDetailChange}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2"
            >
              {allData.stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Data da Compra
            </label>
            <input
              type="date"
              name="date"
              value={purchaseDetails.date}
              onChange={handleDetailChange}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Tipo da Compra
            </label>
            <select
              name="type"
              value={purchaseDetails.type}
              onChange={handleDetailChange}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2"
            >
              <option value="Mensal">Mensal</option>
              <option value="Reposição">Reposição</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-2">Itens Comprados</h3>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-4 items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg"
            >
              <div className="col-span-6">
                <label className="text-xs">Produto</label>
                <select
                  name="productId"
                  value={item.productId}
                  onChange={(e) => handleItemChange(index, e)}
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-1 text-sm"
                >
                  <option value="">Selecione...</option>
                  {allData.products
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.brand})
                      </option>
                    ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs">Qtd.</label>
                <input
                  type="number"
                  name="quantity"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, e)}
                  min="1"
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-1 text-sm"
                />
              </div>
              <div className="col-span-3">
                <label className="text-xs">Preço Unit. (R$)</label>
                <input
                  type="number"
                  name="unitPrice"
                  value={item.unitPrice}
                  onChange={(e) => handleItemChange(index, e)}
                  min="0.01"
                  step="0.01"
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-1 text-sm"
                />
              </div>
              <div className="col-span-1 flex items-end h-full">
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="p-1 text-red-500 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addItem}
          className="mt-4 text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-2"
        >
          <Plus size={16} /> Adicionar Item
        </button>
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
          Salvar Alterações
        </button>
      </div>
    </form>
  );
};

export default EditPurchaseForm;

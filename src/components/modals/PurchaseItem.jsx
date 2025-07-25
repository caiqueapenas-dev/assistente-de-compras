import { useState, useMemo, useEffect } from "react";
import { Trash2, AlertTriangle, ChevronsRight } from "lucide-react";
import CurrencyInput from "../shared/CurrencyInput";
import { formatCurrency } from "../../utils/formatters";

const PurchaseItem = ({
  item,
  allData,
  onItemChange,
  onRemove,
  onOpenModal,
}) => {
  const { products, stores, prices, storeId } = allData;
  const [suggestions, setSuggestions] = useState([]);

  const findSuggestions = (currentItem) => {
    if (!currentItem.productId || !currentItem.unitPrice || !storeId) return;
    const currentProduct = products.find((p) => p.id === currentItem.productId);
    if (!currentProduct) return;

    let cheaperOptions = [];
    // Mesmo produto em outros mercados
    prices
      .filter(
        (p) =>
          p.productId === currentItem.productId &&
          p.storeId !== storeId &&
          p.price < currentItem.unitPrice
      )
      .forEach((p) => {
        const store = stores.find((s) => s.id === p.storeId);
        if (store)
          cheaperOptions.push(
            `${currentProduct.name} por ${formatCurrency(p.price)} em ${
              store.name
            }`
          );
      });

    // Produtos similares
    const productNameRoot = currentProduct.name.split(" ")[0].toLowerCase();
    products
      .filter(
        (p) =>
          p.id !== currentItem.productId &&
          p.name.toLowerCase().includes(productNameRoot)
      )
      .forEach((similarProduct) => {
        prices
          .filter(
            (p) =>
              p.productId === similarProduct.id &&
              p.price < currentItem.unitPrice
          )
          .forEach((priceInfo) => {
            const store = stores.find((s) => s.id === priceInfo.storeId);
            if (store)
              cheaperOptions.push(
                `${similarProduct.name} por ${formatCurrency(
                  priceInfo.price
                )} em ${store.name}`
              );
          });
      });

    setSuggestions([...new Set(cheaperOptions)].slice(0, 2)); // Remove duplicatas
  };

  useEffect(() => {
    findSuggestions(item);
  }, [item.productId, item.unitPrice, storeId, products, prices, stores]);

  const subtotal = useMemo(() => {
    if (item.purchaseType === "unit") return item.quantity * item.unitPrice;
    if (item.purchaseType === "weight" && item.unitPrice > 0)
      return (item.weight / 1000) * item.unitPrice;
    return 0;
  }, [item.quantity, item.weight, item.unitPrice, item.purchaseType]);

  const handleCreateNewProduct = () => {
    onOpenModal("addEditProduct", {
      productToEdit: null,
      onProductCreated: (newProduct) => {
        onItemChange("productId", newProduct.id);
      },
    });
  };

  return (
    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
        {/* Produto */}
        <div className="md:col-span-5">
          <select
            value={item.productId}
            onChange={(e) => {
              if (e.target.value === "__CREATE_NEW__") {
                handleCreateNewProduct();
              } else {
                onItemChange("productId", e.target.value);
              }
            }}
            className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2"
            required
          >
            <option value="">Selecione um produto...</option>
            <option
              value="__CREATE_NEW__"
              className="text-indigo-600 font-bold"
            >
              --- Criar Novo Produto ---
            </option>
            {products
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.brand})
                </option>
              ))}
          </select>
        </div>

        {/* Tipo e Quantidade/Peso */}
        <div className="md:col-span-3 flex items-center gap-2">
          <select
            value={item.purchaseType}
            onChange={(e) => onItemChange("purchaseType", e.target.value)}
            className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2"
          >
            <option value="unit">Un.</option>
            <option value="weight">g</option>
          </select>
          {item.purchaseType === "unit" ? (
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => onItemChange("quantity", e.target.value)}
              className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2"
            />
          ) : (
            <input
              type="number"
              min="1"
              placeholder="Gramas"
              value={item.weight}
              onChange={(e) => onItemChange("weight", e.target.value)}
              className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2"
            />
          )}
        </div>

        {/* Preço e Subtotal */}
        <div className="md:col-span-3">
          <CurrencyInput
            value={item.unitPrice}
            onChange={(value) => onItemChange("unitPrice", value)}
            className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-right"
            required
          />
          <div className="text-right mt-1 font-semibold text-md text-indigo-600 dark:text-indigo-400">
            {formatCurrency(subtotal)}
          </div>
        </div>

        {/* Remover Item */}
        <div className="md:col-span-1 flex items-center justify-end">
          <button
            type="button"
            onClick={onRemove}
            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"
          >
            <Trash2 size={20} />
          </button>
        </div>

        {(item.priceWarning || suggestions.length > 0) && (
          <div className="md:col-span-12 mt-1 space-y-1">
            {item.priceWarning && (
              <div className="text-xs text-red-500 flex items-center gap-1">
                <AlertTriangle size={14} /> {item.priceWarning}
              </div>
            )}
            {suggestions.map((sug, i) => (
              <div
                key={i}
                className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1"
              >
                <ChevronsRight size={14} /> {sug}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseItem;

import { useMemo } from "react";
import { Plus, Minus, DollarSign } from "lucide-react";

const ShoppingListView = ({ data, shoppingList, onUpdateQuantity }) => {
  const { optimalList, savings, totalOptimalCost } = useMemo(() => {
    if (shoppingList.length === 0)
      return { optimalList: {}, savings: [], totalOptimalCost: 0 };

    let optimal = {};
    let totalCost = 0;

    shoppingList.forEach((item) => {
      const pricesForProduct = data.prices.filter(
        (p) => p.productId === item.id
      );
      if (pricesForProduct.length > 0) {
        const bestPrice = pricesForProduct.reduce((min, p) =>
          p.price < min.price ? p : min
        );
        const storeName = data.stores.find(
          (s) => s.id === bestPrice.storeId
        ).name;
        if (!optimal[storeName])
          optimal[storeName] = {
            storeId: bestPrice.storeId,
            items: [],
            total: 0,
          };
        optimal[storeName].items.push({ ...item, unitPrice: bestPrice.price });
        optimal[storeName].total += bestPrice.price * item.quantity;
        totalCost += bestPrice.price * item.quantity;
      } else {
        const unknownStore = "Mercado não encontrado";
        if (!optimal[unknownStore])
          optimal[unknownStore] = { storeId: null, items: [], total: 0 };
        optimal[unknownStore].items.push({ ...item, unitPrice: 0 });
      }
    });

    const calculatedSavings = data.stores
      .map((store) => {
        let totalAtThisStore = 0;
        let canCalculate = true;
        shoppingList.forEach((item) => {
          const priceAtThisStore = data.prices.find(
            (p) => p.productId === item.id && p.storeId === store.id
          );
          if (priceAtThisStore)
            totalAtThisStore += priceAtThisStore.price * item.quantity;
          else canCalculate = false;
        });
        if (canCalculate)
          return {
            storeName: store.name,
            total: totalAtThisStore,
            saved: totalAtThisStore - totalCost,
          };
        return null;
      })
      .filter((s) => s !== null);

    return {
      optimalList: optimal,
      savings: calculatedSavings,
      totalOptimalCost: totalCost,
    };
  }, [data, shoppingList]);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Lista de Compras</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-semibold text-lg">Itens</h3>
          {shoppingList.length === 0 ? (
            <p className="text-gray-500">
              Adicione produtos do dashboard para começar.
            </p>
          ) : (
            <div className="space-y-3">
              {shoppingList.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg shadow"
                >
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.brand}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      className="p-1 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      className="p-1 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-semibold text-lg">
            Compra Otimizada por Mercado
          </h3>
          {Object.keys(optimalList).length === 0 ? (
            <p className="text-gray-500">Sua lista otimizada aparecerá aqui.</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(optimalList).map(([storeName, details]) => (
                <div
                  key={storeName}
                  className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
                >
                  <h4 className="font-bold text-indigo-600 dark:text-indigo-400 mb-2 flex justify-between">
                    <span>{storeName}</span>
                    <span>Total: R$ {details.total.toFixed(2)}</span>
                  </h4>
                  <ul className="space-y-2">
                    {details.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex justify-between items-baseline text-sm"
                      >
                        <span>
                          {item.quantity}x {item.name} ({item.brand})
                        </span>
                        <span className="font-mono">
                          {item.unitPrice > 0
                            ? `R$ ${(item.unitPrice * item.quantity).toFixed(
                                2
                              )}`
                            : "N/A"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {savings.length > 0 && (
            <div className="mt-8">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <DollarSign size={20} /> Sua Economia
              </h3>
              <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg shadow">
                <p className="text-lg font-bold text-green-700 dark:text-green-300 mb-2">
                  Total Otimizado: R$ {totalOptimalCost.toFixed(2)}
                </p>
                <p className="text-sm mb-4">
                  Comparado a comprar tudo em um único mercado:
                </p>
                <ul className="space-y-2">
                  {savings.map((s) => (
                    <li
                      key={s.storeName}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="font-semibold">{s.storeName}:</span>
                      <span className="font-mono">
                        Economia de{" "}
                        <span className="font-bold text-green-600 dark:text-green-400">
                          R$ {s.saved.toFixed(2)}
                        </span>{" "}
                        (Total seria R$ {s.total.toFixed(2)})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingListView;

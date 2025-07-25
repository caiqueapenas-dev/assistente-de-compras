import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Edit, Trash2 } from "lucide-react";
import { formatCurrency } from "../utils/formatters";

const History = ({ data, onOpenModal }) => {
  const { purchases, products, stores } = data;

  const sortedPurchases = useMemo(() => {
    return [...purchases].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [purchases]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Histórico de Compras</h2>
      {sortedPurchases.length === 0 ? (
        <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-xl font-semibold">Nenhuma compra registrada</h3>
          <p className="text-gray-500 mt-2">
            Clique em "Adicionar Compra" para começar.
          </p>
        </div>
      ) : (
        sortedPurchases.map((purchase) => {
          const store = stores.find((s) => s.id === purchase.storeId);
          const purchaseTotal = purchase.items.reduce((total, item) => {
            if (item.weight > 0 && item.unitPrice > 0) {
              return total + (item.weight / 1000) * item.unitPrice;
            }
            return total + item.quantity * item.unitPrice;
          }, 0);

          return (
            <div
              key={purchase.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
            >
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="font-bold text-lg text-indigo-600 dark:text-indigo-400">
                    {store?.name || "Mercado não encontrado"}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {format(
                      parseISO(purchase.date),
                      "EEEE, dd 'de' MMMM 'de' yyyy",
                      { locale: ptBR }
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xl">
                    {formatCurrency(purchaseTotal)}
                  </p>
                  <div className="flex gap-2 justify-end mt-1">
                    <button
                      onClick={() => onOpenModal("addPurchase", purchase)}
                      className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => onOpenModal("deletePurchase", purchase)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {purchase.items.map((item) => {
                  const product = products.find((p) => p.id === item.productId);
                  const itemTotal =
                    item.weight > 0
                      ? (item.weight / 1000) * item.unitPrice
                      : item.quantity * item.unitPrice;

                  return (
                    <li
                      key={`${purchase.id}-${item.productId}`}
                      className="px-4 py-3 flex justify-between items-center text-sm"
                    >
                      <div>
                        <p className="font-semibold">
                          {product?.name || "Produto não encontrado"}
                        </p>
                        <p className="text-gray-500">
                          {item.weight > 0
                            ? `${item.weight}g @ ${formatCurrency(
                                item.unitPrice
                              )}/kg`
                            : `${item.quantity} un. @ ${formatCurrency(
                                item.unitPrice
                              )}`}
                        </p>
                      </div>
                      <p className="font-medium">{formatCurrency(itemTotal)}</p>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })
      )}
    </div>
  );
};

export default History;

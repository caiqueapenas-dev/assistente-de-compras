import { useMemo } from "react";
import { Plus, Clock } from "lucide-react";
import { formatCurrency } from "../utils/formatters"; // Importando o formatador

// Função auxiliar para normalizar strings
const normalizeString = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

const Dashboard = ({ data, searchTerm, onAddToShoppingList, onOpenModal }) => {
  const getPriceInfo = (productId) => {
    const productPrices = data.prices.filter((p) => p.productId === productId);
    if (productPrices.length === 0) return { cheapest: null, latest: null };

    const sortedByDate = [...productPrices].sort(
      (a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)
    );
    const latest = sortedByDate[0];

    const cheapest = [...productPrices].reduce((min, p) =>
      p.price < min.price ? p : min
    );

    return { cheapest, latest };
  };

  const filteredProducts = useMemo(() => {
    const normalizedSearch = normalizeString(searchTerm);
    return data.products.filter(
      (p) =>
        normalizeString(p.name).includes(normalizedSearch) ||
        normalizeString(p.brand).includes(normalizedSearch)
    );
  }, [data.products, searchTerm]);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => {
          const { cheapest, latest } = getPriceInfo(product.id);
          const cheapestStore = cheapest
            ? data.stores.find((s) => s.id === cheapest.storeId)
            : null;

          return (
            <div
              key={product.id}
              onClick={() => onOpenModal("productDetail", product)} // <<-- CORREÇÃO AQUI
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 cursor-pointer flex flex-col"
            >
              <img
                src={product.photo}
                alt={product.name}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://placehold.co/100x100/e2e8f0/4a5568?text=Imagem`;
                }}
              />
              <div className="p-4 flex-grow">
                <h3 className="font-bold text-lg truncate">{product.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {product.brand}
                </p>
                <p className="text-xs bg-gray-200 dark:bg-gray-700 inline-block px-2 py-1 rounded-full mt-2">
                  {product.category}
                </p>
                {cheapestStore && (
                  <p className="text-xs mt-2 text-gray-500">
                    Mais barato em{" "}
                    <span className="text-green-600 dark:text-green-400 font-semibold">
                      {cheapestStore.name} ({formatCurrency(cheapest.price)})
                    </span>
                  </p>
                )}
                {latest && (
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Clock size={12} />
                    Atualizado em:{" "}
                    {new Date(latest.lastUpdated).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="p-2 bg-gray-50 dark:bg-gray-700/50 flex justify-end items-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToShoppingList(product);
                  }}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-1 px-3 rounded-lg text-sm flex items-center gap-1"
                >
                  <Plus size={16} /> Lista
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;

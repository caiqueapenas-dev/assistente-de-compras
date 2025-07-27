import { useState, useMemo } from "react";
import { Search, Edit } from "lucide-react";

const Galpao = ({ data, onOpenModal, searchTerm }) => {
  const [selectedStoreId, setSelectedStoreId] = useState(data.stores[0]?.id);

  // Filtra os produtos com base na pesquisa e no mercado selecionado
  const filteredProducts = useMemo(() => {
    if (!selectedStoreId) return [];

    const normalizedSearch = searchTerm
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    return data.products
      .map((product) => {
        const priceInfo = data.prices.find(
          (p) => p.productId === product.id && p.storeId === selectedStoreId
        );
        return {
          ...product,
          price: priceInfo ? priceInfo.price : null,
          lastUpdated: priceInfo ? priceInfo.lastUpdated : null,
        };
      })
      .filter(
        (p) =>
          p.name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .includes(normalizedSearch) ||
          p.brand
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .includes(normalizedSearch)
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data, selectedStoreId, searchTerm]);

  const { registered, unregistered } = useMemo(() => {
    const reg = filteredProducts.filter((p) => p.price !== null);
    const unreg = filteredProducts.filter((p) => p.price === null);
    return { registered: reg, unregistered: unreg };
  }, [filteredProducts]);

  const [activeTab, setActiveTab] = useState("registrados");

  const listToDisplay = activeTab === "registrados" ? registered : unregistered;

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <select
          value={selectedStoreId}
          onChange={(e) => setSelectedStoreId(e.target.value)}
          className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {data.stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("registrados")}
            className={`${
              activeTab === "registrados"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Registrados ({registered.length})
          </button>
          <button
            onClick={() => setActiveTab("nao-registrados")}
            className={`${
              activeTab === "nao-registrados"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Não Registrados
            {unregistered.length > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {unregistered.length}
              </span>
            )}
          </button>
        </nav>
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="p-4 font-semibold">Produto</th>
              <th className="p-4 font-semibold">Marca</th>
              <th className="p-4 font-semibold">Preço</th>
              <th className="p-4 font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {listToDisplay.map((product) => (
              <tr
                key={product.id}
                className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <td className="p-4 flex items-center gap-3">
                  <img
                    src={product.photo}
                    alt={product.name}
                    className="w-10 h-10 object-cover rounded-md cursor-pointer"
                    onClick={() => onOpenModal("productDetail", product)}
                  />
                  <span
                    className="cursor-pointer"
                    onClick={() => onOpenModal("productDetail", product)}
                  >
                    {product.name}
                  </span>
                </td>
                <td className="p-4">{product.brand}</td>
                <td className="p-4">
                  {product.price !== null ? (
                    `R$ ${product.price.toFixed(2)}`
                  ) : (
                    <span className="text-gray-400 italic">N/A</span>
                  )}
                </td>
                <td className="p-4">
                  <button
                    onClick={() =>
                      onOpenModal("addEditProduct", { productToEdit: product })
                    } // <<-- LÓGICA ALTERADA AQUI
                    className="flex items-center gap-2 text-sm bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-900 text-blue-800 dark:text-blue-300 font-semibold py-1 px-3 rounded-lg"
                  >
                    <Edit size={14} /> Editar / Atualizar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Galpao;

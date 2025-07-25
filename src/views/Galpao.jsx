import { useState, useMemo } from "react";
import { Search, Clock, ArrowUpDown } from "lucide-react";

// Função auxiliar para normalizar strings (remover acentos e converter para minúsculas)
const normalizeString = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

const SortableHeader = ({ children, column, sortConfig, setSortConfig }) => {
  const isSorted = sortConfig.key === column;
  const direction = isSorted ? sortConfig.direction : "asc";

  const handleClick = () => {
    setSortConfig({
      key: column,
      direction: direction === "asc" ? "desc" : "asc",
    });
  };

  return (
    <th
      className="p-4 font-semibold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
      onClick={handleClick}
    >
      <div className="flex items-center gap-2">
        {children}
        {isSorted && <ArrowUpDown size={14} />}
      </div>
    </th>
  );
};

const Galpao = ({ data, onOpenModal }) => {
  const [selectedStoreId, setSelectedStoreId] = useState(data.stores[0]?.id);
  const [activeTab, setActiveTab] = useState("registrados");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  const { registered, unregistered } = useMemo(() => {
    if (!selectedStoreId) return { registered: [], unregistered: [] };

    const reg = [];
    const unreg = [];

    data.products.forEach((product) => {
      const priceInfo = data.prices.find(
        (p) => p.productId === product.id && p.storeId === selectedStoreId
      );
      if (priceInfo) {
        const isOutdated =
          (new Date() - new Date(priceInfo.lastUpdated)) /
            (1000 * 60 * 60 * 24 * 30) >
          2;
        reg.push({
          ...product,
          price: priceInfo.price,
          lastUpdated: priceInfo.lastUpdated,
          isOutdated,
        });
      } else {
        unreg.push({
          ...product,
          price: null,
          lastUpdated: null,
          isOutdated: false,
        });
      }
    });

    return { registered: reg, unregistered: unreg };
  }, [data, selectedStoreId]);

  const sortedAndFilteredList = useMemo(() => {
    const listToDisplay =
      activeTab === "registrados" ? registered : unregistered;
    const normalizedSearch = normalizeString(searchTerm);

    const filtered = listToDisplay.filter(
      (p) =>
        normalizeString(p.name).includes(normalizedSearch) ||
        normalizeString(p.brand).includes(normalizedSearch)
    );

    return filtered.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [activeTab, registered, unregistered, searchTerm, sortConfig]);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Galpão por Mercado</h2>
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
        <div className="relative flex-grow">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Pesquisar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
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
            Registrados
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
              <SortableHeader
                column="name"
                sortConfig={sortConfig}
                setSortConfig={setSortConfig}
              >
                Produto
              </SortableHeader>
              <SortableHeader
                column="brand"
                sortConfig={sortConfig}
                setSortConfig={setSortConfig}
              >
                Marca
              </SortableHeader>
              <SortableHeader
                column="price"
                sortConfig={sortConfig}
                setSortConfig={setSortConfig}
              >
                Preço
              </SortableHeader>
              <SortableHeader
                column="lastUpdated"
                sortConfig={sortConfig}
                setSortConfig={setSortConfig}
              >
                Última Atualização
              </SortableHeader>
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredList.map((product) => (
              <tr
                key={product.id}
                className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                onClick={() => onOpenModal("productDetail", product)}
              >
                <td className="p-4 flex items-center gap-3">
                  <img
                    src={product.photo}
                    alt={product.name}
                    className="w-10 h-10 object-cover rounded-md"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://placehold.co/100x100/e2e8f0/4a5568?text=Img";
                    }}
                  />
                  {product.name}
                </td>
                <td className="p-4">{product.brand}</td>
                <td className="p-4">
                  {product.price !== null ? (
                    <span
                      className={`flex items-center gap-2 ${
                        product.isOutdated ? "text-yellow-500" : ""
                      }`}
                    >
                      R$ {product.price.toFixed(2)}
                      {product.isOutdated && (
                        <Clock
                          size={16}
                          title="Preço desatualizado (mais de 2 meses)"
                        />
                      )}
                    </span>
                  ) : (
                    <span className="text-gray-400 italic">Não registrado</span>
                  )}
                </td>
                <td className="p-4">
                  {product.lastUpdated
                    ? new Date(product.lastUpdated).toLocaleDateString()
                    : "N/A"}
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

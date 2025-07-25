import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Trash2,
  Edit,
  ShoppingCart,
  Archive,
  List,
  DollarSign,
  Download,
  Upload,
  ChevronsRight,
  X,
  Clock,
  Package,
  Store,
  Calendar,
  AlertCircle,
  CheckCircle,
  Minus,
  Info,
} from "lucide-react";
import DATABASE from "./database.json";

// Função auxiliar para normalizar strings (remover acentos e converter para minúsculas)
const normalizeString = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

// Componente Principal da Aplicação
export default function App() {
  const [data, setData] = useState(() => {
    try {
      const localData = localStorage.getItem("marketHelperData");
      return localData ? JSON.parse(localData) : DATABASE;
    } catch (error) {
      console.error("Erro ao carregar dados do localStorage", error);
      return DATABASE;
    }
  });

  const [activeView, setActiveView] = useState("dashboard");
  const [shoppingList, setShoppingList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [modal, setModal] = useState({ isOpen: false, type: "", data: null });
  const [toast, setToast] = useState({ isVisible: false, message: "" });

  // Autosave a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        localStorage.setItem("marketHelperData", JSON.stringify(data));
      } catch (error) {
        console.error("Erro ao salvar dados no localStorage", error);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [data]);

  // Efeito para esconder o Toast Notification
  useEffect(() => {
    if (toast.isVisible) {
      const timer = setTimeout(() => {
        setToast({ isVisible: false, message: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message) => {
    setToast({ isVisible: true, message });
  };

  const handleDataChange = (newData, successMessage) => {
    setData(newData);
    if (successMessage) {
      showToast(successMessage);
    }
  };

  const handleExport = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `backup_compras_${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
  };

  const handleImport = (event) => {
    const fileReader = new FileReader();
    fileReader.readAsText(event.target.files[0], "UTF-8");
    fileReader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (
          importedData.products &&
          importedData.stores &&
          importedData.prices &&
          importedData.purchases
        ) {
          setData(importedData);
          showToast("Dados importados com sucesso!");
        } else {
          alert(
            "Arquivo de backup inválido. A estrutura dos dados está incorreta."
          );
        }
      } catch (error) {
        alert("Erro ao ler o arquivo. Verifique se é um JSON válido.");
        console.error("Erro ao importar JSON:", error);
      }
    };
    event.target.value = null; // Limpar o input para permitir re-importação do mesmo arquivo
  };

  const addToShoppingList = (product) => {
    setShoppingList((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    showToast(`${product.name} adicionado à lista!`);
  };

  const updateShoppingListQuantity = (productId, change) => {
    setShoppingList((prev) => {
      const updatedList = prev.map((item) =>
        item.id === productId
          ? { ...item, quantity: Math.max(0, item.quantity + change) }
          : item
      );
      return updatedList.filter((item) => item.quantity > 0);
    });
  };

  const openModal = (type, modalData = null) => {
    setModal({ isOpen: true, type, data: modalData });
  };

  const closeModal = () => {
    setModal({ isOpen: false, type: "", data: null });
  };

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <Dashboard
            data={data}
            searchTerm={searchTerm}
            onAddToShoppingList={addToShoppingList}
            onOpenModal={openModal}
          />
        );
      case "galpao":
        return <Galpao data={data} onOpenModal={openModal} />;
      case "lista":
        return (
          <ShoppingListView
            data={data}
            shoppingList={shoppingList}
            onUpdateQuantity={updateShoppingListQuantity}
          />
        );
      case "historico":
        return <History data={data} onOpenModal={openModal} />;

      default:
        return (
          <Dashboard
            data={data}
            searchTerm={searchTerm}
            onAddToShoppingList={addToShoppingList}
            onOpenModal={openModal}
          />
        );
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen font-sans">
      <Toast message={toast.message} isVisible={toast.isVisible} />
      <div className="flex flex-col md:flex-row">
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          shoppingListBadge={shoppingList.length}
          onExport={handleExport}
          onImport={handleImport}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {activeView !== "lista" && activeView !== "historico" && (
            <header className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <div className="relative w-full md:w-1/2">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Pesquisar por nome ou marca..."
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={() => openModal("addEditProduct")}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                <Plus size={20} /> Adicionar Produto
              </button>
            </header>
          )}
          {renderView()}
        </main>
      </div>
      <ModalManager
        modal={modal}
        onClose={closeModal}
        data={data}
        onDataChange={handleDataChange}
      />
    </div>
  );
}

// --- SUB-COMPONENTES ---

const Sidebar = ({
  activeView,
  setActiveView,
  shoppingListBadge,
  onExport,
  onImport,
}) => (
  <aside className="w-full md:w-64 bg-white dark:bg-gray-800 p-4 space-y-4 border-b md:border-r border-gray-200 dark:border-gray-700">
    <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
      <ShoppingCart size={28} />
      Compras
    </h1>
    <nav className="space-y-2">
      <NavItem
        icon={<Package size={20} />}
        text="Dashboard"
        active={activeView === "dashboard"}
        onClick={() => setActiveView("dashboard")}
      />
      <NavItem
        icon={<Store size={20} />}
        text="Galpão"
        active={activeView === "galpao"}
        onClick={() => setActiveView("galpao")}
      />
      <NavItem
        icon={<List size={20} />}
        text="Lista de Compras"
        active={activeView === "lista"}
        onClick={() => setActiveView("lista")}
        badge={shoppingListBadge}
      />
      <NavItem
        icon={<Archive size={20} />}
        text="Histórico"
        active={activeView === "historico"}
        onClick={() => setActiveView("historico")}
      />
    </nav>
    <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
      <button
        onClick={onExport}
        className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
      >
        <Download size={18} /> Exportar Backup
      </button>
      <label className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer">
        <Upload size={18} /> Importar Backup
        <input
          type="file"
          accept=".json"
          onChange={onImport}
          className="hidden"
        />
      </label>
    </div>
  </aside>
);

const NavItem = ({ icon, text, active, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-colors ${
      active
        ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-semibold"
        : "hover:bg-gray-100 dark:hover:bg-gray-700"
    }`}
  >
    {icon}
    <span>{text}</span>
    {badge > 0 && (
      <span className="ml-auto bg-indigo-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
        {badge}
      </span>
    )}
  </button>
);

const Dashboard = ({ data, searchTerm, onAddToShoppingList, onOpenModal }) => {
  const getCheapestPriceInfo = (productId) => {
    const productPrices = data.prices.filter((p) => p.productId === productId);
    if (productPrices.length === 0) return null;
    if (productPrices.length === 1) {
      const store = data.stores.find((s) => s.id === productPrices[0].storeId);
      return { text: `em ${store?.name}`, color: "text-gray-500" };
    }
    const cheapest = productPrices.reduce((min, p) =>
      p.price < min.price ? p : min
    );
    const store = data.stores.find((s) => s.id === cheapest.storeId);
    return {
      text: `Mais barato em ${store?.name}`,
      color: "text-green-500 font-semibold",
    };
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
      <h2 className="text-2xl font-semibold mb-4">Produtos Registrados</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            onClick={() => onOpenModal("productDetail", product)}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 cursor-pointer"
          >
            <img
              src={product.photo}
              alt={product.name}
              className="w-full h-100 object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://placehold.co/100x100/e2e8f0/4a5568?text=Imagem";
              }}
            />
            <div className="p-4">
              <h3 className="font-bold text-lg truncate">{product.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {product.brand}
              </p>
              <p className="text-xs bg-gray-200 dark:bg-gray-700 inline-block px-2 py-1 rounded-full mt-2">
                {product.category}
              </p>
              {getCheapestPriceInfo(product.id) && (
                <p
                  className={`text-xs mt-2 ${
                    getCheapestPriceInfo(product.id).color
                  }`}
                >
                  {getCheapestPriceInfo(product.id).text}
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
        ))}
      </div>
    </div>
  );
};

const Galpao = ({ data, onOpenModal }) => {
  const [selectedStoreId, setSelectedStoreId] = useState(data.stores[0]?.id);
  const [activeTab, setActiveTab] = useState("registrados");
  const [searchTerm, setSearchTerm] = useState("");

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

  const normalizedSearch = normalizeString(searchTerm);
  const listToDisplay = activeTab === "registrados" ? registered : unregistered;
  const filteredList = listToDisplay.filter(
    (p) =>
      normalizeString(p.name).includes(normalizedSearch) ||
      normalizeString(p.brand).includes(normalizedSearch)
  );

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
              <th className="p-4 font-semibold">Produto</th>
              <th className="p-4 font-semibold">Marca</th>
              <th className="p-4 font-semibold">Preço</th>
              <th className="p-4 font-semibold">Última Atualização</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((product) => (
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

const History = ({ data, onOpenModal }) => {
  const { stores, purchases, products } = data;
  const getStoreName = (storeId) =>
    stores.find((s) => s.id === storeId)?.name || "Desconhecido";
  const getProductDetails = (productId) =>
    products.find((p) => p.id === productId) || {
      name: "Produto Removido",
      brand: "",
    };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Histórico de Compras</h2>
        <button
          onClick={() => onOpenModal("addPurchase")}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} /> Adicionar Compra
        </button>
      </div>
      <div className="space-y-6">
        {purchases
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .map((purchase) => (
            <div
              key={purchase.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow"
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-3 pb-3 border-b dark:border-gray-700">
                  <div>
                    <p className="font-bold text-lg">
                      {getStoreName(purchase.storeId)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <Calendar size={14} />
                      {new Date(purchase.date).toLocaleDateString()} -{" "}
                      <span className="font-semibold">{purchase.type}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl text-indigo-600 dark:text-indigo-400">
                      Total: R${" "}
                      {purchase.items
                        .reduce(
                          (total, item) =>
                            total + item.unitPrice * item.quantity,
                          0
                        )
                        .toFixed(2)}
                    </p>
                    <div className="flex items-center justify-end gap-3 mt-1">
                      <button
                        onClick={() => onOpenModal("editPurchase", purchase)}
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                      >
                        <Edit size={14} /> Editar
                      </button>
                      {/* Botão de Exclusão Adicionado Aqui */}
                      <button
                        onClick={() => onOpenModal("deletePurchase", purchase)}
                        className="text-sm text-red-600 hover:text-red-800 font-semibold flex items-center gap-1"
                      >
                        <Trash2 size={14} /> Excluir
                      </button>
                    </div>
                  </div>
                </div>
                <ul className="space-y-2">
                  {purchase.items.map((item, index) => {
                    const product = getProductDetails(item.productId);
                    return (
                      <li
                        key={index}
                        className="flex justify-between items-center text-sm"
                      >
                        <span>
                          {item.quantity}x {product.name} ({product.brand})
                        </span>
                        <span className="font-mono">
                          @ R$ {item.unitPrice.toFixed(2)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

const Toast = ({ message, isVisible }) => {
  if (!isVisible) return null;
  return (
    <div className="fixed top-5 right-5 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in-out z-50">
      <CheckCircle size={20} />
      <span>{message}</span>
    </div>
  );
};

// --- MODAIS ---

const ModalManager = ({ modal, onClose, data, onDataChange }) => {
  if (!modal.isOpen) return null;

  const renderModalContent = () => {
    switch (modal.type) {
      case "productDetail":
        return (
          <ProductDetailModal
            product={modal.data}
            allData={data}
            onClose={onClose}
            onDataChange={onDataChange}
          />
        );
      case "addEditProduct":
        return (
          <AddEditProductForm
            productToEdit={modal.data}
            allData={data}
            onClose={onClose}
            onDataChange={onDataChange}
          />
        );
      case "deleteConfirmation":
        return (
          <DeleteConfirmationModal
            item={modal.data}
            allData={data}
            onClose={onClose}
            onDataChange={onDataChange}
          />
        );
      case "addPurchase":
        return (
          <AddPurchaseForm
            allData={data}
            onClose={onClose}
            onDataChange={onDataChange}
          />
        );
      case "editPurchase":
        return (
          <EditPurchaseForm
            purchaseToEdit={modal.data}
            allData={data}
            onClose={onClose}
            onDataChange={onDataChange}
          />
        );
      case "deletePurchase": // Nova linha
        return (
          <DeletePurchaseConfirmationModal
            purchase={modal.data}
            allData={data}
            onClose={onClose}
            onDataChange={onDataChange}
          />
        ); // Nova linha
      case "addStore":
        return (
          <AddStoreForm
            allData={data}
            onClose={onClose}
            onDataChange={onDataChange}
          />
        );
      default:
        return null;
    }
  };

  const getModalMaxWidth = () => {
    switch (modal.type) {
      case "deleteConfirmation":
        return "max-w-lg";
      case "addEditProduct":
        return "max-w-2xl";
      case "productDetail":
        return "max-w-4xl";
      case "addPurchase":
        return "max-w-4xl";
      case "editPurchase":
        return "max-w-4xl";
      case "deletePurchase":
        return "max-w-lg"; // Nova linha
      case "addStore":
        return "max-w-lg";
      default:
        return "max-w-3xl";
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-40 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full ${getModalMaxWidth()} relative animate-scale-in`}
      >
        {renderModalContent()}
      </div>
    </div>
  );
};

const ProductDetailModal = ({ product, allData, onClose, onDataChange }) => {
  const [modal, setModal] = useState({ isOpen: false, type: "", data: null });
  const prices = allData.prices.filter((p) => p.productId === product.id);

  const openSubModal = (type, data) => setModal({ isOpen: true, type, data });
  const closeSubModal = () => setModal({ isOpen: false, type: "", data: null });

  return (
    <>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 z-10"
      >
        <X size={24} />
      </button>
      <div className="p-8">
        <div className="flex flex-col md:flex-row gap-8">
          <img
            src={product.photo}
            alt={product.name}
            className="w-full md:w-64 h-64 object-cover rounded-lg shadow-lg"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://placehold.co/200x200/e2e8f0/4a5568?text=Imagem";
            }}
          />

          <div className="flex-1">
            <span className="text-sm bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300 inline-block px-3 py-1 rounded-full mb-2">
              {product.category}
            </span>
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white">
              {product.name}
            </h2>
            <p className="text-xl text-gray-500 dark:text-gray-400 mt-1">
              {product.brand}
            </p>

            <h3 className="text-xl font-semibold mt-8 mb-3 border-b pb-2 border-gray-200 dark:border-gray-700">
              Preços Registrados
            </h3>
            <div className="space-y-3">
              {prices.length > 0 ? (
                prices.map((price) => {
                  const store = allData.stores.find(
                    (s) => s.id === price.storeId
                  );
                  return (
                    <div
                      key={store.id}
                      className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg"
                    >
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {store.name}
                      </span>
                      <span className="font-bold text-lg text-indigo-600 dark:text-indigo-400">
                        R$ {price.price.toFixed(2)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 italic">
                  Nenhum preço registrado para este produto.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 dark:bg-gray-900/50 p-4 flex justify-end gap-3 rounded-b-lg border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() =>
            openSubModal("deleteConfirmation", {
              id: product.id,
              name: product.name,
            })
          }
          className="btn-danger flex items-center gap-2"
        >
          <Trash2 size={18} /> Excluir
        </button>
        <button
          type="button"
          onClick={() => openSubModal("addEditProduct", product)}
          className="btn-primary flex items-center gap-2"
        >
          <Edit size={18} /> Editar
        </button>
        <button type="button" onClick={onClose} className="btn-secondary">
          Fechar
        </button>
      </div>
      {/* Sub-modal para edição/exclusão */}
      {modal.isOpen && (
        <ModalManager
          modal={modal}
          onClose={closeSubModal}
          data={allData}
          onDataChange={(newData, msg) => {
            onDataChange(newData, msg);
            onClose();
          }}
        />
      )}
    </>
  );
};

const AddEditProductForm = ({
  productToEdit,
  allData,
  onClose,
  onDataChange,
}) => {
  const [formData, setFormData] = useState(
    productToEdit || {
      name: "",
      brand: "",
      category: allData.categories[0] || "",
      photo: "",
    }
  );
  const [priceData, setPriceData] = useState({
    storeId: allData.stores[0]?.id || "",
    price: "",
  });
  const [error, setError] = useState("");
  const [subModal, setSubModal] = useState({
    isOpen: false,
    type: "",
    data: null,
  });

  const openSubModal = (type, data = null) =>
    setSubModal({ isOpen: true, type, data });
  const closeSubModal = () =>
    setSubModal({ isOpen: false, type: "", data: null });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setPriceData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          if (img.height > img.width * 1.5) {
            setError(
              "Imagem muito vertical não suportada. Por favor, escolha uma imagem mais larga."
            );
          } else {
            setError("");
            setFormData((prev) => ({ ...prev, photo: event.target.result }));
          }
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (productToEdit) {
      const updatedProducts = allData.products.map((p) =>
        p.id === productToEdit.id ? formData : p
      );
      onDataChange(
        { ...allData, products: updatedProducts },
        "Produto atualizado com sucesso!"
      );
    } else {
      if (!priceData.storeId || !priceData.price || priceData.price <= 0) {
        alert("Por favor, selecione um mercado e insira um preço válido.");
        return;
      }

      const newProduct = { ...formData, id: `p${Date.now()}` };
      if (!newProduct.photo)
        newProduct.photo = `https://placehold.co/100x100/e2e8f0/4a5568?text=${encodeURIComponent(
          newProduct.name
        )}`;

      const newPriceEntry = {
        productId: newProduct.id,
        storeId: priceData.storeId,
        price: parseFloat(priceData.price),
        lastUpdated: new Date().toISOString(),
      };

      onDataChange(
        {
          ...allData,
          products: [...allData.products, newProduct],
          prices: [...allData.prices, newPriceEntry],
        },
        "Produto adicionado com sucesso!"
      );
    }
    onClose();
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold">
            {productToEdit ? "Editar Produto" : "Adicionar Novo Produto"}
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Nome do Produto
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                className="w-full input-style"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Marca</label>
              <input
                type="text"
                name="brand"
                value={formData.brand || ""}
                onChange={handleChange}
                className="w-full input-style"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Categoria
              </label>
              <select
                name="category"
                value={formData.category || ""}
                onChange={handleChange}
                className="w-full input-style"
              >
                {allData.categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {!productToEdit && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Registrar em qual Mercado?
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      name="storeId"
                      value={priceData.storeId}
                      onChange={handlePriceChange}
                      className="w-full input-style"
                      required
                    >
                      {allData.stores.map((store) => (
                        <option key={store.id} value={store.id}>
                          {store.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => openSubModal("addStore")}
                      className="p-2 btn-secondary flex-shrink-0"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Preço Inicial (R$)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={priceData.price}
                    onChange={handlePriceChange}
                    min="0.01"
                    step="0.01"
                    className="w-full input-style"
                    placeholder="Ex: 5.99"
                    required
                  />
                </div>
              </>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Foto do Produto (URL ou Upload)
              </label>
              <input
                type="text"
                name="photo"
                placeholder="Cole uma URL ou faça upload"
                value={formData.photo || ""}
                onChange={handleChange}
                className="w-full input-style mb-2"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 flex justify-end gap-3 rounded-b-lg border-t border-gray-200 dark:border-gray-700">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" className="btn-primary">
            Salvar
          </button>
        </div>
      </form>
      {subModal.isOpen && (
        <ModalManager
          modal={subModal}
          onClose={closeSubModal}
          data={allData}
          onDataChange={onDataChange}
        />
      )}
    </>
  );
};

const DeleteConfirmationModal = ({ item, allData, onClose, onDataChange }) => {
  const handleDelete = () => {
    const newData = {
      ...allData,
      products: allData.products.filter((p) => p.id !== item.id),
      prices: allData.prices.filter((p) => p.productId !== item.id),
      purchases: allData.purchases
        .map((purchase) => ({
          ...purchase,
          items: purchase.items.filter((i) => i.productId !== item.id),
        }))
        .filter((purchase) => purchase.items.length > 0),
    };
    onDataChange(newData, "Produto excluído com sucesso!");
    onClose();
  };

  return (
    <div className="relative">
      <button
        onClick={onClose}
        className="absolute -top-2 -right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 z-10"
      >
        <X size={24} />
      </button>
      <div className="p-6 text-center sm:text-left">
        <div className="sm:flex sm:items-start sm:gap-4">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 sm:mx-0 sm:h-10 sm:w-10">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <div className="mt-3 sm:mt-0">
            <h3 className="text-lg leading-6 font-bold text-gray-900 dark:text-gray-100">
              Excluir Produto
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tem certeza que deseja excluir <strong>{item.name}</strong>?
                Todos os seus preços e históricos de compra serão removidos
                permanentemente. Esta ação não pode ser desfeita.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 sm:flex sm:flex-row-reverse rounded-b-lg">
        <button
          type="button"
          onClick={handleDelete}
          className="btn-danger w-full sm:w-auto sm:ml-3"
        >
          Excluir
        </button>
        <button
          type="button"
          onClick={onClose}
          className="btn-secondary w-full mt-3 sm:w-auto sm:mt-0"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

const AddPurchaseForm = ({ allData, onClose, onDataChange }) => {
  const [purchaseDetails, setPurchaseDetails] = useState({
    storeId: allData.stores[0]?.id || "",
    date: new Date().toISOString().split("T")[0],
    type: "Mensal",
  });
  const [items, setItems] = useState([
    { productId: "", quantity: 1, unitPrice: "" },
  ]);
  const [subModal, setSubModal] = useState({
    isOpen: false,
    type: "",
    data: null,
  });

  const openSubModal = (type, data = null) =>
    setSubModal({ isOpen: true, type, data });
  const closeSubModal = () =>
    setSubModal({ isOpen: false, type: "", data: null });

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
      alert("Por favor, adicione pelo menos um item válido à compra.");
      return;
    }

    const newPurchase = {
      id: `c${Date.now()}`,
      date: new Date(purchaseDetails.date).toISOString(),
      storeId: purchaseDetails.storeId,
      type: purchaseDetails.type,
      items: validItems.map((item) => ({
        productId: item.productId,
        quantity: parseFloat(item.quantity),
        unitPrice: parseFloat(item.unitPrice),
      })),
    };

    let updatedPrices = [...allData.prices];
    const newLastUpdated = new Date().toISOString();

    newPurchase.items.forEach((item) => {
      const priceIndex = updatedPrices.findIndex(
        (p) =>
          p.productId === item.productId && p.storeId === newPurchase.storeId
      );

      if (priceIndex > -1) {
        updatedPrices[priceIndex] = {
          ...updatedPrices[priceIndex],
          price: item.unitPrice,
          lastUpdated: newLastUpdated,
        };
      } else {
        updatedPrices.push({
          productId: item.productId,
          storeId: newPurchase.storeId,
          price: item.unitPrice,
          lastUpdated: newLastUpdated,
        });
      }
    });

    const newData = {
      ...allData,
      purchases: [...allData.purchases, newPurchase],
      prices: updatedPrices,
    };

    onDataChange(newData, "Compra registrada com sucesso!");
    onClose();
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold">Registrar Nova Compra</h2>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Mercado</label>
              <div className="flex items-center gap-2">
                <select
                  name="storeId"
                  value={purchaseDetails.storeId}
                  onChange={handleDetailChange}
                  className="w-full input-style"
                >
                  {allData.stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => openSubModal("addStore")}
                  className="p-2 btn-secondary flex-shrink-0"
                >
                  <Plus size={16} />
                </button>
              </div>
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
                className="w-full input-style"
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
                className="w-full input-style"
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
                    className="w-full input-style text-sm p-1"
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
                    className="w-full input-style text-sm p-1"
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
                    className="w-full input-style text-sm p-1"
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
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" className="btn-primary">
            Salvar Compra
          </button>
        </div>
      </form>
      {subModal.isOpen && (
        <ModalManager
          modal={subModal}
          onClose={closeSubModal}
          data={allData}
          onDataChange={onDataChange}
        />
      )}
    </>
  );
};

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
              className="w-full input-style"
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
              className="w-full input-style"
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
              className="w-full input-style"
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
                  className="w-full input-style text-sm p-1"
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
                  className="w-full input-style text-sm p-1"
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
                  className="w-full input-style text-sm p-1"
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
        <button type="button" onClick={onClose} className="btn-secondary">
          Cancelar
        </button>
        <button type="submit" className="btn-primary">
          Salvar Alterações
        </button>
      </div>
    </form>
  );
};
const DeletePurchaseConfirmationModal = ({
  purchase,
  allData,
  onClose,
  onDataChange,
}) => {
  const handleDelete = () => {
    const updatedPurchases = allData.purchases.filter(
      (p) => p.id !== purchase.id
    );
    const newData = {
      ...allData,
      purchases: updatedPurchases,
    };
    onDataChange(newData, "Compra excluída com sucesso!");
    onClose();
  };

  const storeName =
    allData.stores.find((s) => s.id === purchase.storeId)?.name ||
    "Mercado Desconhecido";
  const purchaseDate = new Date(purchase.date).toLocaleDateString();

  return (
    <div className="relative">
      <button
        onClick={onClose}
        className="absolute -top-2 -right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 z-10"
      >
        <X size={24} />
      </button>
      <div className="p-6 text-center sm:text-left">
        <div className="sm:flex sm:items-start sm:gap-4">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 sm:mx-0 sm:h-10 sm:w-10">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <div className="mt-3 sm:mt-0">
            <h3 className="text-lg leading-6 font-bold text-gray-900 dark:text-gray-100">
              Excluir Registro de Compra
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tem certeza que deseja excluir o registro da compra feita em{" "}
                <strong>{storeName}</strong> no dia{" "}
                <strong>{purchaseDate}</strong>?
                <br />
                Esta ação não pode ser desfeita.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 sm:flex sm:flex-row-reverse rounded-b-lg">
        <button
          type="button"
          onClick={handleDelete}
          className="btn-danger w-full sm:w-auto sm:ml-3"
        >
          Excluir
        </button>
        <button
          type="button"
          onClick={onClose}
          className="btn-secondary w-full mt-3 sm:w-auto sm:mt-0"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};
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
            className="w-full input-style"
            placeholder="Ex: Supermercado Preço Bom"
            required
          />
        </div>
      </div>
      <div className="bg-gray-50 dark:bg-gray-900/50 p-4 flex justify-end gap-3 rounded-b-lg border-t border-gray-200 dark:border-gray-700">
        <button type="button" onClick={onClose} className="btn-secondary">
          Cancelar
        </button>
        <button type="submit" className="btn-primary">
          Salvar Mercado
        </button>
      </div>
    </form>
  );
};

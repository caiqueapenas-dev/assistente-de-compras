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
} from "lucide-react";
import DATABASE from "./database.json";

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

  // Autosave a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        localStorage.setItem("marketHelperData", JSON.stringify(data));
        console.log("Dados salvos automaticamente!");
      } catch (error) {
        console.error("Erro ao salvar dados no localStorage", error);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [data]);

  const handleDataChange = (newData) => {
    setData(newData);
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
        // Validação básica da estrutura do JSON importado
        if (
          importedData.products &&
          importedData.stores &&
          importedData.prices &&
          importedData.purchases
        ) {
          setData(importedData);
          alert("Dados importados com sucesso!");
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
  };

  const updateShoppingListQuantity = (productId, quantity) => {
    const q = parseInt(quantity, 10);
    if (q <= 0) {
      setShoppingList((prev) => prev.filter((item) => item.id !== productId));
    } else {
      setShoppingList((prev) =>
        prev.map((item) =>
          item.id === productId ? { ...item, quantity: q } : item
        )
      );
    }
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
            onDataChange={handleDataChange}
          />
        );
      case "galpao":
        return <Galpao data={data} />;
      case "lista":
        return (
          <ShoppingListView
            data={data}
            shoppingList={shoppingList}
            onUpdateQuantity={updateShoppingListQuantity}
          />
        );
      case "historico":
        return <History data={data} />;
      default:
        return (
          <Dashboard
            data={data}
            searchTerm={searchTerm}
            onAddToShoppingList={addToShoppingList}
            onOpenModal={openModal}
            onDataChange={handleDataChange}
          />
        );
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen font-sans">
      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
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
              badge={shoppingList.length}
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
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              <Download size={18} /> Exportar Backup
            </button>
            <label className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer">
              <Upload size={18} /> Importar Backup
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
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
              onClick={() => openModal("addProduct")}
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              <Plus size={20} /> Adicionar Produto
            </button>
          </header>
          {renderView()}
        </main>
      </div>
      {modal.isOpen && (
        <Modal
          modal={modal}
          onClose={closeModal}
          data={data}
          onDataChange={handleDataChange}
        />
      )}
    </div>
  );
}

// Componente de Item de Navegação
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

// Componente Dashboard
const Dashboard = ({
  data,
  searchTerm,
  onAddToShoppingList,
  onOpenModal,
  onDataChange,
}) => {
  const filteredProducts = useMemo(() => {
    return data.products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data.products, searchTerm]);

  const handleDeleteProduct = (productId) => {
    if (
      window.confirm(
        "Tem certeza que deseja excluir este produto e todos os seus preços e históricos de compra? Esta ação não pode ser desfeita."
      )
    ) {
      const newData = {
        ...data,
        products: data.products.filter((p) => p.id !== productId),
        prices: data.prices.filter((p) => p.productId !== productId),
        purchases: data.purchases
          .map((purchase) => ({
            ...purchase,
            items: purchase.items.filter(
              (item) => item.productId !== productId
            ),
          }))
          .filter((purchase) => purchase.items.length > 0),
      };
      onDataChange(newData);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Produtos Registrados</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105"
          >
            <img
              src={product.photo}
              alt={product.name}
              className="w-full h-32 object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://placehold.co/100x100/e2e8f0/4a5568?text=Imagem";
              }}
            />
            <div className="p-4">
              <h3 className="font-bold text-lg">{product.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {product.brand}
              </p>
              <p className="text-xs bg-gray-200 dark:bg-gray-700 inline-block px-2 py-1 rounded-full mt-2">
                {product.category}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 flex justify-between items-center">
              <div className="flex gap-2">
                <button
                  onClick={() => onOpenModal("editProduct", product)}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <button
                onClick={() => onAddToShoppingList(product)}
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

// Componente Galpão
const Galpao = ({ data }) => {
  const [selectedStoreId, setSelectedStoreId] = useState(data.stores[0]?.id);

  const productsByStore = useMemo(() => {
    if (!selectedStoreId) return [];

    return data.products.map((product) => {
      const priceInfo = data.prices.find(
        (p) => p.productId === product.id && p.storeId === selectedStoreId
      );
      const isOutdated =
        priceInfo &&
        (new Date() - new Date(priceInfo.lastUpdated)) /
          (1000 * 60 * 60 * 24 * 30) >
          2;

      return {
        ...product,
        price: priceInfo ? priceInfo.price : null,
        lastUpdated: priceInfo ? priceInfo.lastUpdated : null,
        isOutdated,
      };
    });
  }, [data, selectedStoreId]);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">
        Galpão de Produtos por Mercado
      </h2>
      <div className="mb-4">
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
            {productsByStore.map((product) => (
              <tr key={product.id} className="border-b dark:border-gray-700">
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

// Componente Lista de Compras
const ShoppingListView = ({ data, shoppingList, onUpdateQuantity }) => {
  const { optimalList, savings } = useMemo(() => {
    if (shoppingList.length === 0) {
      return { optimalList: {}, savings: [] };
    }

    let optimal = {};
    let totalOptimalCost = 0;

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

        if (!optimal[storeName]) {
          optimal[storeName] = { storeId: bestPrice.storeId, items: [] };
        }
        optimal[storeName].items.push({ ...item, unitPrice: bestPrice.price });
        totalOptimalCost += bestPrice.price * item.quantity;
      } else {
        // Produto sem preço registrado em nenhum mercado
        const unknownStore = "Mercado não encontrado";
        if (!optimal[unknownStore]) {
          optimal[unknownStore] = { storeId: null, items: [] };
        }
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
          if (priceAtThisStore) {
            totalAtThisStore += priceAtThisStore.price * item.quantity;
          } else {
            canCalculate = false;
          }
        });

        if (canCalculate) {
          return {
            storeName: store.name,
            total: totalAtThisStore,
            saved: totalAtThisStore - totalOptimalCost,
          };
        }
        return null;
      })
      .filter((s) => s !== null);

    return { optimalList: optimal, savings: calculatedSavings };
  }, [data, shoppingList]);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Lista de Compras</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna 1: Itens a comprar */}
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
                  <input
                    type="number"
                    min="0"
                    value={item.quantity}
                    onChange={(e) => onUpdateQuantity(item.id, e.target.value)}
                    className="w-16 text-center bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Coluna 2: Lista Otimizada */}
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
                  <h4 className="font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                    {storeName}
                  </h4>
                  <ul className="space-y-2">
                    {details.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex justify-between items-baseline"
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

          {/* Coluna 3: Economia */}
          {savings.length > 0 && (
            <div className="mt-8">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <DollarSign size={20} /> Sua Economia
              </h3>
              <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg shadow">
                <p className="text-lg font-bold text-green-700 dark:text-green-300 mb-2">
                  Total Otimizado: R${" "}
                  {savings.reduce((acc, s) => (s.saved < acc.saved ? s : acc), {
                    saved: Infinity,
                  }).total -
                    savings
                      .reduce((acc, s) => (s.saved < acc.saved ? s : acc), {
                        saved: Infinity,
                      })
                      .saved.toFixed(2)}
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

// Componente Histórico
const History = ({ data }) => {
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
      <h2 className="text-2xl font-semibold mb-4">Histórico de Compras</h2>
      <div className="space-y-6">
        {purchases
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .map((purchase) => (
            <div
              key={purchase.id}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
            >
              <div className="flex justify-between items-center mb-3 pb-3 border-b dark:border-gray-700">
                <div>
                  <p className="font-bold text-lg">
                    {getStoreName(purchase.storeId)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <Calendar size={14} className="inline mr-1" />
                    {new Date(purchase.date).toLocaleDateString()} -
                    <span className="ml-1 font-semibold">{purchase.type}</span>
                  </p>
                </div>
                <p className="font-bold text-xl text-indigo-600 dark:text-indigo-400">
                  Total: R${" "}
                  {purchase.items
                    .reduce(
                      (total, item) => total + item.unitPrice * item.quantity,
                      0
                    )
                    .toFixed(2)}
                </p>
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
          ))}
      </div>
    </div>
  );
};

// Componente Modal
const Modal = ({ modal, onClose, data, onDataChange }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (modal.type === "editProduct" && modal.data) {
      setFormData(modal.data);
    } else if (modal.type === "addProduct") {
      setFormData({
        name: "",
        brand: "",
        category: data.categories[0] || "",
        photo: "",
      });
    }
  }, [modal, data.categories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modal.type === "addProduct") {
      const newProduct = { ...formData, id: `p${Date.now()}` };
      const newPhoto =
        newProduct.photo ||
        `https://placehold.co/100x100/e2e8f0/4a5568?text=${encodeURIComponent(
          newProduct.name
        )}`;
      onDataChange({
        ...data,
        products: [...data.products, { ...newProduct, photo: newPhoto }],
      });
    } else if (modal.type === "editProduct") {
      onDataChange({
        ...data,
        products: data.products.map((p) =>
          p.id === formData.id ? formData : p
        ),
      });
    }
    onClose();
  };

  if (!modal.isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
        >
          <X size={24} />
        </button>
        <h2 className="text-xl font-bold mb-4">
          {modal.type === "addProduct"
            ? "Adicionar Novo Produto"
            : "Editar Produto"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
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
            <label className="block text-sm font-medium mb-1">Categoria</label>
            <select
              name="category"
              value={formData.category || ""}
              onChange={handleChange}
              className="w-full input-style"
            >
              {data.categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
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
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Estilos reutilizáveis em classes para facilitar a manutenção
const globalStyles = `
  .input-style {
    @apply bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500;
  }
  .btn-primary {
    @apply bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors;
  }
  .btn-secondary {
    @apply bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg transition-colors;
  }
`;

// Adiciona os estilos globais ao head do documento
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = globalStyles;
document.head.appendChild(styleSheet);

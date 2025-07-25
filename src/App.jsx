import React, { useState, useEffect } from "react";
import { Search, Plus, Wrench, BarChart2 } from "lucide-react";
import { useShoppingData } from "./hooks/useShoppingData";
import Sidebar from "./components/shared/Sidebar.jsx";
import Toast from "./components/shared/Toast.jsx";
import ModalManager from "./components/shared/ModalManager.jsx";
import Dashboard from "./views/Dashboard.jsx";
import Galpao from "./views/Galpao.jsx";
import ShoppingListView from "./views/ShoppingListView.jsx";
import History from "./views/History.jsx";
import Management from "./views/Management.jsx";
import Analytics from "./views/Analytics.jsx";

export default function App() {
  const {
    data,
    toast,
    handleDataChange,
    handleExport,
    handleImport,
    showToast,
    calculateSuggestion,
  } = useShoppingData();

  const [activeView, setActiveView] = useState("dashboard");
  const [shoppingList, setShoppingList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [modal, setModal] = useState({ isOpen: false, type: "", data: null });
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
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

  const setShoppingListQuantity = (productId, quantity) => {
    setShoppingList((prev) => {
      const updatedList = prev.map((item) =>
        item.id === productId
          ? { ...item, quantity: Math.max(0, quantity) }
          : item
      );
      return updatedList.filter((item) => item.quantity > 0);
    });
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
            onSetQuantity={setShoppingListQuantity}
            calculateSuggestion={calculateSuggestion}
            showToast={showToast}
          />
        );
      case "historico":
        return <History data={data} onOpenModal={openModal} />;
      case "management":
        return <Management data={data} onDataChange={handleDataChange} />;
      case "analytics":
        return <Analytics data={data} />;
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
          shoppingListBadge={shoppingList.reduce(
            (sum, item) => sum + item.quantity,
            0
          )}
          onExport={handleExport}
          onImport={handleImport}
          theme={theme}
          toggleTheme={toggleTheme}
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <header className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            {["dashboard", "galpao"].includes(activeView) && (
              <div className="relative w-full md:flex-1">
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
            )}
            <div className="w-full md:w-auto flex items-center justify-end gap-4">
              {activeView === "historico" && (
                <button
                  onClick={() => openModal("addPurchase")}
                  className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                  <Plus size={20} /> Adicionar Compra
                </button>
              )}
              {["dashboard", "galpao"].includes(activeView) && (
                <button
                  onClick={() => openModal("addEditProduct")}
                  className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                  <Plus size={20} /> Adicionar Produto
                </button>
              )}
            </div>
          </header>
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

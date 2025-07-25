import {
  ShoppingCart,
  Package,
  Store,
  List,
  Archive,
  Download,
  Upload,
} from "lucide-react";
import NavItem from "./NavItem";
import ThemeSwitcher from "./ThemeSwitcher";

const Sidebar = ({
  activeView,
  setActiveView,
  shoppingListBadge,
  onExport,
  onImport,
  theme,
  toggleTheme,
}) => (
  <aside className="w-full md:w-64 bg-white dark:bg-gray-800 p-4 space-y-4 border-b md:border-r border-gray-200 dark:border-gray-700 flex flex-col">
    <div>
      <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2 mb-4">
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
    </div>
    <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
      <ThemeSwitcher theme={theme} toggleTheme={toggleTheme} />
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

export default Sidebar;

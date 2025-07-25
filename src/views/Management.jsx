import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

const Management = ({ data, onDataChange }) => {
  const { stores, categories } = data;
  const [newStoreName, setNewStoreName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");

  const handleAddStore = (e) => {
    e.preventDefault();
    if (!newStoreName.trim()) return;
    const newStore = { id: `s${Date.now()}`, name: newStoreName.trim() };
    onDataChange(
      { ...data, stores: [...stores, newStore] },
      "Mercado adicionado!"
    );
    setNewStoreName("");
  };

  const handleDeleteStore = (storeId) => {
    if (
      window.confirm(
        "Tem a certeza que deseja remover este mercado? A ação não pode ser desfeita."
      )
    ) {
      // Remove o mercado e todos os preços e compras associados a ele
      const newStores = data.stores.filter((s) => s.id !== storeId);
      const newPrices = data.prices.filter((p) => p.storeId !== storeId);
      const newPurchases = data.purchases.filter((p) => p.storeId !== storeId);
      onDataChange(
        {
          ...data,
          stores: newStores,
          prices: newPrices,
          purchases: newPurchases,
        },
        "Mercado removido!"
      );
    }
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const newCategories = [...categories, newCategoryName.trim()];
    onDataChange(
      { ...data, categories: newCategories },
      "Categoria adicionada!"
    );
    setNewCategoryName("");
  };

  const handleDeleteCategory = (categoryName) => {
    if (
      window.confirm(
        "Tem a certeza que deseja remover esta categoria? A ação não pode ser desfeita."
      )
    ) {
      const newCategories = data.categories.filter((c) => c !== categoryName);
      onDataChange(
        { ...data, categories: newCategories },
        "Categoria removida!"
      );
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Gestão de Dados</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Gestão de Mercados */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">Mercados</h3>
          <form onSubmit={handleAddStore} className="flex gap-2 mb-4">
            <input
              type="text"
              value={newStoreName}
              onChange={(e) => setNewStoreName(e.target.value)}
              placeholder="Nome do novo mercado"
              className="flex-grow bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-2 rounded-lg"
            >
              <Plus />
            </button>
          </form>
          <ul className="space-y-2">
            {stores.map((store) => (
              <li
                key={store.id}
                className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded"
              >
                <span>{store.name}</span>
                <button
                  onClick={() => handleDeleteStore(store.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Gestão de Categorias */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">Categorias</h3>
          <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Nome da nova categoria"
              className="flex-grow bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-2 rounded-lg"
            >
              <Plus />
            </button>
          </form>
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li
                key={cat}
                className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded"
              >
                <span>{cat}</span>
                <button
                  onClick={() => handleDeleteCategory(cat)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Management;

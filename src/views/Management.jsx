import { useState } from "react";
import { Plus, Trash2, Edit, Save, X } from "lucide-react";

const Management = ({ data, onDataChange }) => {
  const { stores, categories, products, purchases } = data;
  const [newStoreName, setNewStoreName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingStore, setEditingStore] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

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

  const handleUpdateStore = () => {
    if (!editingStore || !editingStore.name.trim()) return;
    const updatedStores = stores.map((s) =>
      s.id === editingStore.id ? editingStore : s
    );
    onDataChange({ ...data, stores: updatedStores }, "Mercado atualizado!");
    setEditingStore(null);
  };

  const handleDeleteStore = (storeId) => {
    const isStoreInUse = purchases.some((p) => p.storeId === storeId);
    if (isStoreInUse) {
      alert(
        "Este mercado não pode ser removido pois está associado a compras no histórico. Remova ou edite as compras primeiro."
      );
      return;
    }
    if (
      window.confirm(
        "Tem certeza que deseja remover este mercado? A ação não pode ser desfeita."
      )
    ) {
      const newStores = data.stores.filter((s) => s.id !== storeId);
      const newPrices = data.prices.filter((p) => p.storeId !== storeId);
      onDataChange(
        { ...data, stores: newStores, prices: newPrices },
        "Mercado removido!"
      );
    }
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim() || categories.includes(newCategoryName.trim()))
      return;
    const newCategories = [...categories, newCategoryName.trim()];
    onDataChange(
      { ...data, categories: newCategories },
      "Categoria adicionada!"
    );
    setNewCategoryName("");
  };

  const handleUpdateCategory = () => {
    if (!editingCategory || !editingCategory.newName.trim()) return;
    const updatedCategories = categories.map((c) =>
      c === editingCategory.oldName ? editingCategory.newName : c
    );
    const updatedProducts = products.map((p) =>
      p.category === editingCategory.oldName
        ? { ...p, category: editingCategory.newName }
        : p
    );
    onDataChange(
      { ...data, categories: updatedCategories, products: updatedProducts },
      "Categoria atualizada!"
    );
    setEditingCategory(null);
  };

  const handleDeleteCategory = (categoryName) => {
    const isCategoryInUse = products.some((p) => p.category === categoryName);
    if (isCategoryInUse) {
      alert(
        "Esta categoria não pode ser removida pois está em uso por produtos cadastrados. Altere a categoria dos produtos primeiro."
      );
      return;
    }
    if (
      window.confirm(
        "Tem certeza que deseja remover esta categoria? A ação não pode ser desfeita."
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
            <button type="submit" className="btn-primary p-2">
              <Plus />
            </button>
          </form>
          <ul className="space-y-2">
            {stores.map((store) => (
              <li
                key={store.id}
                className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded"
              >
                {editingStore?.id === store.id ? (
                  <input
                    type="text"
                    value={editingStore.name}
                    onChange={(e) =>
                      setEditingStore({ ...editingStore, name: e.target.value })
                    }
                    className="flex-grow bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md p-1"
                    autoFocus
                  />
                ) : (
                  <span>{store.name}</span>
                )}
                <div className="flex gap-2">
                  {editingStore?.id === store.id ? (
                    <>
                      <button
                        onClick={handleUpdateStore}
                        className="text-green-500 hover:text-green-700"
                      >
                        <Save size={18} />
                      </button>
                      <button
                        onClick={() => setEditingStore(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditingStore({ ...store })}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteStore(store.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
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
            <button type="submit" className="btn-primary p-2">
              <Plus />
            </button>
          </form>
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li
                key={cat}
                className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded"
              >
                {editingCategory?.oldName === cat ? (
                  <input
                    type="text"
                    value={editingCategory.newName}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        newName: e.target.value,
                      })
                    }
                    className="flex-grow bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md p-1"
                    autoFocus
                  />
                ) : (
                  <span>{cat}</span>
                )}
                <div className="flex gap-2">
                  {editingCategory?.oldName === cat ? (
                    <>
                      <button
                        onClick={handleUpdateCategory}
                        className="text-green-500 hover:text-green-700"
                      >
                        <Save size={18} />
                      </button>
                      <button
                        onClick={() => setEditingCategory(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() =>
                          setEditingCategory({ oldName: cat, newName: cat })
                        }
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Management;

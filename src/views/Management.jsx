import { useState, useMemo } from "react";
import { Plus, Trash2, Edit, Save, X, GitMerge } from "lucide-react";

// Função para simplificar strings para comparação
const simplifyString = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

const Management = ({ data, onDataChange, onOpenModal }) => {
  const { stores, categories, products, purchases } = data;
  const [activeTab, setActiveTab] = useState("stores"); // stores, categories, duplicates
  const [newStoreName, setNewStoreName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingStore, setEditingStore] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  const potentialDuplicates = useMemo(() => {
    const duplicates = [];
    const productList = [...products];

    for (let i = 0; i < productList.length; i++) {
      for (let j = i + 1; j < productList.length; j++) {
        const productA = productList[i];
        const productB = productList[j];

        const nameA = simplifyString(productA.name);
        const nameB = simplifyString(productB.name);
        const brandA = simplifyString(productA.brand);
        const brandB = simplifyString(productB.brand);

        // Critério de duplicata: nomes se contêm e marcas se contêm
        if (
          (nameA.includes(nameB) || nameB.includes(nameA)) &&
          (brandA.includes(brandB) || brandB.includes(brandA))
        ) {
          // Evita adicionar o mesmo par invertido
          if (
            !duplicates.some(
              (pair) => pair.includes(productA) && pair.includes(productB)
            )
          ) {
            duplicates.push([productA, productB]);
          }
        }
      }
    }
    return duplicates;
  }, [products]);

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
        "Este mercado não pode ser removido pois está associado a compras no histórico."
      );
      return;
    }
    if (window.confirm("Tem certeza? A ação não pode ser desfeita.")) {
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
        "Esta categoria não pode ser removida pois está em uso por produtos."
      );
      return;
    }
    if (window.confirm("Tem certeza? A ação não pode ser desfeita.")) {
      const newCategories = data.categories.filter((c) => c !== categoryName);
      onDataChange(
        { ...data, categories: newCategories },
        "Categoria removida!"
      );
    }
  };

  const TabButton = ({ tabName, label, count }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`${
        activeTab === tabName
          ? "border-indigo-500 text-indigo-600"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
      } flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
    >
      {label}
      {count > 0 && (
        <span className="bg-indigo-100 text-indigo-600 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">Gestão de Dados</h2>
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <TabButton tabName="stores" label="Mercados" count={stores.length} />
          <TabButton
            tabName="categories"
            label="Categorias"
            count={categories.length}
          />
          <TabButton
            tabName="duplicates"
            label="Duplicatas"
            count={potentialDuplicates.length}
          />
        </nav>
      </div>

      {activeTab === "stores" && (
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
      )}

      {activeTab === "categories" && (
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
      )}

      {activeTab === "duplicates" && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">
            Potenciais Duplicatas Encontradas
          </h3>
          {potentialDuplicates.length === 0 ? (
            <p className="text-gray-500">
              Nenhum produto duplicado encontrado. Tudo certo!
            </p>
          ) : (
            <div className="space-y-4">
              {potentialDuplicates.map(([productA, productB], index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex flex-col md:flex-row justify-between items-center gap-4"
                >
                  <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-sm">
                      <p className="font-bold">{productA.name}</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {productA.brand}
                      </p>
                      <p className="text-xs bg-gray-200 dark:bg-gray-600 inline-block px-2 py-0.5 rounded-full mt-1">
                        {productA.category}
                      </p>
                    </div>
                    <div className="text-sm">
                      <p className="font-bold">{productB.name}</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {productB.brand}
                      </p>
                      <p className="text-xs bg-gray-200 dark:bg-gray-600 inline-block px-2 py-0.5 rounded-full mt-1">
                        {productB.category}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      onOpenModal("mergeDuplicates", { productA, productB })
                    }
                    className="btn-primary flex-shrink-0 flex items-center gap-2"
                  >
                    <GitMerge size={18} />
                    Unificar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Management;

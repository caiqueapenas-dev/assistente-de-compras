import { useState, useEffect } from "react";
import { Plus, AlertTriangle } from "lucide-react";
import CurrencyInput from "../shared/CurrencyInput";

const AddEditProductForm = ({
  productToEdit,
  allData,
  onClose,
  onDataChange,
  onProductCreated,
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
  const [similarProducts, setSimilarProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (formData.name && !productToEdit) {
      const searchName = formData.name.trim().toLowerCase();
      const found = allData.products.filter((p) =>
        p.name.toLowerCase().includes(searchName)
      );
      setSimilarProducts(found);
    } else {
      setSimilarProducts([]);
    }
  }, [formData.name, allData.products, productToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (value) => {
    setPriceData((prev) => ({ ...prev, price: value }));
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
    if (productToEdit) {
      const updatedProducts = allData.products.map((p) =>
        p.id === productToEdit.id ? { ...formData, id: productToEdit.id } : p
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

      const newData = {
        ...allData,
        products: [...allData.products, newProduct],
        prices: [...allData.prices, newPriceEntry],
      };

      onDataChange(newData, "Produto adicionado com sucesso!");

      // Se o modal foi aberto a partir do form de compras,
      // chama o callback em vez de fechar tudo
      if (onProductCreated) {
        onProductCreated(newProduct);
      }
    }
    // Fecha apenas o modal atual
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-semibold">
          {productToEdit ? "Editar Produto" : "Adicionar Novo Produto"}
        </h2>
      </div>
      <div className="p-6 max-h-[60vh] overflow-y-auto">
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
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2"
              required
            />
            {similarProducts.length > 0 && (
              <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                  <AlertTriangle size={16} /> Atenção: Produtos similares já
                  existem
                </p>
                <ul className="list-disc list-inside text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  {similarProducts.map((p) => (
                    <li key={p.id}>
                      {p.name} ({p.brand})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Marca</label>
            <input
              type="text"
              name="brand"
              value={formData.brand || ""}
              onChange={handleChange}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Categoria</label>
            <select
              name="category"
              value={formData.category || ""}
              onChange={handleChange}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2"
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
                <select
                  name="storeId"
                  value={priceData.storeId}
                  onChange={(e) =>
                    setPriceData((prev) => ({
                      ...prev,
                      storeId: e.target.value,
                    }))
                  }
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2"
                  required
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
                  Preço Inicial (R$)
                </label>
                <CurrencyInput
                  value={priceData.price}
                  onChange={handlePriceChange}
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2"
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
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2 mb-2"
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
  );
};

export default AddEditProductForm;

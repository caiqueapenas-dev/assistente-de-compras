import { useState, useEffect } from "react";
import { DollarSign, AlertTriangle } from "lucide-react";
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
  const [marketPrices, setMarketPrices] = useState({});
  const [priceData, setPriceData] = useState({
    storeId: allData.stores[0]?.id || "",
    price: "",
  });
  const [similarProducts, setSimilarProducts] = useState([]);

  useEffect(() => {
    if (productToEdit) {
      const initialPrices = {};
      allData.stores.forEach((store) => {
        const priceEntry = allData.prices.find(
          (p) => p.productId === productToEdit.id && p.storeId === store.id
        );
        initialPrices[store.id] = priceEntry ? priceEntry.price : "";
      });
      setMarketPrices(initialPrices);
    }
  }, [productToEdit, allData.stores, allData.prices]);

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

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleMarketPriceChange = (storeId, value) =>
    setMarketPrices((prev) => ({ ...prev, [storeId]: value }));
  const handlePriceChange = (value) =>
    setPriceData((prev) => ({ ...prev, price: value }));
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () =>
        setFormData((prev) => ({ ...prev, photo: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (productToEdit) {
      // MODO EDIÇÃO
      const updatedProducts = allData.products.map((p) =>
        p.id === productToEdit.id ? { ...formData, id: productToEdit.id } : p
      );
      let updatedPrices = allData.prices.filter(
        (p) => p.productId !== productToEdit.id
      ); // Remove todos os preços antigos do produto
      const newLastUpdated = new Date().toISOString();
      Object.entries(marketPrices).forEach(([storeId, price]) => {
        const priceValue = parseFloat(price);
        if (priceValue > 0) {
          updatedPrices.push({
            productId: productToEdit.id,
            storeId,
            price: priceValue,
            lastUpdated: newLastUpdated,
          });
        }
      });
      onDataChange(
        { ...allData, products: updatedProducts, prices: updatedPrices },
        "Produto e preços atualizados!"
      );
    } else {
      // MODO CRIAÇÃO
      if (!priceData.storeId || !priceData.price || priceData.price <= 0) {
        alert("Selecione um mercado e insira um preço inicial válido.");
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
      onDataChange(newData, "Produto adicionado!");
      if (onProductCreated) onProductCreated(newProduct);
    }
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
            <label className="block text-sm font-medium mb-1">Nome</label>
            <input
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              className="w-full bg-gray-50 dark:bg-gray-700 border rounded-lg p-2"
              required
            />
            {similarProducts.length > 0 && (
              <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/30 border rounded-lg">
                <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                  <AlertTriangle size={16} /> Produtos similares já existem
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
              className="w-full bg-gray-50 dark:bg-gray-700 border rounded-lg p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Categoria</label>
            <select
              name="category"
              value={formData.category || ""}
              onChange={handleChange}
              className="w-full bg-gray-50 dark:bg-gray-700 border rounded-lg p-2"
            >
              {allData.categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Foto (URL ou Upload)
            </label>
            <input
              type="text"
              name="photo"
              placeholder="Cole uma URL ou faça upload"
              value={formData.photo || ""}
              onChange={handleChange}
              className="w-full bg-gray-50 dark:bg-gray-700 border rounded-lg p-2 mb-2"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>
        </div>
        {productToEdit ? (
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <DollarSign size={20} /> Preços nos Mercados
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allData.stores.map((store) => (
                <div key={store.id}>
                  <label className="block text-sm font-medium mb-1">
                    {store.name}
                  </label>
                  <CurrencyInput
                    value={marketPrices[store.id] || ""}
                    onChange={(value) =>
                      handleMarketPriceChange(store.id, value)
                    }
                    className="w-full bg-gray-50 dark:bg-gray-700 border rounded-lg p-2"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Registrar em qual Mercado?
              </label>
              <select
                name="storeId"
                value={priceData.storeId}
                onChange={(e) =>
                  setPriceData((prev) => ({ ...prev, storeId: e.target.value }))
                }
                className="w-full bg-gray-50 dark:bg-gray-700 border rounded-lg p-2"
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
                className="w-full bg-gray-50 dark:bg-gray-700 border rounded-lg p-2"
                required
              />
            </div>
          </div>
        )}
      </div>
      <div className="bg-gray-50 dark:bg-gray-900/50 p-4 flex justify-end gap-3 rounded-b-lg border-t">
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

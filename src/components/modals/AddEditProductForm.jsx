import { useState } from "react";
import { Plus } from "lucide-react";
import ModalManager from "../shared/ModalManager";

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
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2"
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
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2"
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
                  <div className="flex items-center gap-2">
                    <select
                      name="storeId"
                      value={priceData.storeId}
                      onChange={handlePriceChange}
                      className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2"
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
                      className="p-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg transition-colors flex-shrink-0"
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
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2"
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
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
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

export default AddEditProductForm;

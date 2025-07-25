import { useState } from "react";
import { X, Trash2, Edit } from "lucide-react";
import ModalManager from "../shared/ModalManager";

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

export default ProductDetailModal;

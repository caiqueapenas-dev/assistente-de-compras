import { Edit, Trash2 } from "lucide-react";
import { formatCurrency } from "../../utils/formatters"; // <<-- CAMINHO CORRIGIDO AQUI

const ProductDetailModal = ({
  product,
  allData,
  onClose,
  onDataChange,
  onOpenModal,
}) => {
  const { stores, prices } = allData;

  const productPrices = prices
    .filter((p) => p.productId === product.id)
    .map((p) => ({
      ...p,
      storeName:
        stores.find((s) => s.id === p.storeId)?.name || "Mercado desconhecido",
    }))
    .sort((a, b) => a.price - b.price);

  return (
    <div className="overflow-hidden">
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <img
              src={product.photo}
              alt={product.name}
              className="w-full h-auto object-cover rounded-lg shadow-md"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://placehold.co/100x100/e2e8f0/4a5568?text=Imagem";
              }}
            />
          </div>
          <div className="md:col-span-2">
            <span className="text-sm bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded-full">
              {product.category}
            </span>
            <h2 className="text-3xl font-bold mt-2">{product.name}</h2>
            <p className="text-lg text-gray-500 dark:text-gray-400">
              {product.brand}
            </p>
            <div className="mt-4">
              <h3 className="font-semibold text-md">Preços Registrados</h3>
              {productPrices.length > 0 ? (
                <ul className="mt-2 space-y-2">
                  {productPrices.map((p) => (
                    <li
                      key={p.storeId}
                      className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md"
                    >
                      <span>{p.storeName}</span>
                      <span className="font-bold">
                        {formatCurrency(p.price)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400 mt-2">
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
          onClick={() => onOpenModal("deleteConfirmation", product)}
          className="btn-danger flex items-center gap-2"
        >
          <Trash2 size={16} /> Excluir
        </button>
        <button
          type="button"
          onClick={() =>
            onOpenModal("addEditProduct", { productToEdit: product })
          }
          className="btn-primary flex items-center gap-2"
        >
          <Edit size={16} /> Editar
        </button>
        <button type="button" onClick={onClose} className="btn-secondary">
          Fechar
        </button>
      </div>
    </div>
  );
};

export default ProductDetailModal;

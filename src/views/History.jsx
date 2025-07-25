import { useState, useMemo } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
      >
        <ChevronsLeft size={20} />
      </button>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
      >
        <ChevronLeft size={20} />
      </button>
      <span className="font-semibold">
        Página {currentPage} de {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
      >
        <ChevronRight size={20} />
      </button>
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
      >
        <ChevronsRight size={20} />
      </button>
    </div>
  );
};

const History = ({ data, onOpenModal }) => {
  const { stores, purchases, products } = data;
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const sortedPurchases = useMemo(() => {
    return [...purchases].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [purchases]);

  const paginatedPurchases = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedPurchases.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, sortedPurchases]);

  const totalPages = Math.ceil(sortedPurchases.length / ITEMS_PER_PAGE);

  const getStoreName = (storeId) =>
    stores.find((s) => s.id === storeId)?.name || "Desconhecido";
  const getProductDetails = (productId) =>
    products.find((p) => p.id === productId) || {
      name: "Produto Removido",
      brand: "",
    };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Histórico de Compras</h2>
        <button
          onClick={() => onOpenModal("addPurchase")}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
        >
          <Plus size={18} /> Adicionar Compra
        </button>
      </div>
      <div className="space-y-6">
        {paginatedPurchases.map((purchase) => (
          <div
            key={purchase.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow"
          >
            <div className="p-4">
              <div className="flex justify-between items-start mb-3 pb-3 border-b dark:border-gray-700">
                <div>
                  <p className="font-bold text-lg">
                    {getStoreName(purchase.storeId)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <Calendar size={14} />
                    {new Date(purchase.date).toLocaleDateString()} -{" "}
                    <span className="font-semibold">{purchase.type}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xl text-indigo-600 dark:text-indigo-400">
                    Total: R${" "}
                    {purchase.items
                      .reduce(
                        (total, item) => total + item.unitPrice * item.quantity,
                        0
                      )
                      .toFixed(2)}
                  </p>
                  <div className="flex items-center justify-end gap-3 mt-1">
                    <button
                      onClick={() => onOpenModal("editPurchase", purchase)}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                    >
                      <Edit size={14} /> Editar
                    </button>
                    <button
                      onClick={() => onOpenModal("deletePurchase", purchase)}
                      className="text-sm text-red-600 hover:text-red-800 font-semibold flex items-center gap-1"
                    >
                      <Trash2 size={14} /> Excluir
                    </button>
                  </div>
                </div>
              </div>
              <ul className="space-y-2">
                {purchase.items.map((item, index) => {
                  const product = getProductDetails(item.productId);
                  return (
                    <li
                      key={index}
                      className="flex justify-between items-center text-sm"
                    >
                      <span>
                        {item.quantity}x {product.name} ({product.brand})
                      </span>
                      <span className="font-mono">
                        @ R$ {item.unitPrice.toFixed(2)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;

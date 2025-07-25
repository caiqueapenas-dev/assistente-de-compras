import { X, AlertCircle } from "lucide-react";

const DeletePurchaseConfirmationModal = ({
  purchase,
  allData,
  onClose,
  onDataChange,
}) => {
  const handleDelete = () => {
    const updatedPurchases = allData.purchases.filter(
      (p) => p.id !== purchase.id
    );
    const newData = {
      ...allData,
      purchases: updatedPurchases,
    };
    onDataChange(newData, "Compra excluída com sucesso!");
    onClose();
  };

  const storeName =
    allData.stores.find((s) => s.id === purchase.storeId)?.name ||
    "Mercado Desconhecido";
  const purchaseDate = new Date(purchase.date).toLocaleDateString();

  return (
    <div className="relative">
      <button
        onClick={onClose}
        className="absolute -top-2 -right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 z-10"
      >
        <X size={24} />
      </button>
      <div className="p-6 text-center sm:text-left">
        <div className="sm:flex sm:items-start sm:gap-4">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 sm:mx-0 sm:h-10 sm:w-10">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <div className="mt-3 sm:mt-0">
            <h3 className="text-lg leading-6 font-bold text-gray-900 dark:text-gray-100">
              Excluir Registro de Compra
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tem certeza que deseja excluir o registro da compra feita em{" "}
                <strong>{storeName}</strong> no dia{" "}
                <strong>{purchaseDate}</strong>?
                <br />
                Esta ação não pode ser desfeita.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 sm:flex sm:flex-row-reverse rounded-b-lg">
        <button
          type="button"
          onClick={handleDelete}
          className="btn-danger w-full sm:w-auto sm:ml-3"
        >
          Excluir
        </button>
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors w-full mt-3 sm:w-auto sm:mt-0"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default DeletePurchaseConfirmationModal;

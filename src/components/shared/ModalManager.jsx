import AddEditProductForm from "../modals/AddEditProductForm";
import AddPurchaseForm from "../modals/AddPurchaseForm";
import DeleteConfirmationModal from "../modals/DeleteConfirmationModal";
import DeletePurchaseConfirmationModal from "../modals/DeletePurchaseConfirmationModal";
import ProductDetailModal from "../modals/ProductDetailModal.jsx";
import QuickPriceUpdateModal from "../modals/QuickPriceUpdateModal.jsx";

const ModalManager = ({ modal, onClose, data, onDataChange, onOpenModal }) => {
  if (!modal.isOpen) return null;

  const renderModalContent = () => {
    switch (modal.type) {
      case "productDetail":
        return (
          <ProductDetailModal
            product={modal.data}
            allData={data}
            onClose={onClose}
            onDataChange={onDataChange}
          />
        );
      case "addEditProduct":
        return (
          <AddEditProductForm
            productToEdit={modal.data?.productToEdit}
            onProductCreated={modal.data?.onProductCreated} // Callback para o form de compras
            allData={data}
            onClose={onClose}
            onDataChange={onDataChange}
          />
        );
      case "deleteConfirmation":
        return (
          <DeleteConfirmationModal
            item={modal.data}
            allData={data}
            onClose={onClose}
            onDataChange={onDataChange}
          />
        );
      case "addPurchase":
        return (
          <AddPurchaseForm
            purchaseToEdit={modal.data}
            allData={data}
            onClose={onClose}
            onDataChange={onDataChange}
            onOpenModal={onOpenModal}
          />
        );
      case "deletePurchase":
        return (
          <DeletePurchaseConfirmationModal
            purchase={modal.data}
            allData={data}
            onClose={onClose}
            onDataChange={onDataChange}
          />
        );
      case "quickPriceUpdate":
        return (
          <QuickPriceUpdateModal
            product={modal.data.product}
            storeId={modal.data.storeId}
            allData={data}
            onClose={onClose}
            onDataChange={onDataChange}
          />
        );
      default:
        return null;
    }
  };

  const getModalMaxWidth = () => {
    switch (modal.type) {
      case "deleteConfirmation":
      case "deletePurchase":
      case "quickPriceUpdate":
        return "max-w-lg";
      case "addEditProduct":
        return "max-w-2xl";
      case "productDetail":
        return "max-w-4xl";
      case "addPurchase":
        return "max-w-6xl"; // Aumentado para o novo formulário
      default:
        return "max-w-3xl";
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-40 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full ${getModalMaxWidth()} relative animate-scale-in`}
      >
        {renderModalContent()}
      </div>
    </div>
  );
};

export default ModalManager;

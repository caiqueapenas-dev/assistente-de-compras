import AddEditProductForm from "../modals/AddEditProductForm";
import AddPurchaseForm from "../modals/AddPurchaseForm";
import AddStoreForm from "../modals/AddStoreForm";
import DeleteConfirmationModal from "../modals/DeleteConfirmationModal";
import DeletePurchaseConfirmationModal from "../modals/DeletePurchaseConfirmationModal";
import EditPurchaseForm from "../modals/EditPurchaseForm";
import ProductDetailModal from "../modals/ProductDetailModal.jsx";

const ModalManager = ({ modal, onClose, data, onDataChange }) => {
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
            productToEdit={modal.data}
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
            allData={data}
            onClose={onClose}
            onDataChange={onDataChange}
          />
        );
      case "editPurchase":
        return (
          <EditPurchaseForm
            purchaseToEdit={modal.data}
            allData={data}
            onClose={onClose}
            onDataChange={onDataChange}
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
      case "addStore":
        return (
          <AddStoreForm
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
      case "addStore":
        return "max-w-lg";
      case "addEditProduct":
        return "max-w-2xl";
      case "productDetail":
      case "addPurchase":
      case "editPurchase":
        return "max-w-4xl";
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

import { useState } from "react";
import { GitMerge, ArrowRight } from "lucide-react";

const MergeDuplicatesModal = ({ products, allData, onClose, onDataChange }) => {
  const { productA, productB } = products;
  const [mainProductId, setMainProductId] = useState(productA.id);

  const mainProduct = mainProductId === productA.id ? productA : productB;
  const duplicateProduct = mainProductId === productA.id ? productB : productA;

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. Atualizar o histórico de compras e a lista de compras
    const updatedPurchases = allData.purchases.map((purchase) => ({
      ...purchase,
      items: purchase.items.map((item) =>
        item.productId === duplicateProduct.id
          ? { ...item, productId: mainProduct.id }
          : item
      ),
    }));

    // 2. Unificar os preços de forma segura
    const otherPrices = allData.prices.filter(
      (p) =>
        p.productId !== mainProduct.id && p.productId !== duplicateProduct.id
    );

    const mainPrices = allData.prices.filter(
      (p) => p.productId === mainProduct.id
    );
    const dupPrices = allData.prices.filter(
      (p) => p.productId === duplicateProduct.id
    );

    const mergedPrices = [...mainPrices];

    dupPrices.forEach((dupPrice) => {
      const conflictingMainPrice = mergedPrices.find(
        (mainPrice) => mainPrice.storeId === dupPrice.storeId
      );
      if (conflictingMainPrice) {
        // Se houver conflito, mantém o preço mais recente.
        if (
          new Date(dupPrice.lastUpdated) >
          new Date(conflictingMainPrice.lastUpdated)
        ) {
          conflictingMainPrice.price = dupPrice.price;
          conflictingMainPrice.lastUpdated = dupPrice.lastUpdated;
        }
      } else {
        // Se não houver conflito, apenas adiciona o preço ao produto principal.
        mergedPrices.push({ ...dupPrice, productId: mainProduct.id });
      }
    });

    // 3. Remover o produto duplicado
    const updatedProducts = allData.products.filter(
      (p) => p.id !== duplicateProduct.id
    );

    onDataChange(
      {
        ...allData,
        products: updatedProducts,
        purchases: updatedPurchases,
        prices: [...otherPrices, ...mergedPrices],
      },
      "Produtos unificados com sucesso!"
    );

    onClose();
  };

  const ProductOption = ({ product, isSelected, onSelect }) => (
    <div
      onClick={onSelect}
      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
        isSelected
          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"
          : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
      }`}
    >
      <p className="font-bold text-lg">{product.name}</p>
      <p className="text-gray-600 dark:text-gray-400">{product.brand}</p>
      <p className="text-sm bg-gray-200 dark:bg-gray-700 inline-block px-2 py-1 rounded-full mt-2">
        {product.category}
      </p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="overflow-hidden">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-semibold flex items-center gap-3">
          <GitMerge /> Unificar Produtos
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Selecione qual versão manter. Os dados do outro produto (histórico e
          preços) serão transferidos para a versão principal.
        </p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <ProductOption
            product={productA}
            isSelected={mainProductId === productA.id}
            onSelect={() => setMainProductId(productA.id)}
          />
          <ProductOption
            product={productB}
            isSelected={mainProductId === productB.id}
            onSelect={() => setMainProductId(productB.id)}
          />
        </div>

        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-900/50 rounded-lg flex flex-col md:flex-row items-center justify-center text-center gap-4">
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-500">SERÁ EXCLUÍDO</p>
            <p>
              {duplicateProduct.name} ({duplicateProduct.brand})
            </p>
          </div>
          <ArrowRight className="text-gray-500" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-500">SERÁ MANTIDO</p>
            <p className="font-bold">
              {mainProduct.name} ({mainProduct.brand})
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900/50 p-4 flex justify-end gap-3 rounded-b-lg border-t">
        <button type="button" onClick={onClose} className="btn-secondary">
          Cancelar
        </button>
        <button type="submit" className="btn-primary">
          Confirmar Unificação
        </button>
      </div>
    </form>
  );
};

export default MergeDuplicatesModal;

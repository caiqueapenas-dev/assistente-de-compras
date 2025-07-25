import { useState, useMemo, useEffect } from "react";
import { Plus, Trash2, Building } from "lucide-react";
import {
  formatCurrency,
  parseDateString,
  formatDateForInput,
} from "../../utils/formatters";
import PurchaseItem from "./PurchaseItem"; // Importando o novo componente

const AddPurchaseForm = ({
  purchaseToEdit,
  allData,
  onClose,
  onDataChange,
  onOpenModal,
}) => {
  const { stores } = allData;
  const [date, setDate] = useState(
    formatDateForInput(
      purchaseToEdit ? parseDateString(purchaseToEdit.date) : new Date()
    )
  );
  const [marketGroups, setMarketGroups] = useState([]);

  // Inicializa os grupos de mercado
  useEffect(() => {
    if (purchaseToEdit) {
      // Se estiver editando, cria um grupo com os dados existentes
      const initialGroup = {
        localId: `group_${Date.now()}`,
        storeId: purchaseToEdit.storeId,
        items: purchaseToEdit.items.map((item) => ({
          ...item,
          localId: `item_${Date.now()}_${Math.random()}`,
          purchaseType: item.weight > 0 ? "weight" : "unit",
        })),
      };
      setMarketGroups([initialGroup]);
    } else if (stores.length > 0) {
      // Se estiver criando, começa com um grupo vazio
      setMarketGroups([
        { localId: `group_${Date.now()}`, storeId: stores[0].id, items: [] },
      ]);
    }
  }, [purchaseToEdit, stores]);

  const handleGroupChange = (localId, field, value) => {
    setMarketGroups((currentGroups) =>
      currentGroups.map((group) =>
        group.localId === localId ? { ...group, [field]: value } : group
      )
    );
  };

  const handleItemChange = (groupId, itemId, field, value) => {
    setMarketGroups((currentGroups) =>
      currentGroups.map((group) => {
        if (group.localId === groupId) {
          const updatedItems = group.items.map((item) =>
            item.localId === itemId ? { ...item, [field]: value } : item
          );
          return { ...group, items: updatedItems };
        }
        return group;
      })
    );
  };

  const addNewItemToGroup = (groupId) => {
    setMarketGroups((currentGroups) =>
      currentGroups.map((group) => {
        if (group.localId === groupId) {
          const newItem = {
            localId: `item_${Date.now()}_${Math.random()}`,
            productId: "",
            quantity: 1,
            unitPrice: 0,
            purchaseType: "unit",
            weight: 0,
          };
          return { ...group, items: [...group.items, newItem] };
        }
        return group;
      })
    );
  };

  const removeItemFromGroup = (groupId, itemId) => {
    setMarketGroups((currentGroups) =>
      currentGroups.map((group) => {
        if (group.localId === groupId) {
          const filteredItems = group.items.filter(
            (item) => item.localId !== itemId
          );
          return { ...group, items: filteredItems };
        }
        return group;
      })
    );
  };

  const addNewMarketGroup = () => {
    const newGroup = {
      localId: `group_${Date.now()}`,
      storeId: stores[0]?.id || "",
      items: [],
    };
    setMarketGroups([...marketGroups, newGroup]);
  };

  const removeMarketGroup = (groupId) => {
    setMarketGroups(marketGroups.filter((g) => g.localId !== groupId));
  };

  const totalCost = useMemo(() => {
    return marketGroups.reduce((total, group) => {
      const groupTotal = group.items.reduce((itemTotal, item) => {
        if (item.purchaseType === "unit") {
          return itemTotal + item.quantity * item.unitPrice;
        }
        if (item.purchaseType === "weight" && item.unitPrice > 0) {
          return itemTotal + (item.weight / 1000) * item.unitPrice;
        }
        return itemTotal;
      }, 0);
      return total + groupTotal;
    }, 0);
  }, [marketGroups]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (marketGroups.some((g) => g.items.length === 0)) {
      alert("Todos os grupos de mercado devem ter pelo menos um item.");
      return;
    }

    const newPurchases = marketGroups.map((group) => ({
      id: `p_${Date.now()}_${group.storeId}`,
      date: parseDateString(date).toISOString(),
      storeId: group.storeId,
      items: group.items.map((item) => ({
        productId: item.productId,
        quantity: item.purchaseType === "unit" ? Number(item.quantity) : 0,
        weight: item.purchaseType === "weight" ? Number(item.weight) : 0,
        unitPrice: Number(item.unitPrice),
      })),
    }));

    let updatedPrices = [...allData.prices];
    marketGroups
      .flatMap((g) => g.items.map((i) => ({ ...i, storeId: g.storeId })))
      .forEach((item) => {
        if (!item.productId || !item.storeId) return;
        const priceIndex = updatedPrices.findIndex(
          (p) => p.productId === item.productId && p.storeId === item.storeId
        );
        const newPriceData = {
          productId: item.productId,
          storeId: item.storeId,
          price: Number(item.unitPrice),
          lastUpdated: parseDateString(date).toISOString(),
        };

        if (priceIndex > -1) {
          updatedPrices[priceIndex] = newPriceData;
        } else {
          updatedPrices.push(newPriceData);
        }
      });

    const finalPurchases = purchaseToEdit
      ? allData.purchases
          .filter((p) => p.id !== purchaseToEdit.id)
          .concat(newPurchases)
      : [...allData.purchases, ...newPurchases];

    onDataChange(
      {
        ...allData,
        purchases: finalPurchases.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        ),
        prices: updatedPrices,
      },
      purchaseToEdit
        ? "Compra atualizada com sucesso!"
        : "Compra adicionada com sucesso!"
    );
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[90vh]">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-semibold">
          {purchaseToEdit ? "Editar Compra" : "Adicionar Nova Compra"}
        </h2>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-2 w-full md:w-auto bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2"
          required
        />
      </div>

      <div className="p-6 flex-grow overflow-y-auto space-y-6">
        {marketGroups.map((group, groupIndex) => (
          <div
            key={group.localId}
            className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Building className="text-gray-500" />
                <select
                  value={group.storeId}
                  onChange={(e) =>
                    handleGroupChange(group.localId, "storeId", e.target.value)
                  }
                  className="font-semibold bg-transparent text-lg border-b-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:border-indigo-500"
                >
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              {marketGroups.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMarketGroup(group.localId)}
                  className="p-2 text-red-500 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>

            <div className="space-y-4">
              {group.items.map((item) => (
                <PurchaseItem
                  key={item.localId}
                  item={item}
                  allData={{ ...allData, storeId: group.storeId }}
                  onItemChange={(field, value) =>
                    handleItemChange(group.localId, item.localId, field, value)
                  }
                  onRemove={() =>
                    removeItemFromGroup(group.localId, item.localId)
                  }
                  onOpenModal={onOpenModal}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => addNewItemToGroup(group.localId)}
              className="w-full mt-4 flex items-center justify-center gap-2 py-2 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
            >
              <Plus size={20} /> Adicionar Item a este Mercado
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addNewMarketGroup}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 rounded-lg font-semibold hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors"
        >
          <Plus size={20} /> Adicionar Outro Mercado
        </button>
      </div>

      <div className="p-4 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center rounded-b-lg border-t border-gray-200 dark:border-gray-700">
        <span className="text-xl font-bold">
          Total: {formatCurrency(totalCost)}
        </span>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" className="btn-primary">
            Salvar Compra
          </button>
        </div>
      </div>
    </form>
  );
};

export default AddPurchaseForm;

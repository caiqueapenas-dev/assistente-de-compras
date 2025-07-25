import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Package,
  Store,
} from "lucide-react";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <p className="label font-bold">{`${label}`}</p>
        <p className="intro text-indigo-500">{`Gasto: R$ ${payload[0].value.toFixed(
          2
        )}`}</p>
      </div>
    );
  }
  return null;
};

const Analytics = ({ data }) => {
  const { products, stores, purchases } = data;

  const analyticsData = useMemo(() => {
    const totalSpent = purchases.reduce(
      (acc, p) =>
        acc + p.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
      0
    );
    const monthlyAverage =
      totalSpent /
      (purchases.length > 0 ? new Date(purchases[0].date).getMonth() + 1 : 1);

    // Gastos por categoria (últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const categorySpending = purchases
      .filter((p) => new Date(p.date) > sixMonthsAgo)
      .flatMap((p) => p.items)
      .reduce((acc, item) => {
        const product = products.find((p) => p.id === item.productId);
        if (product) {
          const category = product.category;
          const cost = item.unitPrice * item.quantity;
          acc[category] = (acc[category] || 0) + cost;
        }
        return acc;
      }, {});

    const categoryData = Object.entries(categorySpending)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Evolução de gastos mensais
    const monthlySpending = purchases.reduce((acc, p) => {
      const month = new Date(p.date).toLocaleString("default", {
        month: "short",
        year: "2-digit",
      });
      const cost = p.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
      acc[month] = (acc[month] || 0) + cost;
      return acc;
    }, {});

    const monthlyData = Object.entries(monthlySpending)
      .map(([name, value]) => ({ name, value }))
      .reverse();

    // Produtos mais comprados (por quantidade)
    const topProducts = purchases
      .flatMap((p) => p.items)
      .reduce((acc, item) => {
        const product = products.find((p) => p.id === item.productId);
        if (product) {
          acc[product.name] = (acc[product.name] || 0) + item.quantity;
        }
        return acc;
      }, {});

    const topProductsData = Object.entries(topProducts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // Gasto por mercado
    const storeSpending = purchases.reduce((acc, p) => {
      const store = stores.find((s) => s.id === p.storeId);
      if (store) {
        const cost = p.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
        acc[store.name] = (acc[store.name] || 0) + cost;
      }
      return acc;
    }, {});

    const storeSpendingData = Object.entries(storeSpending)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return {
      totalSpent,
      monthlyAverage,
      totalPurchases: purchases.length,
      totalItems: purchases.flatMap((p) => p.items).length,
      categoryData,
      monthlyData,
      topProductsData,
      storeSpendingData,
    };
  }, [products, stores, purchases]);

  const StatCard = ({ icon, title, value, color }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center gap-4">
      <div className={`p-3 rounded-full ${color}`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Análise de Compras</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<DollarSign size={24} className="text-white" />}
          title="Total Gasto"
          value={`R$ ${analyticsData.totalSpent.toFixed(2)}`}
          color="bg-green-500"
        />
        <StatCard
          icon={<TrendingUp size={24} className="text-white" />}
          title="Média Mensal"
          value={`R$ ${analyticsData.monthlyAverage.toFixed(2)}`}
          color="bg-blue-500"
        />
        <StatCard
          icon={<ShoppingCart size={24} className="text-white" />}
          title="Total de Compras"
          value={analyticsData.totalPurchases}
          color="bg-yellow-500"
        />
        <StatCard
          icon={<Package size={24} className="text-white" />}
          title="Total de Itens"
          value={analyticsData.totalItems}
          color="bg-red-500"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="font-bold text-lg mb-4">
            Gasto por Categoria (Últimos 6 meses)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {analyticsData.categoryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="font-bold text-lg mb-4">
            Evolução dos Gastos Mensais
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `R$${value}`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                name="Gasto Mensal"
                stroke="#8884d8"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md lg:col-span-2">
          <h3 className="font-bold text-lg mb-4">
            Top 10 Produtos Mais Comprados (por quantidade)
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              layout="vertical"
              data={analyticsData.topProductsData}
              margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip
                cursor={{ fill: "rgba(230, 230, 230, 0.5)" }}
                formatter={(value) => `${value} un.`}
              />
              <Legend />
              <Bar dataKey="value" name="Quantidade Comprada" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md lg:col-span-2">
          <h3 className="font-bold text-lg mb-4">
            Comparação de Gasto por Mercado
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.storeSpendingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `R$${value}`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="value" name="Total Gasto" fill="#FFBB28" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

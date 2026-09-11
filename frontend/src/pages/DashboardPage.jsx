import React, { useEffect, useState } from 'react';
import dashboardService from '../services/dashboardService';
import {
  ShoppingBag,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  Boxes,
  Users,
  RefreshCw,
  TrendingUp,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import toast from 'react-hot-toast';

// Clean initial metrics (0 data for step-by-step learning)
const initialStats = {
  todayOrders: 0,
  runningOrders: 0,
  completedOrders: 0,
  rejectedProducts: 0,
  finishedGoods: 0,
  activeEmployees: 0,
  dailyProduction: [
    { day: 'Mon', pensProduced: 0 },
    { day: 'Tue', pensProduced: 0 },
    { day: 'Wed', pensProduced: 0 },
    { day: 'Thu', pensProduced: 0 },
    { day: 'Fri', pensProduced: 0 },
    { day: 'Sat', pensProduced: 0 },
    { day: 'Sun', pensProduced: 0 },
  ],
  orderStatusBreakdown: [
    { status: 'Pending', count: 0 },
    { status: 'In Progress', count: 0 },
    { status: 'Completed', count: 0 },
    { status: 'Cancelled', count: 0 },
  ],
  qcSummary: {
    passed: 0,
    rejected: 0,
    passRate: 0.0,
  },
};

const STATUS_CONFIG = {
  Pending: { color: '#f59e0b', label: 'Pending' },
  'In Progress': { color: '#0ea5e9', label: 'In Progress' },
  Completed: { color: '#10b981', label: 'Completed' },
  Cancelled: { color: '#94a3b8', label: 'Cancelled' },
};

function DashboardPage() {
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(false);

  const fetchStats = async (isManual = false) => {
    setLoading(true);
    try {
      const res = await dashboardService.getStats();
      const payload = res?.data?.data || res?.data || res;
      if (payload && typeof payload.todayOrders !== 'undefined') {
        setStats(payload);
        if (isManual) {
          toast.success('Live dashboard metrics updated');
        }
      }
    } catch (err) {
      console.log('Using zero metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const metricCards = [
    {
      title: "Today's Orders",
      value: stats.todayOrders ?? 0,
      subtitle: 'New customer work orders',
      icon: ShoppingBag,
      color: 'text-brand-600',
      bg: 'bg-brand-50 border-brand-100',
    },
    {
      title: 'Running Orders',
      value: stats.runningOrders ?? 0,
      subtitle: 'Active in assembly stages',
      icon: PlayCircle,
      color: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-100',
    },
    {
      title: 'Completed Orders',
      value: stats.completedOrders ?? 0,
      subtitle: 'Successfully packaged',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-100',
    },
    {
      title: 'Rejected Products',
      value: stats.rejectedProducts ?? 0,
      subtitle: 'Defective units set aside',
      icon: AlertTriangle,
      color: 'text-rose-600',
      bg: 'bg-rose-50 border-rose-100',
    },
    {
      title: 'Finished Goods',
      value: `${stats.finishedGoods ?? 0} pcs`,
      subtitle: 'Ready in warehouse bays',
      icon: Boxes,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 border-indigo-100',
    },
    {
      title: 'Active Employees',
      value: stats.activeEmployees ?? 0,
      subtitle: 'Operators & QC staff on shift',
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50 border-purple-100',
    },
  ];

  const qcBarData = [
    {
      name: 'Quality Inspection',
      Passed: stats.qcSummary?.passed ?? 0,
      Rejected: stats.qcSummary?.rejected ?? 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Plant Executive Dashboard
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
              Live
            </span>
          </h1>
          <p className="text-sm text-slate-500">
            Real-time manufacturing execution overview for ball pen assembly line
          </p>
        </div>
        <button
          onClick={() => fetchStats(true)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-brand-600' : ''}`} />
          <span>Refresh Live Data</span>
        </button>
      </div>

      {/* 6 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between"
            >
              <div>
                <div className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
                  {card.title}
                </div>
                <div className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
                  {card.value}
                </div>
                <div className="text-xs text-slate-400 mt-1">{card.subtitle}</div>
              </div>
              <div className={`p-3 rounded-xl border ${card.bg} ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1: Daily Production Trend & Order Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Production Area Chart (Span 2) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-600" />
                Daily Assembly Production Output
              </h2>
              <p className="text-xs text-slate-500">Number of finished ball pens produced per shift</p>
            </div>
            <div className="text-xs font-semibold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-100">
              Last 7 Days
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats.dailyProduction}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  allowDecimals={false}
                  tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val)}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const value = payload[0].value;
                      return (
                        <div className="bg-white px-3.5 py-2.5 rounded-xl shadow-xl border border-slate-200 text-xs select-none">
                          <div className="font-semibold text-slate-500 mb-1">{label} Shift Output</div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-base font-black text-slate-900">
                              {Number(value).toLocaleString('en-IN')}
                            </span>
                            <span className="font-medium text-slate-500">pens produced</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="pensProduced"
                  name="Pens Produced"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorOutput)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Donut Chart (Span 1) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="mb-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-600" />
              Order Status Breakdown
            </h2>
            <p className="text-xs text-slate-500">Active vs completed manufacturing orders</p>
          </div>

          {(() => {
            const totalOrdersInBreakdown = (stats.orderStatusBreakdown || []).reduce(
              (sum, item) => sum + (item.count || 0),
              0
            );
            const activeOrderStatus = (stats.orderStatusBreakdown || []).filter((d) => (d.count || 0) > 0);
            const pieDisplayData =
              activeOrderStatus.length > 0
                ? activeOrderStatus
                : [{ status: 'No Orders', count: 1, isPlaceholder: true }];

            return (
              <>
                <div className="h-48 w-full relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieDisplayData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={74}
                        paddingAngle={activeOrderStatus.length > 1 ? 4 : 0}
                        dataKey="count"
                        nameKey="status"
                        strokeWidth={2}
                        stroke="#ffffff"
                      >
                        {pieDisplayData.map((entry) => (
                          <Cell
                            key={entry.status}
                            fill={
                              entry.isPlaceholder
                                ? '#e2e8f0'
                                : STATUS_CONFIG[entry.status]?.color || '#94a3b8'
                            }
                          />
                        ))}
                      </Pie>
                      {activeOrderStatus.length > 0 && (
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0];
                              const status = data.name;
                              const count = data.value;
                              const color =
                                STATUS_CONFIG[status]?.color ||
                                STATUS_CONFIG[status?.toUpperCase()]?.color ||
                                '#10b981';
                              const percent =
                                totalOrdersInBreakdown > 0
                                  ? Math.round((count / totalOrdersInBreakdown) * 100)
                                  : 0;

                              return (
                                <div className="bg-white px-3.5 py-2.5 rounded-xl shadow-xl border border-slate-200 text-xs select-none">
                                  <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                                    <span
                                      className="w-2.5 h-2.5 rounded-full shrink-0"
                                      style={{ backgroundColor: color }}
                                    />
                                    <span>{status}</span>
                                  </div>
                                  <div className="text-slate-600 flex items-center gap-1.5">
                                    <strong className="text-slate-900 font-extrabold text-sm">{count}</strong>
                                    <span>{count === 1 ? 'order' : 'orders'}</span>
                                    <span className="text-slate-400 font-medium">({percent}%)</span>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      )}
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Centered Donut Badge */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-black text-slate-900 leading-tight">
                      {totalOrdersInBreakdown}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {totalOrdersInBreakdown === 1 ? 'Order' : 'Orders'}
                    </span>
                  </div>
                </div>

                {/* Status Breakdown Legend Grid with Live Counts */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 mt-2">
                  {(stats.orderStatusBreakdown || []).map((item) => {
                    const cfg = STATUS_CONFIG[item.status] || { color: '#94a3b8' };
                    return (
                      <div
                        key={item.status}
                        className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-100"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: cfg.color }}
                          />
                          <span className="text-slate-600 truncate text-[11px] font-medium">
                            {item.status}
                          </span>
                        </div>
                        <span className="font-bold text-slate-900 text-xs ml-1.5">{item.count}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Charts Row 2: Quality Inspection Pass vs Reject */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Quality Inspection: Pass vs Reject Metrics
            </h2>
            <p className="text-xs text-slate-500">
              Audit pass rate tolerance threshold (Standard target: &ge; 98%)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Pass Rate: {stats.qcSummary?.passRate ?? 0}%
            </div>
          </div>
        </div>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={qcBarData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" stroke="#94a3b8" fontSize={12} />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white px-3.5 py-2.5 rounded-xl shadow-xl border border-slate-200 text-xs select-none space-y-1">
                        <div className="font-bold text-slate-900 border-b border-slate-100 pb-1 mb-1">
                          Quality Inspection Units
                        </div>
                        {payload.map((entry, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-4">
                            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              {entry.name}:
                            </span>
                            <strong className="text-slate-900 font-bold">
                              {Number(entry.value).toLocaleString('en-IN')} pcs
                            </strong>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="Passed" fill="#10b981" radius={[0, 6, 6, 0]} barSize={22} />
              <Bar dataKey="Rejected" fill="#ef4444" radius={[0, 6, 6, 0]} barSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;

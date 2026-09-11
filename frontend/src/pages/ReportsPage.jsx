import React, { useEffect, useState } from 'react';
import reportService from '../services/reportService';
import toast from 'react-hot-toast';
import {
  FileText,
  Printer,
  Download,
  RefreshCw,
  Search,
  CheckCircle,
  Clock,
  Truck,
  ShieldCheck,
  Archive,
  BarChart2,
  Calendar,
  Layers,
  ChevronRight,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

const emptySummary = {
  totalOrders: 0,
  completedOrders: 0,
  totalProducedPens: 0,
  totalInventoryValuation: 0.0,
  averageQcPassRate: 0.0,
  totalDispatchedPens: 0,
  productionOrders: [],
  qualityChecks: [],
  finishedGoods: [],
  dispatches: [],
};

function ReportsPage() {
  const [activeTab, setActiveTab] = useState('executive'); // 'executive', 'production', 'quality', 'inventory', 'dispatch'
  const [reportData, setReportData] = useState(emptySummary);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await reportService.getExecutiveSummary();
      const payload = res?.data?.data || res?.data || res;
      if (payload && typeof payload.totalOrders !== 'undefined') {
        setReportData(payload);
      } else {
        setReportData(emptySummary);
      }
    } catch (err) {
      console.error('Error fetching report:', err);
      setReportData(emptySummary);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    let filename = 'report.csv';

    if (activeTab === 'production' || activeTab === 'executive') {
      filename = 'ball_pen_production_orders_report.csv';
      csvContent += 'Order Number,Customer,Product,Ordered Qty,Produced Qty,Progress %,Due Date,Priority,Status\n';
      (reportData.productionOrders || []).forEach((o) => {
        const rate = o.orderedQuantity > 0 ? Math.min(100, Math.round(((o.producedQuantity || 0) / o.orderedQuantity) * 100)) : 0;
        csvContent += `"${o.orderNumber}","${o.customerName}","${o.productName}",${o.orderedQuantity},${o.producedQuantity},${rate}%,"${o.dueDate}","${o.priority}","${o.status}"\n`;
      });
    } else if (activeTab === 'quality') {
      filename = 'ball_pen_quality_inspection_report.csv';
      csvContent += 'QC Ref,Order Number,Product,Checked Qty,Passed Qty,Rejected Qty,Pass Rate %,Rejection Reason,Inspector,Date,Status\n';
      (reportData.qualityChecks || []).forEach((q) => {
        csvContent += `"${q.checkNumber}","${q.orderNumber}","${q.productName}",${q.checkedQuantity},${q.passedQuantity},${q.rejectedQuantity},${q.passRate}%,"${q.rejectionReason}","${q.inspectorName}","${q.inspectionDate}","${q.status}"\n`;
      });
    } else if (activeTab === 'inventory') {
      filename = 'ball_pen_warehouse_inventory_report.csv';
      csvContent += 'Product Code,Product Name,Ink Color,Pen Type,Available Qty,Warehouse Bay,Unit Price (INR),Valuation (INR),Status,Ready for Dispatch\n';
      (reportData.finishedGoods || []).forEach((fg) => {
        csvContent += `"${fg.productCode}","${fg.productName}","${fg.inkColor}","${fg.penType}",${fg.quantity},"${fg.warehouseLocation}",${fg.unitPrice},${fg.totalValuation},"${fg.status}",${fg.readyForDispatch}\n`;
      });
    } else if (activeTab === 'dispatch') {
      filename = 'ball_pen_logistics_dispatch_report.csv';
      csvContent += 'Dispatch Ref,Customer,Order Number,Quantity,Carrier,Tracking AWB,Dispatch Date,Status\n';
      (reportData.dispatches || []).forEach((d) => {
        csvContent += `"${d.dispatchNumber}","${d.customerName}","${d.orderNumber}",${d.quantity},"${d.carrierName}","${d.trackingReference}","${d.dispatchDate}","${d.status}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filename}`);
  };

  const tabs = [
    { id: 'executive', label: 'Executive KPI Summary', icon: BarChart2 },
    { id: 'production', label: 'Production Batch Audit', icon: Layers },
    { id: 'quality', label: 'Quality & Defect Analysis', icon: ShieldCheck },
    { id: 'inventory', label: 'Warehouse Valuation', icon: Archive },
    { id: 'dispatch', label: 'Logistics & Dispatch', icon: Truck },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header - Hidden in Print mode */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="h-7 w-7 text-indigo-600" />
            Factory Reports & Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Official manufacturing intelligence, quality audit certificates, and inventory ledgers
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchReport}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            title="Refresh Report Data"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 text-sm font-medium rounded-lg shadow-sm transition-colors"
          >
            <Download className="h-4 w-4 text-slate-500" />
            Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
          >
            <Printer className="h-4 w-4" />
            Print / PDF Report
          </button>
        </div>
      </div>

      {/* Printable Report Letterhead (Visible when printing) */}
      <div className="hidden print:block border-b-2 border-slate-800 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 uppercase tracking-wide">
              Ball Pen Assembly Line MES
            </h1>
            <p className="text-sm text-slate-600">Manufacturing Execution & Quality Audit Report</p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <div>Report Date: {new Date().toLocaleDateString('en-IN')}</div>
            <div>Generated by: Antigravity MES System</div>
          </div>
        </div>
      </div>

      {/* Tabs Bar - Hidden in Print */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-1.5 flex items-center overflow-x-auto gap-1 print:hidden">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: EXECUTIVE KPI SUMMARY */}
      {activeTab === 'executive' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Production Orders
              </span>
              <div className="text-2xl font-bold text-slate-900 mt-2">
                {reportData.completedOrders ?? 0} / {reportData.totalOrders ?? 0}
              </div>
              <div className="text-xs text-slate-500 mt-1">Batches completed vs total</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                Total Output Yield
              </span>
              <div className="text-2xl font-bold text-emerald-700 mt-2">
                {(reportData.totalProducedPens ?? 0).toLocaleString()} pens
              </div>
              <div className="text-xs text-slate-500 mt-1">Manufactured & assembled</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                Average QC Pass Rate
              </span>
              <div className="text-2xl font-bold text-indigo-700 mt-2">
                {reportData.qualityChecks?.length > 0 ? `${reportData.averageQcPassRate ?? 0}%` : '0%'}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {reportData.qualityChecks?.length > 0 ? 'Audit pass standard (>95%)' : 'No inspections recorded yet'}
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-600">
                Inventory Valuation
              </span>
              <div className="text-2xl font-bold text-purple-700 mt-2">
                ₹{(reportData.totalInventoryValuation ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-slate-500 mt-1">Finished goods asset value</div>
            </div>
          </div>

          {/* Quick High-Level Executive Summary Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
                <span>Recent Production Lots</span>
                <span className="text-xs text-indigo-600 font-medium">Live Batches</span>
              </h3>
              <div className="divide-y divide-slate-100">
                {(reportData.productionOrders || []).map((o) => (
                  <div key={o.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-800">{o.orderNumber}</div>
                      <div className="text-slate-400">{o.productName}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">
                        {o.producedQuantity} / {o.orderedQuantity} pens
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-600 uppercase">
                        {o.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
                <span>Quality Audit Highlights</span>
                <span className="text-xs text-emerald-600 font-medium">Inspected Batches</span>
              </h3>
              <div className="divide-y divide-slate-100">
                {(reportData.qualityChecks || []).map((q) => (
                  <div key={q.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-800">{q.checkNumber}</div>
                      <div className="text-slate-400">{q.productName}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-700">{q.passRate}% Pass</div>
                      <div className="text-[10px] text-slate-400">By {q.inspectorName}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTION BATCH AUDIT */}
      {activeTab === 'production' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Production Orders Audit Report</h2>
            <span className="text-xs text-slate-500">
              {(reportData.productionOrders || []).length} Production Lots
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Order Number</th>
                  <th className="px-6 py-3.5">Customer Name</th>
                  <th className="px-6 py-3.5">Product</th>
                  <th className="px-6 py-3.5">Target Qty</th>
                  <th className="px-6 py-3.5">Produced Qty</th>
                  <th className="px-6 py-3.5">Fulfillment %</th>
                  <th className="px-6 py-3.5">Due Date</th>
                  <th className="px-6 py-3.5">Priority</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {(reportData.productionOrders || []).map((o) => {
                  const rate = o.orderedQuantity > 0 ? Math.min(100, Math.round(((o.producedQuantity || 0) / o.orderedQuantity) * 100)) : 0;
                  return (
                    <tr key={o.id} className="hover:bg-slate-50/75">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">{o.orderNumber}</td>
                      <td className="px-6 py-4 font-medium text-slate-800">{o.customerName}</td>
                      <td className="px-6 py-4">{o.productName}</td>
                      <td className="px-6 py-4 font-medium">{o.orderedQuantity?.toLocaleString()}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{o.producedQuantity?.toLocaleString()}</td>
                      <td className="px-6 py-4 font-bold text-indigo-600">{rate}%</td>
                      <td className="px-6 py-4">{o.dueDate}</td>
                      <td className="px-6 py-4 font-semibold">{o.priority}</td>
                      <td className="px-6 py-4 font-semibold text-emerald-700">{o.status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: QUALITY & DEFECT ANALYSIS */}
      {activeTab === 'quality' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Quality Assurance & Defect Report</h2>
            <span className="text-xs text-slate-500">
              Avg Pass Yield: <strong>{reportData.averageQcPassRate}%</strong>
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">QC Ref</th>
                  <th className="px-6 py-3.5">Batch Ref</th>
                  <th className="px-6 py-3.5">Product</th>
                  <th className="px-6 py-3.5">Sampled</th>
                  <th className="px-6 py-3.5">Passed</th>
                  <th className="px-6 py-3.5">Rejected</th>
                  <th className="px-6 py-3.5">Pass Rate</th>
                  <th className="px-6 py-3.5">Defect Reason</th>
                  <th className="px-6 py-3.5">Inspector</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {(reportData.qualityChecks || []).map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/75">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{q.checkNumber}</td>
                    <td className="px-6 py-4 font-mono text-indigo-600">{q.orderNumber}</td>
                    <td className="px-6 py-4">{q.productName}</td>
                    <td className="px-6 py-4">{q.checkedQuantity}</td>
                    <td className="px-6 py-4 text-emerald-600 font-bold">{q.passedQuantity}</td>
                    <td className="px-6 py-4 text-rose-600 font-bold">{q.rejectedQuantity}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{q.passRate}%</td>
                    <td className="px-6 py-4 text-slate-500">{q.rejectionReason || 'None'}</td>
                    <td className="px-6 py-4">{q.inspectorName}</td>
                    <td className="px-6 py-4 font-semibold text-emerald-700">{q.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: WAREHOUSE VALUATION */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Finished Goods Valuation Report</h2>
            <span className="text-xs text-slate-500 font-bold">
              Total Stock Value: ₹
              {reportData.totalInventoryValuation?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Product Code</th>
                  <th className="px-6 py-3.5">Product Name</th>
                  <th className="px-6 py-3.5">Ink Color</th>
                  <th className="px-6 py-3.5">Pen Type</th>
                  <th className="px-6 py-3.5">Available Qty</th>
                  <th className="px-6 py-3.5">Warehouse Bay</th>
                  <th className="px-6 py-3.5">Unit Price</th>
                  <th className="px-6 py-3.5">Total Valuation</th>
                  <th className="px-6 py-3.5">Dispatch Ready</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {(reportData.finishedGoods || []).map((fg) => (
                  <tr key={fg.id} className="hover:bg-slate-50/75">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{fg.productCode}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{fg.productName}</td>
                    <td className="px-6 py-4">{fg.inkColor}</td>
                    <td className="px-6 py-4">{fg.penType}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {fg.quantity?.toLocaleString()} pens
                    </td>
                    <td className="px-6 py-4">{fg.warehouseLocation}</td>
                    <td className="px-6 py-4">₹{fg.unitPrice}</td>
                    <td className="px-6 py-4 font-mono font-bold text-emerald-700">
                      ₹{fg.totalValuation?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      {fg.readyForDispatch ? (
                        <span className="text-emerald-700 font-semibold">Yes (Ready)</span>
                      ) : (
                        <span className="text-amber-700 font-semibold">Staging</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: LOGISTICS & DISPATCH */}
      {activeTab === 'dispatch' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Logistics & Client Dispatch Report</h2>
            <span className="text-xs text-slate-500 font-bold">
              Total Dispatched: {reportData.totalDispatchedPens?.toLocaleString()} pens
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Dispatch Ref</th>
                  <th className="px-6 py-3.5">Client Name</th>
                  <th className="px-6 py-3.5">Order Ref</th>
                  <th className="px-6 py-3.5">Dispatched Qty</th>
                  <th className="px-6 py-3.5">Carrier</th>
                  <th className="px-6 py-3.5">Tracking AWB</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {(reportData.dispatches || []).map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/75">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{d.dispatchNumber}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{d.customerName}</td>
                    <td className="px-6 py-4 font-mono text-indigo-600">{d.orderNumber}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {d.quantity?.toLocaleString()} pens
                    </td>
                    <td className="px-6 py-4">{d.carrierName}</td>
                    <td className="px-6 py-4 font-mono text-blue-600">{d.trackingReference || '—'}</td>
                    <td className="px-6 py-4">{d.dispatchDate}</td>
                    <td className="px-6 py-4 font-semibold text-blue-700">{d.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportsPage;

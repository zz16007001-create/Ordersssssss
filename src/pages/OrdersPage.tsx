/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { OrderItem, PaymentMethod } from '../types';
import { Icon3D } from '../components/icons3d/Icon3D';
import { SaleForm } from '../components/SaleForm';

export const OrdersPage: React.FC = () => {
  const {
    state,
    deleteOrder,
    deleteOrderItem,
    addOrderItemToOrder,
    toggleOrderFinished,
    registerItemSale,
    updateOrderItem,
    returnOrderItem,
    settleOrderItem,
    getOrderProfitImpact,
    createNewOrder,
    customers,
    addCustomer,
    liquidity,
    setCurrentPage,
  } = useApp();

  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(
    state.orders.length > 0 ? state.orders[0].id : null
  );

  // Collapsible inline create order form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formOrderCode, setFormOrderCode] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formItems, setFormItems] = useState([
    { name: '', quantity: 1, costPrice: 0 },
  ]);

  // نافذة البيع: كل حالة النموذج جوّه SaleForm
  const [sellingItemInfo, setSellingItemInfo] = useState<{
    orderId: string;
    item: OrderItem;
  } | null>(null);

  // Item details expanded state (per item ID)
  const [expandedItemIds, setExpandedItemIds] = useState<Record<string, boolean>>({});

  const toggleItemDetails = (itemId: string) => {
    setExpandedItemIds((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const normalizePhoneForComparison = (phone?: string): string => {
    if (!phone) return '';
    let digits = phone.replace(/\D/g, '');
    if (digits.startsWith('0020')) {
      digits = digits.slice(4);
    } else if (digits.startsWith('20') && digits.length > 10) {
      digits = digits.slice(2);
    }
    if (digits.startsWith('0')) {
      digits = digits.slice(1);
    }
    return digits;
  };

  const openSaleModal = (orderId: string, item: OrderItem) => {
    setSellingItemInfo({ orderId, item });
  };

  // Edit item modal state
  const [editingItemInfo, setEditingItemInfo] = useState<{
    orderId: string;
    item: OrderItem;
  } | null>(null);
  const [editItemName, setEditItemName] = useState('');
  const [editItemCost, setEditItemCost] = useState('');
  const [editItemSoldPrice, setEditItemSoldPrice] = useState('');

  // Return item confirmation dialog
  const [returningItemInfo, setReturningItemInfo] = useState<{
    orderId: string;
    item: OrderItem;
    orderCode: string;
  } | null>(null);

  // مبلغ الاسترداد للعميل عند الارتجاع
  const [returnRefundInput, setReturnRefundInput] = useState('');

  // Settle item confirmation dialog
  const [settlingItemInfo, setSettlingItemInfo] = useState<{
    orderId: string;
    item: OrderItem;
    orderCode: string;
  } | null>(null);

  // Delete order confirmation with financial impact breakdown
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);

  // Single item delete confirmation dialog
  const [deletingItemInfo, setDeletingItemInfo] = useState<{
    orderId: string;
    item: OrderItem;
    orderCode: string;
  } | null>(null);

  // Order status filter: all / open / finished
  const [orderFilter, setOrderFilter] = useState<'all' | 'open' | 'finished'>('all');

  // Add item modal state (clean, empty by default)
  const [addingItemOrderId, setAddingItemOrderId] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemCost, setNewItemCost] = useState('');

  const toggleExpand = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const handleConfirmDeleteItem = () => {
    if (!deletingItemInfo) return;
    deleteOrderItem(deletingItemInfo.orderId, deletingItemInfo.item.id);
    setDeletingItemInfo(null);
  };

  const handleSaveAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingItemOrderId || !newItemName.trim()) return;
    const qty = parseInt(newItemQuantity) || 1;
    const cost = parseFloat(newItemCost) || 0;
    addOrderItemToOrder(addingItemOrderId, {
      name: newItemName.trim(),
      quantity: qty,
      costPrice: cost,
    });
    setAddingItemOrderId(null);
    setNewItemName('');
    setNewItemQuantity('');
    setNewItemCost('');
  };



  const openEditModal = (orderId: string, item: OrderItem) => {
    setEditingItemInfo({ orderId, item });
    setEditItemName(item.name);
    setEditItemCost(item.costPrice.toString());
    setEditItemSoldPrice(item.soldPrice !== undefined ? item.soldPrice.toString() : '');
  };

  const handleSaveEditItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItemInfo || !editItemName.trim()) return;
    const cost = parseFloat(editItemCost) || 0;
    const updates: Partial<OrderItem> = {
      name: editItemName.trim(),
      costPrice: cost,
    };
    if (editingItemInfo.item.isSold && editItemSoldPrice) {
      updates.soldPrice = parseFloat(editItemSoldPrice) || 0;
    }
    updateOrderItem(editingItemInfo.orderId, editingItemInfo.item.id, updates);
    setEditingItemInfo(null);
  };

  const handleConfirmReturn = () => {
    if (!returningItemInfo) return;
    const refund = parseFloat(returnRefundInput);
    returnOrderItem(
      returningItemInfo.orderId,
      returningItemInfo.item.id,
      returningItemInfo.item.customerId && refund > 0 ? refund : undefined
    );
    setReturnRefundInput('');
    setReturningItemInfo(null);
  };

  const handleConfirmSettle = () => {
    if (!settlingItemInfo) return;
    settleOrderItem(settlingItemInfo.orderId, settlingItemInfo.item.id);
    setSettlingItemInfo(null);
  };

  const handleConfirmDeleteOrder = () => {
    if (!deletingOrderId) return;
    deleteOrder(deletingOrderId);
    setDeletingOrderId(null);
  };

  const handleCreateOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valid = formItems.filter((it) => it.name.trim() !== '' && it.costPrice > 0);
    if (valid.length === 0) return;

    createNewOrder(formOrderCode.trim() || '', valid, formNotes || undefined);
    setFormOrderCode('');
    setFormNotes('');
    setFormItems([{ name: '', quantity: 1, costPrice: 0 }]);
    setShowCreateForm(false);
  };

  const deleteImpact = deletingOrderId ? getOrderProfitImpact(deletingOrderId) : null;
  const deletingOrderObj = deletingOrderId ? state.orders.find((o) => o.id === deletingOrderId) : null;

  const displayedOrders = state.orders.filter((order) => {
    if (orderFilter === 'open') return !order.isFinished;
    if (orderFilter === 'finished') return !!order.isFinished;
    return true;
  });

  return (
    <div className="w-full flex flex-col gap-[13px] text-[#1F1A2E] dark:text-[#F4F0FA]">
      {/* 1. كارت اسم الصفحة: بنفسجي متدرج، ارتفاع 52px */}
      <div className="card-header-purple flex items-center justify-between">
        <span className="text-[18px] font-[800] text-white leading-none whitespace-nowrap">
          سجل الأوردرات
        </span>

        <div className="flex items-center gap-[8px]">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="h-[26px] px-[10px] rounded-full bg-[#2F7F5F] hover:bg-[#25664C] text-white text-[12px] font-[700] flex items-center gap-1 flex-none shadow-sm cursor-pointer"
          >
            <span className="text-[12px] leading-none">{showCreateForm ? '✕' : '＋'}</span>
            <span>أوردر جديد</span>
          </button>

          <button
            onClick={() => setCurrentPage('entry')}
            className="btn-back-transparent"
            title="رجوع للرئيسية"
          >
            ➜
          </button>
        </div>
      </div>

      {/* 2. فلترة الأوردرات: كل الأوردرات / الأوردرات المفتوحة / الأوردرات المنتهية */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white dark:bg-[#211A2D] border border-[#D4D0E0] dark:border-[#3A3150] shadow-2xs text-[11px] font-bold">
        {[
          { id: 'all', label: `كل الأوردرات (${state.orders.length})` },
          { id: 'open', label: `الأوردرات المفتوحة (${state.orders.filter((o) => !o.isFinished).length})` },
          { id: 'finished', label: `الأوردرات المنتهية (${state.orders.filter((o) => !!o.isFinished).length})` },
        ].map((pill) => (
          <button
            key={pill.id}
            type="button"
            onClick={() => setOrderFilter(pill.id as any)}
            className={`flex-1 py-1.5 rounded-xl transition cursor-pointer text-center whitespace-nowrap ${
              orderFilter === pill.id
                ? 'bg-[#5F2967] text-white shadow-xs'
                : 'text-[#666079] dark:text-[#9E97B0] hover:text-[#1F1A2E] dark:hover:text-[#F4F0FA]'
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Collapsible Create Order Section */}
      {showCreateForm && (
        <form
          onSubmit={handleCreateOrderSubmit}
          className="card-main p-4 space-y-3 text-xs"
        >
          <div className="flex items-center justify-between pb-1.5 border-b border-[#D4D0E0] dark:border-[#3A3150]">
            <span className="font-extrabold text-[#5F2967] dark:text-[#D8B4FE]">
              إنشاء أوردر تسلسلي جديد
            </span>
            <span className="text-[10px] text-[#2F7F5F] dark:text-[#4BA682] font-bold bg-[#E3F2EA] dark:bg-[#162E23] px-2 py-0.5 rounded-full tabular-nums">
              السيولة: {liquidity.toLocaleString('en-US')} {state.settings.currency}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder={`أوردر رقم ${state.orderCounter || state.orders.length + 1}`}
              value={formOrderCode}
              onChange={(e) => setFormOrderCode(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#ECECF4] dark:border-[#32263F] bg-[#F1F1FA] dark:bg-[#17101D] font-bold outline-none focus:border-[#5F2967]"
            />
            <input
              type="text"
              placeholder="ملاحظات اختيارية..."
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#ECECF4] dark:border-[#32263F] bg-[#F1F1FA] dark:bg-[#17101D] outline-none"
            />
          </div>

          <div className="space-y-1.5">
            {formItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <input
                  type="text"
                  required
                  placeholder="اسم الصنف / الموديل..."
                  value={item.name}
                  onChange={(e) => {
                    const c = [...formItems];
                    c[idx].name = e.target.value;
                    setFormItems(c);
                  }}
                  className="flex-1 px-3 py-1.5 rounded-xl border border-[#ECECF4] dark:border-[#32263F] bg-[#F1F1FA] dark:bg-[#17101D] text-xs font-bold outline-none"
                />
                <input
                  type="number"
                  min="1"
                  placeholder="العدد"
                  value={item.quantity}
                  onChange={(e) => {
                    const c = [...formItems];
                    c[idx].quantity = parseInt(e.target.value) || 1;
                    setFormItems(c);
                  }}
                  className="w-16 px-1.5 py-1.5 rounded-xl border border-[#ECECF4] dark:border-[#32263F] bg-[#F1F1FA] dark:bg-[#17101D] text-center font-bold outline-none"
                />
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="سعر التكلفة"
                  value={item.costPrice || ''}
                  onChange={(e) => {
                    const c = [...formItems];
                    c[idx].costPrice = parseFloat(e.target.value) || 0;
                    setFormItems(c);
                  }}
                  className="w-24 px-2 py-1.5 rounded-xl border border-[#ECECF4] dark:border-[#32263F] bg-[#F1F1FA] dark:bg-[#17101D] text-center font-black text-[#5F2967] dark:text-[#9B67A4] outline-none"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setFormItems([...formItems, { name: '', quantity: 1, costPrice: 0 }])}
              className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-[#5F2967] dark:text-[#9B67A4] font-bold text-xs transition cursor-pointer"
            >
              + إضافة صنف
            </button>
            <button
              type="submit"
              className="flex-1 py-1.5 rounded-xl bg-[#5F2967] hover:bg-[#4A1E52] text-white font-black text-xs transition cursor-pointer shadow-xs"
            >
              حفظ الأوردر
            </button>
          </div>
        </form>
      )}

      {/* Orders Cards List */}
      {displayedOrders.length === 0 ? (
        <div className="py-10 text-center border border-dashed border-[#ECECF4] dark:border-[#32263F] rounded-3xl bg-white dark:bg-[#231A2C] p-6">
          <p className="text-xs text-[#9A98B0]">
            {orderFilter === 'finished'
              ? 'لا توجد أوردرات منتهية حالياً'
              : orderFilter === 'open'
              ? 'لا توجد أوردرات مفتوحة حالياً'
              : 'لا توجد أوردرات مسجلة حالياً'}
          </p>
        </div>
      ) : (
        <div className="w-full flex flex-col gap-[13px]">
          {displayedOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const itemsCost = order.items.reduce((s, it) => s + it.costPrice * (it.quantity || 1), 0);
            const totalCost = itemsCost + (order.additionalBagCost || 0);
            const regularItems = order.items.filter((it) => it.name.trim() !== 'مصاريف');
            const soldItems = regularItems.filter((it) => it.isSold);
            const totalCollected = order.items.filter((it) => it.isSold).reduce((s, it) => {
              const fullPrice = (it.soldPrice || 0) * (it.quantity || 1);
              return s + (it.paidAmount !== undefined ? it.paidAmount : fullPrice);
            }, 0);
            const netProfit = totalCollected - totalCost;
            const isAllSold = regularItems.length > 0 && regularItems.every((it) => it.isSold);
            const hasRemainingDebt = soldItems.some((it) => {
              const fullPrice = (it.soldPrice || 0) * (it.quantity || 1);
              const paidAmt = it.paidAmount !== undefined ? it.paidAmount : fullPrice;
              return fullPrice - paidAmt > 0.001;
            });

            let status: 'مقفول' | 'خسارة' | 'مفتوح' | 'بانتظار التحصيل';
            if (isAllSold) {
              if (hasRemainingDebt) {
                status = 'بانتظار التحصيل';
              } else {
                status = netProfit >= 0 ? 'مقفول' : 'خسارة';
              }
            } else {
              status = 'مفتوح';
            }

            return (
              <div
                key={order.id}
                className={`card-main overflow-hidden transition-all ${
                  order.isFinished
                    ? 'border-2 border-slate-300 dark:border-slate-700/80 bg-slate-50/40 dark:bg-[#1D1726]'
                    : ''
                }`}
              >
                {/* Compact Card Header: min-h 50px */}
                <div
                  onClick={() => toggleExpand(order.id)}
                  className="min-h-[50px] px-[15px] py-[8px] flex items-center justify-between gap-2.5 cursor-pointer select-none"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-[800] text-[14px] text-[#1F1A2E] dark:text-[#F4F0FA] truncate leading-tight">
                        {order.code}
                      </h3>
                      {order.isFinished ? (
                        <span className="text-[10px] font-[800] px-2 py-0.5 rounded-full inline-flex items-center gap-1 leading-none bg-[#E2E8F0] dark:bg-[#2A2438] text-[#475569] dark:text-[#CBD5E1] border border-[#CBD5E1] dark:border-[#475569]">
                          <span>✓</span>
                          <span>منتهي</span>
                        </span>
                      ) : (
                        <span
                          className={`text-[10px] font-[700] px-2 py-0.5 rounded-full inline-flex items-center leading-none ${
                            status === 'بانتظار التحصيل'
                              ? 'bg-[#FFF1C7] dark:bg-[#3A2E0E] text-[#8A7340] dark:text-[#D9C08A] border border-[#E6B93F]/50'
                              : status === 'مقفول'
                              ? 'bg-[#E3F2EA] dark:bg-[#162E23] text-[#2F7F5F] dark:text-[#4BA682]'
                              : status === 'خسارة'
                              ? 'bg-[#F8E6EC] dark:bg-[#381B26] text-[#A23B5A] dark:text-[#FB7185]'
                              : 'bg-[#F1E8F4] dark:bg-[#2D1F35] text-[#5F2967] dark:text-[#D8B4FE]'
                          }`}
                        >
                          {status} ({soldItems.length}/{regularItems.length})
                        </span>
                      )}
                    </div>
                    {/* تاریخ إنشاء الأوردر فقط */}
                    <span className="text-[10px] font-[400] text-[#666079] dark:text-[#9E97B0] block mt-0.5 leading-tight">
                      تاريخ الإنشاء: {order.date}
                    </span>
                  </div>

                  {/* Summary Metrics */}
                  <div className="flex items-center gap-[10px] text-center shrink-0">
                    <div>
                      <span className="text-[11px] font-[600] text-[#666079] dark:text-[#9E97B0] block leading-tight">التكلفة</span>
                      <span className="text-[12px] font-[700] text-[#1F1A2E] dark:text-[#F4F0FA] tabular-nums block leading-tight">
                        {totalCost.toLocaleString('en-US')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] font-[600] text-[#666079] dark:text-[#9E97B0] block leading-tight">المبيعات</span>
                      <span className="text-[12px] font-[700] text-[#5F2967] dark:text-[#D8B4FE] tabular-nums block leading-tight">
                        {totalCollected.toLocaleString('en-US')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] font-[600] text-[#666079] dark:text-[#9E97B0] block leading-tight">الربح</span>
                      <span
                        className={`text-[12px] font-[700] tabular-nums block leading-tight ${
                          netProfit >= 0 ? 'text-[#2F7F5F] dark:text-[#4BA682]' : 'text-[#A23B5A] dark:text-[#FB7185]'
                        }`}
                      >
                        {netProfit > 0 ? `+${netProfit.toLocaleString('en-US')}` : netProfit.toLocaleString('en-US')}
                      </span>
                    </div>
                    <div className="text-[#666079] dark:text-[#9E97B0]">
                      <Icon3D name={isExpanded ? 'chevron_up' : 'chevron_down'} size={16} />
                    </div>
                  </div>
                </div>

                {/* Expanded Items */}
                {isExpanded && (
                  <div className="border-t border-[#ECECF4] dark:border-[#32263F] p-3 bg-[#F1F1FA]/50 dark:bg-[#17101D]/50 space-y-2 text-xs">
                    <div className="space-y-1.5">
                      {order.items.map((it) => {
                        const itemCostTotal = it.costPrice * (it.quantity || 1);
                        const itemSoldTotal = it.isSold && it.soldPrice !== undefined ? it.soldPrice * (it.quantity || 1) : null;
                        const itemProfit = itemSoldTotal !== null ? itemSoldTotal - itemCostTotal : null;

                        const isDetailsOpen = !!expandedItemIds[it.id];
                        const totalDue = itemSoldTotal !== null ? itemSoldTotal : 0;
                        const paid = it.paidAmount !== undefined ? it.paidAmount : (it.paymentType === 'cash' || it.isSettled ? totalDue : 0);
                        const remaining = Math.max(0, totalDue - paid);

                        const isFullyPaid = it.isSold && (
                          it.isSettled ||
                          it.paymentType === 'cash' ||
                          it.paidAmount === undefined ||
                          it.paidAmount >= totalDue ||
                          remaining <= 0.001
                        );

                        const isDebtItem = it.isSold && !isFullyPaid && (it.paymentType === 'credit' || it.paymentType === 'partial' || remaining > 0.001);

                        // Card color classes by status (Item 1-د):
                        let cardColorClass = 'bg-white dark:bg-[#231A2C] border border-[#ECECF4] dark:border-[#32263F]';
                        let labelColorClass = 'text-[#9A98B0]';
                        let costColorClass = 'text-[#E2574C]';
                        let soldColorClass = 'text-[#3B9AC4]';
                        let profitColorClass = itemProfit !== null && itemProfit >= 0 ? 'text-[#2FA36B]' : 'text-[#9A98B0]';
                        let debtTextColorClass = 'text-[#7a4a00] dark:text-[#fde68a]';

                        if (isFullyPaid) {
                          cardColorClass = 'bg-[#fde6e6] dark:bg-[#3b1a20] border border-[#f0b4b4] dark:border-[#7a3340]';
                          labelColorClass = 'text-[#8a6a6a] dark:text-[#c9a0a6]';
                          costColorClass = 'text-[#8a1f2e] dark:text-[#fca5a5]';
                          soldColorClass = 'text-[#1d5f8a] dark:text-[#7dd3fc]';
                          profitColorClass = 'text-[#166534] dark:text-[#86efac]';
                          debtTextColorClass = 'text-[#8a1f2e] dark:text-[#fca5a5]';
                        } else if (isDebtItem) {
                          cardColorClass = 'bg-[#fff1c7] dark:bg-[#3a2e0e] border-[1.5px] border-[#e6b93f] dark:border-[#9a7b1c]';
                          labelColorClass = 'text-[#8a7340] dark:text-[#d9c08a]';
                          costColorClass = 'text-[#9a3412] dark:text-[#fdba74]';
                          soldColorClass = 'text-[#1d5f8a] dark:text-[#7dd3fc]';
                          debtTextColorClass = 'text-[#7a4a00] dark:text-[#fde68a]';
                        }

                        const customerObj = it.customerId ? customers.find((c) => c.id === it.customerId) : null;

                        return (
                          <div
                            key={it.id}
                            className={`p-2.5 rounded-2xl ${cardColorClass} space-y-2 shadow-2xs transition-colors`}
                          >
                            {/* الكارت المقفول: اسم الصنف + الكمية + الأزرار (بند 1-أ) */}
                            <div className="flex items-center justify-between gap-2">
                              <div
                                onClick={() => toggleItemDetails(it.id)}
                                className="flex items-center gap-1.5 min-w-0 flex-1 cursor-pointer select-none"
                                title="اضغط لعرض/إخفاء التفاصيل"
                              >
                                <span className="font-black text-[#2B2340] dark:text-white text-xs leading-snug line-clamp-2 break-words">
                                  {it.name}
                                </span>
                                <span className="text-[10px] text-[#9A98B0] shrink-0">
                                  ({it.quantity} قطعة{it.size ? ` - مقاس ${it.size}` : ''})
                                </span>
                                {it.isSettled && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-amber-500/15 text-amber-600 font-bold shrink-0">
                                    مُسوّى
                                  </span>
                                )}
                              </div>

                              {/* Action Buttons (بند 1-ب) */}
                              <div className="flex items-center gap-1 shrink-0">
                                {it.name.trim() === 'مصاريف' ? (
                                  <span className="px-2 py-0.5 rounded-lg bg-[#ECECF4] dark:bg-[#2A2338] text-[#666079] dark:text-[#9E97B0] font-bold text-[10px]">
                                    مصروف أوردر
                                  </span>
                                ) : it.isSold ? (
                                  <button
                                    onClick={() => {
                                      setReturnRefundInput(paid > 0 && it.customerId ? String(paid) : '');
                                      setReturningItemInfo({
                                        orderId: order.id,
                                        item: it,
                                        orderCode: order.code,
                                      });
                                    }}
                                    className="px-2 py-0.5 rounded-lg bg-white dark:bg-[#2b151a] hover:bg-rose-50 dark:hover:bg-[#3b1a20] text-[#d23c3c] dark:text-[#f87171] border border-[#e7a3a3] dark:border-[#7a3340] font-bold text-[10px] transition cursor-pointer shadow-2xs"
                                    title="ارتجاع الصنف بعد البيع"
                                  >
                                    ارتجاع
                                  </button>
                                ) : (
                                  <>
                                    <button
                                      onClick={() =>
                                        setSettlingItemInfo({
                                          orderId: order.id,
                                          item: it,
                                          orderCode: order.code,
                                        })
                                      }
                                      className="px-2 py-0.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-[10px] transition cursor-pointer"
                                      title="تسوية الصنف بالتكلفة"
                                    >
                                      تسوية
                                    </button>
                                    <button
                                      onClick={() => openSaleModal(order.id, it)}
                                      className="px-2.5 py-1 rounded-lg bg-[#2F7F5F] hover:bg-[#25664C] text-white font-bold text-[10px] active:scale-95 transition cursor-pointer"
                                    >
                                      تسجيل بيع
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* التفاصيل عند الفتح: مخفية افتراضياً (بند 1-ج و 1-هـ) */}
                            {isDetailsOpen && (
                              <div className="space-y-2 pt-1 border-t border-inherit">
                                <div className="grid grid-cols-3 gap-1 text-[11px]">
                                  <div>
                                    <span className={`text-[9px] ${labelColorClass} block`}>سعر التكلفة</span>
                                    <strong className={`${costColorClass} font-black tabular-nums block`}>
                                      {it.costPrice} {state.settings.currency}
                                    </strong>
                                  </div>
                                  <div>
                                    <span className={`text-[9px] ${labelColorClass} block`}>سعر البيع</span>
                                    {it.name.trim() === 'مصاريف' ? (
                                      <strong className={`${soldColorClass} font-bold text-[10px] block`}>
                                        بدون بيع (مصروف)
                                      </strong>
                                    ) : !it.isSold ? (
                                      <strong className={`${soldColorClass} font-black tabular-nums block`}>
                                        لم يُبع
                                      </strong>
                                    ) : isDebtItem ? (
                                      it.paymentType === 'credit' ? (
                                        <div>
                                          <strong className={`${soldColorClass} font-black tabular-nums block`}>
                                            0 {state.settings.currency}
                                          </strong>
                                          <span className={`text-[9px] ${labelColorClass} font-bold block`}>آجل</span>
                                        </div>
                                      ) : (
                                        <div>
                                          <strong className={`${soldColorClass} font-black tabular-nums block`}>
                                            {paid} {state.settings.currency}
                                          </strong>
                                          <span className={`text-[9px] ${labelColorClass} font-bold block`}>
                                            من {totalDue}
                                          </span>
                                        </div>
                                      )
                                    ) : (
                                      <strong className={`${soldColorClass} font-black tabular-nums block`}>
                                        {it.soldPrice} {state.settings.currency}
                                      </strong>
                                    )}
                                  </div>
                                  <div>
                                    <span className={`text-[9px] ${labelColorClass} block`}>صافي الربح</span>
                                    <div className="flex items-center justify-between">
                                      <strong className={`${profitColorClass} font-black tabular-nums`}>
                                        {isDebtItem ? '-' : itemProfit !== null ? `${itemProfit > 0 ? '+' : ''}${itemProfit} ${state.settings.currency}` : '-'}
                                      </strong>
                                      <div className="flex items-center gap-0.5">
                                        <button
                                          onClick={() => openEditModal(order.id, it)}
                                          className="p-1 text-slate-400 hover:text-blue-500 transition cursor-pointer"
                                          title="تعديل الصنف"
                                        >
                                          <Icon3D name="edit" size={13} />
                                        </button>
                                        <button
                                          onClick={() =>
                                            setDeletingItemInfo({
                                              orderId: order.id,
                                              item: it,
                                              orderCode: order.code,
                                            })
                                          }
                                          className="p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                                          title="حذف الصنف"
                                        >
                                          <Icon3D name="trash" size={13} />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* سطر المديونية (بند 1-ج و 1-هـ) */}
                                {it.isSold && (isDebtItem || it.customerId) && (
                                  <div className={`pt-1 border-t border-inherit text-[10px] font-bold ${debtTextColorClass}`}>
                                    {customerObj ? (
                                      <span>
                                        {customerObj.name} | مدفوع {paid} | متبقي {remaining} {state.settings.currency}
                                      </span>
                                    ) : isDebtItem ? (
                                      <span>
                                        آجل بالكامل | متبقي {remaining} {state.settings.currency}
                                      </span>
                                    ) : null}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-2 border-t border-[#ECECF4] dark:border-[#32263F] space-y-2">
                      {order.notes && (
                        <div className="text-[11px] text-[#7A7585] dark:text-[#9A98B0] bg-[#F7F7FA] dark:bg-[#1E1726] px-2.5 py-1.5 rounded-lg">
                          <span className="font-bold text-[#5F2967] dark:text-[#9B67A4]">ملاحظة: </span>
                          <span>{order.notes}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {order.isFinished ? (
                            <button
                              type="button"
                              onClick={() => toggleOrderFinished(order.id)}
                              className="px-2.5 py-1 rounded-lg bg-[#5F2967] hover:bg-[#4C1F53] text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition shadow-xs active:scale-95"
                              title="إعادة فتح الأوردر"
                            >
                              <span>إعادة فتح الأوردر</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => toggleOrderFinished(order.id)}
                              className="px-2.5 py-1 rounded-lg bg-[#D23C3C] hover:bg-[#B53030] text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition shadow-xs active:scale-95"
                              title="إقفال الأوردر"
                            >
                              <span>إقفال الأوردر</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setAddingItemOrderId(order.id);
                              setNewItemName('');
                              setNewItemQuantity('');
                              setNewItemCost('');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#2F7F5F] hover:bg-[#25664C] text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition shadow-xs active:scale-95"
                            title="إضافة صنف إلى هذا الأوردر"
                          >
                            <span className="leading-none text-xs">＋</span>
                            <span>إضافة صنف</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => setDeletingOrderId(order.id)}
                          className="text-[11px] text-slate-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer transition font-bold"
                        >
                          <Icon3D name="trash" size={15} />
                          <span>حذف الأوردر</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: تسجيل بيع (نفس النموذج المستخدم في البيع السريع) */}
      {sellingItemInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-sm bg-white dark:bg-[#231A2C] rounded-3xl p-5 border border-[#ECECF4] dark:border-[#32263F] space-y-3.5 text-right shadow-2xl text-xs my-auto">
            <div className="flex items-center justify-between pb-1 border-b border-[#ECECF4] dark:border-[#32263F]">
              <h3 className="font-extrabold text-sm text-[#2B2340] dark:text-white flex items-center gap-1.5">
                <Icon3D name="sell" size={20} />
                بيع: {sellingItemInfo.item.name}
              </h3>
              <button
                type="button"
                onClick={() => setSellingItemInfo(null)}
                className="text-[#9A98B0] hover:text-[#2B2340]"
              >
                <Icon3D name="close" size={16} />
              </button>
            </div>
            <SaleForm
              orderId={sellingItemInfo.orderId}
              item={sellingItemInfo.item}
              onDone={() => setSellingItemInfo(null)}
              onCancel={() => setSellingItemInfo(null)}
            />
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Order Item Modal */}
      {editingItemInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSaveEditItem}
            className="w-full max-w-xs bg-white dark:bg-[#231A2C] rounded-3xl p-5 border border-[#ECECF4] dark:border-[#32263F] space-y-3.5 text-right shadow-2xl text-xs"
          >
            <div className="flex items-center justify-between pb-1 border-b border-[#ECECF4] dark:border-[#32263F]">
              <h3 className="font-extrabold text-sm text-[#2B2340] dark:text-white flex items-center gap-1.5">
                <Icon3D name="edit" size={18} />
                تعديل الصنف
              </h3>
              <button
                type="button"
                onClick={() => setEditingItemInfo(null)}
                className="text-[#9A98B0] hover:text-[#2B2340]"
              >
                <Icon3D name="close" size={16} />
              </button>
            </div>

            <div>
              <label className="block font-bold text-[#2B2340] dark:text-white mb-1">اسم الصنف *</label>
              <input
                type="text"
                required
                value={editItemName}
                onChange={(e) => setEditItemName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#ECECF4] dark:border-[#32263F] bg-white dark:bg-[#231A2C] font-bold outline-none focus:border-[#5F2967]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#2B2340] dark:text-white mb-1">سعر التكلفة *</label>
              <input
                type="number"
                step="0.01"
                required
                value={editItemCost}
                onChange={(e) => setEditItemCost(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#ECECF4] dark:border-[#32263F] bg-white dark:bg-[#231A2C] font-black text-center text-[#E2574C] outline-none"
              />
            </div>

            {editingItemInfo.item.isSold && (
              <div>
                <label className="block font-bold text-[#2B2340] dark:text-white mb-1">سعر البيع</label>
                <input
                  type="number"
                  step="0.01"
                  value={editItemSoldPrice}
                  onChange={(e) => setEditItemSoldPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#ECECF4] dark:border-[#32263F] bg-white dark:bg-[#231A2C] font-black text-center text-[#3B9AC4] outline-none"
                />
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#5F2967] hover:bg-[#4A1E52] text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                حفظ التعديل
              </button>
              <button
                type="button"
                onClick={() => setEditingItemInfo(null)}
                className="px-4 py-2.5 rounded-xl bg-[#ECECF4] dark:bg-[#32263F] text-[#2B2340] dark:text-[#F2EEF7] font-bold text-xs cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: Return Item Confirmation (مع توضيح ما سيحدث) */}
      {returningItemInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#231A2C] rounded-3xl p-5 border border-[#ECECF4] dark:border-[#32263F] space-y-3.5 text-right shadow-2xl text-xs">
            <div className="flex items-center gap-2 text-[#E2574C]">
              <Icon3D name="warning" size={22} />
              <h3 className="font-extrabold text-sm text-[#2B2340] dark:text-white">
                تأكيد ارتجاع الصنف: {returningItemInfo.item.name}
              </h3>
            </div>

            <div className="p-3 rounded-2xl bg-[#F1F1FA] dark:bg-[#17101D] border border-[#ECECF4] dark:border-[#32263F] space-y-1.5 text-[11px] leading-relaxed">
              <p className="font-bold text-[#2B2340] dark:text-white">
                ما سيحدث عند تأكيد الارتجاع:
              </p>
              <ul className="list-disc list-inside space-y-1 text-[#9A98B0]">
                <li>سيعود الصنف غير مباع ويرجع متاحاً للبيع مجدداً.</li>
                <li>يتم استرجاع تكلفته المحبوسة في الأوردر.</li>
                <li>في حال كان الأوردر مغطياً لتكلفته وحقق أرباحاً موزعة، سيتم عكس الأرباح الناتجة عن بيعه تلقائياً بنسب التوزيع:
                  <span className="block font-bold text-[#5F2967] dark:text-[#9B67A4] mr-2">
                    70% نمو رأس مال - 20% دعم بوكيت - 10% صدقة
                  </span>
                </li>
              </ul>
            </div>

            {returningItemInfo.item.customerId && (
              <div>
                <label className="block font-bold text-[#2B2340] dark:text-white mb-1">
                  الفلوس اللي رجّعتيها للعميل (اتركيه فاضي لو ما رجّعتيش حاجة)
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={returnRefundInput}
                  onChange={(e) => setReturnRefundInput(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-xl border border-[#ECECF4] dark:border-[#32263F] bg-white dark:bg-[#231A2C] font-black text-center outline-none focus:border-[#5F2967]"
                />
                <span className="text-[10px] text-[#9A98B0] block mt-1">
                  هيتسجل سطر "استرداد" في كشف حساب العميل، والمدفوع على الصنف ده هيتشال من حسابه.
                </span>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleConfirmReturn}
                className="flex-1 py-2.5 rounded-xl bg-[#E2574C] hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                تأكيد الارتجاع
              </button>
              <button
                type="button"
                onClick={() => {
                  setReturningItemInfo(null);
                  setReturnRefundInput('');
                }}
                className="px-4 py-2.5 rounded-xl bg-[#ECECF4] dark:bg-[#32263F] text-[#2B2340] dark:text-[#F2EEF7] font-bold text-xs cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Settle Unsold Item Confirmation (تسوية) */}
      {settlingItemInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#231A2C] rounded-3xl p-5 border border-[#ECECF4] dark:border-[#32263F] space-y-3.5 text-right shadow-2xl text-xs">
            <div className="flex items-center gap-2 text-amber-600">
              <Icon3D name="warning" size={22} />
              <h3 className="font-extrabold text-sm text-[#2B2340] dark:text-white">
                تأكيد تسوية الصنف: {settlingItemInfo.item.name}
              </h3>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 space-y-1.5 text-[11px] text-amber-950 dark:text-amber-200 leading-relaxed">
              <p className="font-bold">ما سيحدث عند التسوية:</p>
              <p>
                - سيتم إخراج الصنف بسعر تكلفته ({settlingItemInfo.item.costPrice} {state.settings.currency}) بدون أي أرباح، وتحرير قيمته المحبوسة في الأوردر.
              </p>
              <p>
                - تسجيل حركة تسوية في رأس المال بنفس القيمة ({settlingItemInfo.item.costPrice * (settlingItemInfo.item.quantity || 1)} {state.settings.currency}) مع ربطها بالأوردر.
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleConfirmSettle}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                تأكيد التسوية
              </button>
              <button
                type="button"
                onClick={() => setSettlingItemInfo(null)}
                className="px-4 py-2.5 rounded-xl bg-[#ECECF4] dark:bg-[#32263F] text-[#2B2340] dark:text-[#F2EEF7] font-bold text-xs cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Delete Order Confirmation with Breakdown */}
      {deletingOrderId && deletingOrderObj && deleteImpact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#231A2C] rounded-3xl p-5 border border-[#ECECF4] dark:border-[#32263F] space-y-3.5 text-right shadow-2xl text-xs">
            <div className="flex items-center gap-2 text-[#E2574C]">
              <Icon3D name="danger" size={22} />
              <h3 className="font-extrabold text-sm text-[#2B2340] dark:text-white">
                حذف {deletingOrderObj.code}
              </h3>
            </div>

            <p className="text-[11px] text-[#9A98B0]">
              سيتم حذف الأوردر وإلغاء كل الأثر المالي المرتبط به من جميع الخزن:
            </p>

            <div className="p-3 rounded-2xl bg-[#F1F1FA] dark:bg-[#17101D] border border-[#ECECF4] dark:border-[#32263F] space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span>استرجاع نمو رأس المال:</span>
                <strong className="text-[#5F2967] dark:text-[#9B67A4] tabular-nums font-bold">
                  -{deleteImpact.capitalGrowth.toLocaleString('en-US')} {state.settings.currency}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>استرجاع دعم بوكيت:</span>
                <strong className="text-[#5F2967] dark:text-[#9B67A4] tabular-nums font-bold">
                  -{deleteImpact.pocketSupport.toLocaleString('en-US')} {state.settings.currency}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>استرجاع أثر الصدقة:</span>
                <strong className="text-[#5F2967] dark:text-[#9B67A4] tabular-nums font-bold">
                  -{deleteImpact.charityInflow.toLocaleString('en-US')} {state.settings.currency}
                </strong>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleConfirmDeleteOrder}
                className="flex-1 py-2.5 rounded-xl bg-[#E2574C] hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                تأكيد الحذف النهائي
              </button>
              <button
                type="button"
                onClick={() => setDeletingOrderId(null)}
                className="px-4 py-2.5 rounded-xl bg-[#ECECF4] dark:bg-[#32263F] text-[#2B2340] dark:text-[#F2EEF7] font-bold text-xs cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: Single Item Delete Confirmation */}
      {deletingItemInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#231A2C] rounded-3xl p-5 border border-[#ECECF4] dark:border-[#32263F] space-y-3.5 text-right shadow-2xl text-xs">
            <div className="flex items-center gap-2 text-[#E2574C]">
              <Icon3D name="trash" size={22} />
              <h3 className="font-extrabold text-sm text-[#2B2340] dark:text-white">
                حذف الصنف: {deletingItemInfo.item.name}
              </h3>
            </div>

            <p className="text-[11px] text-[#666079] dark:text-[#9E97B0] leading-relaxed">
              هل أنت متأكد من حذف هذا الصنف فقط من <strong className="text-[#5F2967] dark:text-[#D8B4FE]">{deletingItemInfo.orderCode}</strong> دون حذف الأوردر أو الأصناف الأخرى؟
            </p>

            <div className="p-3 rounded-2xl bg-[#F1F1FA] dark:bg-[#17101D] border border-[#ECECF4] dark:border-[#32263F] space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span>الكمية:</span>
                <strong className="font-bold tabular-nums">
                  {deletingItemInfo.item.quantity} قطعة{deletingItemInfo.item.size ? ` (مقاس ${deletingItemInfo.item.size})` : ''}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>سعر التكلفة:</span>
                <strong className="text-[#E2574C] font-black tabular-nums">
                  {deletingItemInfo.item.costPrice} {state.settings.currency}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>حالة البيع:</span>
                <strong className="font-bold">
                  {deletingItemInfo.item.isSold ? 'تم بيعه سابقاً (سيتم عكس أثره المالي بأمان)' : 'متاح في المخزون'}
                </strong>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleConfirmDeleteItem}
                className="flex-1 py-2.5 rounded-xl bg-[#E2574C] hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                تأكيد حذف الصنف
              </button>
              <button
                type="button"
                onClick={() => setDeletingItemInfo(null)}
                className="px-4 py-2.5 rounded-xl bg-[#ECECF4] dark:bg-[#32263F] text-[#2B2340] dark:text-[#F2EEF7] font-bold text-xs cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: Add Item to Existing Order */}
      {addingItemOrderId && (() => {
        const targetOrder = state.orders.find((o) => o.id === addingItemOrderId);
        const orderLabel = targetOrder
          ? targetOrder.code.includes('أوردر')
            ? targetOrder.code
            : `أوردر رقم ${targetOrder.code}`
          : 'الأوردر';

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <form
              onSubmit={handleSaveAddItem}
              className="w-full max-w-sm bg-white dark:bg-[#231A2C] rounded-3xl p-5 border border-[#ECECF4] dark:border-[#32263F] space-y-3.5 text-right shadow-2xl text-xs"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#ECECF4] dark:border-[#32263F]">
                <h3 className="font-extrabold text-sm text-[#2F7F5F] dark:text-[#4BA682] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#E3F2EA] dark:bg-[#162E23] text-[#2F7F5F] dark:text-[#4BA682] flex items-center justify-center text-sm font-black leading-none">＋</span>
                  <span>إضافة صنف إلى {orderLabel}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setAddingItemOrderId(null)}
                  className="text-[#9A98B0] hover:text-[#2B2340] dark:hover:text-white p-1 rounded-lg"
                  aria-label="إغلاق"
                >
                  <Icon3D name="close" size={16} />
                </button>
              </div>

              <div>
                <label className="block font-bold text-[#2B2340] dark:text-white mb-1">
                  اسم الصنف / الموديل *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#ECECF4] dark:border-[#32263F] bg-white dark:bg-[#231A2C] font-bold outline-none focus:border-[#2F7F5F]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2B2340] dark:text-white mb-1">
                  الكمية (العدد) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#ECECF4] dark:border-[#32263F] bg-white dark:bg-[#231A2C] text-center font-bold outline-none focus:border-[#2F7F5F]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2B2340] dark:text-white mb-1">
                  سعر التكلفة ({state.settings.currency}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newItemCost}
                  onChange={(e) => setNewItemCost(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#ECECF4] dark:border-[#32263F] bg-white dark:bg-[#231A2C] font-black text-center text-[#2F7F5F] dark:text-[#4BA682] outline-none focus:border-[#2F7F5F] text-sm tabular-nums"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#2F7F5F] hover:bg-[#25664C] text-white font-bold text-xs shadow-xs transition cursor-pointer"
                >
                  إضافة الصنف للأوردر
                </button>
                <button
                  type="button"
                  onClick={() => setAddingItemOrderId(null)}
                  className="px-4 py-2.5 rounded-xl bg-[#ECECF4] dark:bg-[#32263F] text-[#2B2340] dark:text-[#F2EEF7] font-bold text-xs cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        );
      })()}
    </div>
  );
};

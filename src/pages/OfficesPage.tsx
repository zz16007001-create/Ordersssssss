/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { OfficeItem } from '../types';
import { Icon3D } from '../components/icons3d/Icon3D';

export const OfficesPage: React.FC = () => {
  const {
    state,
    deleteOfficeItem,
    updateOfficeItem,
    addOfficeItem,
    createOrderFromOfficeItems,
    setCurrentPage,
  } = useApp();

  const [selectedOffice, setSelectedOffice] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [customOrderCode, setCustomOrderCode] = useState('');
  const [orderCreatedMsg, setOrderCreatedMsg] = useState<string | null>(null);

  // Registered offices from settings
  const registeredOffices = state.settings.registeredOffices && state.settings.registeredOffices.length > 0
    ? state.settings.registeredOffices
    : ['مكتب النزهة', 'مكتب وسط البلد', 'مكتب العتبة'];

  // Add / Edit form state
  const [showForm, setShowForm] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [formOfficeName, setFormOfficeName] = useState(registeredOffices[0] || '');
  const [formItemName, setFormItemName] = useState('');
  const [formQuantity, setFormQuantity] = useState('1');
  const [formCostPrice, setFormCostPrice] = useState('');
  const [formCustomerName, setFormCustomerName] = useState('');
  const [formCustomerPhone, setFormCustomerPhone] = useState('');
  const [formCustomerAddress, setFormCustomerAddress] = useState('');
  const [formCustomerSize, setFormCustomerSize] = useState('');
  const [formMessengerLink, setFormMessengerLink] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Active items (excluding transferred ones)
  const activeOfficeItems = state.officeItems.filter((i) => !i.isTransferredToOrder);

  // Filter active items
  const filteredActiveItems = activeOfficeItems.filter((item) => {
    const matchOffice = selectedOffice === 'all' || item.officeName === selectedOffice;
    const matchQuery =
      searchQuery === '' ||
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.officeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.customerName && item.customerName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchOffice && matchQuery;
  });

  const toggleSelectItem = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAllAvailable = () => {
    if (selectedItemIds.length === filteredActiveItems.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(filteredActiveItems.map((i) => i.id));
    }
  };

  const openAddForm = () => {
    setEditingItemId(null);
    setFormOfficeName(registeredOffices[0] || '');
    setFormItemName('');
    setFormQuantity('1');
    setFormCostPrice('');
    setFormCustomerName('');
    setFormCustomerPhone('');
    setFormCustomerAddress('');
    setFormCustomerSize('');
    setFormMessengerLink('');
    setFormNotes('');
    setShowForm(true);
  };

  const openEditForm = (item: OfficeItem) => {
    setEditingItemId(item.id);
    setFormOfficeName(item.officeName);
    setFormItemName(item.itemName);
    setFormQuantity(item.quantity.toString());
    setFormCostPrice(item.costPrice.toString());
    setFormCustomerName(item.customerName || '');
    setFormCustomerPhone(item.customerPhone || '');
    setFormCustomerAddress(item.customerAddress || '');
    setFormCustomerSize(item.customerSize || '');
    setFormMessengerLink(item.messengerLink || item.contactUrl || '');
    setFormNotes(item.notes || '');
    setShowForm(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formOfficeName || !formItemName.trim() || !formCostPrice) return;

    if (editingItemId) {
      updateOfficeItem(editingItemId, {
        officeName: formOfficeName,
        itemName: formItemName.trim(),
        quantity: parseInt(formQuantity) || 1,
        costPrice: parseFloat(formCostPrice) || 0,
        customerName: formCustomerName.trim() || undefined,
        customerPhone: formCustomerPhone.trim() || undefined,
        customerAddress: formCustomerAddress.trim() || undefined,
        customerSize: formCustomerSize.trim() || undefined,
        messengerLink: formMessengerLink.trim() || undefined,
        contactUrl: formMessengerLink.trim() || undefined,
        notes: formNotes.trim() || undefined,
      });
    } else {
      addOfficeItem({
        officeName: formOfficeName,
        itemName: formItemName.trim(),
        quantity: parseInt(formQuantity) || 1,
        costPrice: parseFloat(formCostPrice) || 0,
        customerName: formCustomerName.trim() || undefined,
        customerPhone: formCustomerPhone.trim() || undefined,
        customerAddress: formCustomerAddress.trim() || undefined,
        customerSize: formCustomerSize.trim() || undefined,
        messengerLink: formMessengerLink.trim() || undefined,
        contactUrl: formMessengerLink.trim() || undefined,
        notes: formNotes.trim() || undefined,
      });
    }

    setShowForm(false);
    setEditingItemId(null);
  };

  const handleCreateOrder = () => {
    if (selectedItemIds.length === 0) return;
    const orderId = createOrderFromOfficeItems(selectedItemIds, customOrderCode.trim() || undefined);
    if (orderId) {
      setOrderCreatedMsg(`تم إنشاء أوردر بنجاح ونقل ${selectedItemIds.length} صنف!`);
      // Empty selection and clear page state
      setSelectedItemIds([]);
      setCustomOrderCode('');
      setTimeout(() => {
        setOrderCreatedMsg(null);
        setCurrentPage('orders');
      }, 1000);
    }
  };

  return (
    <div className="space-y-3.5 pb-24 max-w-xl mx-auto text-[#2B2340] dark:text-[#F2EEF7]">
      {/* 1. كارت اسم الصفحة: بنفسجي متدرج مطابق لتصميم كارت سجل المراجعة */}
      <div className="card-header-purple flex items-center justify-between gap-2">
        <div className="flex items-center gap-[10px] min-w-0">
          <button
            onClick={() => setCurrentPage('entry')}
            className="btn-back-transparent shrink-0"
            title="رجوع للرئيسية"
          >
            ➜
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 flex items-center justify-center shrink-0 opacity-90">
              <Icon3D name="offices" size={20} />
            </div>
            <span className="text-[15px] sm:text-[18px] font-[800] text-white leading-none truncate">
              بضاعة المكاتب والموردين
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="shrink-0 h-[32px] px-3.5 rounded-full bg-white hover:bg-white/95 text-[#5F2967] text-[12px] font-[800] flex items-center gap-1.5 shadow-sm cursor-pointer transition active:scale-95"
        >
          <span className="text-[#5F2967] font-black text-[14px] leading-none">＋</span>
          <span>إضافة صنف</span>
        </button>
      </div>

      {orderCreatedMsg && (
        <div className="p-3 rounded-2xl bg-[#2FA36B]/15 border border-[#2FA36B]/40 text-[#2FA36B] text-xs font-bold flex items-center gap-2">
          <Icon3D name="check" size={18} />
          <span>{orderCreatedMsg}</span>
        </div>
      )}

      {/* 2. Add / Edit Item Form (بدون إجمالي الفاتورة، مع لينك الماسنجر والمقاس) */}
      {showForm && (
        <form
          onSubmit={handleFormSubmit}
          className="p-3.5 rounded-2xl bg-white dark:bg-[#231A2C] border border-[#5F2967] space-y-2.5 text-xs wallet-card-shadow"
        >
          <div className="flex items-center justify-between pb-1 border-b border-[#ECECF4] dark:border-[#32263F]">
            <span className="font-extrabold text-[#5F2967] dark:text-[#9B67A4]">
              {editingItemId ? 'تعديل صنف مكتب' : 'إضافة صنف لمكتب'}
            </span>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingItemId(null);
              }}
              className="text-[#9A98B0] hover:text-[#2B2340]"
            >
              <Icon3D name="close" size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-[#9A98B0] mb-0.5 font-bold">المكتب / المورد *</label>
              <select
                required
                value={formOfficeName}
                onChange={(e) => setFormOfficeName(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-[#ECECF4] dark:border-[#32263F] bg-white dark:bg-[#231A2C] font-bold outline-none focus:border-[#5F2967]"
              >
                {registeredOffices.map((off) => (
                  <option key={off} value={off}>{off}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-[#9A98B0] mb-0.5 font-bold">اسم الصنف / الموديل *</label>
              <input
                type="text"
                required
                placeholder="صنف..."
                value={formItemName}
                onChange={(e) => setFormItemName(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-[#ECECF4] dark:border-[#32263F] bg-white dark:bg-[#231A2C] font-bold outline-none focus:border-[#5F2967]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-[#9A98B0] mb-0.5">العدد *</label>
              <input
                type="number"
                min="1"
                required
                value={formQuantity}
                onChange={(e) => setFormQuantity(e.target.value)}
                className="w-full px-2 py-1.5 text-center rounded-xl border border-[#ECECF4] dark:border-[#32263F] bg-white dark:bg-[#231A2C] font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[#9A98B0] mb-0.5">سعر التكلفة للقطعة *</label>
              <input
                type="number"
                step="any"
                required
                placeholder="0"
                value={formCostPrice}
                onChange={(e) => setFormCostPrice(e.target.value)}
                className="w-full px-2 py-1.5 text-center rounded-xl border border-[#ECECF4] dark:border-[#32263F] bg-white dark:bg-[#231A2C] font-bold"
              />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#F1F1FA] dark:bg-[#17101D] border border-[#ECECF4] dark:border-[#32263F] space-y-1.5">
            <span className="font-bold text-[#2B2340] dark:text-white block text-[10px]">
              بيانات العميل الاختيارية:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <input
                type="text"
                placeholder="اسم العميل"
                value={formCustomerName}
                onChange={(e) => setFormCustomerName(e.target.value)}
                className="px-2 py-1 rounded-lg border border-[#ECECF4] dark:border-[#32263F] bg-white dark:bg-[#231A2C] text-xs"
              />
              <input
                type="tel"
                placeholder="رقم الهاتف"
                value={formCustomerPhone}
                onChange={(e) => setFormCustomerPhone(e.target.value)}
                className="px-2 py-1 rounded-lg border border-[#ECECF4] dark:border-[#32263F] bg-white dark:bg-[#231A2C] text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <input
                type="text"
                placeholder="العنوان"
                value={formCustomerAddress}
                onChange={(e) => setFormCustomerAddress(e.target.value)}
                className="px-2 py-1 rounded-lg border border-[#ECECF4] dark:border-[#32263F] bg-white dark:bg-[#231A2C] text-xs"
              />
              <input
                type="text"
                placeholder="المقاس"
                value={formCustomerSize}
                onChange={(e) => setFormCustomerSize(e.target.value)}
                className="px-2 py-1 rounded-lg border border-[#ECECF4] dark:border-[#32263F] bg-white dark:bg-[#231A2C] text-xs"
              />
            </div>
            <input
              type="text"
              placeholder="لينك الماسنجر (رابط العميل)"
              value={formMessengerLink}
              onChange={(e) => setFormMessengerLink(e.target.value)}
              className="w-full px-2 py-1 rounded-lg border border-[#ECECF4] dark:border-[#32263F] bg-white dark:bg-[#231A2C] text-xs"
            />
            <input
              type="text"
              placeholder="ملاحظات أخرى..."
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              className="w-full px-2 py-1 rounded-lg border border-[#ECECF4] dark:border-[#32263F] bg-white dark:bg-[#231A2C] text-xs"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-[#5F2967] hover:bg-[#4A1E52] text-white font-bold text-xs cursor-pointer shadow-xs transition"
            >
              {editingItemId ? 'حفظ التعديل' : 'إضافة الصنف'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingItemId(null);
              }}
              className="px-4 py-2 rounded-xl bg-[#ECECF4] dark:bg-[#32263F] text-xs font-bold cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      {/* 3. Search & Filter Bar */}
      <div className="p-2.5 rounded-2xl bg-white dark:bg-[#231A2C] border border-[#ECECF4] dark:border-[#32263F] flex items-center gap-2 text-xs wallet-card-shadow">
        <div className="relative flex-1">
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon3D name="search" size={16} />
          </div>
          <input
            type="text"
            placeholder="بحث في أصناف المكاتب..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-8 pl-3 py-1.5 rounded-xl border border-[#ECECF4] dark:border-[#32263F] bg-[#F1F1FA] dark:bg-[#17101D] text-xs outline-none"
          />
        </div>
        <select
          value={selectedOffice}
          onChange={(e) => setSelectedOffice(e.target.value)}
          className="px-2.5 py-1.5 rounded-xl border border-[#ECECF4] dark:border-[#32263F] bg-[#F1F1FA] dark:bg-[#17101D] font-bold text-[#5F2967] dark:text-[#9B67A4] text-xs outline-none"
        >
          <option value="all">كل المكاتب</option>
          {registeredOffices.map((off) => (
            <option key={off} value={off}>{off}</option>
          ))}
        </select>
      </div>

      {/* 4. Selection & Create Order Action Bar */}
      {filteredActiveItems.length > 0 && (
        <div className="p-3 rounded-2xl bg-gradient-to-r from-[#5F2967] to-[#8A5C93] text-white flex items-center justify-between gap-2.5 shadow-md text-xs">
          <button
            onClick={selectAllAvailable}
            className="flex items-center gap-1.5 font-bold cursor-pointer"
          >
            <Icon3D
              name={selectedItemIds.length === filteredActiveItems.length && filteredActiveItems.length > 0 ? 'checkbox_on' : 'checkbox_off'}
              size={18}
            />
            <span>تحديد الكل ({selectedItemIds.length})</span>
          </button>
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              placeholder="اسم الأوردر..."
              value={customOrderCode}
              onChange={(e) => setCustomOrderCode(e.target.value)}
              className="w-24 px-2 py-1 rounded-xl bg-white/20 text-white placeholder-purple-200 text-xs outline-none"
            />
            <button
              onClick={handleCreateOrder}
              disabled={selectedItemIds.length === 0}
              className="px-3 py-1 rounded-xl bg-white text-[#5F2967] font-black text-xs disabled:opacity-40 cursor-pointer shadow-xs transition hover:bg-purple-50"
            >
              تحويل لأوردر
            </button>
          </div>
        </div>
      )}

      {/* 5. Active Items List: Editable + Delete + Messenger Link Icon */}
      <div className="space-y-2">
        {filteredActiveItems.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#9A98B0] border border-dashed border-[#ECECF4] dark:border-[#32263F] rounded-2xl bg-white dark:bg-[#231A2C]">
            لا توجد أصناف مكاتب متبقية
          </div>
        ) : (
          filteredActiveItems.map((item) => {
            const isSelected = selectedItemIds.includes(item.id);
            const mLink = item.messengerLink || item.contactUrl;
            return (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-white dark:bg-[#231A2C] border border-[#ECECF4] dark:border-[#32263F] flex items-center justify-between gap-2.5 text-xs wallet-card-shadow"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <button
                    onClick={() => toggleSelectItem(item.id)}
                    className="cursor-pointer shrink-0"
                  >
                    <Icon3D name={isSelected ? 'checkbox_on' : 'checkbox_off'} size={22} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-[#2B2340] dark:text-white truncate">
                        {item.itemName}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[#F1F1FA] dark:bg-[#17101D] text-[#5F2967] dark:text-[#9B67A4] font-bold">
                        {item.officeName}
                      </span>
                      {/* Messenger Link Icon */}
                      {mLink && (
                        <a
                          href={mLink.startsWith('http') ? mLink : `https://${mLink}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-600 p-0.5"
                          title="فتح رابط العميل / الماسنجر"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.913 1.455 5.518 3.734 7.214V22l3.373-1.851c.907.251 1.879.387 2.893.387 5.523 0 10-4.145 10-9.278C22 6.145 17.523 2 12 2zm1.002 12.441l-2.559-2.73-4.996 2.73 5.498-5.836 2.621 2.73 4.934-2.73-5.498 5.836z" />
                          </svg>
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-[#9A98B0] mt-0.5">
                      <span>العدد: {item.quantity}</span>
                      <span>التكلفة: {item.costPrice} {state.settings.currency}</span>
                      {item.customerName && <span>العميل: {item.customerName}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEditForm(item)}
                    className="p-1.5 text-slate-400 hover:text-blue-500 transition cursor-pointer"
                    title="تعديل"
                  >
                    <Icon3D name="edit" size={16} />
                  </button>
                  <button
                    onClick={() => deleteOfficeItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                    title="حذف"
                  >
                    <Icon3D name="trash" size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

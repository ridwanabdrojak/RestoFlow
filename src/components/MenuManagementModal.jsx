import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, Save, Image as ImageIcon } from 'lucide-react';
import { useMenu } from '../hooks/useMenu';

const MenuManagementModal = ({ onClose }) => {
    const { menuItems, addItem, updateItem, deleteItem } = useMenu();
    const [editingItem, setEditingItem] = useState(null); // null = list mode, object = edit mode, {} = add mode

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: 'Main',
        image_url: '',
        description: ''
    });

    // Populate form when editing
    useEffect(() => {
        if (editingItem && editingItem.id) {
            setFormData({
                name: editingItem.name,
                price: editingItem.price,
                category: editingItem.category,
                image_url: editingItem.image_url || '',
                description: editingItem.description || ''
            });
        } else {
            setFormData({
                name: '',
                price: '',
                category: 'Main',
                image_url: '',
                description: ''
            });
        }
    }, [editingItem]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            price: parseFloat(formData.price), // Ensure number
        };

        if (editingItem?.id) {
            updateItem({ id: editingItem.id, ...payload });
        } else {
            addItem(payload);
        }
        setEditingItem(null); // Back to list
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            deleteItem(id);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[85vh]">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {editingItem ? (editingItem.id ? 'Edit Item' : 'Add New Item') : 'Manage Menu'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-grow overflow-hidden flex">
                    {/* View: List or Form */}
                    {editingItem ? (
                        <div className="w-full p-8 overflow-y-auto">
                            <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Item Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Price (IDR)</label>
                                        <input
                                            type="number"
                                            required
                                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                                        <select
                                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            <option value="Main">Main Course</option>
                                            <option value="Appetizer">Appetizer</option>
                                            <option value="Side">Side Dish</option>
                                            <option value="Drink">Drink</option>
                                            <option value="Dessert">Dessert</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Image URL</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="url"
                                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                                            placeholder="https://..."
                                            value={formData.image_url}
                                            onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                        />
                                        {formData.image_url && (
                                            <div className="w-12 h-12 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                                                <img src={formData.image_url} className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setEditingItem(null)}
                                        className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 px-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Save size={18} />
                                        Save Item
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="w-full flex flex-col">
                            {/* Toolbar */}
                            <div className="p-4 border-b border-gray-100 flex justify-end">
                                <button
                                    onClick={() => setEditingItem({})} // Empty object signals "New Item"
                                    className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-colors"
                                >
                                    <Plus size={18} />
                                    Add New Item
                                </button>
                            </div>

                            {/* Table */}
                            <div className="flex-grow overflow-y-auto p-4">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                                            <th className="pb-3 pl-2">Item</th>
                                            <th className="pb-3">Category</th>
                                            <th className="pb-3">Price</th>
                                            <th className="pb-3 text-right pr-2">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {menuItems.map(item => (
                                            <tr key={item.id} className="group hover:bg-gray-50 transition-colors">
                                                <td className="py-3 pl-2 flex items-center gap-3">
                                                    <img src={item.image_url || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                                                    <span className="font-bold text-gray-800">{item.name}</span>
                                                </td>
                                                <td className="py-3">
                                                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">{item.category}</span>
                                                </td>
                                                <td className="py-3 font-medium text-gray-600">
                                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.price)}
                                                </td>
                                                <td className="py-3 text-right pr-2">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => setEditingItem(item)}
                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-100 transition-all"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-all"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MenuManagementModal;

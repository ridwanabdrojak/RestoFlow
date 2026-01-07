import React from 'react';
import { Plus } from 'lucide-react';
import { useOrder } from '../context/OrderContext';

const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
};

const MenuCard = ({ item }) => {
    const { addToCart } = useOrder();

    return (
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-200 flex flex-col h-full">
            <div className="h-32 overflow-hidden relative group">
                <img
                    src={item.image_url || item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="p-3 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-800 text-base leading-tight line-clamp-2">{item.name}</h3>
                    <span className="font-bold text-amber-600 text-sm whitespace-nowrap ml-2">{formatCurrency(item.price)}</span>
                </div>
                <p className="text-xs text-gray-500 mb-3 flex-grow">{item.category}</p>
                <button
                    onClick={() => addToCart(item)}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-colors active:scale-95 text-sm font-medium"
                >
                    <Plus size={16} />
                    Add
                </button>
            </div>
        </div>
    );
};

export default MenuCard;

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
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-100 flex flex-col h-full">
            <div className="h-40 overflow-hidden relative group">
                <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800 text-lg leading-tight">{item.name}</h3>
                    <span className="font-bold text-amber-600">{formatCurrency(item.price)}</span>
                </div>
                <p className="text-sm text-gray-500 mb-4 flex-grow">{item.category}</p>
                <button
                    onClick={() => addToCart(item)}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-colors active:scale-95"
                >
                    <Plus size={18} />
                    Add to Cart
                </button>
            </div>
        </div>
    );
};

export default MenuCard;

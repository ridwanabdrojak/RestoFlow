import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { menuData as initialMenuData } from '../data/menuData';

export const useMenu = () => {
    const queryClient = useQueryClient();

    // 1. Fetch Menu Items
    const { data: menuItems = [], isLoading, error } = useQuery({
        queryKey: ['menu'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('menu_items')
                .select('*')
                .order('id', { ascending: true }); // Keep simple order

            if (error) throw error;
            return data;
        }
    });

    // 2. Add Item
    const addMutation = useMutation({
        mutationFn: async (newItem) => {
            // Remove ID if present to let DB handle auto-increment
            const { id, ...itemData } = newItem;
            const { error } = await supabase.from('menu_items').insert([itemData]);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menu'] });
        }
    });

    // 3. Update Item
    const updateMutation = useMutation({
        mutationFn: async (updatedItem) => {
            const { id, ...updates } = updatedItem;
            const { error } = await supabase
                .from('menu_items')
                .update(updates)
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menu'] });
        }
    });

    // 4. Delete Item
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from('menu_items').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menu'] });
        }
    });

    // ONE-TIME UTILITY: Seed Database
    const seedMenu = async () => {
        // Check if empty first
        if (menuItems.length > 0) {
            alert("Menu already has items! Clear table first if you want to re-seed.");
            return;
        }

        const formattedData = initialMenuData.map((item) => ({
            name: item.name,
            price: item.price,
            category: item.category,
            image_url: item.image, // Fix: Map 'image' to 'image_url'
            is_available: true
        }));

        const { error } = await supabase.from('menu_items').insert(formattedData);
        if (error) {
            console.error("Seed failed:", error);
            alert("Failed to seed menu.");
        } else {
            alert("Menu seeded successfully! Refreshing...");
            queryClient.invalidateQueries({ queryKey: ['menu'] });
        }
    };

    return {
        menuItems,
        isLoading,
        error,
        addItem: addMutation.mutate,
        updateItem: updateMutation.mutate,
        deleteItem: deleteMutation.mutate,
        seedMenu
    };
};

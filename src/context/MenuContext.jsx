import React, { createContext, useContext, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { menuData as initialMenuData } from '../data/menuData';

const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
    const queryClient = useQueryClient();

    // 1. Fetch Menu Items
    const { data: menuItems = [], isLoading, error } = useQuery({
        queryKey: ['menu'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('menu_items')
                .select('*')
                .order('id', { ascending: true });

            if (error) throw error;
            return data;
        }
    });

    // 2. Realtime Subscription (Global)
    useEffect(() => {
        console.log("🔌 Initializing Global Menu Subscription...");
        const channel = supabase
            .channel('public:menu_items_global') // Unique name for this context
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'menu_items' },
                (payload) => {
                    console.log('🔔 Global Menu Change:', payload);
                    queryClient.invalidateQueries({ queryKey: ['menu'] });
                }
            )
            .subscribe((status) => {
                console.log("📡 Menu Subscription Status:", status);
            });

        return () => {
            console.log("🔌 Cleaning up Global Menu Subscription...");
            supabase.removeChannel(channel);
        };
    }, [queryClient]);

    // 3. Mutations
    const addMutation = useMutation({
        mutationFn: async (newItem) => {
            const { id, ...itemData } = newItem;
            const { error } = await supabase.from('menu_items').insert([itemData]);
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['menu'] })
    });

    const updateMutation = useMutation({
        mutationFn: async (updatedItem) => {
            const { id, ...updates } = updatedItem;
            const { error } = await supabase.from('menu_items').update(updates).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['menu'] })
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from('menu_items').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['menu'] })
    });

    // 4. Seeding
    const seedMenu = async () => {
        if (menuItems.length > 0) {
            alert("Menu already has items!");
            return;
        }
        const formattedData = initialMenuData.map((item) => ({
            name: item.name,
            price: item.price,
            category: item.category,
            image_url: item.image,
            is_available: true
        }));
        const { error } = await supabase.from('menu_items').insert(formattedData);
        if (error) {
            console.error("Seed failed:", error);
            alert("Failed to seed menu.");
        } else {
            alert("Menu seeded!");
            queryClient.invalidateQueries({ queryKey: ['menu'] });
        }
    };

    const value = {
        menuItems,
        isLoading,
        error,
        addItem: addMutation.mutate,
        updateItem: updateMutation.mutate,
        deleteItem: deleteMutation.mutate,
        seedMenu
    };

    return (
        <MenuContext.Provider value={value}>
            {children}
        </MenuContext.Provider>
    );
};

// Export hook for easy access
export const useMenu = () => {
    return useContext(MenuContext);
};

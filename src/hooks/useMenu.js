import { useContext } from 'react';
import { useMenu as useMenuContext } from '../context/MenuContext';

// Re-export the hook from Context for backward compatibility
export const useMenu = () => {
    return useMenuContext();
};

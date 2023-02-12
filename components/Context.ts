import { createContext } from 'react';
import {MealOrderType} from '@/lib/types';

export const UserContext = createContext({
    isLoggedIn: false,
    showShopGuide: false,
    user: {},
    login: () => { },
    logout: () => { },
    indexpageswitch: () => {}
});

export const OrdersContext = createContext({
    orderlist: [] as MealOrderType[],
    update: () => { },
});

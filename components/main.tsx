import { useState, useEffect, Fragment } from 'react';
import axios from 'axios';
import store from 'store2';
import Layout from "./layout";
import UserHead from './userhead';
import { UserContext, OrdersContext } from './Context';
import {UserContextType, OrdersContextType, User, MealOrderType} from '@/lib/types';

interface PropsType {
  children: JSX.Element;
  asUserForOwner?: boolean;
}

export default function MainPage(props: PropsType) {
    const asUserForOwner = props.asUserForOwner ? props.asUserForOwner: false;
    const [loggedIn, setLoggedIn] = useState(false);
    const [userData, setUserData] = useState({});
    const [showShopGuide, setShowShopGuide] = useState(asUserForOwner);
    const [mealOrders, setMealOrders] = useState< MealOrderType[]>([]);
  
    const login = (user?: User) => {
      if (user && user.id){
        setLoggedIn(true);
        setUserData(user); 
        //For OrdersContext Update
        fetchOrdersData(user);    
      }
    };
   
    const logout = () => {
      setLoggedIn(false);
      setUserData({});
      //Remove OrdersContext
      setMealOrders([]);
      store.remove('currorders');
    };

    const indexpageswitch = () => {
      setShowShopGuide(prevState => !prevState);
    }
  
    const userContext: UserContextType = {
      isLoggedIn: loggedIn, 
      showShopGuide: showShopGuide,
      user: userData, 
      login: login, 
      logout: logout,
      indexpageswitch: indexpageswitch
    };

    const update = (orders?: MealOrderType[]) => {
      if (orders){
        setMealOrders(orders);
      }
    };

    const ordersContext: OrdersContextType = {
      orderlist: mealOrders,
      update: update
    };
  
    async function fetchOrdersData(user: User){
      const currOrders = JSON.parse(store('currorders'));
      const currTime = Math.round(new Date().getTime() / 1000);
      if (currOrders && currOrders.userId === user.id && currTime < (currOrders.logintime + 60 * 10)){
          setMealOrders(currOrders.orderList);
          return;
      }
      const {encryptStorage} = await import('@/lib/encryptStorage');
      const headers = { authorization: `Bearer ${encryptStorage.getItem('token')}` };
      const { data } = await axios.get('/api/getcurrentorders', { headers: headers });
      setMealOrders(data);
      const mealOrders = {logintime: Math.round(new Date().getTime() / 1000), userId: user.id, orderList: data}
      store('currorders', JSON.stringify(mealOrders));
    }
    
    useEffect(() => {
      async function fetchUserData() {
        const {encryptStorage} = await import('@/lib/encryptStorage');
        const headers = { authorization: `Bearer ${encryptStorage.getItem('token')}` };
        const { data } = await axios.get('/api/getselfdetail', { headers: headers });
        const {token, ...others} = data;
        const userData = {...others, logintime: Math.round(new Date().getTime() / 1000)};
        setUserData(userData);
        store('user', JSON.stringify(userData));
        encryptStorage.setItem('token', token);
      }
    
      const user = JSON.parse(store('user'));
      if (user){
        setLoggedIn(true);
        setUserData(user);
          
        const logintime = user.logintime || 0;
        const currTime = Math.round(new Date().getTime() / 1000);
        if (currTime > (logintime + 60 * 60 * 24 * 7)){
          fetchUserData();
        }
        
        //Fetch orders data for mealOrders
        fetchOrdersData(user);
      }
    },[]);
    
    return (
        <UserContext.Provider value={userContext}>
          <OrdersContext.Provider value={ordersContext}>
            <div className="container">
                <Layout>
                  <Fragment>
                    <UserHead />
                    {props.children}
                  </Fragment>
                </Layout>
            </div>
          </OrdersContext.Provider>  
        </UserContext.Provider>
    );
}



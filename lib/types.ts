export interface UserJwtPayload {
    userId: string;
}

export interface UserRecord {
    email: string;
    name: string;
    phone?: string;
    address?: string;
    usertype: number;
    shopid?: ShopBrief[];
    password?: string;
    tobeowner: boolean;
    created: string;
    tobeownerAt?: string;
}

export interface UserData {
    id: string;
    email: string;
    name: string;
    phone?: string;
    address?: string;
    usertype: number;
    shopid?: ShopBrief[];
    password?: string;
    tobeowner: boolean;
    created: string;
    tobeownerAt?: string;
}

export interface User {
    id?: string;
    email?: string;
    name?: string;
    phone?: string;
    address?: string;
    usertype?: number;
    shopid?: ShopBrief[];
    tobeowner?: boolean;
    token?: string;
    logintime?: number;
}

export interface UserLoginType {
    email: string;
    password: string;
}

export interface UserAddType {
    name: string;
    email: string;
    password: string;
    phone: string;
    address: string;
    usertype: number;
    tobeowner: boolean;
}

export interface PasswdCheck {
    mail_sent: number;
    numForCheck: string;
    token: string;
}

export interface UserContextType {
    isLoggedIn: boolean; 
    showShopGuide: boolean;
    user: User; 
    login: (user?: User) => void; 
    logout: () => void;
    indexpageswitch: () => void;
}

export interface OrdersContextType {
    orderlist: MealOrderType[];
    update: (orders?: MealOrderType[]) => void;
}

export interface UserUpdate{
    user_update: number;
}

export interface MealUpdate{
    meal_update: number;
}

export interface MealDelete{
    meal_delete: number;
}

export interface ShopUpdate{
    shop_update: number;
}

export interface ShopDelete{
    shop_delete: number;
}

export interface NoAccount{
    no_account: number;
}

export interface PasswdErr{
    password_error: number;
}

export interface NoAuthorization{
    no_authorization: number;
}

export interface NoData{
    no_data: number;
}

export interface DuplicateEmail{
    duplicate_email: number;
}

export interface SetUserToOwnerDone{
    setusertoowner_done: number;
    id: string;
}

export interface SetShopOnboardDone{
    setshoponboard_done: number;
    id: string;
}

export interface ShopBlockUsers{
    shop_blockusers: number;
    shopId: string;
    userId: string;
}

export interface ShopUnBlockUsers{
    shop_unblockusers: number;
    shopId: string;
    userId: string;
}

export interface FileName{
    filename: string;
}

export interface ProcessResult{
    status: string;
    message: string;
}

export interface MailOptions {
    from: string;
    to: string;
    subject: string;
    html: string;
}

export interface ImgDimensionType{
    width: number;
    height: number;
}

export interface ShopDataRecord{
    shopname: string;
    foodsupply: string;
    profileimage: string;
    owner: string; 
    onboard: boolean;
    created?: string;
} 

export interface ShopDataType{
    id: string;
    shopname: string;
    foodsupply: string;
    profileimage: string;
    owner: string; 
    onboard: boolean;
    blockusers?: string[];
    created?: string;
} 

export interface ShopBrief{
    id: string;
    shopname: string;
    onboard: boolean;
} 

export interface ShopRecord{
    id: string;
    shopname: string;
    foodsupply: string;
    profileimage: string;
    owner: {
       id: string;
       name: string; 
    }
    onboard: boolean;
    blockusers?: string[];
    created?: string;
}

export interface MealDataType{
    id: string;
    shopId?: string;
    mealname: string;
    mealdescr: string;
    unitprice: number;
    profileimage?: string;
    created?: string;
} 

export interface ImageDataType{
    id: string;
    userId: string;
    base64: string;
    mimetype: string;
    width: number; 
    height: number;
}

export interface MealOrderElm {
    id: string;
    profileimage?: string;
    mealname: string;
    unitprice: number;
    quantity?: number;
}
  
export interface MealOrderRecord {
    userId?: string;
    userName?: string;
    orderList: MealOrderElm[];
    sum: number;
    tax: number;
    address: string;
    active: boolean;
    orderstatus: number;
    statushistory: string[];
    created?: string;
}

export interface MealOrderType {
    id: string;
    shopId?: string;
    shopName?: string;
    userId?: string;
    userName?: string;
    orderList: MealOrderElm[];
    sum: number;
    tax: number;
    address: string;
    active: boolean;
    orderstatus: number;
    statushistory: string[];
    created?: string;
    publiccode?: string;
}

export interface CurrentOrders {
   logintime?: number; 
   userId?: string;
   orderList: MealOrderType[];
}

export interface OrderShopsElm {
    id: string;
    shopname?: string;
    profileimage?: string;
    count: number;
    cancel: number;
}

export interface ShopClientsElm {
    id: string;
    userName: string;
    count: number;
    cancel: number;
}

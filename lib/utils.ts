import { MealOrderType } from './types';

export function passwdResetHTML(numForCheck: string): string{
    const htmlStr =  
    `
    <html>
    <body style="font-family: Arial, sans-serif;">
    <p>Hello,</p>
    <p>Please fill the following number in the designated box field of the page.</p>
    <p style="font-weight: 600; font-size: 24pt;">${numForCheck}</p>
    <p>Thanks,</p>
    Your Happy Eats! Team
    </body>
    </html>
    `;

    return htmlStr;
}

export function shopAddedHTML(shopname: string): string{
   const htmlStr =  
   `
   <html>
   <body style="font-family: Arial, sans-serif;">
   <p>Hello Administrator,</p>
   <p>Please be acknowledged that a restaurant called ${shopname} was recently added to the waiting list for your approval to be onboard.</p>
   <p>Thanks,</p>
   Your Happy Eats! Team
   </body>
   </html>
   `;

   return htmlStr;
}

export function intentToBeOwnerHTML(username?: string): string{
   let paragraph;
   if (typeof username === 'undefined'){
      paragraph =`<p>Please be acknowledged that a user recently expressed the intent to be a restaurant owner, which is awaiting your approval.</p>`;
   }else{
      paragraph =`<p>Please be acknowledged that a user called ${username} recently expressed the intent to be a restaurant owner, which is awaiting your approval.</p>`;
   }
   
   const htmlStr =  
   `
   <html>
   <body style="font-family: Arial, sans-serif;">
   <p>Hello Administrator,</p>
   ${paragraph}
   <p>Thanks,</p>
   Your Happy Eats! Team
   </body>
   </html>
   `;

   return htmlStr;
}

export function mealOrderNoticeHTML(shopname: string): string{
   const htmlStr =  
   `
   <html>
   <body style="font-family: Arial, sans-serif;">
   <p>Hello restaurant owner,</p>
   <p>Please be acknowledged that a consumer just placed a meal delivery order at ${shopname} for you to start processing.</p>
   <p>Thanks,</p>
   Your Happy Eats! Team
   </body>
   </html>
   `;

   return htmlStr;
}

export const pageSize = 10;

export const pageSizeToOwners = 10;

export const pageSizeShops = 10;

export const pageSizeMeals = 20;

export const pageSizeImages = 20;

export const pageSizeOrders = 20;

export const pageSizeClients = 50;

export const fireStoreSQLLimit = 10;

export const maxImageWidth = 1024;

export const taxRate = 0.1;

export const orderStatusDescr = ['Placed', 'Canceled', 'Processing', 'In Route', 'Delivered', 'Received'];

export const pseudoAcct = ['canlan@sample.com', 
                           'pizzeria@sample.com', 
                           'waterfish@sample.com', 
                           'taipeitop@sample.com', 
                           'ramenjoy@sample.com',
                           'burger@sample.com',
                           'ramenjoy2@sample.com'];

export function currOrderStatus(order: MealOrderType){
   const latestDateTime = order.statushistory[order.statushistory?.length - 1]; 
   const latestTime = (new Date(latestDateTime)).toLocaleTimeString('en-US');
   return `${orderStatusDescr[order.orderstatus]}@${latestTime}`;
}

export function currOrderStatusLong(order: MealOrderType){
   const latestDateTime = order.statushistory[order.statushistory?.length - 1]; 
   const latestTime = (new Date(latestDateTime)).toLocaleString();
   return `${orderStatusDescr[order.orderstatus]}@${latestTime}`;
}

export function timeDiffPlacedToLast(order: MealOrderType){
   const latestDateTime = order.statushistory[order.statushistory?.length - 1];
   const placedDateTime = order.created!;
   const timeDeiff = (new Date(latestDateTime)).getTime() - (new Date(placedDateTime)).getTime();
   return timeDiffExpression(timeDeiff);
}

export function timeDiffPlacedToCurrent(order: MealOrderType, currentTine: Date){
   const placedDateTime = order.created!;
   const timeDeiff = currentTine.getTime() - (new Date(placedDateTime)).getTime();
   return timeDiffExpression(timeDeiff);
}

export function timeDiffLastToCurrent(order: MealOrderType, currentTine: Date){
   const latestDateTime = order.statushistory[order.statushistory?.length - 1];
   const timeDeiff = currentTine.getTime() - (new Date(latestDateTime)).getTime();
   return timeDiffExpression(timeDeiff);
}

export function timeDiffExpression(num: number){
   const secnum = Math.floor(num/1000);
   const seconds = secnum % 60;
   const secondStr = seconds >= 10 ? seconds.toString(): '0'+seconds.toString();
   const minutes = ((secnum - seconds) / 60) % 60;
   const minuteStr = minutes >= 10 ? minutes.toString(): '0'+minutes.toString();
   const hours = (secnum - 60 * minutes - seconds) / ( 60 * 60);
   const hourStr = hours >= 10 ? hours.toString(): '0'+hours.toString();

   return `${hourStr}:${minuteStr}:${secondStr}`;
}

export function getUserTypeDescr(usertype: number){
    let descr: string;
    switch(usertype){
       case 1:
          descr = 'Regular User';
          break;
       case 2:
          descr = 'Restaurant Owner';
          break;
       case 3:
          descr = 'App Administrator';
          break;
       default:
          descr = 'Regular User';
          break;
    }
    return descr;
}

export function getRandomInt(max: number) {
   return Math.floor(Math.random() * max);
}


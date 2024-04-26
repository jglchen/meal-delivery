---
#
# By default, content added below the "---" mark will appear in the home page
# between the top bar and the list of recent posts.
# To change the home page layout, edit the _layouts/home.html file.
# See: https://jekyllrb.com/docs/themes/#overriding-theme-defaults
#
layout: home
---

This is a semi-commercial meal-delivery app for demonstrations. Everybody can sign up as a regular consumer in this app. If regular consumers want to list their restaurants in the app for delivery, any user can express their intent in the app. The app administrator has the authority to approve the application. If the application is approved, the applicant will become a restaurant owner. Restaurant owners can play dual roles as restaurant owners and as regular consumers. Restaurant owners can place orders as regular users to any restaurant except for the one they manage.

The key functionalities of this app are summarized as bolow:

1. Everybody can sign up as a regular consumer in this app.
2. Registered consumers can apply as restaurant owners to list their restaurants in the app for delivery. The applications need approval by the app administrator.
3. Restaurant owners can play dual roles as restaurant owners and as regular consumers. Restaurant owners can place orders as regular users to any restaurant except for the one they manage.
4. Restaurant owners have the authority to list their restaurants in the app, which still need the app administrator’s approval to be officially on board. 
5. Restaurant owners have the authority to add any meals to the restaurants they manage.
6. Restaurant owners can block users. The blocked users will not be able to follow the restaurants and place orders.
7. An order should be placed for a single restaurant only.
8. Once a delivery order is placed, both the placing user and the restaurant owner can instantaneously follow the delivery status. The placing users can cancel the orders if the restaurant owner does not start processing.
9. Regular users can track down all their purchase order records.
10. Restaurant owners can examine all the clients, which have placed orders at their restaurants, and their purchase order records.

[![meal-delivery-screenshot](/images/meal-delivery-screenshot.png)](https://meal-delivery-three.vercel.app)

**iOS** and **Android** mobile apps are developed with **React Native**, anyone who is interested can test the development builds with [iOS Simulator Build](https://expo.dev/accounts/jglchen/projects/meal-delivery/builds/0d34147e-b06d-4298-aa6d-757691184c99) and [Android Internal Distribution Build](https://expo.dev/accounts/jglchen/projects/meal-delivery/builds/a58cdda5-857a-4f1e-9721-5f8397303a47). If the build storage link has expired, please go to [https://projects-jglchen.vercel.app/en/contact](https://projects-jglchen.vercel.app/en/contact) to request build files.


### [View the App](https://meal-delivery-three.vercel.app)
### [App GitHub](https://github.com/jglchen/meal-delivery)
### Docker: docker run -p 3000:3000 jglchen/meal-delivery
### [iOS Simulator Build](https://expo.dev/accounts/jglchen/projects/meal-delivery/builds/0d34147e-b06d-4298-aa6d-757691184c99)
### [Android Internal Distribution Build](https://expo.dev/accounts/jglchen/projects/meal-delivery/builds/a58cdda5-857a-4f1e-9721-5f8397303a47)
### [React Native GitHub](https://github.com/jglchen/react-native-meal-delivery)
### back To [Series Home](https://jglchen.github.io/)

{% include giscus.html %}

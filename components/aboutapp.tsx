import loaderStyles from '@/styles/loader.module.css';
import lightBoxStyles from '@/styles/lightbox.module.css';

interface PropsType {
    closeAboutInfo: () => void;
}

function AboutApp({closeAboutInfo}: PropsType){

    return(
        <div className={loaderStyles.container}>
           <div className={lightBoxStyles.heading}>
               About This App
           </div>
           <div className="clearfix">
             <button className="muted-button float-right button" style={{marginRight: '0.5rem'}} onClick={closeAboutInfo}>Close</button>
           </div>
           <div>
            <p>
            This is a semi-commercial meal-delivery app for demonstrations. Everybody can sign up as a regular consumer in this app.
            If regular consumers want to list their restaurants in the app for delivery, any user can express their intent in the app.
            The app administrator has the authority to approve the application. If the application is approved, the applicant will become a restaurant owner.
            Restaurant owners can play dual roles as restaurant owners and as regular consumers. Restaurant owners can place orders as regular users to any restaurant except for the one they manage.
            </p>
            <p>
            The key functionalities of this app are summarized as bolow:
            <ol>
                <li>Everybody can sign up as a regular consumer in this app.</li>
                <li>Registered consumers can apply as restaurant owners to list their restaurants in the app for delivery. The applications need approval by the app administrator.</li>
                <li>Restaurant owners can play dual roles as restaurant owners and as regular consumers. Restaurant owners can place orders as regular users to any restaurant except for the one they manage.</li>
                <li>Restaurant owners have the authority to list their restaurants in the app, which still need the app administrator’s approval to be officially on board.</li> 
                <li>Restaurant owners have the authority to add any meals to the restaurants they manage.</li>
                <li>Restaurant owners can block users. The blocked users will not be able to follow the restaurants and place orders.</li>
                <li>An order should be placed for a single restaurant only.</li>
                <li>Once a delivery order is placed, both the placing user and the restaurant owner can instantaneously follow the delivery status. The placing users can cancel the orders if the restaurant owner does not start processing.</li>
                <li>Regular users can track down all their purchase order records.</li>
                <li>Restaurant owners can examine all the clients, which have placed orders at their restaurants, and their purchase order records.</li>
            </ol>
            </p>
            <p>
            <strong>iOS</strong> and <strong>Android</strong> mobile apps are also delivered. 
            The apps are developed with <strong>React Native</strong>, anyone who is interested can test the development builds with <a href='https://expo.dev/accounts/jglchen/projects/meal-delivery/builds/0d34147e-b06d-4298-aa6d-757691184c99' target='_blank' rel='noreferrer'>iOS Simulator Build</a> and <a href='https://expo.dev/accounts/jglchen/projects/meal-delivery/builds/a58cdda5-857a-4f1e-9721-5f8397303a47' target='_blank' rel='noreferrer'>Android Internal Distribution Build</a>.
            If the build storage link has expired, please go to <a href='https://projects-jglchen.vercel.app/en/contact' target='_blank' rel='noreferrer'>https://projects-jglchen.vercel.app/en/contact</a> to request build files.
            </p>
           </div>       
        </div>
    );
}

export default AboutApp;
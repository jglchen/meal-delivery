import Head from 'next/head';

export default function Layout({ children }: {children: JSX.Element}) {
    return (
        <>
           <Head>
             <title>Welcome to Happy Eats!</title>
             <link rel="icon" href="/favicon.ico" />
             <meta
              name="description"
              content="A semi-commercial meal-delivery app for demonstrations"
              />
             <meta name="og:title" content="Welcome to Happy Eats!" />
             <meta
              property="og:description"
              content="A semi-commercial meal-delivery app for demonstrations"
              />
           </Head>
           <main>
              {children}
           </main>   
        </>
    );
}


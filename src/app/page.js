import Head from 'next/head';
import Map from '../components/map';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Public Transit Accessibility</title>
      </Head>
      <main>
        <Map />
      </main>
    </div>
  );
}

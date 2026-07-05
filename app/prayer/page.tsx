export const dynamic = "force-dynamic";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { getPrayerTimes } from "../../lib/prayer";
import PrayerDashboard from "../components/PrayerDashboard";

export default async function PrayerPage() {
  const data = await getPrayerTimes();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12">
        <section>
          <PrayerDashboard data={data} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
import AboutKost from "@/components/aboutKost"
import PenghasilanBulanan from "@/components/penghasilanBulanan"
import Pilihan from "@/components/pilihan"
import ProtectedRoute from "@/components/protectedroute"


const Page = () => {
    return (
    <main>
      <div>
        <ProtectedRoute>
          <AboutKost/>
          <PenghasilanBulanan/>
          <Pilihan/>
        </ProtectedRoute>
      </div>
    </main>
  );
};

export default Page;

import NavigationBar from "@/components/navbar";
import "@/app/globals.css"
import { Gabarito } from 'next/font/google'
import { ExpenseProvider } from "@/components/pengeluaran/ExpensesContext"
import { CategoryProvider } from "@/components/category/index"

const gabarito = Gabarito({ subsets: ['latin'] })

export const metadata = {
  title: "KostCash",
  description: "Website untuk membantu anak kost dalam memanajemen keuangan",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${gabarito.className}`} >
      <NavigationBar/>
      <CategoryProvider>
      <ExpenseProvider>
        {children}
      </ExpenseProvider>
      </CategoryProvider>
        </body>
    </html>
  );
}

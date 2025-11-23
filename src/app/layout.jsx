  import NavigationBar from "@/components/navbar";
  import "@/app/globals.css"
  import { Poppins } from 'next/font/google'
  import { ExpenseProvider } from "@/components/pengeluaran/ExpensesContext"
  import { CategoryProvider } from "@/components/category/index"
  import {MethodContextProvider} from "@/components/payment/PaymentMethodContext";

  const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: '600' 
})

  export const metadata = {
    title: "KostCash",
    description: "Website untuk membantu anak kost dalam memanajemen keuangan",
  };

  export default function RootLayout({ children }) {
    return (
      <html lang="en">
        <body className={`${poppins.className}`} >
        <MethodContextProvider>
        <CategoryProvider>
        <ExpenseProvider>
        <NavigationBar/>
          {children}
        </ExpenseProvider>
        </CategoryProvider>
        </MethodContextProvider>
          </body>
      </html>
    );
  }

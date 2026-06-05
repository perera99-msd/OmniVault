import { DailyTransactionForm } from "@/components/forms/DailyTransactionForm";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col p-6 space-y-8 bg-gradient-to-br from-background to-muted/20 min-h-screen">
      <header className="flex flex-col space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary">
          OmniVault
        </h1>
        <p className="text-muted-foreground text-lg">
          Your wealth. Every source. One vault.
        </p>
      </header>
      
      <section className="flex-1">
        <DailyTransactionForm />
      </section>
    </main>
  );
}

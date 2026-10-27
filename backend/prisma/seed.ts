import { prisma } from "../src/lib/prisma.js";
import { hashPassword } from "../src/utils/hash.js";

const DEMO_EMAIL = "conta@teste.com";

const categories = [
  { title: "Alimentação", description: "Restaurantes, delivery e refeições", icon: "utensils", color: "blue" },
  { title: "Entretenimento", description: "Cinema, jogos e lazer", icon: "ticket", color: "pink" },
  { title: "Investimento", description: "Aplicações e retornos financeiros", icon: "piggy-bank", color: "green" },
  { title: "Mercado", description: "Compras de supermercado e mantimentos", icon: "shopping-cart", color: "orange" },
  { title: "Salário", description: "Renda mensal e bonificações", icon: "briefcase-business", color: "green" },
  { title: "Saúde", description: "Medicamentos, consultas e exames", icon: "heart-pulse", color: "red" },
  { title: "Transporte", description: "Gasolina, transporte público e viagens", icon: "car-front", color: "purple" },
  { title: "Utilidades", description: "Energia, água, internet e telefone", icon: "tool-case", color: "yellow" },
];

const transactions = [
  { description: "Pagamento de Salário", date: "2025-12-01", type: "INCOME", amount: 425000, category: "Salário" },
  { description: "Jantar no Restaurante", date: "2025-11-30", type: "EXPENSE", amount: 8950, category: "Alimentação" },
  { description: "Posto de Gasolina", date: "2025-11-29", type: "EXPENSE", amount: 10000, category: "Transporte" },
  { description: "Compras no Mercado", date: "2025-11-28", type: "EXPENSE", amount: 15680, category: "Mercado" },
  { description: "Retorno de Investimento", date: "2025-11-26", type: "INCOME", amount: 34025, category: "Investimento" },
  { description: "Aluguel", date: "2025-11-26", type: "EXPENSE", amount: 170000, category: "Utilidades" },
  { description: "Freelance", date: "2025-11-24", type: "INCOME", amount: 250000, category: "Salário" },
  { description: "Compras Jantar", date: "2025-11-22", type: "EXPENSE", amount: 15000, category: "Mercado" },
  { description: "Cinema", date: "2025-11-18", type: "EXPENSE", amount: 8800, category: "Entretenimento" },
];

async function main() {
  // Re-runnable: removing the demo user cascades to its categories and transactions.
  await prisma.user.deleteMany({ where: { email: DEMO_EMAIL } });

  const user = await prisma.user.create({
    data: { name: "Conta teste", email: DEMO_EMAIL, password: await hashPassword("12345678") },
  });

  const categoryIds = new Map<string, string>();
  for (const category of categories) {
    const created = await prisma.category.create({ data: { ...category, userId: user.id } });
    categoryIds.set(category.title, created.id);
  }

  for (const { category, date, ...transaction } of transactions) {
    await prisma.transaction.create({
      data: {
        ...transaction,
        date: new Date(`${date}T00:00:00.000Z`),
        userId: user.id,
        categoryId: categoryIds.get(category)!,
      },
    });
  }

  console.log(`Seeded ${DEMO_EMAIL} with ${categories.length} categories and ${transactions.length} transactions.`);
}

await main();

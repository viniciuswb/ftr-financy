export type TransactionType = "EXPENSE" | "INCOME";

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Category {
  id: string;
  title: string;
  description: string | null;
  icon: string;
  color: string;
  transactionCount: number;
  totalAmount: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  date: string;
  amount: number;
  categoryId: string;
  category: Pick<Category, "id" | "title" | "icon" | "color">;
}

export interface AuthPayload {
  token: string;
  user: User;
}

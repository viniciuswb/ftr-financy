import { gql } from "@apollo/client";

const CATEGORY_FIELDS = "id title description icon color transactionCount totalAmount";
const TRANSACTION_FIELDS = "id type description date amount categoryId category { id title icon color }";

export const REGISTER = gql`
  mutation Register($data: RegisterInput!) {
    register(data: $data) {
      token
      user { id name email }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($data: LoginInput!) {
    login(data: $data) {
      token
      user { id name email }
    }
  }
`;

export const ME = gql`
  query Me {
    me { id name email }
  }
`;

export const UPDATE_ME = gql`
  mutation UpdateMe($data: UpdateMeInput!) {
    updateMe(data: $data) { id name email }
  }
`;

export const CATEGORIES = gql`
  query Categories {
    categories { ${CATEGORY_FIELDS} }
  }
`;

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($data: CreateCategoryInput!) {
    createCategory(data: $data) { ${CATEGORY_FIELDS} }
  }
`;

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: ID!, $data: UpdateCategoryInput!) {
    updateCategory(id: $id, data: $data) { ${CATEGORY_FIELDS} }
  }
`;

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`;

export const TRANSACTIONS = gql`
  query Transactions {
    transactions { ${TRANSACTION_FIELDS} }
  }
`;

export const CREATE_TRANSACTION = gql`
  mutation CreateTransaction($data: CreateTransactionInput!) {
    createTransaction(data: $data) { ${TRANSACTION_FIELDS} }
  }
`;

export const UPDATE_TRANSACTION = gql`
  mutation UpdateTransaction($id: ID!, $data: UpdateTransactionInput!) {
    updateTransaction(id: $id, data: $data) { ${TRANSACTION_FIELDS} }
  }
`;

export const DELETE_TRANSACTION = gql`
  mutation DeleteTransaction($id: ID!) {
    deleteTransaction(id: $id)
  }
`;

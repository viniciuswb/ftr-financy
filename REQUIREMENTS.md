# Practical Challenge: Financy

## Meet the project

Let's develop a FullStack finance management application: Financy!

The goal is to create an application that allows organizing finances, with management of transactions and categories.

## Resources

Materials for you to use as a base for development

- **Financy** — [Layout · Figma](https://www.figma.com/design/VbiJi8YeRHcW2nhxkETW6U/Financy--Community-)

## Instructions

Structure, rules and requirements of the project

---

## Back-end description and functional requirements

In this back-end project, an API will be developed to manage the organization of finances.

### Features and Rules

- The user can create an account and log in
- The user can view and manage only the transactions and categories created by them
- It must be possible to create a transaction
- It must be possible to delete a transaction
- It must be possible to edit a transaction
- It must be possible to list all transactions
- It must be possible to create a category
- It must be possible to delete a category
- It must be possible to edit a category
- It must be possible to list all categories

> ⚠️ For this challenge you are expected to use the SQLite database. If you prefer, you can use Postgres as an option.

### Environment variables

Every project has several variable configurations that must be different depending on the environment in which it runs. For this, it's important to know, in an easy and intuitive way, which variables these are. So it is mandatory that this project has a `.env.example` file with the necessary keys.

```env
JWT_SECRET=
DATABASE_URL=
```

If you add additional variables, remember to include them in the `.env.example`.

### Non-Functional Requirements

The use of the following is mandatory:

- TypeScript
- GraphQL
- Prisma
- SQLite

### Best Practices

- Don't forget to enable CORS in the application.

### Want to go further?

Remember to follow all the mandatory requirements, especially those related to the technologies, such as GraphQL. But you learned a lot of content throughout your Postgraduate journey and, if you want to challenge yourself, you can apply the concepts of best practices and DevOps you studied. Just remember to configure the whole environment so that the application can be run locally.

---

## Front-end description and functional requirements

In this front-end project, a React application will be developed that, together with the API, allows the management of transactions and categories.

### Features and Rules

Just like in the API, we have the following features and rules:

- The user can create an account and log in
- The user can view and manage only the transactions and categories created by them
- It must be possible to create a transaction
- It must be possible to delete a transaction
- It must be possible to edit a transaction
- It must be possible to list all transactions
- It must be possible to create a category
- It must be possible to delete a category
- It must be possible to edit a category
- It must be possible to list all categories

In addition, we also have some important rules specific to the front-end:

- It is mandatory to create a React application using GraphQL for API queries and Vite as the bundler;
- Follow the Figma layout as faithfully as possible;

### Pages

This application has 6 pages and two modals with the forms (Dialog):

- The root page (`/`) which displays:
  - Login screen if the user is logged out
  - Dashboard screen if the user is logged in

### Environment variables

Every project has several variable configurations that must be different depending on the environment in which it runs. For this, it's important to know, in an easy and intuitive way, which variables these are. So it is mandatory that this project has a `.env.example` file with the necessary keys:

```env
VITE_BACKEND_URL=
```

### Best Practices

- Start the project with the **Style Guide** tab in Figma. This way, you prepare your entire theme, fonts and components, and when you create the pages it will be much easier;
- Just as the user experience (UX) is important, your development experience (DX) is also very important. That's why, although it's possible to create this application without any library, we recommend using some libraries that will make both the initial development and the code maintenance easier;

### Non-Functional Requirements

The use of the following is mandatory:

- Typescript
- React
- Vite without a framework
- GraphQL

The use of the following is flexible:

- TailwindCSS
- Shadcn
- React Query
- React Hook Form
- Zod

### Want to go further?

If you want to challenge yourself and explore concepts beyond what was proposed in the challenge, we have some ideas in mind to inspire you:

> ⚠️ Your challenge is graded only taking into account the mandatory rules and features mentioned in the previous steps. Therefore, submit your code for grading before implementing new features (or create a new branch with your changed code)

- **Image upload:** uploading an image for the user's avatar is optional, but how about using what you learned and challenging yourself by adding the user's profile picture.

---

## Tasks

Use this checklist to help organize your delivery

- [x] **[Back-end]**
- [x] The user can create an account and log in
- [x] The user can view and manage only the transactions and categories created by them
- [x] It must be possible to create a transaction
- [x] It must be possible to delete a transaction
- [x] It must be possible to edit a transaction
- [x] It must be possible to list all transactions
- [x] It must be possible to create a category
- [x] It must be possible to delete a category
- [x] It must be possible to edit a category
- [x] It must be possible to list all categories
- [x] **[Front-end]**
- [x] The user can create an account and log in
- [x] The user can view and manage only the transactions and categories created by them
- [x] It must be possible to create a transaction
- [x] It must be possible to delete a transaction
- [x] It must be possible to edit a transaction
- [x] It must be possible to list all transactions
- [x] It must be possible to create a category
- [x] It must be possible to delete a category
- [x] It must be possible to edit a category
- [x] It must be possible to list all categories
- [x] It is mandatory to create a React application using GraphQL for API queries and Vite as the bundler;
- [x] Follow the Figma layout as faithfully as possible;

---

## Delivery

This challenge must be delivered on our platform. To submit, you need to create a repository on GitHub and send the link to your repository with your solution on our platform!

However, it's important to follow some standards so that we can grade your project correctly:

- The repository must be public;
- The repository must contain the solution to the challenge;
- The repository must have two subfolders
  - `backend` will contain the complete solution to the Back-end challenge;
  - `frontend` will contain the complete solution to the Front-end challenge.
- The repository must contain the code for the mandatory rules and features. If you want to challenge yourself with extra features, create the code with these changes in a new branch, preserving your original challenge code.

After completing the challenge, if you feel comfortable, how about posting on LinkedIn about your experience, sharing your project and what you learned? It's an excellent way to demonstrate your knowledge and attract new opportunities! 👀

And you can tag us, okay? It will be amazing to follow your whole evolution! 💜

## If you have questions

This project is strongly inspired by the features and technologies seen in the MindShare project. So if you have questions, it's worth revisiting the lessons from the Back-end GraphQL and Front-end GraphQL modules or the project's code (frontend and backend), as they can help you a lot in solving this challenge.

## Final considerations

Remember that the purpose of a challenge is to push you forward, so, depending on the challenge, you may need to go beyond what was discussed in class. But this isn't a bad thing: having the autonomy to look for extra information is a very valuable skill and it will be great for you to practice it here with us!

And remember: stay calm! Facing challenges is part of your learning process!

If you need any guidance or support, we're here with you! Happy studying and good practice! 💜

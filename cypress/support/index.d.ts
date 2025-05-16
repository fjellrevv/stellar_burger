declare namespace Cypress {
    interface Chainable<Subject = any> {
      addIngredient(ingredientName: string): Chainable<void>;
    }
  }

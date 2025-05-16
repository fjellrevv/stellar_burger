/// <reference types="cypress" />

Cypress.Commands.add('addIngredient', (ingredientName: string) => {
    cy.contains(ingredientName).parent().find('button').click();
  });

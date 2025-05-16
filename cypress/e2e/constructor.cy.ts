import { SELECTORS } from 'cypress/support/constants';

describe('test stellar burger', () => {

  beforeEach(() => {
    cy.setCookie("refreshToken", "test-refreshToken");
    cy.setCookie('accessToken', 'test-accessToken');
  })

  afterEach(() => {
    cy.clearAllCookies();
  })

  const ingredients = {
    bun: 'Краторная булка N-200i',
    meat_1: 'Филе Люминесцентного тетраодонтимформа',
    meat_2: 'Мясо бессмертных моллюсков Protostomia',
    sauce_1: 'Соус фирменный Space Sauce',
    salad: 'Мини-салат Экзо-Плантаго',
    sauce_2: 'Соус Spicy-X',
    rings: 'Хрустящие минеральные кольца'
  };

  describe('Неавторизованный пользователь', () => {

    describe('Работа с конструктором бургера', () => {
      beforeEach(() => {
        cy.intercept('GET', '**/ingredients', {fixture: 'ingredients.json' })
        .as('getIngredients');
        cy.visit('');
        cy.wait('@getIngredients');

        cy.addIngredient(ingredients.bun);
        cy.addIngredient(ingredients.meat_2);
        cy.addIngredient(ingredients.salad);
        cy.addIngredient(ingredients.rings);
      });

      it('Перенос на страницу авторизации при оформлении заказа', () => {
        cy.contains('Оформить заказ').click();
      });
      
      it('Удаление ингредиентов (включая булку)', () => {
        cy.contains('Оформить заказ')
          .parents('section')
          .first()
          .within(() => {
            [ingredients.meat_2, ingredients.rings, ingredients.bun].forEach(
              (item) => {
                cy.contains(item)
                  .parent()
                  .find('.constructor-element__action')
                  .click();
              }
            );
            cy.contains(ingredients.bun).should('exist');
          });
      });
    });

    describe('Модальное окно ингредиента', () => {
      beforeEach(() => {
        cy.intercept('GET', '**/ingredients', {fixture: 'ingredients.json' })
        .as('getIngredients');
        cy.visit('');
        cy.wait('@getIngredients');
        cy.contains('Соус с шипами Антарианского плоскоходца').parent().click();
      });
      it('Открытие модального окна', () => {
        cy.get(SELECTORS.MODAL).should(
          'contain',
          'Соус с шипами Антарианского плоскоходца'
        );
        cy.contains('Выберите булки').should('exist');
      });
    
      it('Закрытие модального окна через крестик', () => {
        cy.get(SELECTORS.MODAL_CLOSE_BUTTON).click();
        cy.get(SELECTORS.MODAL).should('not.exist');
        cy.contains('Выберите булки').should('exist');
      });
   
      it('Закрытие модального окна по клику на оверлей', () => {
        cy.get(SELECTORS.MODAL_OVERLAY).click({ force: true });
        cy.get(SELECTORS.MODAL).should('not.exist');
        cy.contains('Выберите булки').should('exist');
      });
    });
  });

  describe('Авторизованный пользователь', () => {
    beforeEach(() => {
      cy.window().then((window) => {
        window.localStorage.setItem('refreshToken', 'testRefresh');
      });

      cy.intercept('GET', '/api/auth/user', {
        fixture: 'user.json'
      }).as('getUser');

      cy.intercept('GET', '/api/ingredients', {
        fixture: 'ingredients.json'
      }).as('getIngredients');

      cy.visit('');
      cy.wait(['@getUser', '@getIngredients']);
    });

    afterEach(() => {
      cy.window().then((window) => {
        window.localStorage.removeItem('refreshToken');
      });
    });

    it('Оформление заказа авторизованным пользователем', () => {
      cy.intercept('POST', '/api/orders', {
        fixture: 'order.json',
        delay: 100
      }).as('postOrder');

      Object.values(ingredients).forEach((item) => {
        cy.addIngredient(item);
      });

      cy.contains('Оформить заказ').click();

      cy.wait('@postOrder').then(() => {
        cy.get(SELECTORS.MODAL).should('contain', '77131');
        cy.get(SELECTORS.MODAL_CLOSE_BUTTON).click();

        cy.contains('Выберите булки').should('exist');
        cy.contains('Оформить заказ').parent().contains('0').should('exist');
      });
    });
  });
});

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

        cy.contains('Оформить заказ').as('orderButton');
      });

      it('Перенос на страницу авторизации при оформлении заказа', () => {
        cy.get('@orderButton').click();
      });
      
      it('Удаление ингредиентов (включая булку)', () => {
        cy.get('@orderButton')
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

        cy.contains('Выберите булки').as('chooseBun');
      });
      it('Открытие модального окна', () => {
        cy.get(SELECTORS.MODAL).should(
          'contain',
          'Соус с шипами Антарианского плоскоходца'
        );
        cy.get('@chooseBun').should('exist');
      });
    
      it('Закрытие модального окна через крестик', () => {
        cy.get(SELECTORS.MODAL_CLOSE_BUTTON).click();
        cy.get(SELECTORS.MODAL).should('not.exist');
        cy.get('@chooseBun').should('exist');
      });
   
      it('Закрытие модального окна по клику на оверлей', () => {
        cy.get(SELECTORS.MODAL_OVERLAY).click({ force: true });
        cy.get(SELECTORS.MODAL).should('not.exist');
        cy.get('@chooseBun').should('exist');
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

      cy.contains('Оформить заказ').as('orderButton');
      cy.contains('Выберите булки').as('chooseBun');

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

      cy.get('@orderButton').click();

      cy.wait('@postOrder').then(() => {
        cy.get(SELECTORS.MODAL).should('contain', '77131');
        cy.get(SELECTORS.MODAL_CLOSE_BUTTON).click();

        cy.get('@chooseBun').should('exist');
        cy.get('@orderButton').parent().contains('0').should('exist');
      });
    });
  });
});

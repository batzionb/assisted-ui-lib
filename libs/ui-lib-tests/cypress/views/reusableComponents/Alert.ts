export class Alert {
  static readonly alias = `@${Alert.name}`;
  static readonly selector = '.pf-c-alert';

  constructor(parentAlias: string, id: string = Alert.selector) {
    cy.findWithinOrGet(id, parentAlias).as(Alert.name);
  }

  get body() {
    return cy.get(Alert.alias);
  }

  get title() {
    return this.body.find('.pf-c-alert__title');
  }

  get description() {
    return this.body.find('.pf-c-alert__description');
  }
}

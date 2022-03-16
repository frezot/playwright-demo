import test, { expect, Locator, Page } from "@playwright/test";

export class SqlPage {
  readonly page: Page;

  private readonly _form: Locator;
  private readonly _submit: Locator;
  private readonly _resTable: Locator;
  private readonly _resSummary: Locator;
  private readonly _shippersFastQuery: Locator;

  constructor(page: Page) {
    this.page = page;

    this._form = page.locator(`[id="tryitform"]`);
    this._submit = page.locator(".ws-btn");
    this._resTable = page.locator(".ws-table-all");
    this._resSummary = page.locator(`[id="divResultSQL"] > div:nth-child(1)`);
    this._shippersFastQuery = page.locator(
      `[title="Click to see the content of the Shippers table"]`
    );
  }

  private getRowLocator(index: number) {
    // NOTE: если бы вынести строку-заголовок из tbody в thead не пришлось бы сдвигать индексы
    return this._resTable.locator(`tr:nth-child(${index + 1})`);
  }

  async start() {
    await this.page.goto("/sql/trysql.asp?filename=trysql_select_all");
  }

  async writeQuery(query: string) {
    await this.page.evaluate((_query) => {
      //@ts-ignore
      window.editor.doc.setValue(_query);
    }, query);
  }

  async submitForm() {
    await this._submit.click();
  }

  async evaluateQuery(query: string) {
    await this.writeQuery(query);
    await this.submitForm();
  }

  async applyShippersFastQuery() {
    await this._shippersFastQuery.click();
  }

  async verifyFormScreenshot(description?: string) {
    expect(await this._form.screenshot()).toMatchSnapshot(description);
  }

  async expectRowContent(options: { index: number; name: string; address: string }) {
    const row = this.getRowLocator(options.index);

    await expect(row.locator("td:nth-child(3)")).toHaveText(options.name);
    await expect(row.locator("td:nth-child(4)")).toHaveText(options.address);
    // NOTE: семантически было бы лучше если колонки таблицы различались разметкой а не индексами
  }

  async expectFullRowContent(index: number, expectedText: string) {
    const row = this.getRowLocator(index);

    await expect(row).toHaveText(expectedText);
  }

  async shouldFoundRecords(count: number) {
    await expect(this._resSummary.locator(`[style="margin-bottom:10px;"]`)).toHaveText(
      `Number of Records: ${count}`
    );
    // страхуемся и проверяем что в таблице и правда ожидаемо число строк
    await expect(this._resTable.locator("tr")).toHaveCount(count + 1);
  }

  async shouldAffectedRows(count: number) {
    await expect(this._resSummary).toHaveText(
      `You have made changes to the database. Rows affected: ${count}`
    );
  }
}

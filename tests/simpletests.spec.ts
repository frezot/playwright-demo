import { test } from "@playwright/test";
import { SqlPage } from "./sql-page";

/**
 * Вывести все строки таблицы Customers и убедиться,
 * что запись с ContactName равной ‘СGiovanni Rovelli’
 * имеет Address = ‘Via Ludovico il Moro 22’.
 */
test("Select `all` works correct", async ({ page }) => {
  const sqlPage = new SqlPage(page);

  await sqlPage.start();
  await sqlPage.evaluateQuery("SELECT * FROM Customers;");
  await sqlPage.expectRowContent({
    index: 49,
    name: "Giovanni Rovelli",
    address: "Via Ludovico il Moro 22",
  });
});

/**
 * Вывести только те строки таблицы Customers, где city=‘London’.
 * Проверить, что в таблице ровно 6 записей.
 */
test("City filter applies correct", async ({ page }) => {
  const sqlPage = new SqlPage(page);

  await sqlPage.start();
  await sqlPage.evaluateQuery(`SELECT * FROM Customers WHERE city = "London";`);
  await sqlPage.shouldFoundRecords(6);
});

/**
 * Добавить новую запись в таблицу Customers и проверить, что эта запись добавилась.
 */
test("Insert operation works correct", async ({ page }) => {
  const sqlPage = new SqlPage(page);

  await sqlPage.start();
  await sqlPage.evaluateQuery(`
    INSERT INTO Customers (CustomerID, CustomerName, ContactName, Address, City, PostalCode, Country)
    VALUES ('100', 'Biba', 'Boba', 'Nowhere', 'Gotham', '100500', 'ES');
  `);
  await sqlPage.shouldAffectedRows(1);

  // TODO: было бы элегантнее проверить содержимое `Web sql` в localStorage но надо разбираться

  await sqlPage.evaluateQuery(`SELECT * FROM Customers WHERE CustomerID = "100";`);
  await sqlPage.shouldFoundRecords(1);
});

/**
 * Обновить все поля (кроме CustomerID) в любой записи таблицы *Customers*и проверить, что изменения записались в базу.
 */
test("Update operation works correct", async ({ page }) => {
  const sqlPage = new SqlPage(page);

  await sqlPage.start();
  await sqlPage.evaluateQuery(`
  UPDATE Customers
  SET CustomerName="Potter", ContactName="Harry", Address="4 Privet Drive", City="Little Whinging", PostalCode=" 4242 ", Country="England"
  WHERE CustomerID = "49";
`);
  await sqlPage.shouldAffectedRows(1);

  // TODO: было бы элегантнее проверить содержимое `Web SQL` в localStorage но надо разбираться
  await sqlPage.evaluateQuery(`SELECT * FROM Customers WHERE CustomerID = "49";`);
  await sqlPage.expectFullRowContent(1, "49PotterHarry4 Privet DriveLittle Whinging 4242 England");
});

/**
 * Применяем быстрый фильтр и проверяем форму визуально
 */
test("Fast query by table renders correct", async ({ page }) => {
  const sqlPage = new SqlPage(page);

  await sqlPage.start();
  await sqlPage.submitForm();
  await sqlPage.applyShippersFastQuery();
  await sqlPage.verifyFormScreenshot();
});

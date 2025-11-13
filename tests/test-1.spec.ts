import { test, expect } from '@playwright/test';

test('tutorial CRUD test', async ({ page }) => {
  await page.goto('http://localhost:8081/tutorials');

  // --- Create first tutorial ---
  await page.getByRole('link', { name: 'Add' }).click();
  await page.getByRole('textbox', { name: 'Title' }).fill('Run test');
  await page.getByRole('textbox', { name: 'Description' }).fill('use playwright, submit');
  await page.getByRole('button', { name: 'Submit' }).click();

  // --- Create second tutorial ---
  await page.getByRole('link', { name: 'Add' }).click();
  await page.getByRole('textbox', { name: 'Title' }).fill('Create a clean UI');
  await page.getByRole('textbox', { name: 'Description' }).fill('use scss, js or ts');
  await page.getByRole('button', { name: 'Submit' }).click();

  // --- Create third tutorial (Clean room) ---
  await page.getByRole('link', { name: 'Add' }).click();
  await page.getByRole('textbox', { name: 'Title' }).fill('Clean room');
  await page.getByRole('textbox', { name: 'Description' }).fill('bed and laundry');
  await page.getByRole('button', { name: 'Submit' }).click();

  // --- Edit "Clean room" tutorial ---
  await page.getByRole('link', { name: 'Tutorials' }).click();
  await page.getByText('Clean room').click();
  await page.getByRole('link', { name: 'Edit' }).click();
  await page.getByRole('textbox', { name: 'Description' }).fill('bed and laundry updated');
  await page.getByRole('button', { name: 'Update' }).click();
  await expect(page.getByText('This tutorial was updated successfully!')).toBeVisible();

  // --- Delete "Run test" tutorial ---
  await page.getByRole('link', { name: 'Tutorials' }).click();
  await page.getByText('Run test').click();
  await page.getByRole('link', { name: 'Edit' }).click();
  await page.getByRole('button', { name: 'Delete' }).click();

  // --- Confirm deletion ---
  await page.getByRole('link', { name: 'Tutorials' }).click();
  await expect(page.getByText('Run test')).toHaveCount(0);
});

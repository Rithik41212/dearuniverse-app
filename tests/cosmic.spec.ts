import { test, expect } from "@playwright/test"

async function openApp(page: import("@playwright/test").Page) {
  await page.goto("/")
  await page.getByRole("button", { name: "Log in", exact: true }).click()
}

test("daily card supports dragging, holding, revealing and resetting", async ({
  page,
}) => {
  await openApp(page)
  await page.getByRole("button", { name: /Draw your card/ }).click()
  const card = page.getByRole("button", { name: "Choose card 6", exact: true })
  await card.scrollIntoViewIfNeeded()
  const before = await card.getAttribute("style")
  const box = (await card.boundingBox())!
  await page.mouse.move(box.x + box.width / 2, box.y + 20)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2 - 65, box.y + 20, { steps: 8 })
  await page.mouse.up()
  await expect(card).not.toHaveAttribute("style", before!)
  await expect(
    page.getByRole("button", { name: "Reveal your thought of the day" }),
  ).toHaveCount(0)
  const next = page.getByRole("button", { name: "Choose card 8", exact: true })
  await next.scrollIntoViewIfNeeded()
  const originalNode = await next.elementHandle()
  const originalTransform = await next.evaluate(el => getComputedStyle(el).transform)
  await next.hover()
  await page.mouse.down()
  await expect(
    page.getByRole("button", { name: "Reveal your thought of the day" }),
  ).toBeVisible()
  await page.mouse.up()
  const lifted = page.locator('.selected-deck-card')
  await expect(lifted).toHaveAttribute('data-motion', 'ready')
  expect(await lifted.evaluate((el, original) => el === original, originalNode)).toBe(true)
  await expect(page.locator('.fan-card')).toHaveCount(12)
  await expect(lifted).toHaveCSS('opacity', '1')
  await expect(lifted).toHaveCSS('filter', 'none')
  await page
    .getByRole("button", { name: "Reveal your thought of the day" })
    .click()
  await expect(page.locator(".selected-deck-card .card-turn")).toHaveClass(/is-flipped/)
  await expect(page.locator(".selected-deck-card .card-turn")).toHaveCSS("transform", "matrix3d(-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1)")
  await page.screenshot({ path: "test-results/daily-card.png" })
  await page.getByRole("button", { name: /Return card/ }).click()
  await expect(card).toBeEnabled()
  const returned = page.getByRole('button', { name: 'Choose card 8', exact: true })
  expect(await returned.evaluate((el, original) => el === original, originalNode)).toBe(true)
  await expect(returned).toHaveCSS('transform', originalTransform)
  await expect(page.locator('.fan-card')).toHaveCount(12)
})

test("zodiac match uses sign and selected qualities and remembers sign", async ({
  page,
}) => {
  await openApp(page)
  await page.getByRole("button", { name: /Find your match/ }).click()
  await page.getByRole("button", { name: /Start your story/ }).click()
  await page.getByLabel("Your zodiac sign").selectOption("Pisces")
  await page.getByRole("button", { name: /Explore compatibility/ }).click()
  await expect(
    page.getByRole("button", { name: /Find my match/ }),
  ).toBeDisabled()
  await page.getByRole("button", { name: /Emotional stability/ }).click()
  await page.getByRole("button", { name: /Find my match/ }).click()
  await expect(
    page.getByRole("heading", { name: "Pisces & Cancer" }),
  ).toBeVisible()
  await page.getByRole("button", { name: "Back to home" }).click()
  await page.getByRole("button", { name: /Draw your card/ }).click()
  await expect(page.getByLabel("Your zodiac sign")).toHaveValue("Pisces")
})

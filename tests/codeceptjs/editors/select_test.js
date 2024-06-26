/* global Feature Scenario */

Feature('select')

Scenario('Should start with correct value @select-value', async ({ I }) => {
  I.amOnPage('select-values.html')
  I.waitForElement('.je-ready')
  I.waitForValue('#value', '{"data":[]}')
  I.click('#set-value')
  I.waitForValue('#value', '{"data":[{"baumart":"other_hardwood"},{"baumart":"beech"},{"baumart":"oak"},{"baumart":"spruce"}]}')
  I.getSelectedValueAndAssert('select[name="root[data][0][baumart]"]', 'other_hardwood');
  I.getSelectedValueAndAssert('select[name="root[data][1][baumart]"]', 'beech');
  I.getSelectedValueAndAssert('select[name="root[data][2][baumart]"]', 'oak');
  I.getSelectedValueAndAssert('select[name="root[data][3][baumart]"]', 'spruce');
})

Scenario('Should render a non selectable placeholder options for not in enum values @placeholderOption', async ({ I }) => {
  I.amOnPage('placeholder-options.html')
  I.waitForElement('.je-ready')
  I.waitForElement('option[value="_placeholder_"][disabled][hidden]')
  I.waitForElement('option[value="a"]')
  I.waitForElement('option[value="b"]')
  I.click('#set-value')
  I.waitForText('-select-')
  I.waitForText('Value must be one of the enumerated values')
  I.waitForValue('#value', '"other"')
  I.selectOption('[name="root"]', 'a')
  I.waitForValue('#value', '"a"')
  I.dontSee('Value must be one of the enumerated values')
  I.selectOption('[name="root"]', 'b')
  I.waitForValue('#value', '"b"')
  I.dontSee('Value must be one of the enumerated values')
})

Scenario('should return correct booleans values when selected @readOnly', async ({ I }) => {
  I.amOnPage('select.html')
  I.click('.get-value')
  I.waitForValue('.value', '{"boolean":true}')
  I.selectOption('[name="root[boolean]"]', 'false')
  I.click('.get-value')
  I.waitForValue('.value', '{"boolean":false}')
  I.selectOption('[name="root[boolean]"]', 'true')
  I.click('.get-value')
  I.waitForValue('.value', '{"boolean":true}')
})

Scenario('should be disabled if "readonly" is specified', async ({ I }) => {
  I.amOnPage('read-only.html')
  I.seeDisabledAttribute('[name="root[select]"]')
})

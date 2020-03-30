import { addQueryParamsToUrl } from './url-util.js'

test('should insert utm param', () => {
  expect(addQueryParamsToUrl("http://app.swivle.com", "utm_source=blaat"))
      .toBe("http://app.swivle.com?utm_source=blaat");
  expect(addQueryParamsToUrl("http://app.swivle.com/terms-of-service.html", "utm_source=blaat"))
      .toBe("http://app.swivle.com/terms-of-service.html?utm_source=blaat");
  expect(addQueryParamsToUrl("http://app.swivle.com/#signup", "utm_source=blaat"))
      .toBe("http://app.swivle.com/?utm_source=blaat#signup");
  expect(addQueryParamsToUrl("http://app.swivle.com/?region=eu-west-1&tenant=blaat#signup", "utm_source=blaat"))
      .toBe("http://app.swivle.com/?utm_source=blaat&region=eu-west-1&tenant=blaat#signup");
});

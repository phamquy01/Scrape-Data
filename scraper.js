const scrapeCategory = (browser, url) =>
  new Promise(async (resolve, reject) => {
    try {
      let page = await browser.newPage();
      console.log(">> mở tab mới");
      await page.goto(url);
      console.log(">> truy cập vào " + url);

      await page.waitForSelector("#default");
      console.log(">> website đã load xong ");

      const dataCategory = await page.$$eval(
        ".side_categories > ul > li > ul > li",
        (els) => {
          dataCategory = els.map((el) => {
            return {
              category: el.querySelector("a").innerText,
              link: el.querySelector("a").href,
            };
          });
          return dataCategory;
        }
      );

      await page.close();
      resolve(dataCategory);
    } catch (error) {
      console.log(" lỗi ở scrape category: " + error);
      reject(error);
    }
  });

const scraper = (browser, url) =>
  new Promise(async (resolve, reject) => {
    try {
      let newPage = await browser.newPage();
      console.log(">> đã mở tab mới ...");
      await newPage.goto(url);
      console.log(">> đã truy cập vào trang " + url);
      await newPage.waitForSelector("section");
      console.log(">> đã load xong trang ");

      const scrapeData = {};

      // lấy title
      const titleHeader = await newPage.$eval(".page-header", (el) => {
        return el.querySelector("h1")?.innerText;
      });

      // lấy link từng quyển sách
      const detailLink = await newPage.$$eval("ol.row > li", (els) => {
        detailLink = els.map((el) => {
          return el.querySelector(".product_pod > h3 > a").href;
        });
        return detailLink;
      });

      // truy cap trang detail
      const scrapeDetail = (link) =>
        new Promise(async (resolve, reject) => {
          try {
            let pageDetail = await browser.newPage();
            console.log(">> đã mở tab mới ...");
            await pageDetail.goto(link);
            console.log(">> đã truy cập vào trang " + link);
            await pageDetail.waitForSelector(".page_inner");
            console.log(">> đã load xong trang ");

            let scrapeDetail = {};

            const info = await pageDetail.$eval("#content_inner", (el) => {
              return {
                imageUrl: el.querySelector(
                  "article.product_page > div.row #product_gallery > .thumbnail > .carousel-inner > .item > img"
                ).src,
                bookTitle: el.querySelector(
                  "article.product_page > div.row > .product_main h1"
                )?.innerText,
                bookPrice: el.querySelector(
                  "article.product_page > div.row > .product_main p"
                )?.innerText,
                available: el.querySelector(
                  "article.product_page > div.row > .product_main .instock"
                )?.innerText,
                bookDescription: el.querySelector("article.product_page > p")
                  ?.innerText,
              };
            });

            scrapeDetail = { ...info };

            const upc = await pageDetail.$$eval(
              "#content_inner > article.product_page > .table-striped",
              (els) => {
                upc = els.map((el) => {
                  return el.querySelector("tbody > tr > td")?.innerText;
                });
                return upc;
              }
            );

            // scrapeDetail.upc = upc[0];

            scrapeDetail.upc = upc[0];

            await pageDetail.close();
            console.log(">> đã đóng tab: " + link);
            resolve(scrapeDetail);
          } catch (error) {
            console.log(">> lỗi ở scrape detail: " + error);
            reject(error);
          }
        });

      let details = [];

      for (let link of detailLink) {
        const detail = await scrapeDetail(link);
        details.push(detail);
      }

      scrapeData[`${titleHeader}`] = details;

      await browser.close();
      console.log(">> trình duyệt đã đóng.");
      resolve(scrapeData);
    } catch (error) {
      console.log(" lỗi ở scrape: " + error);

      reject(error);
    }
  });

export default { scrapeCategory, scraper };

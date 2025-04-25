import { rejects } from "assert";
import scraper from "./scraper.js";
import fs from "fs";

const scrapeController = async (browserInstance) => {
  const url = "https://books.toscrape.com/";
  const indexs = [0, 1, 2, 3, 4];
  try {
    let browser = await browserInstance;

    const categories = await scraper.scrapeCategory(browser, url);
    const selectedCategories = categories.filter((category, index) =>
      indexs.some((i) => i === index)
    );

    let result = await scraper.scraper(browser, selectedCategories[0].link);

    fs.writeFile("data.json", JSON.stringify(result), (err) => {
      if (err) console.log("ghi data vao file json thất bại" + err);
      console.log("ghi data vao file json thành công");
    });
  } catch (error) {
    console.log("lỗi ở scrape controller: " + error);
  }
};

export default scrapeController;

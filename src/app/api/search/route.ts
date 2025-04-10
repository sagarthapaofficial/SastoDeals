import puppeteer from "puppeteer";

import { NextRequest, NextResponse } from "next/server";

interface Product {
  title: string;
  price: number;
  link: string;
  store: string;
}

interface WebsiteConfig {
  url: string;
  baseUrl: string;
  store: string;
  selectors: {
    productContainer: string;
    title: string;
    link: string;
    price: string;
  };
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, " ") // Normalize multiple spaces
    .replace(/[^a-z0-9\s]/g, "")
    .trim(); // Remove special characters
}

function getCheapProduct(products: Product[]): Product | null {
  let cheapestProduct: Product | null = null;

  for (const product of products) {
    if (!cheapestProduct || product.price < cheapestProduct.price) {
      cheapestProduct = product;
    }
  }

  return cheapestProduct;
}

function hasSufficientKeywordMatch(keywords, normalizedTitle) {
  //reduce function is used to count the number of keywords that match the title
  let matchCount = 0;
  for (const keyword of keywords) {
    if (normalizedTitle.includes(keyword)) {
      matchCount++;
    }
  }
  return matchCount == keywords.length; // Adjust the threshold as needed
}

//Avoid the sponsored products shown
const websites: WebsiteConfig[] = [
  {
    url: "https://www.amazon.ca/s?k=",
    baseUrl: "https://www.amazon.ca",
    store: "Amazon",
    selectors: {
      productContainer:
        "div.a-section.a-spacing-small.puis-padding-left-small.puis-padding-right-small",
      title: "div:nth-child(2) a.a-link-normal h2", // Updated selector
      price: "span.a-price span.a-offscreen",
      link: "div:nth-child(2) a.a-link-normal",
    },
  },

  {
    url: "https://www.bestbuy.ca/en-ca/search?search=",
    baseUrl: "https://www.bestbuy.ca",
    store: "BestBuy",
    selectors: {
      productContainer: "li.productLine_2N9kG.x-productListItem",
      title: "h3.productItemName_3IZ3c",
      link: 'a[itemprop="url"]',
      price: '[data-automation="product-price"] span',
    },
  },
  // {
  //   url: "https://www.walmart.ca/en/search?q=",
  //   store: "Walmart",
  //   baseUrl: "https://www.walmart.ca",
  //   selectors: {
  //     productContainer: "div.mb0.ph0-xl.pt0-xl.bb.b--near-white.w-25.pb3-m.ph1", // Updated selector
  //     title: "span.w_q67L",
  //     link: 'a[link-identifier="2ST3I0QR531Z"].w-100',
  //     price: '[data-automation-id="product-price"] div', // Refined price selector
  //   },
  // },

  // {
  //   url: "https://www.costco.ca/s?langId=-24&keyword=",
  //   store: "Costco",
  //   selectors: {
  //     productContainer: ".product",
  //     title: ".description",
  //     link: "a",
  //     price: ".price",
  //   },
  // },
  // {
  //   url: "https://www.canadacomputers.com/en/search?s=",
  //   store: "Canada Computers & Electronics",
  //   selectors: {
  //     productContainer: ".productTemplate",
  //     title: ".productTemplate_title",
  //     link: "a",
  //     price: ".price",
  //   },
  // },
  // {
  //   url: "https://www.staples.ca/search?query=",
  //   baseUrl: "https://www.staples.ca/",
  //   store: "Staples",
  //   selectors: {
  //     productContainer: "div.ais-block", // Product container
  //     title: "a.product-thumbnail__title.product-link", // Adjust this based on the actual title element
  //     link: "a.product-thumbnail__title.product-link", // Link is in the <a> tag
  //     price: "span.money.pre-money", // Adjust this based on the actual price element
  //   },
  // },
  // {
  //   url: "https://www.visions.ca/catalogsearch/result?q=",
  //   baseUrl: "https://www.visions.ca/",
  //   store: "Visions Electronics",
  //   selectors: {
  //     productContainer: ".product",
  //     title: ".product-title",
  //     link: "a",
  //     price: ".price",
  //   },
  // },

  // {
  //   url: "https://www.newegg.ca/p/pl?d=",
  //   baseUrl: "https://www.newegg.ca",
  //   store: "Newegg",
  //   selectors: {
  //     productContainer: ".item-cell",
  //     title: ".item-title",
  //     link: "a.item-title",
  //     price: ".price-current",
  //   },
  // },
];

async function scrapeWebsite(
  config: WebsiteConfig,
  query: string
): Promise<Product | null> {
  const browser = await puppeteer.launch({
    headless: true,
    // args: ["--no-sandbox"],
    // ignoreDefaultArgs: ["--enable-automation"],
  });

  try {
    const page = await browser.newPage();

    await page.goto(`${config.url}${query}`, {
      waitUntil: "networkidle2",
    });
    // await page.evaluate(async () => {
    //   window.scrollBy(0, document.body.scrollHeight);
    //   await new Promise((resolve) => setTimeout(resolve, 2000));
    // });

    await page.waitForSelector(config.selectors.productContainer, {
      visible: true,
      timeout: 30000,
    });

    const productContainer = await page.$$(config.selectors.productContainer);
    // productContainer.forEach((product) => {
    //   console.log("Product: ", product); // Log the product element
    // });

    const products: Product[] = [];

    //Loop through all handles
    for (const product of productContainer.slice(0, 3)) {
      //Get the title:
      const titleHandle = await product.$(config.selectors.title);

      const priceHandle = await product.$(config.selectors.price);

      const linkHandle = await product.$(config.selectors.link);
      const title = await page.evaluate((el) => el?.textContent, titleHandle);

      //console.log("Title: ", title?.trim());

      const price = await page.evaluate((el) => el?.textContent, priceHandle);
      const priceF = parseFloat(price?.trim().replace(/[^0-9.-]+/g, ""));

      const link = await page.evaluate(
        (el) => el?.getAttribute("href"),
        linkHandle
      );
      const linkText = link?.trim() || "#";

      const titleText = title?.trim() as string;

      const keywords = query.toLowerCase().split(" "); //splits by whitespace

      const normalizedTitle = normalizeText(titleText?.toLowerCase());
      //const normalizedQuery = normalizeText(query.toLowerCase());

      if (title !== null && title !== undefined) {
        const isMatch =
          // normalizedTitle.includes(normalizedQuery) ||
          hasSufficientKeywordMatch(keywords, normalizedTitle);

        // console.log(
        //   `TitleText: ${normalizeText(title?.toLowerCase())}, store: ${
        //     config.store
        //   }, queryLowerCase: ${query.toLowerCase()}`
        // );
        console.log("isMatch", isMatch);
        if (isMatch) {
          // console.log(
          //   `TitleText: ${title?.toLowerCase()}, store: ${config.store}`
          // );
          products.push({
            title: titleText,
            price: priceF,
            link: linkText.includes("http")
              ? linkText
              : config.baseUrl + linkText,
            store: config.store,
          });
        }
      }

      //console.log('Tiel :"%s\n".', title?.trim());
    }
    //console.log("Products: ", products);
    const cheapestProduct = getCheapProduct(products);

    //console.log("Cheapest product: ", cheapestProduct);

    // console.log("All products:\n ");
    // for (const product of products) {
    //   console.log("Product: ", product);
    // }

    //await page.type("#twotabsearchtextbox", "iphone 14 pro max");

    // Wait and click on first result
    // const searchResultSelector =
    //   "div.a-section.a-spacing-small.puis-padding-left-small.puis-padding-right-small div:nth-child(2) a.a-link-normal h2";
    // arch box

    //    const fullTitle = await data?.evaluate((el) => el.textContent);

    //   console.log('The title of this blog post is "%s".', $("h2").text());

    return cheapestProduct;
  } catch (error) {
    console.error("Error occurred while scraping:", error);
    return null; // Return null in case of an error
  } finally {
    // Close the browser

    await browser.close();
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const query = searchParams.get("query");
  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 }
    );
  }

  try {
    // Fetch the product details for the first product from each website with limited concurrency
    let allResults: Product[] = []; // Initialize as an empty array

    // Call scrapWebsites directly instead of wrapping it in a function
    const allResults1: (Product | null)[] = await Promise.all(
      websites.map((website) => scrapeWebsite(website, query)) // Call the function directly
    );

    // Filter out null results
    allResults = allResults1.filter((product) => product !== null) as Product[];

    console.log("All results: ", allResults);

    const topResults = allResults.sort((a, b) => a.price - b.price).slice(0, 3);

    return NextResponse.json(topResults, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch search results" },
      { status: 500 }
    );
  }
}

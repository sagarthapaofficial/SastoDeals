import puppeteer from "puppeteer";
import { NextRequest, NextResponse } from "next/server";

interface Product {
  title: string;
  link: string;
  price: number;
  store: string;
  description?: string;
  imageUrl?: string;
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

export const scrapeWebsite = async (
  config: WebsiteConfig,
  query: string
): Promise<Product | null> => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  try {
    // Navigate to the search page
    await page.goto(`${config.url}${encodeURIComponent(query)}`, {
      waitUntil: "networkidle2",
    });

    await page.waitForSelector(config.selectors.productContainer, {
      timeout: 90000,
    });

    // Extract the first product details
    const firstProductDetails = await page.evaluate((selectors) => {
      const title =
        document.querySelector(selectors.title)?.textContent?.trim() ||
        "No Title";

      const link =
        document.querySelector(selectors.link)?.getAttribute("href") || "#";
      const priceText =
        document.querySelector(selectors.price)?.textContent?.trim() || "0";

      const price = parseFloat(priceText.replace(/[^0-9.]/g, ""));

      return { title, link, price };
    }, config.selectors);

    if (!firstProductDetails) {
      throw new Error("No valid product found");
    }

    return {
      title: firstProductDetails.title,
      link: config.baseUrl + firstProductDetails.link,
      price: firstProductDetails.price,
      store: config.store,
    };
  } catch (error) {
    console.error(`Error scraping ${config.store}:`, error);
    return null;
  } finally {
    await browser.close();
  }
};

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
    const websites: WebsiteConfig[] = [
      {
        url: "https://www.amazon.ca/s?k=",
        baseUrl: "https://www.amazon.ca/",
        store: "Amazon",
        selectors: {
          productContainer:
            "div.a-section.a-spacing-small.puis-padding-left-small.puis-padding-right-small",
          title: "a.a-link-normal h2", // Updated selector
          link: "a.a-link-normal",
          price: "span.a-price span.a-offscreen",
        },
      },

      {
        url: "https://www.bestbuy.ca/en-ca/search?search=",
        baseUrl: "https://www.bestbuy.ca/",
        store: "BestBuy",
        selectors: {
          productContainer: "div.listItem_10CIq.materialOverride_vWsDY",
          title: "h3.productItemName_3IZ3c",
          link: '[itemprop="url"]',
          price: '[data-automation="product-price"] span',
        },
      },
      // {
      //   url: "https://www.walmart.ca/en/search?q=",
      //   store: "Walmart",
      //   baseUrl: "https://www.walmart.ca/",
      //   selectors: {
      //     productContainer:
      //       "div.flex.flex-wrap.w-100.flex-grow-0.flex-shrink-0.ph2.pr0-xl.pl4-xl.mt0-xl", // Updated selector
      //     title: '[link-identifier="4VF1FCZJE4FL"] span',
      //     link: '[link-identifier="4VF1FCZJE4FL"].w-100',
      //     price:
      //       'div.flex.flex-wrap.justify-start.items-center.lh-title.mb0[data-automation-id="product-price"] div', // Refined price selector
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
      //   store: "Newegg",
      //   selectors: {
      //     productContainer: ".item-cell",
      //     title: ".item-title",
      //     link: "a",
      //     price: ".price-current",
      //   },
      // },
    ];

    // Fetch the product details for the first product from each website
    const allResults: (Product | null)[] = await Promise.all(
      websites.map((website) => scrapeWebsite(website, query))
    );

    // Filter out null results and sort by price
    const validResults = allResults.filter(
      (result): result is Product => result !== null
    );
    const topResults = validResults
      .sort((a, b) => a.price - b.price)
      .slice(0, 3);

    return NextResponse.json(topResults, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch search results" },
      { status: 500 }
    );
  }
}

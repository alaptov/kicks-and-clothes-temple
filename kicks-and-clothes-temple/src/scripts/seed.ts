import { CreateInventoryLevelInput, ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresStep,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";
import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";

// Multi-region configuration for Kicks and Clothes Temple
const REGIONS_CONFIG = {
  ghana: {
    name: "Ghana",
    currency_code: "ghs",
    countries: ["gh"],
    payment_providers: ["pp_paystack_paystack", "pp_system_default"],
  },
  us: {
    name: "United States",
    currency_code: "usd",
    countries: ["us"],
    payment_providers: ["pp_stripe_stripe", "pp_system_default"],
  },
  uk: {
    name: "United Kingdom",
    currency_code: "gbp",
    countries: ["gb"],
    payment_providers: ["pp_stripe_stripe", "pp_system_default"],
  },
  europe: {
    name: "Europe",
    currency_code: "eur",
    countries: ["de", "fr", "es", "it", "nl", "be", "at", "pt", "ie"],
    payment_providers: ["pp_stripe_stripe", "pp_system_default"],
  },
  canada: {
    name: "Canada",
    currency_code: "cad",
    countries: ["ca"],
    payment_providers: ["pp_stripe_stripe", "pp_system_default"],
  },
  nigeria: {
    name: "Nigeria",
    currency_code: "ngn",
    countries: ["ng"],
    payment_providers: ["pp_paystack_paystack", "pp_system_default"],
  },
  southAfrica: {
    name: "South Africa",
    currency_code: "zar",
    countries: ["za"],
    payment_providers: ["pp_stripe_stripe", "pp_system_default"],
  },
};

// All supported currencies
const SUPPORTED_CURRENCIES = [
  { currency_code: "usd", is_default: true },
  { currency_code: "ghs" },
  { currency_code: "gbp" },
  { currency_code: "eur" },
  { currency_code: "cad" },
  { currency_code: "ngn" },
  { currency_code: "zar" },
];

// All countries for tax regions
const ALL_COUNTRIES = Object.values(REGIONS_CONFIG).flatMap(r => r.countries);

const updateStoreCurrencies = createWorkflow(
  "update-store-currencies",
  (input: {
    supported_currencies: { currency_code: string; is_default?: boolean }[];
    store_id: string;
  }) => {
    const normalizedInput = transform({ input }, (data) => {
      return {
        selector: { id: data.input.store_id },
        update: {
          supported_currencies: data.input.supported_currencies.map(
            (currency) => {
              return {
                currency_code: currency.currency_code,
                is_default: currency.is_default ?? false,
              };
            }
          ),
        },
      };
    });

    const stores = updateStoresStep(normalizedInput);

    return new WorkflowResponse(stores);
  }
);

export default async function seedDemoData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const storeModuleService = container.resolve(Modules.STORE);

  logger.info("🏪 Seeding Kicks and Clothes Temple store data...");
  const [store] = await storeModuleService.listStores();

  // Update store name
  await storeModuleService.updateStores(store.id, {
    name: "Kicks and Clothes Temple",
  });

  let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  });

  if (!defaultSalesChannel.length) {
    const { result: salesChannelResult } = await createSalesChannelsWorkflow(
      container
    ).run({
      input: {
        salesChannelsData: [
          {
            name: "Default Sales Channel",
          },
        ],
      },
    });
    defaultSalesChannel = salesChannelResult;
  }

  // Set up all supported currencies
  logger.info("💱 Setting up multi-currency support...");
  await updateStoreCurrencies(container).run({
    input: {
      store_id: store.id,
      supported_currencies: SUPPORTED_CURRENCIES,
    },
  });

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_sales_channel_id: defaultSalesChannel[0].id,
      },
    },
  });

  // Create all regions
  logger.info("🌍 Seeding multi-region data...");
  const regions: Record<string, any> = {};

  for (const [key, config] of Object.entries(REGIONS_CONFIG)) {
    logger.info(`  Creating region: ${config.name}`);
    const { result: regionResult } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: config.name,
            currency_code: config.currency_code,
            countries: config.countries,
            payment_providers: config.payment_providers,
          },
        ],
      },
    });
    regions[key] = regionResult[0];
  }
  logger.info("✅ Finished seeding regions.");

  // Create tax regions for all countries
  logger.info("📋 Seeding tax regions...");
  await createTaxRegionsWorkflow(container).run({
    input: ALL_COUNTRIES.map((country_code) => ({
      country_code,
      provider_id: "tp_system",
    })),
  });
  logger.info("✅ Finished seeding tax regions.");

  // Create stock locations for different regions
  logger.info("📦 Seeding stock locations...");

  // Main warehouse in Ghana
  const { result: ghanaWarehouseResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "Ghana Warehouse",
          address: {
            city: "Accra",
            country_code: "GH",
            address_1: "123 Liberation Road",
          },
        },
      ],
    },
  });
  const ghanaWarehouse = ghanaWarehouseResult[0];

  // US Warehouse
  const { result: usWarehouseResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "US Warehouse",
          address: {
            city: "Los Angeles",
            country_code: "US",
            address_1: "456 Commerce Street",
          },
        },
      ],
    },
  });
  const usWarehouse = usWarehouseResult[0];

  // Europe Warehouse
  const { result: europeWarehouseResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "Europe Warehouse",
          address: {
            city: "Amsterdam",
            country_code: "NL",
            address_1: "789 Logistics Way",
          },
        },
      ],
    },
  });
  const europeWarehouse = europeWarehouseResult[0];

  // Set Ghana as default location
  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_location_id: ghanaWarehouse.id,
      },
    },
  });

  // Link all warehouses to fulfillment provider
  for (const warehouse of [ghanaWarehouse, usWarehouse, europeWarehouse]) {
    await link.create({
      [Modules.STOCK_LOCATION]: {
        stock_location_id: warehouse.id,
      },
      [Modules.FULFILLMENT]: {
        fulfillment_provider_id: "manual_manual",
      },
    });
  }

  logger.info("🚚 Seeding fulfillment data...");
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  });
  let shippingProfile = shippingProfiles.length ? shippingProfiles[0] : null;

  if (!shippingProfile) {
    const { result: shippingProfileResult } =
      await createShippingProfilesWorkflow(container).run({
        input: {
          data: [
            {
              name: "Default Shipping Profile",
              type: "default",
            },
          ],
        },
      });
    shippingProfile = shippingProfileResult[0];
  }

  // Create fulfillment sets for each region
  // Ghana fulfillment
  const ghanaFulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "Ghana Delivery",
    type: "shipping",
    service_zones: [
      {
        name: "Ghana Zone",
        geo_zones: [{ country_code: "gh", type: "country" }],
      },
    ],
  });

  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: ghanaWarehouse.id },
    [Modules.FULFILLMENT]: { fulfillment_set_id: ghanaFulfillmentSet.id },
  });

  // US fulfillment
  const usFulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "US Delivery",
    type: "shipping",
    service_zones: [
      {
        name: "US Zone",
        geo_zones: [
          { country_code: "us", type: "country" },
          { country_code: "ca", type: "country" },
        ],
      },
    ],
  });

  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: usWarehouse.id },
    [Modules.FULFILLMENT]: { fulfillment_set_id: usFulfillmentSet.id },
  });

  // Europe fulfillment
  const europeFulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "Europe Delivery",
    type: "shipping",
    service_zones: [
      {
        name: "Europe Zone",
        geo_zones: REGIONS_CONFIG.europe.countries
          .concat(["gb"])
          .map((cc) => ({ country_code: cc, type: "country" as const })),
      },
    ],
  });

  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: europeWarehouse.id },
    [Modules.FULFILLMENT]: { fulfillment_set_id: europeFulfillmentSet.id },
  });

  // Africa fulfillment (Nigeria, South Africa from Ghana warehouse)
  const africaFulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "Africa Delivery",
    type: "shipping",
    service_zones: [
      {
        name: "Africa Zone",
        geo_zones: [
          { country_code: "ng", type: "country" },
          { country_code: "za", type: "country" },
        ],
      },
    ],
  });

  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: ghanaWarehouse.id },
    [Modules.FULFILLMENT]: { fulfillment_set_id: africaFulfillmentSet.id },
  });

  // Create shipping options for all zones
  const shippingOptionsData = [
    // Ghana shipping
    {
      name: "Standard Shipping - Ghana",
      price_type: "flat" as const,
      provider_id: "manual_manual",
      service_zone_id: ghanaFulfillmentSet.service_zones[0].id,
      shipping_profile_id: shippingProfile.id,
      type: { label: "Standard", description: "Delivery in 3-5 business days", code: "standard" },
      prices: [
        { currency_code: "ghs", amount: 2000 }, // 20 GHS
        { region_id: regions.ghana.id, amount: 2000 },
      ],
      rules: [
        { attribute: "enabled_in_store", value: "true", operator: "eq" },
        { attribute: "is_return", value: "false", operator: "eq" },
      ],
    },
    {
      name: "Express Shipping - Ghana",
      price_type: "flat" as const,
      provider_id: "manual_manual",
      service_zone_id: ghanaFulfillmentSet.service_zones[0].id,
      shipping_profile_id: shippingProfile.id,
      type: { label: "Express", description: "Same day delivery in Accra", code: "express" },
      prices: [
        { currency_code: "ghs", amount: 5000 }, // 50 GHS
        { region_id: regions.ghana.id, amount: 5000 },
      ],
      rules: [
        { attribute: "enabled_in_store", value: "true", operator: "eq" },
        { attribute: "is_return", value: "false", operator: "eq" },
      ],
    },
    // US shipping
    {
      name: "Standard Shipping - US",
      price_type: "flat" as const,
      provider_id: "manual_manual",
      service_zone_id: usFulfillmentSet.service_zones[0].id,
      shipping_profile_id: shippingProfile.id,
      type: { label: "Standard", description: "Delivery in 5-7 business days", code: "standard" },
      prices: [
        { currency_code: "usd", amount: 1000 }, // $10
        { currency_code: "cad", amount: 1400 }, // $14 CAD
        { region_id: regions.us.id, amount: 1000 },
        { region_id: regions.canada.id, amount: 1400 },
      ],
      rules: [
        { attribute: "enabled_in_store", value: "true", operator: "eq" },
        { attribute: "is_return", value: "false", operator: "eq" },
      ],
    },
    {
      name: "Express Shipping - US",
      price_type: "flat" as const,
      provider_id: "manual_manual",
      service_zone_id: usFulfillmentSet.service_zones[0].id,
      shipping_profile_id: shippingProfile.id,
      type: { label: "Express", description: "2-3 business days", code: "express" },
      prices: [
        { currency_code: "usd", amount: 2500 }, // $25
        { currency_code: "cad", amount: 3500 }, // $35 CAD
        { region_id: regions.us.id, amount: 2500 },
        { region_id: regions.canada.id, amount: 3500 },
      ],
      rules: [
        { attribute: "enabled_in_store", value: "true", operator: "eq" },
        { attribute: "is_return", value: "false", operator: "eq" },
      ],
    },
    // Europe shipping
    {
      name: "Standard Shipping - Europe",
      price_type: "flat" as const,
      provider_id: "manual_manual",
      service_zone_id: europeFulfillmentSet.service_zones[0].id,
      shipping_profile_id: shippingProfile.id,
      type: { label: "Standard", description: "Delivery in 5-7 business days", code: "standard" },
      prices: [
        { currency_code: "eur", amount: 1000 }, // €10
        { currency_code: "gbp", amount: 900 }, // £9
        { region_id: regions.europe.id, amount: 1000 },
        { region_id: regions.uk.id, amount: 900 },
      ],
      rules: [
        { attribute: "enabled_in_store", value: "true", operator: "eq" },
        { attribute: "is_return", value: "false", operator: "eq" },
      ],
    },
    {
      name: "Express Shipping - Europe",
      price_type: "flat" as const,
      provider_id: "manual_manual",
      service_zone_id: europeFulfillmentSet.service_zones[0].id,
      shipping_profile_id: shippingProfile.id,
      type: { label: "Express", description: "2-3 business days", code: "express" },
      prices: [
        { currency_code: "eur", amount: 2000 }, // €20
        { currency_code: "gbp", amount: 1800 }, // £18
        { region_id: regions.europe.id, amount: 2000 },
        { region_id: regions.uk.id, amount: 1800 },
      ],
      rules: [
        { attribute: "enabled_in_store", value: "true", operator: "eq" },
        { attribute: "is_return", value: "false", operator: "eq" },
      ],
    },
    // Africa shipping
    {
      name: "Standard Shipping - Africa",
      price_type: "flat" as const,
      provider_id: "manual_manual",
      service_zone_id: africaFulfillmentSet.service_zones[0].id,
      shipping_profile_id: shippingProfile.id,
      type: { label: "Standard", description: "Delivery in 7-14 business days", code: "standard" },
      prices: [
        { currency_code: "ngn", amount: 500000 }, // 5000 NGN
        { currency_code: "zar", amount: 20000 }, // 200 ZAR
        { region_id: regions.nigeria.id, amount: 500000 },
        { region_id: regions.southAfrica.id, amount: 20000 },
      ],
      rules: [
        { attribute: "enabled_in_store", value: "true", operator: "eq" },
        { attribute: "is_return", value: "false", operator: "eq" },
      ],
    },
  ];

  await createShippingOptionsWorkflow(container).run({
    input: shippingOptionsData,
  });
  logger.info("✅ Finished seeding fulfillment data.");

  // Link sales channels to stock locations
  for (const warehouse of [ghanaWarehouse, usWarehouse, europeWarehouse]) {
    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: {
        id: warehouse.id,
        add: [defaultSalesChannel[0].id],
      },
    });
  }
  logger.info("✅ Finished seeding stock location data.");

  logger.info("🔑 Seeding publishable API key data...");
  const { result: publishableApiKeyResult } = await createApiKeysWorkflow(
    container
  ).run({
    input: {
      api_keys: [
        {
          title: "Kicks and Clothes Temple Storefront",
          type: "publishable",
          created_by: "",
        },
      ],
    },
  });
  const publishableApiKey = publishableApiKeyResult[0];

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel[0].id],
    },
  });
  logger.info("✅ Finished seeding publishable API key data.");

  logger.info("👕 Seeding product categories...");
  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: [
        { name: "Sneakers", is_active: true },
        { name: "T-Shirts", is_active: true },
        { name: "Hoodies", is_active: true },
        { name: "Jeans", is_active: true },
        { name: "Jackets", is_active: true },
        { name: "Accessories", is_active: true },
        { name: "New Arrivals", is_active: true },
        { name: "Sale", is_active: true },
      ],
    },
  });

  logger.info("👟 Seeding products with size/color variants...");

  // Helper to create variant prices for all currencies
  const createPrices = (baseUSD: number) => {
    const rates = {
      usd: 1,
      ghs: 15.5, // 1 USD = ~15.5 GHS
      gbp: 0.79,
      eur: 0.92,
      cad: 1.36,
      ngn: 1550, // 1 USD = ~1550 NGN
      zar: 18.5, // 1 USD = ~18.5 ZAR
    };

    return Object.entries(rates).map(([currency, rate]) => ({
      currency_code: currency,
      amount: Math.round(baseUSD * rate * 100), // Convert to cents
    }));
  };

  // Sneaker product with size/color variants
  const sneakerSizes = ["US 7", "US 8", "US 9", "US 10", "US 11", "US 12"];
  const sneakerColors = ["Black", "White", "Red"];
  const sneakerVariants = sneakerSizes.flatMap((size) =>
    sneakerColors.map((color) => ({
      title: `${size} / ${color}`,
      sku: `SNEAKER-${size.replace(" ", "-")}-${color.toUpperCase()}`,
      options: { Size: size, Color: color },
      prices: createPrices(120), // $120 base price
    }))
  );

  // T-shirt product with size/color variants
  const tshirtSizes = ["S", "M", "L", "XL", "XXL"];
  const tshirtColors = ["Black", "White", "Navy", "Gray"];
  const tshirtVariants = tshirtSizes.flatMap((size) =>
    tshirtColors.map((color) => ({
      title: `${size} / ${color}`,
      sku: `TSHIRT-${size}-${color.toUpperCase()}`,
      options: { Size: size, Color: color },
      prices: createPrices(35), // $35 base price
    }))
  );

  // Hoodie variants
  const hoodieSizes = ["S", "M", "L", "XL", "XXL"];
  const hoodieColors = ["Black", "Gray", "Navy"];
  const hoodieVariants = hoodieSizes.flatMap((size) =>
    hoodieColors.map((color) => ({
      title: `${size} / ${color}`,
      sku: `HOODIE-${size}-${color.toUpperCase()}`,
      options: { Size: size, Color: color },
      prices: createPrices(65), // $65 base price
    }))
  );

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "Temple Classic Sneakers",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Sneakers")!.id,
            categoryResult.find((cat) => cat.name === "New Arrivals")!.id,
          ],
          description:
            "Premium sneakers from Kicks and Clothes Temple. Comfortable, stylish, and built to last. Perfect for any occasion.",
          handle: "temple-classic-sneakers",
          weight: 800,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            { url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800" },
            { url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800" },
          ],
          options: [
            { title: "Size", values: sneakerSizes },
            { title: "Color", values: sneakerColors },
          ],
          variants: sneakerVariants,
          sales_channels: [{ id: defaultSalesChannel[0].id }],
        },
        {
          title: "Temple Premium T-Shirt",
          category_ids: [
            categoryResult.find((cat) => cat.name === "T-Shirts")!.id,
          ],
          description:
            "Soft, breathable cotton T-shirt with the Temple logo. A wardrobe essential that combines comfort with style.",
          handle: "temple-premium-tshirt",
          weight: 200,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            { url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800" },
            { url: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800" },
          ],
          options: [
            { title: "Size", values: tshirtSizes },
            { title: "Color", values: tshirtColors },
          ],
          variants: tshirtVariants,
          sales_channels: [{ id: defaultSalesChannel[0].id }],
        },
        {
          title: "Temple Signature Hoodie",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Hoodies")!.id,
            categoryResult.find((cat) => cat.name === "New Arrivals")!.id,
          ],
          description:
            "Cozy and warm hoodie with kangaroo pocket. Perfect for those cool evenings or casual outings.",
          handle: "temple-signature-hoodie",
          weight: 500,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            { url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800" },
            { url: "https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=800" },
          ],
          options: [
            { title: "Size", values: hoodieSizes },
            { title: "Color", values: hoodieColors },
          ],
          variants: hoodieVariants,
          sales_channels: [{ id: defaultSalesChannel[0].id }],
        },
      ],
    },
  });
  logger.info("✅ Finished seeding product data.");

  logger.info("📊 Seeding inventory levels...");
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  const inventoryLevels: CreateInventoryLevelInput[] = [];
  for (const inventoryItem of inventoryItems) {
    // Add inventory to all warehouses
    for (const warehouse of [ghanaWarehouse, usWarehouse, europeWarehouse]) {
      inventoryLevels.push({
        location_id: warehouse.id,
        stocked_quantity: 100,
        inventory_item_id: inventoryItem.id,
      });
    }
  }

  await createInventoryLevelsWorkflow(container).run({
    input: { inventory_levels: inventoryLevels },
  });

  logger.info("✅ Finished seeding inventory levels data.");
  logger.info("🎉 Kicks and Clothes Temple seed completed successfully!");
  logger.info(`
    =====================================================
    🏪 Store: Kicks and Clothes Temple

    📍 Regions configured:
       - Ghana (GHS) - Paystack
       - United States (USD) - Stripe
       - United Kingdom (GBP) - Stripe
       - Europe (EUR) - Stripe
       - Canada (CAD) - Stripe
       - Nigeria (NGN) - Paystack
       - South Africa (ZAR) - Stripe

    📦 Warehouses:
       - Ghana Warehouse (Accra)
       - US Warehouse (Los Angeles)
       - Europe Warehouse (Amsterdam)

    🔑 Publishable API Key: ${publishableApiKey.token}

    Next steps:
    1. Add your payment provider API keys to .env
    2. Run: npm run dev
    3. Access admin: http://localhost:9000/app
    4. Access store: http://localhost:8000
    =====================================================
  `);
}

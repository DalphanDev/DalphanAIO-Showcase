interface ShopifySite {
  modes: ['safe', 'fast', 'preload', 'domain'];
  apiToken: string;
  preloadUrls: string[];
  targetShippingRate: string;
}

interface SiteMapEntry {
  url: string;
  platform: string;
  data: ShopifySite;
  value: string;
  label: string;
}

const siteMap: Map<string, SiteMapEntry> = new Map();

export default siteMap;

// A Ma Maniere
siteMap.set('https://www.a-ma-maniere.com/', {
  url: 'https://www.a-ma-maniere.com/',
  platform: 'shopify',
  data: {},
  value: 'https://www.a-ma-maniere.com/',
  label: 'A Ma Maniere',
} as SiteMapEntry);

// Amine Store
siteMap.set('https://amine.store/', {
  url: 'https://amine.store/',
  platform: 'shopify',
  data: {},
  value: 'https://amine.store/',
  label: 'Amine Store',
} as SiteMapEntry);

// Adidas Confirmed
siteMap.set('adidas-confirmed', {
  url: 'https://www.adidas.com/us/apps/yeezy',
  platform: 'confirmed',
  data: {},
  value: 'adidas-confirmed',
  label: 'Adidas Confirmed',
} as SiteMapEntry); // Skipping for now

// APB Store
siteMap.set('https://www.apbstore.com/', {
  url: 'https://www.apbstore.com/',
  platform: 'shopify',
  data: {},
  value: 'https://www.apbstore.com/',
  label: 'APB Store',
} as SiteMapEntry);

// Atmos USA
siteMap.set('https://atmosusa.com/', {
  url: 'https://atmosusa.com/',
  platform: 'shopify',
  data: {},
  value: 'https://atmosusa.com/',
  label: 'Atmos USA',
} as SiteMapEntry);

// BBC Ice Cream
siteMap.set('https://www.bbcicecream.com/', {
  url: 'https://www.bbcicecream.com/',
  platform: 'shopify',
  data: {},
  value: 'https://www.bbcicecream.com/',
  label: 'BBC Ice Cream',
} as SiteMapEntry);

// Bodega
siteMap.set('https://bdgastore.com/', {
  url: 'https://bdgastore.com/',
  platform: 'shopify',
  data: {},
  value: 'https://bdgastore.com/',
  label: 'Bodega',
} as SiteMapEntry);

// Concepts
siteMap.set('https://cncpts.com/', {
  url: 'https://cncpts.com/',
  platform: 'shopify',
  data: {},
  value: 'https://cncpts.com/',
  label: 'Concepts',
} as SiteMapEntry);

// Denim Tears
siteMap.set('https://checkout.denimtears.com/', {
  url: 'https://checkout.denimtears.com/',
  platform: 'shopify',
  data: {},
  value: 'https://checkout.denimtears.com/',
  label: 'Denim Tears',
} as SiteMapEntry);

// DSMNY E-SHOP
siteMap.set('https://shop-us.doverstreetmarket.com/', {
  url: 'https://shop-us.doverstreetmarket.com/', // Alternative URL: https://shop.doverstreetmarket.com/us/
  platform: 'shopify',
  data: {},
  value: 'https://shop-us.doverstreetmarket.com/',
  label: 'DSMNY E-SHOP',
} as SiteMapEntry);

// DTLR
siteMap.set('https://www.dtlr.com/', {
  url: 'https://www.dtlr.com/',
  platform: 'shopify',
  data: {},
  value: 'https://www.dtlr.com/',
  label: 'DTLR',
} as SiteMapEntry);

// Extra Butter
siteMap.set('https://extrabutterny.com/', {
  url: 'https://extrabutterny.com/',
  platform: 'shopify',
  data: {},
  value: 'https://extrabutterny.com/',
  label: 'Extra Butter',
} as SiteMapEntry);

// Goat
siteMap.set('https://www.goat.com/', {
  url: 'https://www.goat.com/',
  platform: 'goat',
  data: {},
  value: 'https://www.goat.com/',
  label: 'Goat',
} as SiteMapEntry);

// JJJJound
siteMap.set('https://www.jjjjound.com/', {
  url: 'https://www.jjjjound.com/',
  platform: 'shopify',
  data: {},
  value: 'https://www.jjjjound.com/',
  label: 'JJJJound',
} as SiteMapEntry);

// Kith
siteMap.set('https://kith.com/', {
  url: 'https://kith.com/',
  platform: 'shopify',
  data: {},
  value: 'https://kith.com/',
  label: 'Kith',
} as SiteMapEntry);

// Labor Skateshop
siteMap.set('https://www.laborskateshop.com/', {
  url: 'https://www.laborskateshop.com/',
  platform: 'shopify',
  data: {},
  value: 'https://www.laborskateshop.com/',
  label: 'Labor Skateshop',
} as SiteMapEntry);

// Lapstone & Hammer
siteMap.set('https://www.lapstoneandhammer.com/', {
  url: 'https://www.lapstoneandhammer.com/',
  platform: 'shopify',
  data: {},
  value: 'https://www.lapstoneandhammer.com/',
  label: 'Lapstone & Hammer',
} as SiteMapEntry);

// Likelihood
siteMap.set('https://likelihood.us/', {
  url: 'https://likelihood.us/',
  platform: 'shopify',
  data: {},
  value: 'https://likelihood.us/',
  label: 'Likelihood',
} as SiteMapEntry);

// Mamba & Mambacita
siteMap.set('https://shop.mambaandmambacita.org/', {
  url: 'https://shop.mambaandmambacita.org/',
  platform: 'shopify',
  data: {},
  value: 'https://shop.mambaandmambacita.org/',
  label: 'Mamba & Mambacita',
} as SiteMapEntry);

// Mattel Creations
siteMap.set('https://creations.mattel.com/', {
  url: 'https://creations.mattel.com/',
  platform: 'shopify',
  data: {},
  value: 'https://creations.mattel.com/',
  label: 'Mattel Creations',
} as SiteMapEntry);

// Miller High Life
siteMap.set('https://shop.millerhighlife.com/', {
  url: 'https://shop.millerhighlife.com/',
  platform: 'shopify',
  data: {},
  value: 'https://shop.millerhighlife.com/',
  label: 'Miller High Life',
} as SiteMapEntry);

// Nike
siteMap.set('https://www.nike.com/', {
  url: 'https://www.nike.com/',
  platform: 'nike',
  data: {},
  value: 'https://www.nike.com/',
  label: 'Nike',
} as SiteMapEntry);

// NOCTA
siteMap.set('https://nocta.com/', {
  url: 'https://nocta.com/',
  platform: 'shopify',
  data: {},
  value: 'https://nocta.com/',
  label: 'NOCTA',
} as SiteMapEntry);

// Notre
siteMap.set('https://www.notre-shop.com/', {
  url: 'https://www.notre-shop.com/',
  platform: 'shopify',
  data: {},
  value: 'https://www.notre-shop.com/',
  label: 'Notre',
} as SiteMapEntry);

// Obey Giant
siteMap.set('https://store.obeygiant.com/', {
  url: 'https://store.obeygiant.com/',
  platform: 'shopify',
  data: {},
  value: 'https://store.obeygiant.com/',
  label: 'Obey Giant',
} as SiteMapEntry);

// Oneness Boutique
siteMap.set('https://www.onenessboutique.com/', {
  url: 'https://www.onenessboutique.com/',
  platform: 'shopify',
  data: {},
  value: 'https://www.onenessboutique.com/',
  label: 'Oneness Boutique',
} as SiteMapEntry);

// OVO
siteMap.set('https://us.octobersveryown.com/', {
  url: 'https://us.octobersveryown.com/',
  platform: 'shopify',
  data: {},
  value: 'https://us.octobersveryown.com/',
  label: 'OVO',
} as SiteMapEntry);

// Packer
siteMap.set('https://packershoes.com/', {
  url: 'https://packershoes.com/',
  platform: 'shopify',
  data: {},
  value: 'https://packershoes.com/',
  label: 'Packer',
} as SiteMapEntry);

// Private Sneakers
siteMap.set('https://www.privatesneakers.com/', {
  url: 'https://www.privatesneakers.com/',
  platform: 'shopify',
  data: {},
  value: 'https://www.privatesneakers.com/',
  label: 'Private Sneakers',
} as SiteMapEntry);

// RSVP Gallery
siteMap.set('https://rsvpgallery.com/', {
  url: 'https://rsvpgallery.com/',
  platform: 'shopify',
  data: {},
  value: 'https://rsvpgallery.com/',
  label: 'RSVP Gallery',
} as SiteMapEntry);

// Rule of Next
siteMap.set('https://ruleofnext.com/', {
  url: 'https://ruleofnext.com/',
  platform: 'shopify',
  data: {},
  value: 'https://ruleofnext.com/',
  label: 'Rule of Next',
} as SiteMapEntry);

// Saint Alfred
siteMap.set('https://www.saintalfred.com/', {
  url: 'https://www.saintalfred.com/',
  platform: 'shopify',
  data: {},
  value: 'https://www.saintalfred.com/',
  label: 'Saint Alfred',
} as SiteMapEntry);

// Shoe Palace
siteMap.set('https://www.shoepalace.com/', {
  url: 'https://www.shoepalace.com/',
  platform: 'shopify',
  data: {},
  value: 'https://www.shoepalace.com/',
  label: 'Shoe Palace',
} as SiteMapEntry);

// Shop Nice Kicks
siteMap.set('https://shopnicekicks.com/', {
  url: 'https://shopnicekicks.com/',
  platform: 'shopify',
  data: {},
  value: 'https://shopnicekicks.com/',
  label: 'Shop Nice Kicks',
} as SiteMapEntry);

// ShopWSS
siteMap.set('https://www.shopwss.com/', {
  url: 'https://www.shopwss.com/',
  platform: 'shopify',
  data: {},
  value: 'https://www.shopwss.com/',
  label: 'ShopWSS',
} as SiteMapEntry);

// Sneaker Politics
siteMap.set('https://sneakerpolitics.com/', {
  url: 'https://sneakerpolitics.com/',
  platform: 'shopify',
  data: {},
  value: 'https://sneakerpolitics.com/',
  label: 'Sneaker Politics',
} as SiteMapEntry);

// Social Status
siteMap.set('https://www.socialstatuspgh.com/', {
  url: 'https://www.socialstatuspgh.com/',
  platform: 'shopify',
  data: {},
  value: 'https://www.socialstatuspgh.com/',
  label: 'Social Status',
} as SiteMapEntry);

// Stanley 1913
siteMap.set('https://www.stanley1913.com/', {
  url: 'https://www.stanley1913.com/',
  platform: 'shopify',
  data: {},
  value: 'https://www.stanley1913.com/',
  label: 'Stanley 1913',
} as SiteMapEntry);

// Stussy
siteMap.set('https://www.stussy.com/', {
  url: 'https://www.stussy.com/',
  platform: 'shopify',
  data: {},
  value: 'https://www.stussy.com/',
  label: 'Stussy',
} as SiteMapEntry);

// Supreme
siteMap.set('https://us.supreme.com/', {
  url: 'https://us.supreme.com/',
  platform: 'shopify',
  data: {},
  value: 'https://us.supreme.com/',
  label: 'Supreme',
} as SiteMapEntry);

// Taco Bell
siteMap.set('https://www.tacobelltacoshop.com/', {
  url: 'https://www.tacobelltacoshop.com/',
  platform: 'shopify',
  data: {},
  value: 'https://www.tacobelltacoshop.com/',
  label: 'Taco Bell',
} as SiteMapEntry);

// The Better Generation
siteMap.set('https://telfar.net/', {
  url: 'https://telfar.net/',
  platform: 'shopify',
  data: {},
  value: 'https://telfar.net/',
  label: 'Teflar',
} as SiteMapEntry);

// The Better Generation
siteMap.set('https://thebettergeneration.com/', {
  url: 'https://thebettergeneration.com/',
  platform: 'shopify',
  data: {},
  value: 'https://thebettergeneration.com/',
  label: 'The Better Generation',
} as SiteMapEntry);

// The Darkside Initiative
siteMap.set('https://www.thedarksideinitiative.com/', {
  url: 'https://www.thedarksideinitiative.com/',
  platform: 'shopify',
  data: {},
  value: 'https://www.thedarksideinitiative.com/',
  label: 'The Darkside Initiative',
} as SiteMapEntry);

// Travis Scott
siteMap.set('https://shop.travisscott.com/', {
  url: 'https://shop.travisscott.com/',
  platform: 'shopify',
  data: {},
  value: 'https://shop.travisscott.com/',
  label: 'Travis Scott',
} as SiteMapEntry);

// Trophy Room
siteMap.set('https://www.trophyroomstore.com/', {
  url: 'https://www.trophyroomstore.com/',
  platform: 'shopify',
  data: {},
  value: 'https://www.trophyroomstore.com/',
  label: 'Trophy Room',
} as SiteMapEntry);

// Undefeated
siteMap.set('https://undefeated.com/', {
  url: 'https://undefeated.com/',
  platform: 'shopify',
  data: {},
  value: 'https://undefeated.com/',
  label: 'Undefeated',
} as SiteMapEntry);

// Union LA
siteMap.set('https://store.unionlosangeles.com/', {
  url: 'https://store.unionlosangeles.com/',
  platform: 'shopify',
  data: {},
  value: 'https://store.unionlosangeles.com/',
  label: 'Union LA',
} as SiteMapEntry);

// Unknwn
siteMap.set('https://www.unknwn.com/', {
  url: 'https://www.unknwn.com/',
  platform: 'shopify',
  data: {},
  value: 'https://www.unknwn.com/',
  label: 'Unknwn',
} as SiteMapEntry);

// Wish ATL
siteMap.set('https://wishatl.com/', {
  url: 'https://wishatl.com/',
  platform: 'shopify',
  data: {},
  value: 'https://wishatl.com/',
  label: 'Wish ATL',
} as SiteMapEntry);

// Xhibition
siteMap.set('https://www.xhibition.co/', {
  url: 'https://www.xhibition.co/',
  platform: 'shopify',
  data: {},
  value: 'https://www.xhibition.co/',
  label: 'Xhibition',
} as SiteMapEntry);

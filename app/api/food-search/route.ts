import { NextRequest, NextResponse } from "next/server";

type Confidence = "high" | "medium" | "low";

type FoodSource = "open_food_facts" | "local_fallback";

type FoodSearchResult = {
  name: string;
  brand?: string;
  baseAmount: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  source: FoodSource;
  confidence: Confidence;
  verified: boolean;
  sourceUrl?: string;
  notes?: string;
};

type SearchCategory =
  | "tuna"
  | "beef"
  | "chicken_breast"
  | "rice"
  | "egg"
  | "whey"
  | "greek_yogurt"
  | "salmon"
  | "pork"
  | "unknown";

const fallbackFoods: FoodSearchResult[] = [
  {
    name: "ทูน่ากระป๋องในน้ำแร่ / น้ำเกลือ",
    brand: "Generic",
    baseAmount: 100,
    unit: "g",
    calories: 116,
    protein: 25.5,
    carbs: 0,
    fat: 0.8,
    source: "local_fallback",
    confidence: "medium",
    verified: false,
    notes: "ค่า fallback โดยประมาณ เหมาะกับทูน่ากระป๋องในน้ำแร่หรือน้ำเกลือ",
  },
  {
    name: "เนื้อวัวไม่ติดมัน",
    brand: "Generic",
    baseAmount: 100,
    unit: "g",
    calories: 190,
    protein: 26,
    carbs: 0,
    fat: 9,
    source: "local_fallback",
    confidence: "medium",
    verified: false,
    notes: "ค่า fallback สำหรับเนื้อวัวไม่ติดมัน 100g",
  },
  {
    name: "เนื้อวัวติดมันปานกลาง",
    brand: "Generic",
    baseAmount: 100,
    unit: "g",
    calories: 250,
    protein: 25,
    carbs: 0,
    fat: 17,
    source: "local_fallback",
    confidence: "medium",
    verified: false,
    notes: "ค่า fallback สำหรับเนื้อวัวติดมันปานกลาง 100g",
  },
  {
    name: "อกไก่",
    brand: "Generic",
    baseAmount: 100,
    unit: "g",
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    source: "local_fallback",
    confidence: "medium",
    verified: false,
    notes: "ค่า fallback สำหรับอกไก่ 100g",
  },
  {
    name: "ข้าวสวย",
    brand: "Generic",
    baseAmount: 100,
    unit: "g",
    calories: 130,
    protein: 2.7,
    carbs: 28,
    fat: 0.3,
    source: "local_fallback",
    confidence: "medium",
    verified: false,
    notes: "ค่า fallback สำหรับข้าวสวย 100g",
  },
  {
    name: "ไข่ไก่",
    brand: "Generic",
    baseAmount: 1,
    unit: "ฟอง",
    calories: 70,
    protein: 6,
    carbs: 0.6,
    fat: 5,
    source: "local_fallback",
    confidence: "medium",
    verified: false,
    notes: "ค่า fallback สำหรับไข่ไก่ 1 ฟอง",
  },
  {
    name: "เวย์โปรตีน",
    brand: "Generic",
    baseAmount: 1,
    unit: "scoop",
    calories: 120,
    protein: 24,
    carbs: 3,
    fat: 1.5,
    source: "local_fallback",
    confidence: "medium",
    verified: false,
    notes: "ค่า fallback สำหรับเวย์โปรตีน 1 scoop",
  },
  {
    name: "กรีกโยเกิร์ต",
    brand: "Generic",
    baseAmount: 150,
    unit: "g",
    calories: 90,
    protein: 9,
    carbs: 8,
    fat: 2,
    source: "local_fallback",
    confidence: "medium",
    verified: false,
    notes: "ค่า fallback สำหรับกรีกโยเกิร์ต 150g",
  },
  {
    name: "แซลมอน",
    brand: "Generic",
    baseAmount: 100,
    unit: "g",
    calories: 208,
    protein: 20,
    carbs: 0,
    fat: 13,
    source: "local_fallback",
    confidence: "medium",
    verified: false,
    notes: "ค่า fallback สำหรับแซลมอน 100g",
  },
  {
    name: "หมูสันใน / หมูไม่ติดมัน",
    brand: "Generic",
    baseAmount: 100,
    unit: "g",
    calories: 143,
    protein: 26,
    carbs: 0,
    fat: 3.5,
    source: "local_fallback",
    confidence: "medium",
    verified: false,
    notes: "ค่า fallback สำหรับหมูไม่ติดมัน 100g",
  },
];

function round1(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 10) / 10;
}

function detectCategory(rawQuery: string): SearchCategory {
  const q = rawQuery.trim().toLowerCase();

  if (["ทูน่า", "ปลาทูน่า", "tuna", "thon"].some((x) => q.includes(x))) {
    return "tuna";
  }

  if (["เนื้อวัว", "เนื้อ", "beef", "boeuf"].some((x) => q.includes(x))) {
    return "beef";
  }

  if (["อกไก่", "ไก่", "chicken breast"].some((x) => q.includes(x))) {
    return "chicken_breast";
  }

  if (["ข้าวสวย", "ข้าว", "rice", "cooked rice"].some((x) => q.includes(x))) {
    return "rice";
  }

  if (["ไข่", "ไข่ไก่", "egg"].some((x) => q.includes(x))) {
    return "egg";
  }

  if (["เวย์", "whey", "protein powder"].some((x) => q.includes(x))) {
    return "whey";
  }

  if (
    ["โยเกิร์ต", "กรีกโยเกิร์ต", "greek yogurt", "yogurt"].some((x) =>
      q.includes(x)
    )
  ) {
    return "greek_yogurt";
  }

  if (["แซลมอน", "salmon"].some((x) => q.includes(x))) {
    return "salmon";
  }

  if (["หมู", "pork"].some((x) => q.includes(x))) {
    return "pork";
  }

  return "unknown";
}

function normalizeQuery(rawQuery: string) {
  const category = detectCategory(rawQuery);

  const map: Record<SearchCategory, string> = {
    tuna: "tuna",
    beef: "beef",
    chicken_breast: "chicken breast",
    rice: "cooked white rice",
    egg: "egg",
    whey: "whey protein",
    greek_yogurt: "greek yogurt",
    salmon: "salmon",
    pork: "pork",
    unknown: rawQuery.trim(),
  };

  return {
    query: map[category],
    category,
  };
}

function getConfidence({
  calories,
  protein,
  carbs,
  fat,
  hasName,
  category,
}: {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  hasName: boolean;
  category: SearchCategory;
}): Confidence {
  if (!hasName || calories <= 0) return "low";

  if (category === "beef") {
    if (protein < 15 || carbs > 8) return "low";
  }

  if (category === "chicken_breast") {
    if (protein < 20 || carbs > 5) return "low";
  }

  if (category === "tuna") {
    if (protein < 15 || carbs > 5) return "low";
  }

  const macroCalories = protein * 4 + carbs * 4 + fat * 9;
  const diffPercent = Math.abs(macroCalories - calories) / calories;

  if (diffPercent <= 0.2) return "high";
  if (diffPercent <= 0.35) return "medium";

  return "low";
}

function hasBadKeywords(text: string) {
  const badKeywords = [
    "chocolate",
    "chocolat",
    "cocoa",
    "cacao",
    "biscuit",
    "cookie",
    "cake",
    "bar",
    "cereal",
    "sauce",
    "soup",
    "noodle",
    "pasta",
    "pizza",
    "sandwich",
    "meal",
    "ready meal",
    "protein bar",
    "drink",
    "milk",
    "yogurt",
    "fromage",
    "cheese",
    "snack",
    "dessert",
    "ice cream",
  ];

  return badKeywords.some((word) => text.includes(word));
}

function passesCategorySanity({
  category,
  originalName,
  brand,
  calories,
  protein,
  carbs,
  fat,
}: {
  category: SearchCategory;
  originalName: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}) {
  const text = `${originalName} ${brand ?? ""}`.toLowerCase();

  if (calories <= 0) return false;

  if (category === "beef") {
    if (!(text.includes("beef") || text.includes("boeuf"))) return false;
    if (hasBadKeywords(text)) return false;
    if (protein < 15) return false;
    if (carbs > 8) return false;
    if (fat > 35) return false;
    return true;
  }

  if (category === "chicken_breast") {
    if (!text.includes("chicken")) return false;
    if (hasBadKeywords(text)) return false;
    if (protein < 20) return false;
    if (carbs > 8) return false;
    return true;
  }

  if (category === "tuna") {
    if (!(text.includes("tuna") || text.includes("thon"))) return false;
    if (hasBadKeywords(text)) return false;
    if (protein < 15) return false;
    if (carbs > 8) return false;
    return true;
  }

  if (category === "rice") {
    if (!text.includes("rice")) return false;
    if (protein > 10) return false;
    if (carbs < 10) return false;
    return true;
  }

  if (category === "egg") {
    if (!text.includes("egg")) return false;
    if (protein < 5 && calories > 100) return false;
    return true;
  }

  if (category === "whey") {
    if (!(text.includes("whey") || text.includes("protein"))) return false;
    if (protein < 15) return false;
    return true;
  }

  if (category === "greek_yogurt") {
    if (!text.includes("yogurt") && !text.includes("yaourt")) return false;
    return true;
  }

  if (category === "salmon") {
    if (!text.includes("salmon")) return false;
    if (protein < 15) return false;
    if (carbs > 5) return false;
    return true;
  }

  if (category === "pork") {
    if (!text.includes("pork") && !text.includes("porc")) return false;
    if (hasBadKeywords(text)) return false;
    if (protein < 15) return false;
    if (carbs > 8) return false;
    return true;
  }

  return true;
}

function translateProductName({
  originalName,
  brand,
  category,
}: {
  originalName: string;
  brand?: string;
  category: SearchCategory;
}) {
  const n = originalName.toLowerCase();
  const brandText = brand ? ` (${brand})` : "";

  if (category === "tuna") {
    if (n.includes("huile") || n.includes("oil")) {
      return `ทูน่าในน้ำมัน${brandText}`;
    }

    if (
      n.includes("nature") ||
      n.includes("natural") ||
      n.includes("water") ||
      n.includes("brine")
    ) {
      return `ทูน่าในน้ำแร่ / น้ำเกลือ${brandText}`;
    }

    if (n.includes("albacore")) {
      return `ทูน่าอัลบาคอร์${brandText}`;
    }

    return `ทูน่า${brandText}`;
  }

  if (category === "beef") return `เนื้อวัว${brandText}`;
  if (category === "chicken_breast") return `อกไก่${brandText}`;
  if (category === "rice") return `ข้าวสวย / ข้าวขาวสุก${brandText}`;
  if (category === "egg") return `ไข่ไก่${brandText}`;
  if (category === "whey") return `เวย์โปรตีน${brandText}`;
  if (category === "greek_yogurt") return `กรีกโยเกิร์ต${brandText}`;
  if (category === "salmon") return `แซลมอน${brandText}`;
  if (category === "pork") return `เนื้อหมู${brandText}`;

  return `${originalName}${brandText}`;
}

function relevanceScore({
  originalName,
  brand,
  category,
  calories,
  protein,
  carbs,
  fat,
}: {
  originalName: string;
  brand?: string;
  category: SearchCategory;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}) {
  const text = `${originalName} ${brand ?? ""}`.toLowerCase();
  let score = 0;

  if (calories > 0) score += 10;
  if (protein >= 0 && carbs >= 0 && fat >= 0) score += 5;

  if (category === "beef") {
    if (text.includes("beef") || text.includes("boeuf")) score += 40;
    if (protein >= 20) score += 25;
    if (carbs <= 2) score += 15;
    if (fat <= 20) score += 5;
    if (hasBadKeywords(text)) score -= 100;
  }

  if (category === "tuna") {
    if (text.includes("tuna") || text.includes("thon")) score += 40;
    if (protein >= 20) score += 25;
    if (carbs <= 2) score += 15;
    if (text.includes("nature") || text.includes("natural") || text.includes("water")) {
      score += 10;
    }
    if (text.includes("huile") || text.includes("oil")) {
      score += 3;
    }
    if (hasBadKeywords(text)) score -= 100;
  }

  if (category === "chicken_breast") {
    if (text.includes("chicken")) score += 40;
    if (protein >= 25) score += 25;
    if (carbs <= 2) score += 15;
    if (hasBadKeywords(text)) score -= 100;
  }

  if (category === "rice" && text.includes("rice")) score += 30;
  if (category === "egg" && text.includes("egg")) score += 30;
  if (category === "whey" && (text.includes("whey") || text.includes("protein"))) score += 30;
  if (category === "greek_yogurt" && (text.includes("yogurt") || text.includes("yaourt"))) score += 30;
  if (category === "salmon" && text.includes("salmon")) score += 30;
  if (category === "pork" && (text.includes("pork") || text.includes("porc"))) score += 30;

  return score;
}

function getFallbackResults(category: SearchCategory, query: string) {
  if (category !== "unknown") {
    return fallbackFoods.filter((food) => {
      const name = food.name.toLowerCase();

      if (category === "tuna") return name.includes("ทูน่า");
      if (category === "beef") return name.includes("เนื้อวัว");
      if (category === "chicken_breast") return name.includes("อกไก่");
      if (category === "rice") return name.includes("ข้าว");
      if (category === "egg") return name.includes("ไข่");
      if (category === "whey") return name.includes("เวย์");
      if (category === "greek_yogurt") return name.includes("โยเกิร์ต");
      if (category === "salmon") return name.includes("แซลมอน");
      if (category === "pork") return name.includes("หมู");

      return false;
    });
  }

  const q = query.toLowerCase();
  return fallbackFoods.filter((food) => food.name.toLowerCase().includes(q));
}

function dedupeFoods(items: FoodSearchResult[]) {
  const seen = new Set<string>();
  const result: FoodSearchResult[] = [];

  for (const item of items) {
    const key = `${item.name}-${item.calories}-${item.protein}-${item.carbs}-${item.fat}`;

    if (seen.has(key)) continue;

    seen.add(key);
    result.push(item);
  }

  return result;
}

function buildFallbackResponse({
  query,
  category,
  reason,
}: {
  query: string;
  category: SearchCategory;
  reason: string;
}) {
  const fallbackResults = getFallbackResults(category, query);

  return NextResponse.json({
    ok: true,
    query,
    category,
    results: fallbackResults,
    message:
      fallbackResults.length > 0
        ? `ใช้ข้อมูล fallback ภาษาไทย ${fallbackResults.length} รายการ (${reason})`
        : `ไม่พบข้อมูล fallback สำหรับคำนี้ (${reason})`,
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawQuery = searchParams.get("q") ?? "";

  const { query, category } = normalizeQuery(rawQuery);

  if (!query || query.trim().length < 2) {
    return NextResponse.json({
      ok: false,
      results: [],
      message: "กรุณาใส่คำค้นหาอย่างน้อย 2 ตัวอักษร",
    });
  }

  const url = new URL("https://world.openfoodfacts.org/api/v2/search");

  url.searchParams.set("search_terms", query);
  url.searchParams.set("page_size", "30");
  url.searchParams.set(
    "fields",
    [
      "code",
      "product_name",
      "brands",
      "url",
      "nutriments",
      "quantity",
      "serving_size",
    ].join(",")
  );

  try {
    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "MacroMate/0.1 local nutrition tracker",
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return buildFallbackResponse({
        query,
        category,
        reason: `Open Food Facts ${res.status}`,
      });
    }

    const data = await res.json();
    const products = Array.isArray(data.products) ? data.products : [];

    const openFoodFactsResults = products
      .map((product: any) => {
        const nutriments = product.nutriments ?? {};

        const originalName =
          product.product_name ||
          product.brands ||
          product.quantity ||
          "Unknown food";

        const brand = product.brands || "";

        const calories =
          Number(nutriments["energy-kcal_100g"]) ||
          Number(nutriments["energy-kcal"]) ||
          0;

        const protein = Number(nutriments["proteins_100g"]) || 0;
        const carbs = Number(nutriments["carbohydrates_100g"]) || 0;
        const fat = Number(nutriments["fat_100g"]) || 0;

        const sanityOk = passesCategorySanity({
          category,
          originalName,
          brand,
          calories,
          protein,
          carbs,
          fat,
        });

        if (!sanityOk) return null;

        const confidence = getConfidence({
          calories,
          protein,
          carbs,
          fat,
          hasName: Boolean(product.product_name || product.brands),
          category,
        });

        if (confidence === "low" && category !== "unknown") return null;

        const translatedName = translateProductName({
          originalName,
          brand,
          category,
        });

        const score = relevanceScore({
          originalName,
          brand,
          category,
          calories,
          protein,
          carbs,
          fat,
        });

        return {
          item: {
            name: translatedName,
            brand,
            baseAmount: 100,
            unit: "g",
            calories: round1(calories),
            protein: round1(protein),
            carbs: round1(carbs),
            fat: round1(fat),
            source: "open_food_facts" as const,
            confidence,
            verified: confidence === "high",
            sourceUrl:
              product.url ||
              (product.code
                ? `https://world.openfoodfacts.org/product/${product.code}`
                : undefined),
            notes:
              confidence === "high"
                ? `แปลจากชื่อเดิม: ${originalName}. ข้อมูลจาก Open Food Facts และ macro ผ่าน sanity check`
                : `แปลจากชื่อเดิม: ${originalName}. ควรตรวจสอบก่อนบันทึก`,
          },
          score,
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.score - a.score)
      .map((entry: any) => entry.item) as FoodSearchResult[];

    const fallbackResults = getFallbackResults(category, query);

    const finalResults =
      category !== "unknown"
        ? dedupeFoods([...fallbackResults, ...openFoodFactsResults]).slice(0, 8)
        : dedupeFoods(openFoodFactsResults).slice(0, 8);

    return NextResponse.json({
      ok: true,
      query,
      category,
      results: finalResults,
      message:
        finalResults.length > 0
          ? `พบ ${finalResults.length} รายการที่ผ่านการคัดกรอง`
          : "ไม่พบข้อมูลที่น่าเชื่อถือสำหรับคำนี้",
    });
  } catch (error) {
    return buildFallbackResponse({
      query,
      category,
      reason: error instanceof Error ? error.message : "fetch failed",
    });
  }
}
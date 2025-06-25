"use client";

import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Animated,
  Share,
  StatusBar,
  Dimensions,
} from "react-native";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
const MAIN_COLOR = "#FF8E6E"; // Coral color as the main theme
const FAVORITE_TIPS_KEY = "@DermaScanAI:favoriteTips";

// Tip type definition
type Tip = {
  id: string;
  title: string;
  content: string;
  category: string;
  imageUrl?: string;
  source?: string;
  tags: string[];
  featured?: boolean;
};

// Category type definition
type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export default function TipsScreen({ navigation }: { navigation?: any }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [favoriteTips, setFavoriteTips] = useState<string[]>([]);
  const [expandedTip, setExpandedTip] = useState<string | null>(null);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [refreshing, setRefreshing] = useState(false);

  // Load favorite tips from storage
  useEffect(() => {
    const loadFavoriteTips = async () => {
      try {
        const storedFavorites = await AsyncStorage.getItem(FAVORITE_TIPS_KEY);
        if (storedFavorites) {
          setFavoriteTips(JSON.parse(storedFavorites));
        }
      } catch (error) {
        console.error("Failed to load favorite tips:", error);
      }
    };

    loadFavoriteTips();
  }, []);

  // Save favorite tips to storage
  const saveFavoriteTips = async (tips: string[]) => {
    try {
      await AsyncStorage.setItem(FAVORITE_TIPS_KEY, JSON.stringify(tips));
    } catch (error) {
      console.error("Failed to save favorite tips:", error);
    }
  };

  // Toggle favorite status of a tip
  const toggleFavorite = (tipId: string) => {
    const newFavorites = favoriteTips.includes(tipId)
      ? favoriteTips.filter((id) => id !== tipId)
      : [...favoriteTips, tipId];

    setFavoriteTips(newFavorites);
    saveFavoriteTips(newFavorites);
  };

  // Share a tip
  const shareTip = async (tip: Tip) => {
    try {
      await Share.share({
        message: `${tip.title}\n\n${tip.content}\n\nShared from DermaScanAI`,
      });
    } catch (error) {
      console.error("Error sharing tip:", error);
    }
  };

  // Categories
  const categories: Category[] = [
    { id: "skinHealth", name: "Skin Health", icon: "sun", color: "#FF8E6E" },
    { id: "nutrition", name: "Nutrition", icon: "apple-alt", color: "#4CAF50" },
    { id: "hydration", name: "Hydration", icon: "tint", color: "#2196F3" },
    {
      id: "sunProtection",
      name: "Sun Protection",
      icon: "umbrella-beach",
      color: "#FFC107",
    },
    {
      id: "seasonal",
      name: "Seasonal Care",
      icon: "cloud-sun",
      color: "#9C27B0",
    },
    {
      id: "conditions",
      name: "Skin Conditions",
      icon: "allergies",
      color: "#F44336",
    },
    { id: "wellness", name: "Wellness", icon: "heart", color: "#E91E63" },
    { id: "exercise", name: "Exercise", icon: "running", color: "#3F51B5" },
    {
      id: "mentalHealth",
      name: "Mental Health",
      icon: "brain",
      color: "#009688",
    },
  ];

  // Tips data
  const tips: Tip[] = [
    // SKIN HEALTH TIPS
    {
      id: "tip1",
      title: "Gentle Cleansing Routine",
      content:
        "Wash your face with a gentle cleanser twice daily. Avoid harsh soaps that can strip natural oils from your skin. Use lukewarm water, as hot water can dry out your skin. Pat dry with a soft towel instead of rubbing to avoid irritation.",
      category: "skinHealth",
      tags: ["cleansing", "daily routine", "basics"],
      featured: true,
    },
    {
      id: "tip2",
      title: "Exfoliate Weekly, Not Daily",
      content:
        "Exfoliation removes dead skin cells, but over-exfoliating can damage your skin barrier. Limit exfoliation to 1-2 times per week. Choose chemical exfoliants (like AHAs or BHAs) for sensitive skin rather than physical scrubs which can cause micro-tears.",
      category: "skinHealth",
      tags: ["exfoliation", "skin barrier", "skincare"],
    },
    {
      id: "tip3",
      title: "Layering Skincare Products",
      content:
        "Apply skincare products in order of consistency, from thinnest to thickest. The correct order is: cleanser, toner, serums, treatments, moisturizer, and sunscreen (in the morning). This ensures each product can penetrate effectively.",
      category: "skinHealth",
      tags: ["skincare routine", "product application", "advanced"],
    },
    {
      id: "tip4",
      title: "Nighttime Skin Repair",
      content:
        "Your skin repairs itself while you sleep. Use products with ingredients like retinol, peptides, and antioxidants at night to support this natural process. Always remove makeup before bed to allow your skin to breathe and regenerate.",
      category: "skinHealth",
      tags: ["night routine", "skin repair", "sleep"],
    },
    {
      id: "tip5",
      title: "Patch Test New Products",
      content:
        "Before applying a new skincare product to your face, test it on a small area of skin (like your inner forearm) for 24-48 hours. This helps identify potential allergic reactions or irritation before applying to more sensitive facial skin.",
      category: "skinHealth",
      tags: ["product safety", "allergies", "sensitive skin"],
    },

    // NUTRITION TIPS
    {
      id: "tip6",
      title: "Antioxidant-Rich Foods for Skin",
      content:
        "Consume foods rich in antioxidants like berries, dark leafy greens, and colorful vegetables. These help fight free radicals that damage skin cells. Vitamin C from citrus fruits also supports collagen production, keeping skin firm and youthful.",
      category: "nutrition",
      tags: ["antioxidants", "diet", "anti-aging"],
      featured: true,
    },
    {
      id: "tip7",
      title: "Omega-3 Fatty Acids for Skin Barrier",
      content:
        "Include omega-3 fatty acids in your diet through fatty fish (salmon, mackerel), walnuts, and flaxseeds. These essential fats strengthen your skin's barrier, retain moisture, and reduce inflammation that can lead to premature aging and acne.",
      category: "nutrition",
      tags: ["essential fats", "inflammation", "skin barrier"],
    },
    {
      id: "tip8",
      title: "Zinc for Acne Prevention",
      content:
        "Foods high in zinc like oysters, pumpkin seeds, and legumes can help regulate oil production and reduce acne inflammation. Zinc supports immune function and wound healing, making it essential for maintaining clear, healthy skin.",
      category: "nutrition",
      tags: ["minerals", "acne", "oil control"],
    },
    {
      id: "tip9",
      title: "Limit Sugar and Dairy",
      content:
        "High-glycemic foods and dairy products can trigger hormonal fluctuations that increase sebum production and inflammation. Consider reducing refined sugars, white bread, and dairy to see if your skin clarity improves, especially if you're prone to acne.",
      category: "nutrition",
      tags: ["diet restrictions", "acne triggers", "inflammation"],
    },
    {
      id: "tip10",
      title: "Vitamin E for Skin Repair",
      content:
        "Incorporate vitamin E-rich foods like almonds, sunflower seeds, and avocados into your diet. This fat-soluble antioxidant protects cell membranes, promotes healing, and may help reduce UV damage when combined with vitamin C and sunscreen.",
      category: "nutrition",
      tags: ["vitamins", "skin repair", "antioxidants"],
    },

    // HYDRATION TIPS
    {
      id: "tip11",
      title: "Optimal Daily Water Intake",
      content:
        "Aim to drink at least 8-10 glasses (2-2.5 liters) of water daily. Proper hydration helps maintain skin elasticity, flush toxins, and transport nutrients to skin cells. Your skin is an organ that requires adequate hydration to function optimally.",
      category: "hydration",
      tags: ["water intake", "basics", "daily habits"],
      featured: true,
    },
    {
      id: "tip12",
      title: "Hydrating Foods for Skin",
      content:
        "Consume water-rich foods like cucumber (96% water), watermelon (92% water), and strawberries (91% water). These foods provide sustained hydration along with beneficial vitamins, minerals, and antioxidants that support skin health.",
      category: "hydration",
      tags: ["food sources", "nutrition", "water content"],
    },
    {
      id: "tip13",
      title: "Humidifier Benefits",
      content:
        "Use a humidifier in dry environments or during winter months to add moisture to the air. This prevents water loss from your skin and helps maintain hydration levels, especially while you sleep. Aim for 40-60% humidity for optimal skin health.",
      category: "hydration",
      tags: ["environment", "dry skin", "winter care"],
    },
    {
      id: "tip14",
      title: "Hyaluronic Acid: Hydration Magnet",
      content:
        "Apply products containing hyaluronic acid to damp skin. This molecule can hold up to 1000 times its weight in water, drawing moisture into the skin. For maximum effectiveness, use it before heavier moisturizers to seal in hydration.",
      category: "hydration",
      tags: ["ingredients", "skincare", "moisture retention"],
    },
    {
      id: "tip15",
      title: "Avoid Dehydrating Beverages",
      content:
        "Limit consumption of alcohol and caffeine, which act as diuretics and can dehydrate your skin. If you do consume these beverages, compensate by drinking extra water. For every cup of coffee or alcoholic drink, add an additional glass of water.",
      category: "hydration",
      tags: ["beverages", "dehydration", "lifestyle"],
    },

    // SUN PROTECTION TIPS
    {
      id: "tip16",
      title: "Daily SPF: Non-Negotiable",
      content:
        "Apply broad-spectrum SPF 30+ sunscreen every day, regardless of weather or season. UV rays penetrate clouds and windows, causing cumulative damage over time. Reapply every two hours when outdoors, or more frequently when swimming or sweating.",
      category: "sunProtection",
      tags: ["sunscreen", "daily protection", "UV damage"],
      featured: true,
    },
    {
      id: "tip17",
      title: "Physical vs. Chemical Sunscreens",
      content:
        "Physical sunscreens (zinc oxide, titanium dioxide) reflect UV rays and are better for sensitive skin. Chemical sunscreens absorb UV rays and convert them to heat. For optimal protection, use a sunscreen with both physical and chemical filters.",
      category: "sunProtection",
      tags: ["sunscreen types", "sensitive skin", "ingredients"],
    },
    {
      id: "tip18",
      title: "Protective Clothing and Accessories",
      content:
        "Supplement sunscreen with UPF-rated clothing, wide-brimmed hats, and UV-blocking sunglasses. Seek shade between 10 AM and 4 PM when UV rays are strongest. Remember that water, sand, and snow reflect UV rays, increasing exposure.",
      category: "sunProtection",
      tags: ["physical protection", "UV exposure", "outdoor activities"],
    },
    {
      id: "tip19",
      title: "Post-Sun Exposure Care",
      content:
        "After sun exposure, cool your skin with a lukewarm shower and apply aloe vera or products containing antioxidants to neutralize free radicals. Increase hydration both topically and by drinking extra water to replenish moisture lost through sweating.",
      category: "sunProtection",
      tags: ["after-sun care", "repair", "sunburn"],
    },
    {
      id: "tip20",
      title: "Medication and Sun Sensitivity",
      content:
        "Certain medications including antibiotics, retinoids, and some blood pressure drugs can increase photosensitivity. Check with your healthcare provider about potential sun-sensitizing effects of your medications and take extra precautions if needed.",
      category: "sunProtection",
      tags: ["photosensitivity", "medications", "precautions"],
    },

    // SEASONAL CARE TIPS
    {
      id: "tip21",
      title: "Winter Skincare Adjustments",
      content:
        "Switch to a cream-based cleanser and richer moisturizer in winter. Add a hydrating serum containing glycerin or hyaluronic acid to your routine. Consider using a humidifier indoors and drinking warm herbal teas to maintain hydration from within.",
      category: "seasonal",
      tags: ["winter", "dry skin", "seasonal changes"],
      featured: true,
    },
    {
      id: "tip22",
      title: "Summer Skincare Essentials",
      content:
        "In summer, opt for lightweight, oil-free moisturizers and increase your sunscreen application. Consider using antioxidant serums with vitamin C in the morning to boost UV protection. Keep skincare products in the refrigerator for a cooling effect.",
      category: "seasonal",
      tags: ["summer", "heat", "lightweight products"],
    },
    {
      id: "tip23",
      title: "Fall Transition Skincare",
      content:
        "As temperatures drop in fall, gradually transition to more nourishing products. Incorporate mild exfoliation to remove summer sun damage and prepare skin for winter. Add antioxidants to repair summer damage and strengthen your skin barrier.",
      category: "seasonal",
      tags: ["fall", "transition", "repair"],
    },
    {
      id: "tip24",
      title: "Spring Renewal Routine",
      content:
        "Spring is ideal for introducing retinol or AHAs if you've taken a winter break. Lighten up your moisturizer as humidity increases. Focus on repairing winter damage with niacinamide and vitamin C while preparing your skin for increased sun exposure.",
      category: "seasonal",
      tags: ["spring", "renewal", "transition"],
    },
    {
      id: "tip25",
      title: "Travel Skincare Adaptations",
      content:
        "When traveling to different climates, gradually adapt your skincare routine. For dry climates, increase hydration and occlusive products. In humid environments, use lighter formulations and oil-control products. Always pack a basic rescue kit for skin emergencies.",
      category: "seasonal",
      tags: ["travel", "climate changes", "adaptation"],
    },

    // SKIN CONDITIONS TIPS
    {
      id: "tip26",
      title: "Eczema Management Strategies",
      content:
        "For eczema-prone skin, avoid hot showers, use fragrance-free products, and apply moisturizer immediately after bathing. Identify and avoid triggers like certain fabrics, detergents, or foods. During flares, use prescribed medications and consider wet wrap therapy for severe cases.",
      category: "conditions",
      tags: ["eczema", "sensitive skin", "flare management"],
      featured: true,
    },
    {
      id: "tip27",
      title: "Acne: Beyond the Basics",
      content:
        "Treat acne with a consistent routine using salicylic acid or benzoyl peroxide. Don't pick or squeeze pimples, which can lead to scarring and infection. Change pillowcases weekly, clean phone screens daily, and be mindful of hair products that contact your face.",
      category: "conditions",
      tags: ["acne", "breakouts", "prevention"],
    },
    {
      id: "tip28",
      title: "Rosacea Triggers and Care",
      content:
        "If you have rosacea, identify personal triggers which may include spicy foods, alcohol, extreme temperatures, or certain skincare ingredients. Use gentle, non-foaming cleansers, mineral-based sunscreens, and products with anti-inflammatory ingredients like niacinamide or azelaic acid.",
      category: "conditions",
      tags: ["rosacea", "redness", "triggers"],
    },
    {
      id: "tip29",
      title: "Psoriasis Support Strategies",
      content:
        "For psoriasis management, keep skin well-moisturized, especially after bathing. Consider medicated treatments as prescribed by your dermatologist. Stress management, moderate sun exposure, and avoiding alcohol and tobacco can help reduce flare frequency and severity.",
      category: "conditions",
      tags: ["psoriasis", "flares", "management"],
    },
    {
      id: "tip30",
      title: "Hyperpigmentation Treatment",
      content:
        "Address hyperpigmentation with ingredients like vitamin C, niacinamide, alpha arbutin, or kojic acid. Always use sunscreen, as UV exposure worsens dark spots. Be patient—treatment typically takes 8-12 weeks to show results, and consistent sun protection is essential.",
      category: "conditions",
      tags: ["dark spots", "pigmentation", "brightening"],
    },

    // WELLNESS TIPS
    {
      id: "tip31",
      title: "Sleep Quality and Skin Health",
      content:
        "Aim for 7-9 hours of quality sleep nightly. During deep sleep, your body increases blood flow to the skin and produces growth hormone, essential for repair. Sleep on your back when possible to prevent facial creasing, and use a silk pillowcase to reduce friction.",
      category: "wellness",
      tags: ["sleep", "repair", "regeneration"],
      featured: true,
    },
    {
      id: "tip32",
      title: "Stress Management for Skin",
      content:
        "Chronic stress increases cortisol, which can trigger inflammation, acne, and exacerbate conditions like eczema and psoriasis. Incorporate stress-reduction techniques such as meditation, deep breathing, or yoga. Even 5-10 minutes daily can make a difference.",
      category: "wellness",
      tags: ["stress", "cortisol", "inflammation"],
    },
    {
      id: "tip33",
      title: "Digital Device Skin Protection",
      content:
        "Blue light from digital devices may contribute to skin aging through oxidative stress. Take regular breaks, keep devices at a distance, and consider using skincare with antioxidants like niacinamide or iron oxides that help protect against blue light damage.",
      category: "wellness",
      tags: ["blue light", "digital devices", "modern concerns"],
    },
    {
      id: "tip34",
      title: "Gut-Skin Connection",
      content:
        "Your gut microbiome influences skin health through immune regulation and inflammation control. Consume probiotic-rich foods like yogurt, kefir, and fermented vegetables. Prebiotic foods like garlic, onions, and bananas feed beneficial gut bacteria.",
      category: "wellness",
      tags: ["microbiome", "gut health", "probiotics"],
    },
    {
      id: "tip35",
      title: "Hormonal Balance and Skin",
      content:
        "Hormonal fluctuations affect oil production and skin cell turnover. Track breakouts in relation to your menstrual cycle. Consider speaking with a healthcare provider about options like spironolactone or birth control for persistent hormonal acne.",
      category: "wellness",
      tags: ["hormones", "women's health", "acne"],
    },

    // EXERCISE TIPS
    {
      id: "tip36",
      title: "Exercise: Your Skin's Circulation Boost",
      content:
        "Regular exercise increases blood flow, delivering oxygen and nutrients to skin cells while helping remove waste products. Aim for at least 150 minutes of moderate activity weekly. The improved circulation gives your skin a healthy, post-workout glow.",
      category: "exercise",
      tags: ["circulation", "blood flow", "general fitness"],
      featured: true,
    },
    {
      id: "tip37",
      title: "Pre and Post-Workout Skin Care",
      content:
        "Remove makeup before exercising to prevent clogged pores. After working out, cleanse your skin promptly to remove sweat and bacteria. Apply a lightweight, non-comedogenic moisturizer to rehydrate without clogging pores.",
      category: "exercise",
      tags: ["workout routine", "sweat", "cleansing"],
    },
    {
      id: "tip38",
      title: "Outdoor Exercise Sun Protection",
      content:
        "When exercising outdoors, wear water-resistant, broad-spectrum sunscreen with at least SPF 30. Choose sweat-resistant formulations and reapply every 80 minutes. Wear UPF-rated clothing and exercise during early morning or late afternoon when UV rays are less intense.",
      category: "exercise",
      tags: ["outdoor activities", "sun protection", "active lifestyle"],
    },
    {
      id: "tip39",
      title: "Yoga for Skin Radiance",
      content:
        "Certain yoga poses increase blood flow to the face and reduce stress hormones that can trigger skin issues. Inversions like downward dog and forward folds bring oxygen-rich blood to facial tissues. The stress reduction benefits also help reduce inflammation.",
      category: "exercise",
      tags: ["yoga", "blood flow", "stress reduction"],
    },
    {
      id: "tip40",
      title: "Hydration During Exercise",
      content:
        "Drink water before, during, and after exercise to maintain hydration levels. Dehydration during workouts can lead to dull skin and exacerbate existing skin conditions. For intense workouts lasting over an hour, consider electrolyte replacement.",
      category: "exercise",
      tags: ["hydration", "workout recovery", "electrolytes"],
    },

    // MENTAL HEALTH TIPS
    {
      id: "tip41",
      title: "Skin Picking and Stress",
      content:
        "Dermatillomania (skin picking) often worsens during stress. If you notice this habit, try stress-reduction techniques and physical barriers like bandages or fidget toys. Cognitive behavioral therapy can be effective for breaking this cycle.",
      category: "mentalHealth",
      tags: ["skin picking", "habits", "stress management"],
      featured: true,
    },
    {
      id: "tip42",
      title: "Body Image and Skin Conditions",
      content:
        "Chronic skin conditions can impact self-esteem and body image. Practice self-compassion and focus on your whole self beyond skin appearance. Connect with support groups of others with similar conditions for understanding and coping strategies.",
      category: "mentalHealth",
      tags: ["body image", "self-esteem", "support"],
    },
    {
      id: "tip43",
      title: "Mindfulness for Skin Health",
      content:
        "Mindfulness practices reduce stress hormones that can trigger inflammation and skin issues. Try a body scan meditation, focusing on sensations without judgment. This awareness can also help you notice skin changes earlier and seek treatment when needed.",
      category: "mentalHealth",
      tags: ["mindfulness", "meditation", "awareness"],
    },
    {
      id: "tip44",
      title: "Breaking the Stress-Skin Cycle",
      content:
        "Skin conditions cause stress, and stress worsens skin conditions. Break this cycle by addressing both simultaneously. Work with healthcare providers for skin treatment while implementing stress management techniques like deep breathing or progressive muscle relaxation.",
      category: "mentalHealth",
      tags: ["stress cycle", "holistic approach", "management"],
    },
    {
      id: "tip45",
      title: "Acceptance and Skin Conditions",
      content:
        "Practicing acceptance doesn't mean giving up on treatment. Rather, it means acknowledging your skin's current state while working toward improvement. This mindset reduces the stress that can exacerbate skin conditions and improves quality of life.",
      category: "mentalHealth",
      tags: ["acceptance", "mindset", "quality of life"],
    },
  ];

  // Filter tips based on search, category, and favorites
  const filteredTips = tips.filter((tip) => {
    const matchesSearch =
      searchQuery === "" ||
      tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tip.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tip.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === null || tip.category === selectedCategory;

    const matchesFavorites =
      !showOnlyFavorites || favoriteTips.includes(tip.id);

    return matchesSearch && matchesCategory && matchesFavorites;
  });

  // Get featured tips
  const featuredTips = tips.filter((tip) => tip.featured);

  // Header animation
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [200, 120],
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60, 90],
    outputRange: [1, 0.3, 0],
    extrapolate: "clamp",
  });

  const searchBarTranslate = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -50],
    extrapolate: "clamp",
  });

  // Render category item
  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.id && {
          backgroundColor: item.color + "20",
          borderColor: item.color,
        },
      ]}
      onPress={() =>
        setSelectedCategory(selectedCategory === item.id ? null : item.id)
      }
    >
      <FontAwesome5
        name={item.icon as any}
        size={16}
        color={selectedCategory === item.id ? item.color : "#666"}
      />
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item.id && {
            color: item.color,
            fontWeight: "600",
          },
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  // Render tip card
  const renderTipCard = ({ item }: { item: Tip }) => {
    const isFavorite = favoriteTips.includes(item.id);
    const isExpanded = expandedTip === item.id;
    const category = categories.find((cat) => cat.id === item.category);

    return (
      <TouchableOpacity
        style={[styles.tipCard, isExpanded && styles.expandedTipCard]}
        onPress={() => setExpandedTip(isExpanded ? null : item.id)}
        activeOpacity={0.9}
      >
        <View style={styles.tipHeader}>
          <View style={styles.tipTitleContainer}>
            <View
              style={[
                styles.categoryIndicator,
                { backgroundColor: category?.color || MAIN_COLOR },
              ]}
            />
            <Text style={styles.tipTitle}>{item.title}</Text>
          </View>
          <View style={styles.tipActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => shareTip(item)}
            >
              <Feather name="share" size={18} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => toggleFavorite(item.id)}
            >
              <Feather
                name={isFavorite ? "heart" : "heart"}
                size={18}
                color={isFavorite ? MAIN_COLOR : "#666"}
                solid={isFavorite}
              />
            </TouchableOpacity>
          </View>
        </View>

        <Text
          style={styles.tipContent}
          numberOfLines={isExpanded ? undefined : 3}
        >
          {item.content}
        </Text>

        {!isExpanded && <Text style={styles.readMore}>Tap to read more</Text>}

        {isExpanded && (
          <View style={styles.tipFooter}>
            <View style={styles.tagContainer}>
              {item.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
            {item.source && (
              <Text style={styles.sourceText}>Source: {item.source}</Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Render featured tip
  const renderFeaturedTip = ({ item }: { item: Tip }) => {
    const isFavorite = favoriteTips.includes(item.id);
    const category = categories.find((cat) => cat.id === item.category);

    return (
      <TouchableOpacity
        style={styles.featuredTipCard}
        onPress={() => {
          setSelectedCategory(item.category);
          setExpandedTip(item.id);
        }}
        activeOpacity={0.9}
      >
        <View style={styles.featuredTipContent}>
          <View style={styles.featuredTipHeader}>
            <View style={styles.featuredCategoryBadge}>
              <Text style={styles.featuredCategoryText}>{category?.name}</Text>
            </View>
            <TouchableOpacity
              style={styles.featuredFavoriteButton}
              onPress={() => toggleFavorite(item.id)}
            >
              <Feather
                name={isFavorite ? "heart" : "heart"}
                size={20}
                color={isFavorite ? "#FFF" : "rgba(255,255,255,0.8)"}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.featuredTipTitle}>{item.title}</Text>
          <Text style={styles.featuredTipDescription} numberOfLines={2}>
            {item.content}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Animated Header */}
      <Animated.View
        style={[
          styles.header,
          {
            height: headerHeight,
          },
        ]}
      >
        <Animated.View
          style={[styles.headerContent, { opacity: headerOpacity }]}
        >
          <Text style={styles.headerTitle}>Health Tips</Text>
          <Text style={styles.headerSubtitle}>
            Expert advice for your skin & overall health
          </Text>
        </Animated.View>

        {/* Search Bar */}
        <Animated.View
          style={[
            styles.searchContainer,
            { transform: [{ translateY: searchBarTranslate }] },
          ]}
        >
          <View style={styles.searchBar}>
            <Feather
              name="search"
              size={20}
              color="#999"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search tips..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
            {searchQuery !== "" && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Feather name="x" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.favoriteFilterButton,
              showOnlyFavorites && styles.favoriteFilterActive,
            ]}
            onPress={() => setShowOnlyFavorites(!showOnlyFavorites)}
          >
            <Feather
              name="heart"
              size={20}
              color={showOnlyFavorites ? "#FFF" : MAIN_COLOR}
            />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Featured Tips */}
        {!showOnlyFavorites && !searchQuery && selectedCategory === null && (
          <View style={styles.featuredContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Tips</Text>
            </View>
            <FlatList
              data={featuredTips}
              renderItem={renderFeaturedTip}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredList}
              snapToInterval={width - 60}
              decelerationRate="fast"
              snapToAlignment="center"
            />
          </View>
        )}

        {/* All Tips */}
        <View style={styles.tipsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {showOnlyFavorites
                ? "Favorite Tips"
                : selectedCategory
                ? categories.find((cat) => cat.id === selectedCategory)?.name +
                  " Tips"
                : searchQuery
                ? "Search Results"
                : "All Tips"}
            </Text>
            <Text style={styles.resultCount}>{filteredTips.length} tips</Text>
          </View>

          {filteredTips.length > 0 ? (
            filteredTips.map((tip) => (
              <View key={tip.id}>{renderTipCard({ item: tip })}</View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Feather name="search" size={50} color="#DDD" />
              <Text style={styles.emptyStateTitle}>No tips found</Text>
              <Text style={styles.emptyStateText}>
                Try adjusting your search or filters to find what you&apos;re
                looking for.
              </Text>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => {
                  setSearchQuery("");
                  setSelectedCategory(null);
                  setShowOnlyFavorites(false);
                }}
              >
                <Text style={styles.resetButtonText}>Reset Filters</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    justifyContent: "flex-end",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    zIndex: 10,
  },
  headerContent: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 46,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333333",
  },
  favoriteFilterButton: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  favoriteFilterActive: {
    backgroundColor: MAIN_COLOR,
  },
  scrollView: {
    flex: 1,
  },
  categoriesContainer: {
    marginTop: 15,
  },
  categoriesList: {
    paddingHorizontal: 20,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  categoryText: {
    fontSize: 14,
    color: "#666666",
    marginLeft: 8,
  },
  featuredContainer: {
    marginTop: 25,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  resultCount: {
    fontSize: 14,
    color: "#999999",
  },
  featuredList: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  featuredTipCard: {
    width: width - 60,
    height: 180,
    borderRadius: 16,
    marginRight: 10,
    overflow: "hidden",
    backgroundColor: MAIN_COLOR,
  },
  featuredTipContent: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  featuredTipHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  featuredCategoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  featuredCategoryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  featuredFavoriteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  featuredTipTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 10,
  },
  featuredTipDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginTop: 8,
  },
  tipsContainer: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  tipCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  expandedTipCard: {
    borderColor: MAIN_COLOR,
  },
  tipHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  tipTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    flex: 1,
  },
  tipActions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 8,
    marginLeft: 5,
  },
  tipContent: {
    fontSize: 14,
    lineHeight: 22,
    color: "#666666",
  },
  readMore: {
    fontSize: 12,
    color: MAIN_COLOR,
    marginTop: 8,
    fontWeight: "500",
  },
  tipFooter: {
    marginTop: 16,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  tag: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: "#666666",
  },
  sourceText: {
    fontSize: 12,
    color: "#999999",
    fontStyle: "italic",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    marginTop: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: MAIN_COLOR,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  bottomPadding: {
    height: 100,
  },
});

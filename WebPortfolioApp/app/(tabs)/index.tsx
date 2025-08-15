import React, { useEffect, useRef } from "react";

import {
  Animated,
  Dimensions,
  Easing,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  ListRenderItemInfo,
} from "react-native";

type Recipe = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  duration: string;
  calories: string;
};

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.78;
const SPACER = (width - CARD_WIDTH) / 2;
const CARD_SPACING = 16;

const RECIPES: Recipe[] = [
  {
    id: "1",
    title: "Garlic Butter Salmon",
    subtitle: "Lemon & herb glaze",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1600&auto=format&fit=crop",
    duration: "25 min",
    calories: "420 kcal",
  },
  {
    id: "2",
    title: "Creamy Pesto Pasta",
    subtitle: "Basil & parmesan",
    image:
      "https://images.unsplash.com/photo-1523986371872-9d3ba2e2f642?q=80&w=1600&auto=format&fit=crop",
    duration: "20 min",
    calories: "520 kcal",
  },
  {
    id: "3",
    title: "Citrus Chicken Bowl",
    subtitle: "Avocado & grains",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1600&auto=format&fit=crop",
    duration: "30 min",
    calories: "560 kcal",
  },
  {
    id: "4",
    title: "Veggie Ramen",
    subtitle: "Miso broth & tofu",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1600&auto=format&fit=crop",
    duration: "35 min",
    calories: "480 kcal",
  },
  {
    id: "5",
    title: "Berry Yogurt Parfait",
    subtitle: "Granola crunch",
    image:
      "https://images.unsplash.com/photo-1505577058444-a3dab90d4253?q=80&w=1600&auto=format&fit=crop",
    duration: "10 min",
    calories: "260 kcal",
  },
];

export default function HomeScreen() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const listRef = useRef<FlatList<Recipe>>(null);
  const indexRef = useRef(0);

  // Simple auto-play that advances every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (indexRef.current + 1) % RECIPES.length;
      indexRef.current = nextIndex;
      listRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      const firstViewableItem = viewableItems?.[0];
      if (firstViewableItem?.index !== null && firstViewableItem?.index !== undefined) {
        indexRef.current = firstViewableItem.index;
      }
    }
  ).current;

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const renderItem = ({ item, index }: ListRenderItemInfo<Recipe>) => {
    const inputRange = [
      (index - 1) * (CARD_WIDTH + CARD_SPACING),
      index * (CARD_WIDTH + CARD_SPACING),
      (index + 1) * (CARD_WIDTH + CARD_SPACING),
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: "clamp",
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6],
      extrapolate: "clamp",
    });

    const translateY = scrollX.interpolate({
      inputRange,
      outputRange: [14, 0, 14],
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        style={[
          styles.card,
          { width: CARD_WIDTH, transform: [{ scale }, { translateY }], opacity },
        ]}
      >
        <View style={styles.imageWrap}>
          <Image source={{ uri: item.image }} style={styles.image} />
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.duration}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.calories}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text numberOfLines={1} style={styles.cardTitle}>
            {item.title}
          </Text>
          <Text numberOfLines={1} style={styles.cardSubtitle}>
            {item.subtitle}
          </Text>

          <View style={styles.ctaRow}>
            <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.8}>
              <Text style={styles.primaryBtnText}>Cook Now</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.8}>
              <Text style={styles.secondaryBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.brand}>Taste</Text>
        <Text style={styles.tagline}>Find your next favorite dish</Text>
        <View style={styles.searchRow}>
          <TextInput
            placeholder="Search recipes, ingredients…"
            placeholderTextColor="rgba(255,255,255,0.6)"
            style={styles.search}
          />
          <TouchableOpacity style={styles.filterBtn} activeOpacity={0.85}>
            <Text style={styles.filterText}>Filters</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Animated.FlatList
        ref={listRef}
        data={RECIPES}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate={0}
        bounces={false}
        contentContainerStyle={{
          paddingHorizontal: SPACER,
        }}
        ItemSeparatorComponent={() => <View style={{ width: CARD_SPACING }} />}
        renderItem={renderItem}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewConfigRef.current}
        getItemLayout={(_, i) => ({
          length: CARD_WIDTH + CARD_SPACING,
          offset: (CARD_WIDTH + CARD_SPACING) * i,
          index: i,
        })}
        scrollEventThrottle={16}
      />

      <View style={styles.dotsRow}>
        {RECIPES.map((_, i) => {
          const inputRange = [
            (i - 1) * (CARD_WIDTH + CARD_SPACING),
            i * (CARD_WIDTH + CARD_SPACING),
            (i + 1) * (CARD_WIDTH + CARD_SPACING),
          ];
          const dotScale = scrollX.interpolate({
            inputRange,
            outputRange: [1, 1.6, 1],
            extrapolate: "clamp",
          });
          const dotOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: "clamp",
          });
          return (
            <Animated.View
              key={`dot-${i}`}
              style={[
                styles.dot,
                { transform: [{ scale: dotScale }], opacity: dotOpacity },
              ]}
            />
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f1220",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 18,
  },
  brand: {
    fontSize: 34,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  tagline: {
    marginTop: 4,
    color: "rgba(255,255,255,0.75)",
    fontSize: 15,
  },
  searchRow: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10,
  },
  search: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#fff",
  },
  filterBtn: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  filterText: {
    color: "#fff",
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#151835",
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  imageWrap: {
    width: "100%",
    height: 220,
    backgroundColor: "#0d1026",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  badgeRow: {
    position: "absolute",
    bottom: 12,
    left: 12,
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  cardBody: {
    padding: 16,
    gap: 10,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },
  cardSubtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
  },
  ctaRow: {
    marginTop: 6,
    flexDirection: "row",
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryBtnText: {
    color: "#0a0d1a",
    fontWeight: "800",
  },
  secondaryBtn: {
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  secondaryBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
  dotsRow: {
    flexDirection: "row",
    alignSelf: "center",
    gap: 8,
    paddingVertical: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: "#ffffff",
  },
});
